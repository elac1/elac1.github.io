---
title: 'Docker 工具介绍与工程实践：在 Ubuntu 24.04 中运行 Ubuntu 22.04'
pubDate: '2026-11-07'
description: '在 Ubuntu 24.04 主机上，用 Docker 创建 Ubuntu 22.04 容器，安装 ROS 2 Humble，并通过 Talker 与 Listener 验证节点通信。'
cover: '/images/covers/docker-ubuntu-ros2.webp'
tags:
  - Docker
  - Ubuntu
  - ROS2
  - Linux
category: 学习笔记
featured: false
---

![ROS 2 与 Docker：通过容器为 Ubuntu 24.04 主机提供 ROS 2 Humble 运行环境](/images/covers/docker-ubuntu-ros2.webp)

## 一、需求背景：为什么需要 Docker？

在实际软件开发和机器人开发过程中，经常会遇到不同项目对操作系统、软件版本和运行依赖有不同要求的情况。

例如：

- 项目 A 要求 Ubuntu 20.04。
- 项目 B 要求 Ubuntu 22.04。
- 项目 C 要求 Ubuntu 24.04。

如果所有项目都直接部署在同一台 Linux 主机上，就可能出现软件版本冲突、依赖库不兼容以及环境配置复杂等问题。

以 ROS 2 开发为例，ROS 2 Humble 官方主要面向 Ubuntu 22.04，而当前开发主机可能已经安装 Ubuntu 24.04。如果为了运行 ROS 2 Humble 而重新安装操作系统，或者配置双系统，不仅操作复杂，也会影响现有开发环境。

那么，是否可以在不更换当前操作系统的情况下，在 Ubuntu 24.04 中运行一个独立的 Ubuntu 22.04 环境？

这就是 Docker 可以解决的典型问题。

## 二、Docker 的作用：解决什么问题？

Docker 是一种容器化工具，可以将应用程序及其运行所需的依赖环境封装到容器中，实现运行环境的隔离、快速部署和迁移。

通过 Docker，我们不需要真的安装一套完整的 Ubuntu 22.04 操作系统，就可以创建一个基于 Ubuntu 22.04 用户空间的容器，并在其中安装和运行相应的软件。

Docker 主要解决以下问题：

**1. 环境隔离**

不同项目可以运行在不同容器中，各自使用独立的软件和依赖环境，减少项目之间的依赖冲突。

**2. 快速部署**

可以直接使用现成的镜像创建容器，不需要每次都从头配置运行环境。

**3. 环境迁移**

通过镜像共享和容器配置，可以在相同或兼容架构的设备上复现相近的运行环境，降低项目部署成本。

### 2.1 Docker 核心概念

使用 Docker 时，需要了解三个基本概念：

| 概念              | 说明                           |
| ----------------- | ------------------------------ |
| Image（镜像）     | 用于创建容器的环境模板         |
| Container（容器） | 镜像启动后产生的运行实例       |
| Dockerfile        | 用于定义镜像构建过程的配置文件 |

它们之间的关系是：

```text
Dockerfile → 构建 Image → 创建 Container
```

例如，下载一个 Ubuntu 22.04 镜像，就可以利用这个镜像创建一个或多个 Ubuntu 22.04 容器。

需要注意，Docker 容器并不是一台完整的虚拟机。**容器与主机共享 Linux 内核，通过隔离机制实现独立的运行环境。** 容器里的 `/etc/os-release` 显示 Ubuntu 22.04，并不意味着它运行了一套独立的 Ubuntu 22.04 内核。

## 三、实例场景：在 Ubuntu 24.04 中运行 Ubuntu 22.04

### 3.1 实验目标

本次实验使用 Docker，在 Ubuntu 24.04 主机上创建 Ubuntu 22.04 容器，并在容器中部署 ROS 2 Humble，最终通过 ROS 2 节点通信验证运行环境。

实验环境：

| 项目         | 配置          |
| ------------ | ------------- |
| 主机操作系统 | Ubuntu 24.04  |
| 容器用户空间 | Ubuntu 22.04  |
| 容器管理工具 | Docker Engine |
| ROS 2 版本   | Humble        |

整体架构：

```text
物理电脑
│
└── Ubuntu 24.04（主机系统）
     │
     └── Docker Engine
          │
          └── Ubuntu 22.04（容器用户空间）
               │
               └── ROS 2 Humble
                    ├── Talker
                    └── Listener
```

下面的图概括了环境隔离、核心概念和实验流程。具体安装命令以正文为准。

![Docker 与 ROS 2 实践概览：需求背景、环境隔离、镜像与容器，以及 Ubuntu 24.04 主机上的 Humble 通信测试流程](/images/docker-ubuntu-ros2-infographic.webp)

本文从已经安装 Docker Engine 的主机开始；尚未安装时，可先参考 [Docker 官方 Ubuntu 安装文档](https://docs.docker.com/engine/install/ubuntu/)。主机需要能够访问 Ubuntu、ROS 软件源和 GitHub。

**命令执行位置：** `docker` 和 `systemctl` 命令在主机执行；进入容器后，`apt`、`source` 和 `ros2` 命令在容器执行。本文创建的容器默认使用 root 用户，因此容器内的命令不加 `sudo`。

### 3.2 检查 Docker 环境

首先，在 **Ubuntu 24.04 主机终端**中检查 Docker 是否安装：

```bash
docker --version
```

查看 Docker 服务状态：

```bash
sudo systemctl status docker
```

按 `q` 退出状态查看。如果 Docker 服务没有启动，可以执行：

```bash
sudo systemctl start docker
```

本文后续的 `docker` 命令假设当前用户已有访问 Docker daemon 的权限。如果提示访问 `/var/run/docker.sock` 被拒绝，可以在主机上为对应命令加 `sudo`，例如 `sudo docker images`。

### 3.3 下载 Ubuntu 22.04 镜像

在主机执行：

```bash
docker pull ubuntu:22.04
```

其中：

- `docker pull`：下载镜像。
- `ubuntu`：镜像名称。
- `22.04`：镜像版本标签。

下载完成后，查看本地镜像：

```bash
docker images
```

### 3.4 创建 Ubuntu 22.04 容器

在主机执行：

```bash
docker run -it --name ubuntu22 ubuntu:22.04 bash
```

参数说明：

- `docker run`：创建并启动容器。
- `-it`：以交互式终端方式运行。
- `--name ubuntu22`：将容器命名为 `ubuntu22`。
- `ubuntu:22.04`：指定使用的镜像。
- `bash`：进入容器的 Bash 终端。

进入容器后，执行：

```bash
cat /etc/os-release
```

如果显示 Ubuntu 22.04，说明容器创建成功。

此时，主机系统仍然是 Ubuntu 24.04，只是我们通过 Docker 进入了 Ubuntu 22.04 容器。**从这里到通信测试结束，保持这个容器终端开启。**

### 3.5 在容器中安装 ROS 2 Humble

ROS 2 Humble 的官方 Ubuntu deb 包面向 Ubuntu 22.04，因此可以在当前容器中安装。以下步骤均在 **Ubuntu 22.04 容器内**执行。

首先更新软件包列表并安装基础工具：

```bash
apt update
apt install -y software-properties-common curl ca-certificates locales
```

配置 UTF-8 语言环境：

```bash
locale-gen en_US en_US.UTF-8
update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
locale
```

启用 Ubuntu Universe 软件源：

```bash
add-apt-repository -y universe
```

按照 [ROS 2 Humble 官方安装文档](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html)，使用 `ros2-apt-source` 软件包配置 ROS 2 软件源和签名密钥：

```bash
export ROS_APT_SOURCE_VERSION=$(curl -fsSL \
  https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest \
  | grep -F '"tag_name"' | awk -F '"' '{print $4}')

echo "$ROS_APT_SOURCE_VERSION"
```

确认输出了版本号后，下载并安装对应 Ubuntu 版本的源配置包：

```bash
curl -fL -o /tmp/ros2-apt-source.deb \
  "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"

dpkg -i /tmp/ros2-apt-source.deb
```

更新软件包列表，并在安装 ROS 2 前升级容器内的软件包：

```bash
apt update
apt upgrade -y
```

安装 ROS 2 Humble：

```bash
apt install -y ros-humble-desktop
```

`ros-humble-desktop` 包含 ROS、RViz 和示例程序。本文只验证命令行节点通信，不涉及容器图形界面；运行 RViz 等图形工具还需要另行配置显示转发。

### 3.6 验证 ROS 2 环境

在容器中加载 ROS 2 环境变量：

```bash
source /opt/ros/humble/setup.bash
```

查看当前加载的 ROS 2 发行版：

```bash
echo "$ROS_DISTRO"
```

如果输出：

```text
humble
```

说明 Humble 的环境变量已经加载。接下来通过节点通信检查实际运行情况。

### 3.7 运行 ROS 2 通信测试

为了验证 ROS 2 是否可以正常运行，我们使用官方提供的 Talker 和 Listener 示例程序。

在容器中确认示例程序已安装：

```bash
apt install -y ros-humble-demo-nodes-cpp ros-humble-demo-nodes-py
```

**终端一：运行 Talker**

在当前容器终端中执行：

```bash
source /opt/ros/humble/setup.bash
ros2 run demo_nodes_cpp talker
```

Talker 会持续发布消息。保持这个终端运行，不要退出容器。

**终端二：运行 Listener**

在 Ubuntu 24.04 主机上重新打开一个终端，执行：

```bash
docker exec -it ubuntu22 bash
```

进入同一个正在运行的容器后执行：

```bash
source /opt/ros/humble/setup.bash
ros2 run demo_nodes_py listener
```

Talker 的输出中应出现 `Publishing`，Listener 的输出中应出现 `I heard`。如果 Listener 能够接收到 Talker 发布的消息，就说明 ROS 2 节点通信测试成功。

两个节点位于同一个容器中，因此不需要额外配置跨容器网络。若后续将节点放在不同容器或主机中，还需要考虑 ROS 2 DDS 网络发现、网络模式和防火墙配置。

### 3.8 退出后如何再次使用？

在两个终端中分别按 `Ctrl + C` 停止节点，再输入 `exit` 退出 Shell。最初由 `docker run` 启动的 Bash 退出后，容器会停止。

在主机上可以查看包括已停止容器在内的列表：

```bash
docker ps -a
```

再次启动并进入原来的容器：

```bash
docker start -ai ubuntu22
```

如果容器已经在运行，则使用：

```bash
docker exec -it ubuntu22 bash
```

每次打开新的容器 Shell 后，运行 ROS 2 命令前都需要重新加载环境：

```bash
source /opt/ros/humble/setup.bash
```

这里没有使用 `--rm`，因此停止容器后，已安装的软件和容器内文件仍保留在这个容器中。不要重复执行 `docker run --name ubuntu22 ...`，否则会遇到同名容器冲突。

手动安装的软件也不会自动写回最初的 `ubuntu:22.04` 镜像。如果需要让其他设备复现这套环境，可以把安装过程整理进 Dockerfile，再构建项目自己的镜像。

## 四、总结

通过本次实践，我们使用 Docker 在 Ubuntu 24.04 主机上创建了 Ubuntu 22.04 容器，并在容器中完成了 ROS 2 Humble 的安装和节点通信测试。

整个过程不需要重新安装操作系统，也不需要创建完整的虚拟机。

Docker 的价值不仅在于运行不同版本的 Ubuntu，更重要的是能够将应用程序及其依赖环境进行隔离和封装，从而降低开发环境配置、项目部署和环境迁移的复杂度。

在机器人开发中，Docker 可以用于 ROS 2 开发环境搭建、算法运行环境部署、AI 模型部署以及多服务协同运行，为机器人软件的开发和交付提供更加灵活的环境管理方式。
