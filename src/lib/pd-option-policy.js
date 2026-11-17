// PD router / connector admission and visibility, driven by each catalog entry.
// Keep this module browser-safe: callers provide compatibility checks so this
// pure policy helper does not depend on command synthesis.

export function pdRouterOption(strategy, key) {
  return key === "vllm" ? strategy?.router : strategy?.[key];
}

export function evaluatePdOption({
  strategy,
  option,
  key,
  field,
  hardware,
  effectiveSelect,
  compatibilityReason = null,
}) {
  const name = option?.display_name || key;
  let scopeReason = null;
  if (strategy?.deploy_type !== "pd_cluster") {
    scopeReason = `${name} requires PD disaggregation.`;
  } else if (!option) {
    scopeReason = `${name} is not configured for this PD strategy.`;
  } else if (option.brands?.length && !option.brands.includes(hardware?.brand)) {
    scopeReason = `${name} requires ${option.brands.join(" / ")} hardware.`;
  } else if (option.requires_preset === true && effectiveSelect?.[field] !== key) {
    scopeReason = `Select a model preset that explicitly configures ${name} for this hardware and variant.`;
  }

  const pd = strategy?.deploy_type === "pd_cluster";
  const brandSupported = !option?.brands?.length || option.brands.includes(hardware?.brand);
  return {
    visible: pd && !!option && !(option.hide_on_unsupported_hardware === true && !brandSupported),
    scopeReason,
    unavailableReason: scopeReason || compatibilityReason || null,
  };
}
