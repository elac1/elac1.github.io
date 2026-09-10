---
title: 'ROS 2 Nav2 导航实战：从建图到避障'
pubDate: '2026-09-02'
description: '用 TurtleBot3 + Nav2 从零搭建一个能自主导航的机器人，记录建图、路径规划、避障调参的完整过程和踩坑点。'
tags:
  - ROS2
  - 导航
category: 垂直领域研究
---

## 硬件准备

手上用的是 TurtleBot3 Burger（差速驱动），激光雷达是 LDS-01，树莓派 4B 做上位机。整个栈跑在 Ubuntu 22.04 + ROS 2 Humble。

## Step 1：建图（SLAM）

用 slam_toolbox 实时建图，参数调好就能跑出一张干净的 2D 代价地图：

```bash
ros2 launch slam_toolbox online_async_launch.py
```

**踩坑**：LDS-01 的扫描频率默认 5Hz，调到 15Hz 建图明显更清晰。另外 `max_laser_range` 不要设太大，3.5m 足够了，太大反而噪声多。

## Step 2：加载地图 + 定位

```bash
ros2 launch nav2_bringup localization_launch.py map:=/path/to/map.yaml
```

定位用 AMCL，启动后给机器人一个初始位姿（RViz 里点一下就行）。

## Step 3：导航栈

```bash
ros2 launch nav2_bringup navigation_launch.py
```

核心参数我改过这些：

| 参数 | 默认 | 我的值 | 原因 |
|------|------|--------|------|
| `controller_frequency` | 20.0 | 15.0 | 树莓派算力有限，降频更稳 |
| `inflation_radius` | 0.55 | 0.35 | 机器人小，可以离墙更近 |
| `cost_scaling_factor` | 10.0 | 3.0 | 让代价地图的膨胀衰减更快 |
| `max_vel_x` | 0.26 | 0.35 | TurtleBot3 实际能跑得更快 |
| `min_radius` | 0.32 | 0.28 | 原地旋转需要 |

## Step 4：避障测试

Nav2 的避障主要靠两个层：
- **Static Layer**：激光雷达数据，实时更新障碍物
- **Inflation Layer**：在障碍物周围膨胀出代价场

测试场景：在机器人面前放一个纸箱，它应该能绕过去。实测 90% 情况能成功，偶尔会卡住需要手动 rescue。

**下一步计划**：把 costmap 的 `observation_sources` 加上深度相机，从 2D 避障升级到 2.5D。
