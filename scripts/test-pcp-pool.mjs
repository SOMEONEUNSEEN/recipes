import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import yaml from "js-yaml";
import Ajv from "ajv";
import { resolveCommand } from "../src/lib/command-synthesis.js";
import { buildRecipeSchema } from "../src/lib/recipe-schema.js";
import { contentDir } from "../src/lib/content-root.js";
import { applyOverlay, resolveScope, splitOverlay } from "../src/lib/overlay-merge.js";
import { validatePresets } from "../src/lib/recipe-presets.js";
import { renderCommand } from "../src/lib/recipe-render.js";

const read = (file) => yaml.load(fs.readFileSync(path.join(contentDir(), file), "utf8"));
const taxonomy = read("taxonomy.yaml");
// Serving strategies plus the KV-store deployments, merged as the build does.
const strategies = Object.fromEntries(["strategies", "kv_store"].flatMap((dir) => fs.readdirSync(path.join(contentDir(), dir))
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => { const s = read(`${dir}/${file}`); return [s.name, s]; })));
strategies.pd_cluster = yaml.load(fs.readFileSync(new URL("../strategies/pd_cluster.yaml", import.meta.url), "utf8"));

// A2 (8 NPUs) / A3 (16 NPUs) PD fixture: the tutorial's Prefill DP2/PCP4/TP1
// (A2) and DP4/PCP4/TP1 (A3) on top of the external-DP Ascend router.
function pcpRecipe(hardware = "ascend_910b") {
  return {
    hf_id: "test/PCP-Pool",
    meta: {
      title: "PCP pool fixture", slug: "pcp-pool", provider: "test", description: "PD PCP regression fixture",
      date_added: "2026-01-01", date_updated: "2026-01-01", tasks: ["text"],
      hardware: { ascend_910b: "supported", ascend_910c: "supported" },
    },
    model: { model_id: "test/PCP-Pool", architecture: "moe", parameter_count: "32B", base_args: ["--max-model-len", "32768"] },
    variants: { default: { precision: "int8", vram_minimum_gb: 64, supported_hardware: ["ascend_910b", "ascend_910c"] } },
    compatible_strategies: ["multi_node_tp", "multi_node_dep", "pd_cluster"],
    guide: "Synthetic PCP pool fixture.",
    strategy_overrides: {
      pd_cluster: {
        prefill: { nodes: 1, parallelism: "dep", tp: 1, pcp: 4 },
        decode: { nodes: 1, parallelism: "dep", tp: 1 },
      },
    },
    presets: {
      ascend_pd: {
        label: "Ascend PCP PD", hardware, strategy: "pd_cluster",
        select: { pd_router: "ascend", pd_connector: "mooncake_ascend", frontend: "python" },
        roles: {
          prefill: { args: ["--port", "7100"] },
          decode: { args: ["--port", "7100"] },
        },
      },
    },
  };
}

const pools = (rank = 0) => ({
  prefill: { nodes: 1, parallelism: "dep", rank },
  decode: { nodes: 1, parallelism: "dep", rank },
});

const render = (recipe, hardware, { pdNodes = pools(), router = "ascend", connector = "mooncake_ascend", preset = "ascend_pd" } = {}) =>
  resolveCommand(recipe, "default", "pd_cluster", hardware, [], strategies, taxonomy,
    [], 1, pdNodes, {}, null, null, "python", router, "http", null, preset, null, connector);

const flagValue = (argv, flag) => { const i = argv.lastIndexOf(flag); return i < 0 ? undefined : argv[i + 1]; };
const flagValues = (argv, flag) => {
  const i = argv.lastIndexOf(flag);
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < argv.length && !String(argv[j]).startsWith("--"); j++) out.push(argv[j]);
  return out;
};

test("PCP divides the DEP pool's devices: A2 is DP2/PCP4/TP1, A3 is DP4/PCP4/TP1", () => {
  const a2 = render(pcpRecipe("ascend_910b"), "ascend_910b");
  assert.equal(a2.prefill.pcp, 4);
  assert.equal(a2.prefill.tp, 1);
  assert.equal(a2.prefill.dpLocal, 2);
  assert.equal(a2.prefill.dpSize, 2);
  assert.equal(flagValue(a2.prefill.argv, "--prefill-context-parallel-size"), "4");
  assert.equal(flagValue(a2.prefill.argv, "--data-parallel-size"), "2");
  assert.equal(flagValue(a2.prefill.argv, "--data-parallel-size-local"), "2");
  assert.equal(flagValue(a2.prefill.argv, "--data-parallel-start-rank"), "0");
  assert.ok(a2.prefill.argv.includes("--data-parallel-multi-port-external-lb"));
  assert.ok(a2.prefill.argv.includes("--enable-expert-parallel"));

  // Decode keeps PCP1: one rank per NPU and no PCP flag.
  assert.equal(a2.decode.pcp, 1);
  assert.equal(a2.decode.dpLocal, 8);
  assert.equal(a2.decode.dpSize, 8);
  assert.equal(a2.decode.argv.includes("--prefill-context-parallel-size"), false);

  const a3 = render(pcpRecipe("ascend_910c"), "ascend_910c");
  assert.equal(a3.prefill.pcp, 4);
  assert.equal(a3.prefill.dpLocal, 4);
  assert.equal(a3.prefill.dpSize, 4);
  assert.equal(a3.decode.dpLocal, 16);
});

test("Ascend proxy and KV metadata follow the PCP topology", () => {
  const a2 = render(pcpRecipe("ascend_910b"), "ascend_910b");
  assert.deepEqual(flagValues(a2.router.argv, "--prefiller-hosts"), ["$PREFILL_NODE_1", "$PREFILL_NODE_1"]);
  assert.deepEqual(flagValues(a2.router.argv, "--prefiller-ports"), ["7100", "7101"]);
  assert.deepEqual(flagValues(a2.router.argv, "--decoder-ports"), ["7100", "7101", "7102", "7103", "7104", "7105", "7106", "7107"]);

  // PCP does not change the connector's tp_size (vLLM Ascend tutorial §5.2.1.5).
  const kv = JSON.parse(flagValue(a2.prefill.argv, "--kv-transfer-config"));
  assert.deepEqual(kv.kv_connector_extra_config.prefill, { dp_size: 2, tp_size: 1, pp_size: 1 });
  assert.deepEqual(kv.kv_connector_extra_config.decode, { dp_size: 8, tp_size: 1, pp_size: 1 });

  const a3 = render(pcpRecipe("ascend_910c"), "ascend_910c");
  assert.deepEqual(flagValues(a3.router.argv, "--prefiller-ports"), ["7100", "7101", "7102", "7103"]);
  const kv3 = JSON.parse(flagValue(a3.prefill.argv, "--kv-transfer-config"));
  assert.deepEqual(kv3.kv_connector_extra_config.prefill, { dp_size: 4, tp_size: 1, pp_size: 1 });
});

test("the published rendering carries pcp for both pools", () => {
  const r = renderCommand(pcpRecipe("ascend_910b"), "default", "pd_cluster", "ascend_910b", 1, [], strategies, taxonomy,
    pools(), null, "ascend_pd", undefined, true);
  assert.equal(r.prefill.pcp, 4);
  assert.equal(r.prefill.dpLocal, 2);
  assert.equal(r.prefill.dpSize, 2);
  assert.equal(r.decode.pcp, 1);
  assert.equal(r.decode.dpLocal, 8);
});

test("PCP layout is validated", () => {
  const validate = new Ajv({ allErrors: true, strict: false }).compile(buildRecipeSchema({ taxonomy, strategies }));
  const { hf_id: _hfId, ...authored } = pcpRecipe();
  assert.ok(validate(authored), JSON.stringify(validate.errors));
  const zero = structuredClone(authored);
  zero.strategy_overrides.pd_cluster.prefill.pcp = 0;
  assert.equal(validate(zero), false);
  const str = structuredClone(authored);
  str.strategy_overrides.pd_cluster.prefill.pcp = "4";
  assert.equal(validate(str), false);

  // PCP × TP must divide the node's devices.
  const odd = pcpRecipe();
  odd.strategy_overrides.pd_cluster.prefill.pcp = 3;
  assert.throws(() => render(odd, "ascend_910b"), /TP × PCP/);

  // PCP is prefill-only, and DEP-only.
  const decodePcp = pcpRecipe();
  decodePcp.strategy_overrides.pd_cluster.decode.pcp = 4;
  assert.throws(() => render(decodePcp, "ascend_910b"), /prefill pool/);

  const tpPcp = pcpRecipe();
  tpPcp.strategy_overrides.pd_cluster.prefill.pcp = 2;
  assert.throws(() => render(tpPcp, "ascend_910b", { pdNodes: { prefill: { nodes: 1, parallelism: "tp" }, decode: { nodes: 1, parallelism: "dep" } } }),
    /DEP prefill pool/);

  // A preset may only set pcp on the prefill pool.
  const presetPcp = pcpRecipe();
  presetPcp.presets.ascend_pd.roles.decode = { pcp: 4 };
  const errors = validatePresets(presetPcp, taxonomy, ["multi_node_tp", "multi_node_dep", "pd_cluster"],
    [], strategies.pd_cluster.connectors);
  assert.ok(errors.some((e) => /only the prefill pool sets pcp/.test(e)));
});

test("overlays may scope a pcp override to Huawei hardware", () => {
  const ctx = resolveScope({ brands: ["Huawei"] }, taxonomy);
  const core = pcpRecipe();
  delete core.strategy_overrides.pd_cluster.prefill.pcp;
  delete core.presets;
  const overlay = { strategy_overrides: { pd_cluster: { prefill: { pcp: { ascend_910b: 4 } } } } };
  const merged = applyOverlay(core, overlay, { ctx, source: "vllm-ascend" });
  assert.deepEqual(merged.errors, []);
  assert.deepEqual(merged.recipe.strategy_overrides.pd_cluster.prefill.pcp, { ascend_910b: 4 });
  assert.deepEqual(splitOverlay(merged.recipe, { ctx, source: "vllm-ascend" }).overlay.strategy_overrides, overlay.strategy_overrides);

  const outOfScope = applyOverlay(core, { strategy_overrides: { pd_cluster: { prefill: { pcp: { h200: 4 } } } } },
    { ctx, source: "vllm-ascend" });
  assert.ok(outOfScope.errors.length > 0);
});
