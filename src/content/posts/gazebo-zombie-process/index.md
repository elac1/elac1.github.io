---
title: 'Gazebo 僵尸进程：话题全空、TF 错乱——同一个根因，两种玄学故障'
pubDate: '2026-10-07'
description: '残留的 gzserver 会以两种看不出关系的方式毁掉仿真：占住 11345 端口让新的 gzserver 静默退出（话题全空），或者继续发 /clock 与 /tf 和新实例打架（读到上一轮的旧数据、TF 错乱）。含确认方法与一键清场脚本。'
tags:
  - Gazebo
  - 仿真
  - ROS2
  - 调试
category: '垂直领域研究'
featured: false
---

**上一次没杀干净的 Gazebo，会以两种看起来毫无关系的方式搞死你的仿真。**

一种是启动后**所有 ROS 话题一个数据都没有**，你还以为是自己订阅写错了。

另一种更玄：**话题有数据，但程序读到的是上一轮的旧数据，TF 和地图对不上，机器人不动或者乱跳。**

这俩我都在项目里踩了。而且是同一个根因：**僵尸 gzserver**。

---

## 两种故障速查

| | 故障一 | 故障二 |
| --- | --- | --- |
| **现象** | 启动后所有话题无数据 | 有数据，但是旧的；TF 错乱 |
| **直观看像** | 仿真没起来 / 订阅写错 | 业务逻辑错 / 定位算法崩了 |
| **根因** | 僵尸进程占着 11345 端口，新 gzserver 静默退出 | 僵尸进程还在发 `/clock` `/tf`，和新的实例打架 |

两个故障，**症状都不会指向“残留进程”**。因为僵尸进程本身是不可见的——不报错、不打日志、`ps` 里可能还看不到。

---

## 故障一：仿真启动后，所有 ROS 话题无数据

### 现象

启动脚本跑完了。没报错。

然后：

- `/clock` 收不到
- 相机话题收不到
- `/odom` 收不到
- 所有“等仿真就绪”的逻辑全部超时

`ros2 topic list` 能列出话题。`ros2 topic info` 也可能显示有发布者。

**但就是一个数据都没有。**

程序里那行 `print("仿真就绪")` 永远不输出。

### 原因

Gazebo 的 server 占一个固定端口：**11345**。

上一轮的 gzserver 没死，端口还占着。

这一轮启动的时候，新的 gzserver 发现端口被占，**直接退出**。

要命的是：**它退得很安静。**

不抛异常、不打印错误、你的启动脚本返回码还是 0。你完全看不出来。

于是你以为仿真在跑，其实端口上挂的是**上一轮那个僵尸**。

你的节点连上去，什么都没收到。

**容易被忽略的点**：这不是“仿真启动慢”，是“仿真压根没启动成功，而且没告诉你”。

### 怎么确认

```bash
ss -ltn | grep 11345
```

**有输出** → 端口被占。有问题。
**没输出** → 端口空闲。正常。

再确认一下有几个仿真在发时钟：

```bash
ros2 topic info /clock
```

看 **Publisher count**：

- `1` → 正常
- `2` 或更多 → **有两个仿真实例在跑**，直接切到故障二
- `0` → 仿真根本没起来

这一条特别好用。**两个 Gazebo = 两个时钟源**，一眼看穿。

### 修复方案

```bash
# 1) 杀掉残留（用 -x，别用 -f，理由见结尾）
pkill -x gzserver
pkill -x gzclient

# 2) 等它真的退干净
sleep 5

# 3) 确认端口空了
ss -ltn | grep 11345 || echo "端口空闲，可以开跑"

# 4) 还占着？上 -9 再来一次
pkill -9 -x gzserver
sleep 3
ss -ltn | grep 11345 && echo "端口还占着，别开跑"
```

**关键**：清完场**先验端口，再启动**。别在脏环境上开跑，跑出来的结果全是无效的。

---

## 故障二：读到上一轮的旧数据，TF 和地图错乱

### 现象

这个更阴。

仿真**起来了**，话题**有数据**。但数据不对劲：

- **不是所有话题都空**，是一部分正常、一部分乱
- 程序收到的配置/任务内容，是**上一轮的**
- **TF 查询报错**：`Lookup would require extrapolation into the past`
- 不同节点的时间对不上：任务节点看到仿真时间已经 **190 秒**，Nav2 那边的时钟还停在 **5.7 秒**
- **地图和实际位置对不上**，机器人报的位置在飘
- 下发导航目标后，机器人**一动不动**，一直挂到超时（我这边实测挂着 **180 秒**没动）

日志长这样：

```text
Timed out waiting for transform from base_footprint to map to become available,
tf error: Lookup would require extrapolation at time 4.780000,
but only time 5.756000 is in the buffer
```

看着像定位算法崩了、像 TF 树配错了、像导航参数不对。

**都不是。**

### 原因

僵尸 gzserver **还在发消息**。

它还在发 `/clock`、`/tf`、`/odom`、以及各种状态话题。

于是新老两个实例的数据**混在一起**：

- **两个 `/clock` 发布者** → 仿真时间被两个源来回拉 → 时间跳变
- **两个 `/odom` → `/tf` 发布者** → 同一个 TF 帧有两个来源 → 机器人位置在飘
- TF 缓冲按时间戳索引，时间一乱，`extrapolation` 就来了

Nav2 那边尤其敏感。它靠 TF 做代价地图和规划。TF 一乱，**规划器算不出路，控制器不发速度**，机器人就在原地待着——不是卡死，是**它拿不到可信的位姿**。

**容易被忽略的点**：这种情况**不会报“有僵尸进程”**。

你看到的全是下游症状：TF 报错、时间不对、位置在飘。全是“算法层”的现象。

而且它比故障一更难发现——**故障一是全空，一眼就知道不对；故障二是有数据，只是数据是错的。**

### 怎么确认

**第一步：数时钟源。**

```bash
ros2 topic info /clock
```

`Publisher count` 大于 1 → **确认有多个仿真实例**。

这一步基本就能定罪。

**第二步：看 TF 的发布者数量。**

```bash
ros2 topic info /tf
ros2 topic hz /tf
```

如果 `/tf` 的发布者数量异常多，或者频率是正常值的两倍——老实例还在发。

**第三步：直接抓时钟值对比。**

```bash
ros2 topic echo /clock --once
```

记下这个值。过 10 秒再抓一次。

如果**时间跳变、或者往回走**（比如从 42 秒跳到 5 秒），说明有两个时钟源在抢。

**第四步：看时间戳对不对得上。**

```bash
ros2 topic echo /tf --once
```

看 `header.stamp`。如果一条 TF 的时间戳和你 `ros2 topic echo /clock` 抓到的时间差得很远，说明**这条 TF 来自另一个实例**。

### 修复方案

跟故障一**完全一样**——清场。

```bash
# 彻底清
pkill -x gzserver
pkill -x gzclient
pkill -x nav2_container 2>/dev/null || true
pkill -x referee_node 2>/dev/null || true
sleep 5

# 再补一刀
pkill -9 -x gzserver 2>/dev/null || true
pkill -9 -x gzclient 2>/dev/null || true
sleep 3

# 验端口
if ss -ltn | grep -q ':11345'; then
    echo "端口还占着，别开跑"
    exit 2
fi

# 验时钟源（起来之后）
# ros2 topic info /clock   → Publisher count 必须是 1
```

**注意**：清完场，**新一轮起来后要再验一次 `Publisher count == 1`**。

因为故障二的特征就是“能启动、有数据”，光看启动成功是不够的。

---

## 避坑准则清单

1. **每轮开跑前先清场，再验端口。** 顺序不能反——先启动再检查，已经晚了。

2. **端口是唯一可靠的判据。** `ss -ltn | grep 11345`，有输出就别开跑。

3. **别信进程列表。**
   - 容器里 `ps` / `pgrep` 看不到真实进程
   - `pgrep -f 某个词` 会匹配到**你自己那条命令**的文本

   我实测过一次：循环检查 8 个进程名，**每个都显示“有 3 个”**——那 3 个是我自己的命令行被匹配了。

4. **启动成功后立刻数时钟源。** `ros2 topic info /clock`，`Publisher count` 必须是 1。

5. **`pkill` 用 `-x`，永远别用 `-f`。**

   ```bash
   pkill -f gzserver     # ❌ 会杀掉你自己的启动脚本
   pkill -x gzserver     # ✅ 只匹配进程名
   ```

   `-f` 匹配整条命令行。你的启动脚本命令行里要是带了 `gzserver` 这个词——脚本把自己杀了。我踩过这个。

6. **不要假设“脚本退出了子进程就没了”。**

   程序**崩溃、被 timeout 杀掉、被 Ctrl-C 打断**的时候，清理代码根本不执行。

   我这两次故障的污染源，全是上一轮**异常退出**留下的。

7. **数据“格式对”不等于“数据是本轮的”。**

   公告栏式（latched）的消息会把最后一条重发给新订阅者。僵尸进程还在发，你就收到旧的。**不报错，格式完全合法。**

8. **单轮测试通过 ≠ 多轮测试通过。**

   端口、有状态的服务、latched 消息、缓存——全都只在多轮时暴露。

---

## 一键清理脚本

存成 `clean_sim.sh`，每轮开跑前执行。

```bash
#!/usr/bin/env bash
# Gazebo 仿真残留清理 + 开跑前校验
# 用法: bash clean_sim.sh && bash run_mission.sh

set -u

PORT=11345

echo "=== 1/4 清理残留进程 ==="
for name in gzserver gzclient rviz2 nav2_container referee_node mission_manager; do
    # -x: 精确匹配进程名。绝对不要用 -f，会匹配到本脚本自己的命令行
    if pkill -x "$name" 2>/dev/null; then
        echo "  已发送终止信号: $name"
    fi
done
sleep 5

echo "=== 2/4 补刀（处理不响应 SIGTERM 的）==="
for name in gzserver gzclient nav2_container; do
    pkill -9 -x "$name" 2>/dev/null || true
done
sleep 3

echo "=== 3/4 校验端口 ==="
if ss -ltn 2>/dev/null | grep -q ":${PORT}"; then
    echo "  ❌ 端口 ${PORT} 仍被占用，说明还有残留。中止，别开跑。"
    ss -ltnp 2>/dev/null | grep ":${PORT}" || true
    exit 2
fi
echo "  ✅ 端口 ${PORT} 空闲"

echo "=== 4/4 完成 ==="
echo "现在可以启动仿真。起来之后记得再验一次："
echo "  ros2 topic info /clock      # Publisher count 必须为 1"
```

跑完的期望输出：

```text
=== 1/4 清理残留进程 ===
  已发送终止信号: gzserver
=== 2/4 补刀（处理不响应 SIGTERM 的）===
=== 3/4 校验端口 ===
  ✅ 端口 11345 空闲
=== 4/4 完成 ===
现在可以启动仿真。起来之后记得再验一次：
  ros2 topic info /clock      # Publisher count 必须为 1
```

---

## 总结

**同一个僵尸进程，两种玄学故障：**

- **占端口** → 新的 gzserver 静默退出 → **话题全空**
- **还在发消息** → 两个时钟源、两个 TF 源 → **读到旧数据、TF 错乱**

**症状永远不会指向“残留进程”**，因为它是隐形的。故障一指错到“订阅写错了”，故障二指错到“定位算法崩了”。

**唯一对策是不靠症状、靠纪律：**

```bash
# 每轮开跑前
pkill -x gzserver && sleep 5 && ss -ltn | grep 11345 || echo "干净，开跑"

# 起来后
ros2 topic info /clock     # Publisher count == 1
```
