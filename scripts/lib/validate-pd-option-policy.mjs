const POLICY_FIELDS = ["requires_preset", "hide_on_unsupported_hardware"];
const ROUTER_OPTIONS = new Set(["router", "dynamo", "smg", "ascend"]);

const validBrands = (option) => Array.isArray(option?.brands)
  && option.brands.length > 0
  && option.brands.every((brand) => typeof brand === "string" && brand.trim().length > 0);

/** Catalog-only validation. Returns `<config.path>: message` error strings. */
export function validatePdOptionPolicy(strategy) {
  const errors = [];
  const visit = (value, path = []) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const connector = strategy?.deploy_type === "pd_cluster" && path.length === 2 && path[0] === "connectors";
    const router = strategy?.deploy_type === "pd_cluster" && path.length === 1 && ROUTER_OPTIONS.has(path[0]);
    const allowed = connector || router;
    for (const field of POLICY_FIELDS) {
      if (!Object.hasOwn(value, field)) continue;
      const at = [...path, field].join(".");
      if (typeof value[field] !== "boolean") errors.push(`${at}: expected boolean`);
      if (!allowed) errors.push(`${at}: only a pd_cluster router or connector may set this policy`);
    }
    if (value.hide_on_unsupported_hardware === true && !validBrands(value)) {
      errors.push(`${[...path, "hide_on_unsupported_hardware"].join(".")}: requires a non-empty brands list of hardware brand names`);
    }
    if (connector && value.requires_preset === true && value.default === true) {
      errors.push(`${[...path, "requires_preset"].join(".")}: a gated connector cannot also be the catalog default`);
    }
    for (const [key, child] of Object.entries(value)) visit(child, [...path, key]);
  };
  visit(strategy);
  return errors;
}
