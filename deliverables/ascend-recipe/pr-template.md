# Ascend Recipe Overlay PR Template

<!--
Usage:
1. Copy the title and body into the vllm-project/vllm-ascend PR.
2. Replace every __UPPER_SNAKE_CASE__ value. Delete only rows that are genuinely
   not applicable, and record N/A + reason for requested but unsupported forms.
3. Do not mark a test PASS without a log, artifact, preview, or linked evidence.
4. Keep `recipe` labeling, DCO sign-off, and final-head CI as separate gates.
5. Paste the applicable items from pr-checklist.md into the final section.
-->

## PR title

```text
[Doc][Recipe] Add <hf_org>/<hf_repo> Ascend recipe overlay
```

<!-- `[Recipe]` alone does not satisfy the repository title allowlist. Keep
`[Doc][Recipe]` unless the actual change category requires another allowed
prefix. The HF org/repo must preserve canonical case. -->

## Summary / 新增模型功能说明

<!--
Required: what the model does, why this overlay is needed, where the base
recipe lives, and what users can do after this PR. Do not claim capabilities
that are only advertised but untested; separate those below.
-->

- **Canonical model:** `__HF_ORG__/__HF_REPO__`
- **Model function and use case:** __MODEL_FUNCTION_SUMMARY__
- **Overlay path:** `recipes/overlays/__HF_ORG__/__HF_REPO__.yaml`
- **Base recipe:** __BASE_RECIPE_URL__
- **Base owner and commit:** `vllm-project/vllm@__BASE_RECIPE_COMMIT__`
- **User-facing change:** __USER_FACING_CHANGE__
- **Ascend runtime/source support:** __ASCEND_RUNTIME_SUPPORT_SUMMARY__
- **Verified scope:** __VERIFIED_SCOPE_SUMMARY__
- **Advertised but unverified scope:** __UNVERIFIED_SCOPE_SUMMARY__

## Model and precision matrix / 精度清单

<!--
List EVERY precision/checkpoint added or made reachable on Ascend. UI label,
internal precision, checkpoint format, and runtime quantization are different
facts. In particular:
- W8A8 (ASCEND): normally precision=int8 and --quantization ascend.
- W8A8 MXFP8 (ASCEND): precision=mxfp8 and --quantization ascend.
- Native MXFP8 is a separate path; do not copy the W8A8 MXFP8 flags.
Use NOT_RUN for missing runtime evidence; never substitute "schema passed".
-->

| Variant key | User-visible label | Checkpoint + immutable revision | Internal `precision` | Runtime quantization | VRAM minimum + calculation | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `default` / inherited | `__BASE_DEFAULT_LABEL__` | `__BASE_MODEL_ID__@__BASE_MODEL_REVISION__` | `__BASE_DEFAULT_PRECISION__` | `__BASE_DEFAULT_QUANTIZATION_OR_NONE__` | `__BASE_DEFAULT_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __BASE_DEFAULT_EVIDENCE__ |
| `ascend_bf16` | `BF16 (ASCEND)` | `__BF16_MODEL_ID__@__BF16_MODEL_REVISION__` | `bf16` | `None` | `__BF16_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __BF16_EVIDENCE__ |
| `ascend_fp8` | `FP8 (ASCEND)` | `__FP8_MODEL_ID__@__FP8_MODEL_REVISION__` | `fp8` | `__FP8_QUANTIZATION_OR_NONE__` | `__FP8_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __FP8_EVIDENCE__ |
| `ascend_w8a8` | `W8A8 (ASCEND)` | `__W8A8_MODEL_ID__@__W8A8_MODEL_REVISION__` | `int8` | `ascend` | `__W8A8_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __W8A8_EVIDENCE__ |
| `ascend_w8a8_mxfp8` | `W8A8 MXFP8 (ASCEND)` | `__W8A8_MXFP8_MODEL_ID__@__W8A8_MXFP8_MODEL_REVISION__` | `mxfp8` | `ascend` | `__W8A8_MXFP8_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __W8A8_MXFP8_EVIDENCE__ |
| `ascend_w4a8` | `W4A8 (ASCEND)` | `__W4A8_MODEL_ID__@__W4A8_MODEL_REVISION__` | `int4` | `ascend` | `__W4A8_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __W4A8_EVIDENCE__ |
| `ascend_w4a4_mxfp4` | `W4A4 (ASCEND)` | `__W4A4_MODEL_ID__@__W4A4_MODEL_REVISION__` | `mxfp4` | `ascend` | `__W4A4_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __W4A4_EVIDENCE__ |
| `ascend_mxfp8` | `MXFP8 (ASCEND)` | `__NATIVE_MXFP8_MODEL_ID__@__NATIVE_MXFP8_MODEL_REVISION__` | `mxfp8` | `mxfp8` | `__NATIVE_MXFP8_VRAM_AND_FORMULA__` | `PASS / NOT_RUN` | __NATIVE_MXFP8_EVIDENCE__ |

**Additional variant-specific flags/env and why they are required:**

__VARIANT_SPECIFIC_ARGS_ENV_TABLE_OR_LIST__

**Checkpoint access and integrity verification:**

- Access check (including gated repositories): __HF_ACCESS_EVIDENCE__
- Revision, shard count/size, and integrity check: __CHECKPOINT_INTEGRITY_EVIDENCE__
- Mixed-precision footprint source, when applicable: __MIXED_PRECISION_FOOTPRINT_EVIDENCE__

## Deployment coverage / 部署形态覆盖范围

<!--
Cover every selectable hardware × variant × strategy combination in the detailed
logs, and summarize representative rows here. Use exact topology values, not
ranges or formulas in the result columns. For renderer limitations use
`N/A (renderer limitation)`; for an available but unrun configuration use
`NOT_RUN`. Neither state is a PASS.
-->

| Deployment form | Strategy / preset | Hardware | Nodes | Exact TP / PP / local DP / global DP / EP | PD Router / Connector | Rendered artifact | Runtime status + evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Single-node TP | `single_node_tp` / `__TP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | 1 | `TP=__TP__; PP=1; DP=1; EP=__ON_OFF__` | N/A | __TP_JSON_MD_LINK__ | __TP_RUNTIME_STATUS_EVIDENCE__ |
| Multi-node TP | `multi_node_tp` / `__MULTI_TP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | `__NODES__` | `TP=__TOTAL_TP__; PP=1; DP=1` | N/A | __MULTI_TP_JSON_MD_LINK__ | __MULTI_TP_RUNTIME_STATUS_EVIDENCE__ |
| Multi-node TP+PP | `multi_node_tp_pp` / `__TP_PP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | `__NODES__` | `TP=__NODE_LOCAL_TP__; PP=__PP__; DP=1` | N/A | __TP_PP_JSON_MD_LINK__ | __TP_PP_RUNTIME_STATUS_EVIDENCE__ |
| Multi-node TP+DP | `multi_node_tp_dp` / `__TP_DP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | `__NODES__` | `TP=__NODE_LOCAL_TP__; local DP=1; global DP=__DP__` | N/A | __TP_DP_JSON_MD_LINK__ | __TP_DP_RUNTIME_STATUS_EVIDENCE__ |
| Single-node DEP | `single_node_dep` / `__SINGLE_DEP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | 1 | `DP=__DP__; EP=on; explicit TP sizing=__YES_NO_LIMIT__` | N/A | __SINGLE_DEP_JSON_MD_LINK__ | __SINGLE_DEP_RUNTIME_STATUS_EVIDENCE__ |
| Multi-node DEP | `multi_node_dep` / `__MULTI_DEP_PRESET_OR_BASELINE__` | `__HARDWARE_ID__` | `__NODES__` | `DP=__DP__; EP=on; explicit TP sizing=__YES_NO_LIMIT__` | N/A | __MULTI_DEP_JSON_MD_LINK__ | __MULTI_DEP_RUNTIME_STATUS_EVIDENCE__ |
| PD disaggregation with DP+TP+EP | `pd_cluster` / `ascend_pd` | `__HARDWARE_ID__` | `P=__P_NODES__; D=__D_NODES__` | Prefill `__P_TOPOLOGY__`; Decode `TP=__D_TP__; local DP=__D_LOCAL_DP__; global DP=__D_GLOBAL_DP__; EP=on; PP=1` | `ascend` / `mooncake_ascend` | __PD_JSON_MD_LINK__ | __PD_RUNTIME_STATUS_EVIDENCE__ |
| Single-node TP+PP | N/A | N/A | N/A | `N/A (renderer limitation: no single_node_tp_pp strategy)` | N/A | N/A | N/A |
| Single-node TP+DP | N/A | N/A | N/A | `N/A (renderer limitation: no single_node_tp_dp strategy)` | N/A | N/A | N/A |
| Aggregated, non-PD explicit DP+TP+EP | N/A | N/A | N/A | `N/A (renderer limitation: use a qualified PD DEP role for explicit TP)` | N/A | N/A | N/A |

### Multi-node command coverage

- Head and every worker/node command artifact: __ALL_NODE_COMMANDS_EVIDENCE__
- Node ranks, master/rendezvous addresses, and headless flags checked by: __RANK_RENDEZVOUS_EVIDENCE__
- Confirmation that rank 1 was NOT copied unchanged to every follower: __DISTINCT_WORKER_COMMANDS_EVIDENCE__
- HCCL/network/interface prerequisites: __MULTI_NODE_NETWORK_PREREQUISITES__

## Ascend PD and distributed DP / PD 分离专项

<!--
Both select values are mandatory for the supported path. Ascend Router proxies
requests and enumerates endpoints; native vLLM launches/supervises external-DP
workers. Do not describe the Router as the worker process launcher.
-->

- **Preset / point:** `ascend_pd` / `__PD_POINT_OR_NONE__`
- **Preset hardware and variants:** `__PD_HARDWARE__` / `__PD_VARIANTS__`
- **Preset source + revision:** __PD_SOURCE_URL__ / `__PD_SOURCE_REVISION__`
- **`select.pd_router`:** `ascend`
- **`select.pd_connector`:** `mooncake_ascend`
- **Frontend:** `python` (or `__PD_FRONTEND_JUSTIFICATION__`)
- **Prefill topology:** `nodes=__P_NODES__; parallelism=__P_MODE__; TP=__P_TP__; PP=__P_PP__`
- **Decode topology:** `nodes=__D_NODES__; parallelism=dep; TP=__D_TP__; PP=1; local DP=__D_LOCAL_DP__; global DP=__D_GLOBAL_DP__`
- **Topology arithmetic and divisibility check:** __PD_TOPOLOGY_ARITHMETIC__
- **External-LB branch:** `DP1 / local-DP1 / local-DP>1` → `__GENERATED_EXTERNAL_DP_FLAGS__`
- **Inherited LB cleanup:** preset `remove_args: ["--data-parallel-hybrid-lb"]`; remaining argv has no hybrid/external mode conflict: __PD_LB_CONFLICT_CHECK__
- **Final Router / connector key / runtime connector class:** `ascend` / `mooncake_ascend` / `__FINAL_KV_CONNECTOR_CLASS__`
- **Mooncake implementation and evidence:** `V1 / V2 / Hybrid / other: __IMPLEMENTATION__`; __MOONCAKE_IMPLEMENTATION_EVIDENCE__
- **All Prefill and Decode `node_commands[]`:** __PD_NODE_COMMANDS_EVIDENCE__
- **All rank endpoints returned to the Router:** __PD_ROUTER_ENDPOINTS_EVIDENCE__
- **Connector DP/TP/PP metadata:** __PD_CONNECTOR_METADATA_EVIDENCE__
- **Proxy script in the selected runtime:** `__ASCEND_PROXY_SCRIPT_PATH__`; existence/compatibility evidence: __PROXY_COMPATIBILITY_EVIDENCE__
- **Image tag and immutable digest:** `__PD_IMAGE_TAG_AND_DIGEST__`
- **Required external-DP flags confirmed in `vllm serve --help`:** __PD_IMAGE_FLAG_EVIDENCE__
- **HTTP rank ports and supervisor health-port separation:** __PD_PORT_EVIDENCE__
- **KV transfer and request-through-Router evidence:** __PD_KV_AND_ROUTER_RUNTIME_EVIDENCE__
- **Known limitations (single pool per role, no independent replica groups, other routers not covered):** __PD_LIMITATIONS__

## Changes / 变更内容明细

| File | Change | Reason / user impact |
| --- | --- | --- |
| `recipes/overlays/__HF_ORG__/__HF_REPO__.yaml` | `__RECIPE_CHANGE_SUMMARY__` | `__RECIPE_CHANGE_REASON__` |
| `__DOCUMENTATION_FILE_OR_REMOVE_ROW__` | `__DOCUMENTATION_CHANGE__` | `__DOCUMENTATION_REASON__` |
| `__OTHER_FILE_OR_REMOVE_ROW__` | `__OTHER_CHANGE__` | `__OTHER_REASON__` |

- **Huawei scope only:** __SCOPE_REVIEW_RESULT__
- **Base default and inherited variants remain usable:** __INHERITED_VARIANT_REGRESSION_RESULT__
- **NVIDIA/AMD and unrelated recipe output comparison:** __NON_ASCEND_DIFF_RESULT__

## Dependencies / 依赖项说明

| Dependency | Required version / commit / digest | Already merged or published? | Evidence / compatibility notes |
| --- | --- | --- | --- |
| Base recipe in `vllm-project/vllm` | `__BASE_RECIPE_COMMIT__` | `YES / NO (blocks merge)` | __BASE_DEPENDENCY_EVIDENCE__ |
| Renderer contract (`recipes#1226` or newer) | `__RENDERER_COMMIT__` | `YES / NO` | __RENDERER_DEPENDENCY_EVIDENCE__ |
| vLLM runtime | `__VLLM_VERSION_OR_COMMIT__` | `YES / NO` | __VLLM_DEPENDENCY_EVIDENCE__ |
| vLLM Ascend runtime | `__VLLM_ASCEND_VERSION_OR_COMMIT__` | `YES / NO` | __VLLM_ASCEND_DEPENDENCY_EVIDENCE__ |
| Serving image | `__IMAGE_TAG_AND_DIGEST__` | `YES / NO` | __IMAGE_AVAILABILITY_EVIDENCE__ |
| Model checkpoints | `__CHECKPOINT_REVISIONS__` | `YES / NO` | __CHECKPOINT_AVAILABILITY_EVIDENCE__ |
| Mooncake / transfer engine / proxy | `__MOONCAKE_PROXY_VERSIONS__` | `YES / NO / N_A` | __MOONCAKE_DEPENDENCY_EVIDENCE__ |
| Other packages / host driver / firmware | `__OTHER_DEPENDENCY_VERSIONS__` | `YES / NO / N_A` | __OTHER_DEPENDENCY_EVIDENCE__ |

## Test evidence / 测试验证情况

### Static validation and rendering

<!--
Run from vllm-project/recipes with the owning source pointed at the PR checkout.
`validate-source` is the same strict assemble + schema + JSON API validation used
by the source PR check. test:render requires the corresponding JSON build first.
Do not stage generated public/ or .content/ artifacts.
-->

```bash
node scripts/validate-source.mjs --source vllm-ascend --dir __VLLM_ASCEND_RECIPE_DIR__
pnpm test:schema
pnpm test:overlay
pnpm test:presets
pnpm test:pd-connectors
pnpm test:hardware
pnpm test:guide-html
pnpm test:render
```

| Check | Final-head result | Log / artifact | Notes and unrelated baseline failures |
| --- | --- | --- | --- |
| `validate-source` | `PASS / FAIL / NOT_RUN` | __VALIDATE_SOURCE_LOG__ | __NOTES__ |
| Schema / overlay scope | `PASS / FAIL / NOT_RUN` | __SCHEMA_OVERLAY_LOG__ | __NOTES__ |
| Presets and every point | `PASS / FAIL / NOT_RUN` | __PRESET_LOG__ | __NOTES__ |
| PD connectors / external-DP | `PASS / FAIL / NOT_RUN` | __PD_CONNECTOR_LOG__ | __NOTES__ |
| Hardware rules / guide HTML | `PASS / FAIL / NOT_RUN` | __HARDWARE_GUIDE_LOG__ | __NOTES__ |
| JSON vs Markdown render parity | `PASS / FAIL / NOT_RUN` | __RENDER_PARITY_LOG__ | __NOTES__ |
| Existing-model and non-Ascend diff | `PASS / FAIL / NOT_RUN` | __REGRESSION_DIFF_LOG__ | __NOTES__ |
| `git diff --check` | `PASS / FAIL / NOT_RUN` | __DIFF_CHECK_LOG__ | __NOTES__ |

### NPU smoke and inference correctness

| Variant / topology | `/health` | `/v1/models` canonical id | Valid generation + `finish_reason: stop` | Runtime fingerprint | Evidence |
| --- | --- | --- | --- | --- | --- |
| `__VARIANT_AND_TOPOLOGY__` | `PASS / FAIL / NOT_RUN` | `PASS / FAIL / NOT_RUN` | `PASS / FAIL / NOT_RUN` | `__BUILD_IMAGE_MODEL_REVISION__` | __SMOKE_LOG__ |
| `__SECOND_VARIANT_AND_TOPOLOGY__` | `PASS / FAIL / NOT_RUN` | `PASS / FAIL / NOT_RUN` | `PASS / FAIL / NOT_RUN` | `__BUILD_IMAGE_MODEL_REVISION__` | __SMOKE_LOG__ |

- Optional feature evidence (tool calling/reasoning/multimodal/spec decoding/long context): __OPTIONAL_FEATURE_EVIDENCE_OR_NOT_RUN__
- Accuracy/quality comparison, if claimed: __ACCURACY_EVIDENCE_OR_NOT_RUN__

### Multi-node distributed connectivity

- HCCL/interface/device visibility: __HCCL_CONNECTIVITY_EVIDENCE__
- Rendezvous and every rank joining: __RANK_JOIN_EVIDENCE__
- Every role/node health: __ALL_NODE_HEALTH_EVIDENCE__
- Request through Ascend Router plus KV transfer: __ROUTER_KV_CONNECTIVITY_EVIDENCE__
- Logs for head, every follower, prefill/decode, and Router: __DISTRIBUTED_LOG_BUNDLE__

### Performance benchmarks

<!--
Record exact revisions, image digest, hardware topology, warmup, input/output
lengths, concurrency, and raw logs. A generated command is not a benchmark.
Do not claim a regression threshold that was not agreed for this model.
-->

| Variant / strategy | Hardware and nodes | Input / output lengths | Concurrency | TTFT | TPOT | Throughput | Baseline comparison | Raw evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `__VARIANT_STRATEGY__` | `__HW_TOPOLOGY__` | `__INPUT_OUTPUT__` | `__CONCURRENCY__` | `__TTFT__` | `__TPOT__` | `__THROUGHPUT__` | `__BASELINE_DELTA__` | __BENCHMARK_LOG__ |
| `__SECOND_VARIANT_STRATEGY__` | `__HW_TOPOLOGY__` | `__INPUT_OUTPUT__` | `__CONCURRENCY__` | `__TTFT__` | `__TPOT__` | `__THROUGHPUT__` | `__BASELINE_DELTA__` | __BENCHMARK_LOG__ |

### Fault tolerance and negative cases

| Scenario | Expected behavior | Actual result | Evidence |
| --- | --- | --- | --- |
| Worker/node process failure and restart | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| Ascend Router unavailable / restored | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| Mooncake/KV transfer failure | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| HCCL/rendezvous timeout | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| Rank HTTP-port or health-port conflict | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| Invalid TP/PP/DP combination | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |
| Unsupported or unqualified variant/hardware selection | `__EXPECTED__` | `PASS / FAIL / NOT_RUN` | __FAULT_LOG__ |

## Backward compatibility and upgrade notes / 向后兼容与升级注意事项

- **Backward compatibility:** __BACKWARD_COMPATIBILITY_RESULT__
- **Existing install/runtime requirements changed?:** __RUNTIME_REQUIREMENT_CHANGES__
- **Default selection, flags, checkpoint, or image changed?:** __BEHAVIOR_CHANGES__
- **User migration steps:** __MIGRATION_STEPS_OR_NONE_WITH_REASON__
- **Rollback / fallback:** __ROLLBACK_INSTRUCTIONS__
- **Known upgrade risks and mitigations:** __UPGRADE_RISKS__

## Documentation / 文档配套

| Document | Update or N/A reason | Link / evidence |
| --- | --- | --- |
| Template/model configuration usage | `__USAGE_DOC_UPDATE__` | __USAGE_DOC_LINK__ |
| `recipes/README.md` | `__README_UPDATE_OR_NA_REASON__` | __README_LINK__ |
| `docs/source/user_guide/support_matrix/supported_models.md` | `__SUPPORT_MATRIX_UPDATE_OR_NA_REASON__` | __SUPPORT_MATRIX_LINK__ |
| `docs/source/tutorials/models/__MODEL_TUTORIAL__.md` | `__DEPLOYMENT_GUIDE_UPDATE_OR_NA_REASON__` | __DEPLOYMENT_GUIDE_LINK__ |
| Other references / release notes | `__OTHER_DOC_UPDATE_OR_NA_REASON__` | __OTHER_DOC_LINK__ |

<!-- recipes/README.md is not a continuously maintained full model index. N/A is
valid only with that reason; do not create a fake index requirement. Support
status and tutorials must never claim more than the attached evidence. -->

## Issues and design references / 关联 Issue 与设计文档

- **Closes:** `Closes #__ISSUE_NUMBER__` (or `Related: __ISSUE_URL__`)
- **Model card:** __MODEL_CARD_URL__
- **Runtime model-support PR/design:** __RUNTIME_SUPPORT_PR_URL__
- **Recipe/design document:** __RECIPE_DESIGN_DOC_URL__
- **PD design/evidence:** __PD_DESIGN_DOC_URL__
- **Related historical PRs and what was reused:** __RELATED_PRS_AND_REUSE__
- **Additional references:** __ADDITIONAL_REFERENCES__

<!-- A recipe tracking issue belongs here, not in the user-facing YAML guide. -->

## Preview and merge checklist / 预览与合入检查

- **Recipe label applied:** `YES / NO`
- **Preview URL:** __PREVIEW_URL__
- **Preview actually deployed commit:** `__PREVIEW_HEAD_COMMIT__`
- **Preview dispatch and deployment are both successful:** `YES / NO / NOT_RUN`
- **Preview selections checked (hardware/variant/strategy/features/preset/point):** __PREVIEW_SELECTION_EVIDENCE__
- **Final PR head:** `__FINAL_HEAD_COMMIT__`
- **Every commit has `Signed-off-by`:** `YES / NO`
- **Final-head required checks:** __FINAL_HEAD_CI_LINKS_AND_RESULTS__

<!--
Paste the applicable checklist from pr-checklist.md below. Keep NOT_RUN and
N/A + reason explicit. Empty checkboxes and static-CI-only evidence do not meet
this task's full-scene runtime acceptance bar.
-->

### Pasted checklist and evidence

__PASTE_COMPLETED_PR_CHECKLIST_HERE__
