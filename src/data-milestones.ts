// 行业级技术突破时间轴（经独立研究 agent 核实与纠错，2026-07-06）
import type { Milestone } from "./data"

export const MILESTONES_FULL: Milestone[] = [
  {
    date: "2024-02", title: "百万上下文首次落地", who: "Google (Gemini 1.5 Pro)",
    what: "以 MoE 架构实现 1M token 上下文（研究版测到 10M），NIAH 召回 99%。此前公开模型上限仅 200K（Claude 2.1）。",
    why: "把「上下文长度」变成新的军备竞赛维度，为长上下文 agent、整库代码分析铺路；也是 RAG-vs-长上下文之争的起点。", tag: "架构",
  },
  {
    date: "2024-05", title: "MLA 登场：赢下 KV cache 战争", who: "DeepSeek V2",
    what: "Multi-head Latent Attention 把 K/V 压成低秩 latent，KV cache 削减 93.3%，比 GQA 更省显存。",
    why: "让同规模模型能以更低成本做长上下文服务，成为国产系标配，也是 DeepSeek 低价路线的技术根基。", tag: "架构",
  },
  {
    date: "2024-09", title: "推理时计算成为第二 scaling 维度", who: "OpenAI o1",
    what: "用大规模 RL 训出隐藏长链思维，推理时花更多算力换准确率；官方公开性能随训练/推理算力对数线性提升的曲线。",
    why: "打破「只能靠预训练堆规模」的单一路径，催生一整代 reasoning 模型，算力需求从训练向推理迁移的起点。", tag: "范式",
  },
  {
    date: "2024-10", title: "模型开始操作计算机", who: "Anthropic Computer Use",
    what: "截屏→点击/输入，模型直接驱动 GUI（OSWorld 14.9%，当时最高）。",
    why: "从「答问」迈向「干活」，是 agent 时代的起点。", tag: "范式",
  },
  {
    date: "2024-11", title: "RLVR 可验证奖励范式", who: "Ai2 (Tülu 3)",
    what: "用确定性验证函数（数学/代码答案对错）替代 RLHF 的奖励模型，并开源 8B-405B 全套配方（arXiv 2411.15124）。",
    why: "定义了 reasoning 模型后训练的主流范式，两个月后被 DeepSeek R1（GRPO+规则奖励）推到全行业标配；post-training 成为新的 scaling 轴。", tag: "范式",
  },
  {
    date: "2024-12", title: "效率震撼：$5.6M 训出前沿开源", who: "DeepSeek V3",
    what: "671B/37B MoE，2.788M H800-hours ≈ $5.576M；同时首次在 671B 规模验证 FP8 训练与 MTP（后者被 Qwen3-Next、Nemotron 3 采纳成标配）。",
    why: "证明前沿能力未必需要天量预算，重塑成本预期；FP8/MTP 两项技术自此成为行业默认件。", tag: "成本",
  },
  {
    date: "2025-01", title: "「DeepSeek 时刻」：算力叙事被重定价", who: "DeepSeek R1",
    what: "开源推理模型对标 o1、RL 阶段成本仅约 $294K，公开训练配方。",
    why: "引发 2025-01-27 Nvidia 单日 -17%，市场首次系统性质疑「算力=护城河」；出口管制有效性被打上问号。", tag: "市场",
  },
  {
    date: "2025-02", title: "混合推理：一个模型可切推理深度", who: "Claude 3.7 Sonnet",
    what: "同一模型在快答与显式长推理间切换，思考预算可精确控制；Qwen3（2025-04）跟进——但阿里 2025-07 又拆回 Instruct/Thinking 两线（承认损质量）。",
    why: "推理不再是独立模型，成本与延迟可按需调节；但单模型混合路线本身出现反转，说明范式仍在演化。", tag: "范式",
  },
  {
    date: "2025-02", title: "蒸馏潮：$50 复刻推理", who: "DeepSeek / Stanford (s1)",
    what: "R1 同步开源 6 个蒸馏模型（32B 超 o1-mini）；斯坦福 s1 用 1000 条样本、<$50 云算力蒸馏出接近 o1 的推理能力。",
    why: "证明推理能力可被极低成本迁移，动摇「训练投入=护城河」逻辑；直接引发 OpenAI 指控蒸馏滥用、各家收紧 API 条款。", tag: "成本",
  },
  {
    date: "2025-03", title: "MCP 成 agent 事实标准", who: "Anthropic 发起，OpenAI/Google 跟进",
    what: "Anthropic 2024-11 开源 MCP；2025-03-26 OpenAI 宣布全线接入并加入指导委员会，4 月 Google DeepMind 跟进，年末捐入 Linux 基金会。",
    why: "竞对主动采纳对手协议极罕见，标志 agent 工具调用层完成标准化——连接器生态从 M×N 收敛为单一协议。", tag: "范式",
  },
  {
    date: "2025-03", title: "METR：任务时长 7 个月翻倍", who: "METR (Kwa et al.)",
    what: "测得 AI 以 50% 可靠性完成任务的人类耗时长度，6 年来每约 7 个月翻倍；2024-25 加速至约 4 个月一倍，2026 年已超 16 小时。",
    why: "给「AI 何时能替代整段人类工作」提供首个可外推的量化指标，成为 agent 经济叙事和 AGI 时间表的锚点数据。", tag: "范式",
  },
  {
    date: "2025-04", title: "MoE 成开源默认", who: "Llama 4 转 MoE",
    what: "连一向 dense 的 Llama 也转向稀疏 MoE（Maverick 400B/17B active）。",
    why: "总参数与推理成本解耦成为行业共识，此后几乎所有旗舰都稀疏化。", tag: "架构",
  },
  {
    date: "2025-05", title: "昇腾训出 718B 模型", who: "华为 (Pangu Ultra MoE)",
    what: "6000+ 昇腾 NPU 训练 718B MoE（MFU 30%）、8192 卡训练 135B dense（13.2T tokens），性能对标 DeepSeek-R1 级。",
    why: "首次实证脱离 NVIDIA 也能训前沿模型，中美 AI 全栈脱钩从叙事变为事实；2026 年昇腾 910C 产量翻倍至 60 万片。", tag: "市场",
  },
  {
    date: "2025-06", title: "o3 降价 80%：推理 token 通缩", who: "OpenAI",
    what: "o3 API 从 $10/$40 直降至 $2/$8，同模型仅靠推理栈优化；Cursor/Windsurf 当日跟随下调。",
    why: "史上最大单次 API 降价，宣告前沿推理能力快速商品化，倒逼全行业按推理成本而非能力溢价定价。", tag: "成本",
  },
  {
    date: "2025-08", title: "统一路由 + 开放权重回归", who: "GPT-5 / gpt-oss",
    what: "GPT-5 单入口自动路由推理深度并把旗舰价压到 $1.25/$10；OpenAI 时隔多年重发开放权重 gpt-oss。",
    why: "闭源龙头也回到开源牌桌，产品形态从「选模型」变「选目标」；旗舰定价战开打。", tag: "范式",
  },
  {
    date: "2025-09", title: "混合注意力：长上下文近线性", who: "Qwen3-Next (2025-09-11)",
    what: "3:1 Gated DeltaNet（线性注意力）+ Gated Attention 混合块，以 Qwen3-32B 约 10% 训练成本超越其表现，长上下文吞吐 10x；NVIDIA Nemotron 系（2025-08 起）同步走 Mamba-Transformer 混合路线。",
    why: "摆脱二次方注意力成本，让长上下文 agentic 工作流显著变便宜；该架构被 Qwen3.5 旗舰与 Kimi Linear 继承。", tag: "架构",
  },
  {
    date: "2025-09", title: "训练精度迈向 FP4", who: "NVIDIA (NVFP4)",
    what: "继 DeepSeek V3 验证 FP8 后，NVFP4 实现 12B 模型在 10T tokens 上 4-bit 预训练，loss 与 FP8 基线几乎重合。",
    why: "FP8→FP4 意味着同等算力预算下 2-3 倍有效吞吐，是 Blackwell 世代硬件的核心卖点，也是训练成本曲线持续下移的底层驱动。", tag: "成本",
  },
  {
    date: "2025-10", title: "开闭源差距缩至数月", who: "Epoch AI / 中国开源阵营",
    what: "Epoch 量化：开源权重模型平均仅落后闭源前沿约 3 个月（2026-05 更新为 4 个月），而 2024-11 时约一年；开源榜首已全为中国模型。",
    why: "闭源能力溢价的「保鲜期」被压缩到一个季度，削弱纯 API 商业模式定价权，抬升推理基建与应用层的相对价值。", tag: "市场",
  },
  {
    date: "2026-01", title: "预训练收益递减渐成共识", who: "多方实证研究",
    what: "《From Scaling Law to Sub-Scaling Law》等研究实证数据密度导致的次线性 scaling；GPT-4.5 以 30 倍价格证明纯预训练扩张性价比过低后 5 个月退场。",
    why: "「墙」从口号变成有实证支撑的经验判断（注：精确 FLOPs 阈值仍有争议），推动算力从预训练转向推理/后训练。", tag: "范式",
  },
  {
    date: "2026-02", title: "多智能体并行成默认", who: "Anthropic 领跑，全行业两周跟进",
    what: "Claude Code 随 Opus 4.6 推出 Agent Teams（lead+teammates、独立上下文、worktree 并行）；同两周内 Codex CLI、Windsurf、Cline 全部上线并行 agent。",
    why: "从「单 agent 长上下文」转向「多 agent 编排」的范式切换，token 消耗 3-4 倍放大，直接抬升推理算力需求曲线。", tag: "范式",
  },
  {
    date: "2026-04", title: "稀疏/混合注意力进万亿旗舰", who: "DeepSeek V4 (CSA+HCA)",
    what: "1.6T 开源旗舰用 CSA+HCA 混合注意力：1M 上下文下单 token 推理 FLOPs 仅为 V3.2 的 27%、KV cache 10%；并在 NVIDIA+昇腾双平台验证训练方案。",
    why: "注意力机制本身被重构，长上下文成本再降一档；「华为芯片参训」若坐实则是国产替代叙事最强单点证据。", tag: "架构",
  },
  {
    date: "2026-04", title: "Meta 弃开源转闭源", who: "Meta 超级智能实验室",
    what: "04-08 发布首个闭源旗舰 Muse Spark 取代 Llama 线；Behemoth 搁置、开源路线图悬置。",
    why: "开源阵营最大旗手退场，「开源 vs 闭源」阵营图重画：西方开源真空由中国模型填补。", tag: "市场",
  },
  {
    date: "2026-04", title: "同能力成本 ~10x/年下降", who: "全行业",
    what: "GPT-4 级能力从 2023 初 ~$30/1M tokens 降到 2026 <$1/1M；但 2026 起旗舰新品定价开始回升（GPT-5.4/5.5 连续翻倍、Gemini 3.5 Flash 涨 3 倍）。",
    why: "推理成本崩塌是应用爆发的底层引擎；而「廉价 AI 时代终结」的新信号提示：前沿能力开始重新收取溢价。", tag: "成本",
  },
  {
    date: "2026-05", title: "首个次二次方商用模型", who: "Subquadratic (SubQ)",
    what: "05-05 SubQ 1M-Preview 上线：SSA（次二次方选择性注意力）架构，1M 生产/12M 研究上下文，SWE-bench Verified 81.8%，$0.50/$1.50。",
    why: "首个以非标准 transformer 注意力为卖点的商用前沿模型；效率宣称初期存疑，6 月 MIT TR 报道的独立评测部分坐实（权重未公开，长期验证进行中）。", tag: "架构",
  },
]
