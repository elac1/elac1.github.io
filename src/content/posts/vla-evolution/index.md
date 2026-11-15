---
title: 'VLA 的发展与能力演进：从 RT-1 到 π 系列与 Helix'
pubDate: '2026-11-15'
description: '一次 VLA 分享的简短复盘：RT-1 学动作，RT-2 引入图文知识，π 系列探索泛化与技能组合，Helix 协调理解和控制。附配套演示。'
cover: '/images/vla-evolution/cover.webp'
tags:
  - VLA
  - 具身智能
  - 机器人
  - 模仿学习
category: 学习笔记
featured: false
---

上周，我做了一次 **VLA（视觉语言动作模型）发展与能力演进**的分享。这篇留下几项代表工作的核心变化，以及当时播放的演示。

我最想弄清的是：**机器人怎样理解任务、把动作做好，并在情况变化后继续执行？**

## 一、VLA 学的是什么？

以“把蓝色方块放进盒子”为例，模块化系统通常由工程师组织任务流程，再依次调用感知、抓取规划和控制模块。换物体、换任务时，要检查已有模块与恢复规则能否覆盖。

VLA 尝试从机器人示范中学习：给定画面和指令，应该采取什么动作。人遥操作时记录的图像、指令和动作，就能组成监督数据。

但模型仍然只是系统的一段。**动作预测之后，还需要接口适配和控制；执行之后，再观察、再预测。** 这个实时闭环通常不会更新模型参数。

<details class="post-more">
<summary>展开流程图：模块化系统与 VLA 闭环</summary>

![模块化系统的任务、感知、规划、控制与反馈流程](/images/vla-evolution/modular-robot-pipeline.webp)

![VLA 从输入、动作预测到控制执行和再次观察的闭环](/images/vla-evolution/vla-pipeline.webp)

图为教学示意：VLA 覆盖哪些模块、是否需要独立规划，以及怎样还原动作尺度，都取决于具体模型和硬件接口。

</details>

## 二、RT-1 与 RT-2：学会动作，再引入知识

**[RT-1（2022）](https://robotics-transformer1.github.io/)** 用超过 13 万条机器人操作轨迹、700 多种任务，训练统一的多任务策略。它根据近期画面和指令，预测离散动作 token，再解码成动作数值。

长任务还可以组合高层框架：[SayCan](https://say-can.github.io/) 结合语言模型与技能可行性评估，选择下一项技能；RT-1 负责根据画面持续预测动作。

下面的抽屉取物演示，可以留意画面中的 `Current step`：高层怎样切换技能，底层又怎样执行。

<figure class="post-video">
  <video controls playsinline preload="none" poster="/images/vla-evolution/saycan-rt1-drawer.webp" width="1280" height="720" aria-label="SayCan 与 RT-1：从抽屉中取出零食的演示">
    <source src="/videos/vla-evolution/saycan-rt1-drawer.mp4" type="video/mp4" />
    当前浏览器无法播放视频，可<a href="https://elac1.github.io/videos/vla-evolution/saycan-rt1-drawer.mp4">单独打开视频</a>。
  </video>
  <figcaption>RT-1 官网演示 · 1:01 · 原片 4× 加速、未见过的厨房 · 无声</figcaption>
</figure>

<details class="post-more">
<summary>再看一段：取薯片，并拿一张餐巾</summary>

<figure class="post-video">
  <video controls playsinline preload="none" poster="/images/vla-evolution/saycan-rt1-napkin.webp" width="1280" height="720" aria-label="SayCan 与 RT-1：取薯片并拿餐巾的复合任务演示">
    <source src="/videos/vla-evolution/saycan-rt1-napkin.mp4" type="video/mp4" />
    当前浏览器无法播放视频，可<a href="https://elac1.github.io/videos/vla-evolution/saycan-rt1-napkin.mp4">单独打开视频</a>。
  </video>
  <figcaption>RT-1 官网演示 · 1:05 · 原片 4× 加速 · 无声</figcaption>
</figure>

</details>

**[RT-2（2023）](https://robotics-transformer2.github.io/)** 把预训练视觉语言模型用于动作预测，联合学习机器人示范和图文任务。

“拿起恐龙玩具”和“拿起已经灭绝的动物”，可能对应相同的抓取动作，后一句却需要额外的概念联系。RT-2 的代表进展，就是让图文知识参与目标选择和操作。

<figure class="post-video">
  <video controls playsinline preload="none" poster="/images/vla-evolution/rt2-semantic-tasks.webp" width="1280" height="720" aria-label="RT-2：物体选择、符号理解与语义泛化演示合集">
    <source src="/videos/vla-evolution/rt2-semantic-tasks.mp4" type="video/mp4" />
    当前浏览器无法播放视频，可<a href="https://elac1.github.io/videos/vla-evolution/rt2-semantic-tasks.mp4">单独打开视频</a>。
  </video>
  <figcaption>RT-2 官网演示 · 1:52 · 部分片段加速 · 无声</figcaption>
</figure>

图文知识帮助确定“该操作什么”，机器人示范帮助学会“怎样操作”。它仍然受训练数据和硬件能力约束。

<details class="post-more">
<summary>补充视频：原理动画与思维链扩展</summary>

下面的短动画概括了图文知识与机器人动作的结合：

<figure class="post-video">
  <video controls playsinline preload="none" poster="/images/vla-evolution/rt2-overview.webp" width="1280" height="720" aria-label="RT-2：视觉语言知识与机器人动作结合的原理动画">
    <source src="/videos/vla-evolution/rt2-overview.mp4" type="video/mp4" />
    当前浏览器无法播放视频，可<a href="https://elac1.github.io/videos/vla-evolution/rt2-overview.mp4">单独打开视频</a>。
  </video>
  <figcaption>RT-2 官方原理动画 · 0:20 · 无声</figcaption>
</figure>

RT-2 还做了先输出文字推理、再输出动作的思维链扩展实验。它是额外的实验设置，普通 RT-2 并不默认每次都先生成可见的文字推理。

<figure class="post-video">
  <video controls playsinline preload="none" poster="/images/vla-evolution/rt2-chain-of-thought.webp" width="1280" height="720" aria-label="RT-2 思维链扩展相关机器人操作演示">
    <source src="/videos/vla-evolution/rt2-chain-of-thought.mp4" type="video/mp4" />
    当前浏览器无法播放视频，可<a href="https://elac1.github.io/videos/vla-evolution/rt2-chain-of-thought.mp4">单独打开视频</a>。
  </video>
  <figcaption>RT-2 思维链扩展配套演示 · 1:14 · 无声</figcaption>
</figure>

</details>

## 三、OpenVLA 与 π 系列：开放实践、动作和泛化

后面的工作，开始从不同方向继续推进：

**[OpenVLA（2024）](https://openvla.github.io/)** 公开权重和训练、微调工具，让研究者能亲自运行与适配 VLA。它是独立工作，接到自己的机器人上时，仍要对齐相机、动作定义和控制接口。

**[π0（2024）](https://www.pi.website/blog/pi0)** 用 Flow Matching 在连续空间中生成一段动作，展示了专项微调后的叠衣、组装纸盒等灵巧操作。连续与离散描述的是动作表示方式，不能直接等同于运动是否流畅。

**[π0.5（2025）](https://www.pi.website/blog/pi05)** 关注新环境泛化：换到训练中未见过的家庭环境，继续收拾餐具、整理卧室。考验的是物品、布局和操作条件变化后，已学能力还能否迁移。

**[π0.7（2026）](https://www.pi.website/blog/pi07)** 进一步探索技能组合与细致指导。空气炸锅案例里，仅给整体指令时没有完整完成任务，逐步语言指导后表现改善；之后还利用指导微调高层策略。看这个案例时，指导与训练条件和最终动作同样重要。

这些工作涉及不同平台和评测条件，适合按研究重点理解，而不能仅凭几段视频排列强弱。

## 四、Helix：理解与动作按不同节奏协作

[Helix（2025）](https://www.figure.ai/news/helix) 把任务理解与快速动作分开：S2 视觉语言模型以 7–9 Hz 更新语义信息，S1 视觉运动策略以 200 Hz 生成上半身动作目标。两者传递连续潜在向量，S1 不必每次都等 S2 完成推理。

[Helix 02（2026）](https://www.figure.ai/news/helix-02) 再加入 1 kHz 的 S0，跟踪全身目标，协调平衡与接触。伸手会改变重心，迈步又会改变抓取范围，这让移动和操作必须配合起来。

“快慢脑”帮助我理解了这一点：语义理解和身体控制，需要不同的处理节奏。相关演示可以直接在官网观看。

## 五、看完这些工作，我留下的三个问题

再看机器人演示，我会先问：

- **变了什么？** 是新物体、新环境，还是新的技能组合？
- **给了什么帮助？** 是一句指令，还是持续指导、目标图片或专项微调？
- **效果怎样验证？** 视频有没有加速、剪辑与重置，重复试验又表现如何？

带着这些问题看，VLA 的进步会具体很多：从学习多任务动作，到利用知识、适应环境，再到组合技能与协调全身。对我而言，下一步最值得动手研究的，是开放模型怎样真正接到自己的机器人上。

---

_本文根据我的分享 PPT 整理，研究链接见各模型名称。流程图来自分享材料，五段视频来自 RT-1、RT-2 官方项目演示，封面截取自 RT-2 视频；本文未提供独立实机评测。_
