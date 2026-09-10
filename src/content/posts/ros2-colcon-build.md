---
title: 'ROS 2 工作空间：colcon build 从入门到崩溃'
pubDate: '2026-09-04'
description: 'ROS 2 的构建系统 colcon 看着简单，实际用起来有一堆参数和坑。整理了常用参数、编译顺序、以及常见报错的解决办法。'
tags:
  - ROS2
  - 工具
---

## colcon 是什么

colcon = **col**lective **con**struction，是 ROS 2 的构建工具。它的工作流就是：

```bash
# 第一次构建，编译所有包
colcon build

# 改了代码，只编译改过的包
colcon build --packages-select my_robot

# 改了头文件，需要全量重编
colcon build --packages-up-to my_robot

# 清除再编译
colcon build --cmake-clean-cache
```

## 常用参数速查

| 参数 | 作用 | 什么时候用 |
|------|------|-----------|
| `--packages-select` | 只编译指定包 | 改了某个包的源码 |
| `--packages-up-to` | 编译指定包及其依赖 | 改了底层包，要重编上层 |
| `--cmake-clean-cache` | 清 cmake 缓存 | CMakeLists.txt 改了 |
| `--symlink-install` | 用软链接代替复制 | 开发时改 .py 不用重编 |
| `--executor sequential` | 单线程编译 | 内存不够时 |

## 最常见的坑

**1. CMake 找不到包**

```
Could not find a package configuration file provided by "sensor_msgs"
```

解决：`apt install ros-humble-sensor-msgs`。缺什么装什么。

**2. Python 包找不到依赖**

```
ModuleNotFoundError: No module named 'some_dep'
```

先 `pip install some_dep`，然后 `colcon build --symlink-install` 再 `source install/setup.bash`。

**3. 改了代码没生效**

大概率是忘了 source：

```bash
source install/setup.bash
```

每次开新终端都要 source。写进 `.bashrc` 里一劳永逸。
