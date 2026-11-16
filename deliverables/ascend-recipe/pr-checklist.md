# Ascend Recipe Overlay PR Checklist

适用对象：向 `vllm-project/vllm-ascend` 新增共享模型 `recipes/overlays/<hf_org>/<hf_repo>.yaml` 的 PR。

## 使用规则与状态定义

本 Checklist 同时包含两类门槛，不能相互替代：

- **A — 仓库强制门槛**：来源/scope/schema、PR 标题与标签、DCO、最终 head 的适用 CI 和预览等。
- **B — 本次全场景交付证据门槛**：用户要求的全部精度、部署形态、NPU smoke、多节点、性能、容错与文档证据。这些不一定都由仓库自动 CI 执行，但不能因静态 CI 通过而视为完成。

填写规则：

- `[x]` 仅表示 **PASS** 或有充分理由的 **N/A**；每项在末尾附日志、链接、命令输出或 N/A 原因。
- **NOT_RUN** 保持 `[ ]` 并写明 `NOT_RUN + 原因`，不得写 PASS。
- **FAIL** 保持 `[ ]`，链接失败日志并记录是否为当前 PR 引入。
- 结构上不支持的组合写 `N/A (renderer limitation)`；已支持但没测试写 `NOT_RUN`，二者都不是通过。
- `verified`、性能提升、全精度或全场景“已验证”等声明，必须能追溯到**最终 PR head**对应的模型 revision、runtime commit、镜像 digest 和原始证据。

## PR 基线信息

- **PR / head:** __PR_URL__ / `__FINAL_HEAD_COMMIT__`
- **Base recipe / commit:** __BASE_RECIPE_URL__ / `__BASE_RECIPE_COMMIT__`
- **Renderer / reusable workflow commit:** `__RENDERER_AND_WORKFLOW_COMMIT__`
- **vLLM / vLLM Ascend runtime:** `__VLLM_COMMIT__` / `__VLLM_ASCEND_COMMIT__`
- **Image tag / digest:** `__IMAGE_TAG__` / `__IMAGE_DIGEST__`
- **Checkpoint revisions:** __CHECKPOINT_REVISIONS__
- **Hardware / physical topology:** __HARDWARE_AND_PHYSICAL_TOPOLOGY__
- **Evidence bundle:** __EVIDENCE_BUNDLE_URL__

---

# A. 仓库强制门槛

## A1. 来源、归属与变更范围

- [ ] HF `<org>/<repo>` 的大小写、recipe 路径和 base `model.model_id` 完全一致；已核实 canonical repo 与每个量化 checkpoint，而非使用别名或猜测路径。证据：__HF_IDENTITY_EVIDENCE__
- [ ] vLLM 当前 base 已存在于 `recipes/models/__HF_ORG__/__HF_REPO__.yaml`，并记录其 commit；overlay 不是 orphan。证据：__BASE_EXISTENCE_EVIDENCE__
- [ ] 新文件位于 `vllm-ascend/recipes/overlays/__HF_ORG__/__HF_REPO__.yaml`，未错误新增共享模型的 Ascend-only `models/` owner。证据：__CHANGED_FILES__
- [ ] overlay 只添加 Huawei scope；未修改 NVIDIA/AMD 或其他品牌配置，未添加非 Huawei dependency。证据：__SCOPE_DIFF__
- [ ] 未写入 `model`、`compatible_strategies`、顶层 `guide`、`default_strategy`、`opt_in_features`、`kv_offload_support`、`troubleshooting`、`pool_modes` 等 overlay 不可写字段。证据：__OVERLAY_FIELD_REVIEW__
- [ ] 未覆盖 base `meta/model/default`、未把 scalar 提升为 map、未复制 base recipe 来绕过 owner 规则；base 已有 variant 只追加合法的 Huawei key。证据：__ADD_ONLY_REVIEW__
- [ ] 所有新 variant 都有非空且全 Huawei 的 `supported_hardware`；所有 preset 都使用 taxonomy 中存在的精确 Ascend hardware id。证据：__VARIANT_PRESET_SCOPE_CHECK__
- [ ] `meta.hardware` 的 `supported/verified/unsupported` 使用正确；`unsupported` 对应已确认 blocker，而不是“未测试”。证据：__HARDWARE_STATUS_REVIEW__
- [ ] 未向 base 已有 variant 随意新增 `supported_hardware`，避免把原本适用于非 Ascend 的 variant 意外限制为 Ascend-only。证据：__INHERITED_VARIANT_ELIGIBILITY_REVIEW__

## A2. YAML、命名与注释合规

- [ ] YAML parser 可解析；没有 tab、重复 key、错误缩进、非预期锚点/标签或未闭合 block scalar。证据：__YAML_PARSE_RESULT__
- [ ] `node scripts/validate-source.mjs --source vllm-ascend --dir __RECIPE_DIR__` 在最终 head 通过 strict assemble、scope、schema、JSON API 和 preset/point 渲染。日志：__VALIDATE_SOURCE_LOG__
- [ ] 所有字段都存在于当前 renderer schema 和 `OVERLAY_RULES`；没有来自旧 launcher/grouped 实现的 `processes[]`、`nodes_per_instance`、recipe 私有 connector map 等字段。证据：__SCHEMA_FIELD_REVIEW__
- [ ] variant/preset/point key 使用合法小写 id；`baseline` 未被占用；硬件 key 不使用显示名。证据：__KEY_NAMING_REVIEW__
- [ ] 每个 Ascend 新增 variant 都显式设置用户可见 `label`；量化 label 中的 **ASCEND 全部大写**，不依赖 UI 从 precision 推导名称。证据：__LABEL_REVIEW__
- [ ] PR 标题采用 `[Doc][Recipe] Add <hf_org>/<hf_repo> Ascend recipe overlay` 或包含其他仓库允许的变更前缀；`[Recipe]` 没有单独作为有效前缀。证据：__PR_TITLE__
- [ ] 必填字段、可选字段、取值范围、单/多节点语义、硬件约束、精度/量化约束和证据边界均有清晰注释；注释与实际 renderer 行为一致。证据：__COMMENT_REVIEW__
- [ ] 没有未替换的 `__PLACEHOLDER__`、TODO、示例假模型、无效 URL、伪造 revision/image/digest 或“未验证即通过”的描述。检查：__PLACEHOLDER_SCAN__
- [ ] `git diff --check` 通过；补丁仅包含预期源文件，不含生成物、临时脚本、缓存、日志或无关格式化。证据：__DIFF_CHECK_LOG__
- [ ] 每个 commit 都有正确的 `Signed-off-by` trailer（使用 `git commit -s`），DCO App 在最终 head 通过。证据：__DCO_RESULT__

## A3. 静态回归与仓库 CI

- [ ] `pnpm test:schema` 通过。日志：__SCHEMA_TEST_LOG__
- [ ] `pnpm test:overlay` 通过，且 add-only/split round-trip 无 scope 越界。日志：__OVERLAY_TEST_LOG__
- [ ] `pnpm test:presets` 通过；每个 preset × point 都严格渲染，没有静默缺失。日志：__PRESET_TEST_LOG__
- [ ] `pnpm test:pd-connectors` 通过。日志：__PD_CONNECTOR_TEST_LOG__
- [ ] `pnpm test:hardware` 通过。日志：__HARDWARE_TEST_LOG__
- [ ] `pnpm test:guide-html` 通过；guide 无 raw HTML 或不安全 URL。日志：__GUIDE_HTML_TEST_LOG__
- [ ] 对应 JSON 构建完成后，`pnpm test:render` 通过；页面查询渲染与静态 JSON/preset point 一致。日志：__RENDER_TEST_LOG__
- [ ] 对相同 base/renderer 做既有模型和 NVIDIA/AMD 输出差分；除预期 Huawei 新增外无变化。证据：__NON_ASCEND_REGRESSION_DIFF__
- [ ] `recipe` 标签已由 labeler 或维护者添加到最终 PR。证据：__PR_LABEL__
- [ ] 最终 head 的 Recipes、pre-commit、cpu-ut、ci-gate、标题检查、DCO 及其他适用 required checks 全部通过；失败项已归因，未把旧失败写成成功。证据：__FINAL_HEAD_CHECKS__
- [ ] preview dispatch 成功 **且实际 preview 部署成功**；部署 commit 等于最终 head，并检查 hardware/variant/strategy/feature/preset/point。证据：__PREVIEW_URL_AND_COMMIT__

---

# B. 本次全场景交付证据门槛

## B1. 全部精度、checkpoint 与安装路径

> 对目标模型实际发布的每一种 Ascend 精度逐项复制本小节。模板中的可选块不是全模型通用清单；不存在的精度应删除，实际存在的新精度必须补齐。

- [ ] 已列出目标模型**全部** Ascend checkpoint/variant，包括复用 base 的 default/BF16/FP8；没有只验证新增 variant 而遗漏仍可达的继承 variant。矩阵：__FULL_PRECISION_MATRIX__
- [ ] 每个 checkpoint 的 HF id、immutable revision、访问权限、shard 数量/大小与完整性均已验证；没有使用相似名称的缓存权重代替。证据：__CHECKPOINT_ACCESS_INTEGRITY__
- [ ] 每个 variant 的 label、内部 `precision`、checkpoint 格式和 runtime quantization 四者一致，并有模型卡/runtime 文档或代码证据。证据：__PRECISION_QUANTIZATION_MAPPING__
- [ ] `ascend_w8a8` 使用 `label: W8A8 (ASCEND)`、`precision: int8`；`--quantization ascend` 仅在权重/runtime 合同要求时保留。证据：__W8A8_MAPPING_EVIDENCE__
- [ ] `ascend_w8a8_mxfp8` 使用 `label: W8A8 MXFP8 (ASCEND)`、`precision: mxfp8` 和 `--quantization ascend`；没有误写为 `--quantization mxfp8`。证据：__W8A8_MXFP8_MAPPING_EVIDENCE__
- [ ] `ascend_w4a8` 使用 `label: W4A8 (ASCEND)`、`precision: int4`；`ascend_w4a4_mxfp4` 使用 `label: W4A4 (ASCEND)`、`precision: mxfp4`；没有混用 W4A4/W4A8 名称。证据：__W4_MAPPING_EVIDENCE__
- [ ] 原生 MXFP8 与 W8A8 MXFP8 (ASCEND) 分开建模；`--quantization mxfp8`、`--dtype`、`--kv-cache-dtype` 等只来自该原生路径的真实证据。证据：__NATIVE_MXFP8_MAPPING_EVIDENCE__
- [ ] `vram_minimum_gb` 使用总参数量和正确字节数；MoE 包含未激活专家；混合精度按真实权重 footprint × 1.2，而不是机械按 bit 数估算。证据：__VRAM_CALCULATION__
- [ ] 每个 variant 的 `min_vllm_version`、依赖、pip/Docker 安装路径、镜像 tag/digest 和入口均真实存在且包含所需模型/量化支持。证据：__INSTALL_RUNTIME_MATRIX__
- [ ] 没有从其他模型复制 EP/DP/PP、长上下文、graph、多模态、MTP 或 parser 参数；所有 variant `extra_args/extra_env` 都有用途和证据。证据：__VARIANT_ARGS_REVIEW__
- [ ] 每个继承 feature、frontend 和可选功能均检查 Ascend 兼容性；未实测功能没有标为 verified。证据：__FEATURE_COMPATIBILITY_MATRIX__
- [ ] 切换 default/其他 variant 后，安装、Serve、Verify、Bench 使用同一预期 model id，未出现基线回归。证据：__VARIANT_SWITCH_REGRESSION__

## B2. 四种并行组合与单/多节点渲染

### 纯 TP：`single_node_tp` / `multi_node_tp`

- [ ] 单机 TP 的 `--tensor-parallel-size` 等于经过验证的配置；没有误带多节点 rendezvous 参数。证据：__SINGLE_TP_RENDER__
- [ ] 多机 TP 的总 TP、节点数、`--nnodes`、`--node-rank`、`--master-addr` 正确；follower 使用 `--headless`。证据：__MULTI_TP_RENDER__
- [ ] Head 与每个 follower 都有独立命令；`worker_commands[]`/相应 JSON 数组完整，rank 1 没有被重复用于所有节点。证据：__MULTI_TP_WORKER_COMMANDS__
- [ ] 单机与多机均完成冒烟或明确标记 NOT_RUN；多机实际 join 和推理证据见 B5。证据：__TP_RUNTIME_MATRIX__

### TP+PP：`multi_node_tp_pp`

- [ ] 生成节点内 TP 和跨节点 PP；TP=每节点设备数、PP=节点数（或经当前策略明确计算后的值），没有用 raw args 覆盖拓扑。证据：__TP_PP_RENDER__
- [ ] 每个 rank 的 node rank/master/headless 和 pipeline 拓扑一致；所有节点命令完整。证据：__TP_PP_WORKER_COMMANDS__
- [ ] 没有虚构 `single_node_tp_pp`；单机 TP+PP 在覆盖矩阵中为 `N/A (renderer limitation)`。证据：__SINGLE_TP_PP_NA_REASON__
- [ ] 多机 TP+PP 已完成实际推理或明确标记 NOT_RUN。证据：__TP_PP_RUNTIME_EVIDENCE__

### TP+DP：`multi_node_tp_dp`

- [ ] 生成节点内 TP、跨节点 DP 和 `--data-parallel-size-local 1`；DP size/rank 与节点数一致。证据：__TP_DP_RENDER__
- [ ] worker node N 的 DP rank 正确，所有节点命令和网络地址完整。证据：__TP_DP_WORKER_COMMANDS__
- [ ] 没有把该策略描述为任意 local DP；没有虚构 `single_node_tp_dp`。证据：__TP_DP_SCOPE_REVIEW__
- [ ] 多机 TP+DP 已完成实际推理或明确标记 NOT_RUN。证据：__TP_DP_RUNTIME_EVIDENCE__

### DP+TP+EP：DEP 与 PD role

- [ ] base 模型确为 MoE；`single_node_dep`/`multi_node_dep` 只在架构和 runtime 支持时开放，dense 模型已删除这些块。证据：__MOE_ARCHITECTURE_EVIDENCE__
- [ ] 聚合 DEP 输出包含正确的 EP/DP 参数和节点命令；没有把 DEP 自动描述为可独立设置任意 TP 的 DP+TP+EP。证据：__AGGREGATED_DEP_RENDER__
- [ ] 需要显式 TP>1 的 DP+TP+EP 使用合格 PD DEP role：`parallelism: dep`、`tp: N`、`pp: 1`。证据：__PD_DEP_TOPOLOGY_CONFIG__
- [ ] PD DEP 满足 `tp` 整除每节点设备数；`local_dp = devices_per_node / tp`、`global_dp = nodes × local_dp`、start rank 按节点递增，计算结果有逐项记录。证据：__PD_DEP_ARITHMETIC__
- [ ] 非 PD 显式 DP+TP+EP 的结构缺口已标为 N/A；没有用 `--tensor-parallel-size` raw args 制造与 connector/Router 不一致的拓扑。证据：__NON_PD_DP_TP_EP_NA_REASON__

## B3. PD 分离 + Ascend Router + 分布式 DP 专项

### Preset、选择与拓扑

- [ ] `pd_cluster` 的支持路径是匹配 hardware + variant 的 `ascend_pd` preset；该 preset 默认 opt-in，除非有充分依据设为默认。证据：__PD_PRESET_CONFIG__
- [ ] active preset 同时包含 `select.pd_router: ascend` 和 `select.pd_connector: mooncake_ascend`；最终 rendering 的 Router、connector key 和 runtime class 三者一致。证据：__PD_FINAL_SELECTION_RENDER__
- [ ] preset 的 `source.href/key/revision`、镜像/digest、model revision 和实测证据完整；不是无来源的拓扑示例。证据：__PD_PRESET_SOURCE__
- [ ] Prefill/Decode 的 `nodes/parallelism/tp/pp` 与物理拓扑一致；TP/PP role 使用 pool device 推导，DEP role 遵守 PP1/TP 整除。证据：__PD_ROLE_TOPOLOGY_REVIEW__
- [ ] 每角色只有一个 pool 的限制已记录；没有使用独立 replica groups、旧 grouped/launcher 字段或手工 Start_Server 模板。证据：__PD_SCOPE_REVIEW__
- [ ] 文档准确说明：native vLLM 启动/监督 external-DP workers，Ascend Router 负责代理与 endpoint 路由，**不是 worker 进程 launcher**。证据：__PD_ROUTER_SEMANTICS_REVIEW__
- [ ] 已说明 Baseline/其他 Router 不属于本 overlay 的验证范围，且当前 schema 不能全局禁止这些选择；没有虚假宣称 YAML 已强制所有 PD 用户只能使用 Ascend Router。证据：__PD_BASELINE_LIMIT_DISCLOSURE__

### 逐节点命令、external-DP 与 endpoints

- [ ] Prefill 和 Decode 的 `node_commands[]` 分别覆盖所有节点，包含 node rank、command/argv/env 及可用 Docker 形式；Markdown 与 JSON 一致。证据：__PD_ALL_NODE_COMMANDS__
- [ ] preset 通过 `remove_args: ["--data-parallel-hybrid-lb"]` 清除 base 可能继承的 hybrid-LB；最终 argv 不含 hybrid 与 external 模式冲突，也未误删当前拓扑需要的 external-LB flag。证据：__PD_INHERITED_LB_CLEANUP__
- [ ] global DP=1 时不生成错误的 DP rank/start-rank/external-LB 参数，Router 只有一个适用 endpoint，connector `dp_size=1`。证据：__PD_GLOBAL_DP1_RENDER__
- [ ] global DP>1 且 local DP=1 时，各节点使用正确的 `--data-parallel-rank` 和 `--data-parallel-external-lb`。证据：__PD_LOCAL_DP1_RENDER__
- [ ] local DP>1 时使用 `--data-parallel-start-rank` 和 `--data-parallel-multi-port-external-lb`；native supervisor 的 device slice、`start_rank + local_rank` 和 `base_port + local_rank` 均已核对。证据：__PD_LOCAL_DP_MULTI_RENDER__
- [ ] Ascend Router 枚举所有 DP rank HTTP endpoints；TP/PP pool 只列出适用服务头 endpoint；没有重复 rank0 或遗漏末尾 rank。证据：__PD_ROUTER_ENDPOINT_LIST__
- [ ] connector 最终 JSON 是合法对象且有非空 transfer `kv_connector`；Prefill/Decode 的 DP/TP/PP placeholder 均解析为 JSON number。证据：__PD_CONNECTOR_JSON_RENDER__
- [ ] V1/V2/Hybrid/其他 Mooncake implementation 只对实际验证项勾选；使用按名称寻址的 `json_args`，没有覆盖 MultiConnector 根 connector 或丢失 KV tier。证据：__MOONCAKE_IMPLEMENTATION_RENDER__
- [ ] 选中镜像的 `vllm serve --help` 包含所需 external-DP/multi-port flag，并含匹配的 Mooncake 与 Ascend proxy 实现。证据：__PD_IMAGE_CAPABILITY_CHECK__
- [ ] proxy 脚本与当前 renderer/runtime 匹配；HTTP rank ports 不冲突，并避开 supervisor health port（默认 9256，若配置不同则记录实际值）。证据：__PD_PROXY_AND_PORT_CHECK__

## B4. 单功能冒烟与推理正确性

> 每一种声明支持的精度至少覆盖代表硬件；每一种可选功能独立验证。服务启动成功不等于推理通过。

- [ ] 权重加载完成，日志中的 architecture、checkpoint revision、dtype/quantization、runtime source fingerprint 与预期一致。证据：__WEIGHT_LOAD_FINGERPRINT__
- [ ] `/health` 成功。证据：__HEALTH_CHECK_LOG__
- [ ] `/v1/models` 返回所选 canonical/variant model id。证据：__MODELS_CHECK_LOG__
- [ ] `/v1/chat/completions` 返回有效内容且 `finish_reason: stop`；不是空内容、错误 JSON 或仅连接成功。证据：__CHAT_COMPLETION_LOG__
- [ ] 对 embedding/reranker/multimodal 等非普通 chat 模型，使用其实际任务 endpoint 和有效输入完成等价验证；普通 chat 检查标 N/A 并说明原因。证据：__TASK_SPECIFIC_INFERENCE_LOG__
- [ ] tool calling、reasoning、spec decoding、多模态、长上下文、KV offload 等可选路径分别验证或标 NOT_RUN；没有从 base chat PASS 推断其通过。证据：__OPTIONAL_FEATURE_RUNTIME_MATRIX__
- [ ] 对声称的精度/准确率结果，记录数据集、指标、对比基线和原始输出；未执行则不写准确率声明。证据：__ACCURACY_EVALUATION_OR_NOT_RUN__

## B5. 多节点分布式连通性

- [ ] 所有节点的 NPU、driver/firmware、设备映射、网络和 HCCL interface 配置一致且符合模型要求。证据：__DISTRIBUTED_HOST_MATRIX__
- [ ] head/master/rendezvous 地址可达，所有 rank 成功 join，无重复 rank、错误 group head 或 follower 自连 loopback。证据：__RENDEZVOUS_JOIN_LOG__
- [ ] 每个 Head/Node N、Prefill/Decode 节点和每个 DP rank 的健康状态均有证据。证据：__ALL_RANK_HEALTH_LOG__
- [ ] TP、TP+PP、TP+DP、DEP 各声明形态均完成跨节点推理或标 NOT_RUN；不是只验证服务进程启动。证据：__MULTI_STRATEGY_DISTRIBUTED_MATRIX__
- [ ] PD 通过 Ascend Router 发起请求，并确认实际发生 Mooncake KV transfer；不是绕过 Router 直接请求单个 worker。证据：__ROUTER_KV_TRANSFER_LOG__
- [ ] 已收集 head、所有 follower、Prefill/Decode、Router/Proxy 和 connector 的原始日志，可按时间关联一次完整请求。证据：__DISTRIBUTED_LOG_BUNDLE__

## B6. 不同并行策略的性能基准

- [ ] 每个基准记录模型 revision、vLLM/vLLM Ascend commit、镜像 digest、NPU 型号、每节点设备数、节点数和完整策略拓扑。证据：__BENCHMARK_ENVIRONMENT__
- [ ] 记录 workload、数据集/请求分布、输入/输出长度、并发、warmup、测量轮次和客户端位置；未使用范围或公式代替明确 operating point。证据：__BENCHMARK_WORKLOAD__
- [ ] 对 TP、TP+PP、TP+DP、DEP/PD 的声明验证场景分别记录吞吐、TTFT、TPOT/延迟和必要的显存指标，或标 NOT_RUN。结果：__STRATEGY_BENCHMARK_MATRIX__
- [ ] preset `points` 使用实测 operating points；concurrency 是明确整数，label 与内容一致，benchmark-only 配置保持 opt-in。证据：__PRESET_POINT_BENCHMARKS__
- [ ] 性能对比有同版本/同负载基线和原始日志；没有虚构阈值、把单次结果写成稳定结论或把静态渲染当性能证据。证据：__PERFORMANCE_BASELINE_AND_RAW_LOGS__
- [ ] `performance_headline`、preset runbook 和 PR 中的数字均来自上述结果，未把其他模型/硬件/精度的数据移用。证据：__PERFORMANCE_CLAIM_REVIEW__

## B7. 异常场景与容错

- [ ] worker/节点进程异常退出与重启行为符合预期，日志能定位失败 rank；恢复后不残留错误 endpoint。证据：__WORKER_FAILURE_TEST__
- [ ] Ascend Router 不可用和恢复时的请求行为符合预期，客户端错误可读，没有错误转发到失效 rank。证据：__ROUTER_FAILURE_TEST__
- [ ] Mooncake/KV transfer 失败、超时或版本不匹配时能观察到明确错误并按 connector 策略处理。证据：__KV_FAILURE_TEST__
- [ ] HCCL/rendezvous 超时、网络不可达或错误 interface 时失败明确，不发生无限等待且无诊断。证据：__HCCL_FAILURE_TEST__
- [ ] rank HTTP port、KV port、bootstrap/side-channel port 或 supervisor health port 冲突时有明确失败和修复说明。证据：__PORT_CONFLICT_TEST__
- [ ] 非法 TP/PP/DP（不能整除、DEP PP>1、节点数不足等）在构建或启动早期失败，不输出误导性的可执行拓扑。证据：__INVALID_TOPOLOGY_TEST__
- [ ] 不支持/未验证的 variant、hardware、strategy、Router/Connector 组合不会被标记为 verified；请求值被 renderer 调整时，`selection.adjusted` 和文档保持一致。证据：__INVALID_SELECTION_TEST__
- [ ] checkpoint 无权限、revision 不存在、权重不完整或镜像拉取失败时的错误和恢复步骤已验证或标 NOT_RUN。证据：__DEPENDENCY_FAILURE_TEST__

## B8. 文档、索引与部署指引

- [ ] 配置模板/模型使用说明已同步：占位符替换、可选块裁剪、精度 label 映射、硬件 id、策略限制、PD preset 和验证命令均可操作。证据：__CONFIG_USAGE_DOC__
- [ ] `guide_sections.ascend` 包含模型/Ascend 概述、前置条件、Client Usage、实测范围和 References；未重复 builder 可生成的 launch/env，也没有“select X in builder”的漂移步骤。证据：__GUIDE_CONTENT_REVIEW__
- [ ] guide 中没有 `vllm serve`、`dynamo.vllm`、生成环境 exports 或与结构化字段重复的命令；配置专属说明位于 notes，已知症状修复位于合适的 owner 文档。检查：__GUIDE_COMMAND_SCAN__
- [ ] `recipes/README.md` 已核对。若本次修改其 provenance/清单则同步；若仅新增普通 overlay，可标 N/A，但必须说明“该文件不是持续维护的全量模型索引”。证据：__RECIPES_README_REVIEW__
- [ ] `docs/source/user_guide/support_matrix/supported_models.md` 按真实支持状态更新，或记录 N/A/独立文档 PR；支持状态和教程链接没有超出验证范围。证据：__SUPPORT_MATRIX_UPDATE__
- [ ] `docs/source/tutorials/models/` 的部署指引与本次精度、安装、单/多节点和 PD 路径同步，或记录 N/A/独立文档 PR；历史手写命令没有冒充当前 builder 输出。证据：__DEPLOYMENT_GUIDE_UPDATE__
- [ ] 站点首页/org 页面/sidebar 自动索引和 `.md`/`.json` agent 入口已在 preview 核对；没有把生成的 `public/` 当源文档提交。证据：__SITE_INDEX_AND_AGENT_RENDER_CHECK__
- [ ] 所有模型卡、runtime、设计、镜像、证据和 Ascend PD 文档链接可访问；recipe tracking issue 只在 PR 正文，不在用户 YAML References。证据：__REFERENCE_LINK_CHECK__

---

# C. 合入前最终门禁

## C1. 依赖与兼容性

- [ ] base recipe 已合入 vLLM main，或当前验证明确使用兼容 pin；不存在 strict validation 下的 orphan/ownership 冲突。证据：__BASE_MERGE_DEPENDENCY__
- [ ] renderer 至少包含 recipes#1226 的最终通用 PD pools/Ascend Router/Mooncake (Ascend) 合同，或包含其后续兼容替代；未依赖已删除的 launcher/grouped 实现。证据：__RENDERER_DEPENDENCY__
- [ ] vLLM/vLLM Ascend runtime 已包含模型注册、量化、所需 kernel、external-DP/multi-port、Mooncake 和 proxy 修复；未合入支持 PR 不被描述为已发布能力。证据：__RUNTIME_DEPENDENCY__
- [ ] 所有镜像、wheel、包、driver/firmware、connector 和 checkpoint 均可由普通用户按文档获取；内部 nightly/私有镜像没有伪装成公开依赖。证据：__DEPENDENCY_AVAILABILITY__
- [ ] 未依赖未合入的 renderer 提案（例如自定义 local DP、overlay default variant 或 preview-only recipe）作为当前功能；若确需依赖，已明确标为阻塞并链接对应 PR。证据：__UNMERGED_DEPENDENCY_REVIEW__

## C2. 向后兼容与升级注意事项

- [ ] base default、继承 variants、原有 features/frontends 和其他品牌输出无回归；差分证据已附。证据：__BACKWARD_COMPATIBILITY_DIFF__
- [ ] 既有 Ascend 模型/overlay 没有因共享字段、策略状态或 preset key 冲突而改变命令。证据：__ASCEND_EXISTING_RECIPE_DIFF__
- [ ] PR 已说明安装/runtime/镜像/checkpoint 升级、默认行为变化、迁移步骤、回退路径和风险；无变化时写明 `None` 及理由。证据：__UPGRADE_NOTES__
- [ ] 所有 `verified`、性能、精度和“全场景”声明在最终 head 重新核对；旧评论、旧预览或其他模型证据没有被当作当前结果。证据：__FINAL_CLAIM_AUDIT__

## C3. 最终提交与 CI

- [ ] 最终 head 已推送且与本地验证/预览/证据所测 commit 一致；CI 测试的不是旧 head 或不同 merge 合成结果。证据：__FINAL_HEAD_MATCH__
- [ ] 所有 required checks 全绿；非 required 失败也有归因，没有通过重跑或描述掩盖当前 PR 引入的问题。证据：__FINAL_CI_RESULTS__
- [ ] preview 在最终 head 可访问，实际展示的 Install/Serve/Verify/Bench、Router/Connector 和所有节点命令与 JSON/Markdown 一致。证据：__FINAL_PREVIEW_REVIEW__
- [ ] 未提交 `public/`、`.content/`、`.sources/`、`node_modules/`、source lock 的无关变更、本地 override、临时验证树、日志或缓存。证据：__FINAL_CHANGED_FILES__
- [ ] PR 正文所有必填模块、变更明细、依赖、升级说明、Issue/设计链接和 Checklist 证据已填写；无空模板段或占位符。证据：__FINAL_PR_BODY_REVIEW__
- [ ] DCO/sign-off、标题、`recipe` 标签、 reviewer 要求及合入许可均满足。证据：__FINAL_MERGE_APPROVAL_REQUIREMENTS__

---

# D. 常用验证入口

在 `vllm-project/recipes` checkout 中，将 `__VLLM_ASCEND_RECIPE_DIR__` 替换为待审 vllm-ascend checkout 的 `recipes/` 路径：

```bash
node scripts/validate-source.mjs --source vllm-ascend --dir __VLLM_ASCEND_RECIPE_DIR__
pnpm test:schema
pnpm test:overlay
pnpm test:presets
pnpm test:pd-connectors
pnpm test:hardware
pnpm test:guide-html
# test:render 前先生成对应 JSON API：
node scripts/build-recipes-api.mjs
pnpm test:render
```

注意：

- `validate-source` 已执行同步、strict assemble、schema 和 JSON API 构建；重复命令用于专项回归，不代表每次都需要完整站点 build。
- 不提交生成的 `public/` 或 `.content/`；不修改生产 source lock 来“验证”一个 PR。
- 静态构建、离线 argv、预览、NPU smoke、准确率、性能和容错是不同证据层级。
- 多节点必须使用每个节点的命令；重复 rank 1 会导致 rendezvous 问题。
- PD 必须检查最终 worker argv 和 Router endpoints，不能只看 UI pill 或 preset 名称。

# E. 参考基线与历史 PR

## 当前规范

- [Recipe SCHEMA](https://github.com/vllm-project/recipes/blob/main/SCHEMA.md) — 字段、拓扑、preset、Ascend PD 和 VRAM 公式。
- [add-recipe skill](https://github.com/vllm-project/recipes/blob/main/.agents/skills/add-recipe/SKILL.md) — evidence → YAML → rendered surface 合同。
- [vLLM recipes README](https://github.com/vllm-project/vllm/blob/main/recipes/README.md) — core owner 与 Huawei 内容迁移边界。
- [vLLM Ascend recipes README](https://github.com/vllm-project/vllm-ascend/blob/main/recipes/README.md) — overlay/models 目录与 provenance。
- [vLLM Ascend supported models](https://github.com/vllm-project/vllm-ascend/blob/main/docs/source/user_guide/support_matrix/supported_models.md) — 人工支持矩阵。

## 已合入的主要参考

- [recipes#1226 — Support Ascend distributed PD through generic PD pools](https://github.com/vllm-project/recipes/pull/1226) — 通用 PD pools、逐节点命令、Ascend Router、Mooncake (Ascend)、role `pp` 和 external-DP。
- [vllm-ascend#19381](https://github.com/vllm-project/vllm-ascend/pull/19381) — overlay 初始迁移与验证 workflow。
- [vllm-ascend#19788](https://github.com/vllm-project/vllm-ascend/pull/19788) — recipe label 与 preview dispatch。
- [vllm-ascend#20816](https://github.com/vllm-project/vllm-ascend/pull/20816) — 新增模型的安装、API 与 benchmark 证据表述。
- [vllm-ascend#21065](https://github.com/vllm-project/vllm-ascend/pull/21065) — variants 与不可自动生成部署形态的处理。
- [vllm-ascend#21808](https://github.com/vllm-project/vllm-ascend/pull/21808) — variant × strategy × hardware 继承冲突与差分必要性。
- [vllm#61302](https://github.com/vllm-project/vllm/pull/61302) / [vllm#65044](https://github.com/vllm-project/vllm/pull/65044) — recipe 迁移及 Huawei 内容归属边界。

## 仅作参考、不得当作当前合同

- [vllm-ascend#21852](https://github.com/vllm-project/vllm-ascend/pull/21852) — 调研时未合入；其模型、镜像、PCP/TP 替代和验证范围不能视为 main 事实。
- [recipes#1245](https://github.com/vllm-project/recipes/pull/1245)、[recipes#1246](https://github.com/vllm-project/recipes/pull/1246)、[recipes#1250](https://github.com/vllm-project/recipes/pull/1250) — 调研时未合入或仅 preview；使用前必须重新核实，不能据此编写当前模板字段。
