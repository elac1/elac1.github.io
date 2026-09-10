---
title: 'Ubuntu 22.04 部署 ROS 2 Humble 完整指南'
pubDate: '2026-08-15'
description: '从零开始在 Ubuntu 22.04 上安装 ROS 2 Humble，包括换源、密钥、环境配置、工作空间初始化，以及常见安装报错的解决办法。'
tags:
  - ROS2
  - 部署
category: 垂直领域研究
---

## 为什么选 Ubuntu 22.04 + ROS 2 Humble

- Humble 是 ROS 2 的 LTS 版本，维护到 2027 年
- 22.04 也是 Ubuntu LTS，稳定
- 两者搭配是当前 ROS 2 生态的主流组合

## 正式安装步骤

### 1. 换国内源（可选但强烈推荐）

```bash
# 备份
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 清华源
sudo sed -i 's|archive.ubuntu.com|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list
sudo sed -i 's|security.ubuntu.com|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list
sudo apt update
```

### 2. 设置 locale

```bash
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

### 3. 加 ROS 2 仓库

```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
```

### 4. 安装 ROS 2

```bash
sudo apt install ros-humble-desktop
sudo apt install ros-dev-tools
```

desktop 版包含 RViz、rqt、示例节点，适合开发。如果只要核心装 `ros-humble-ros-base` 就行。

### 5. 环境配置

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

验证：`ros2 --help` 不报错就成。

### 6. 工作空间初始化

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

## 常见报错

**1. apt update 后 GPG key 报错**

```
NO_PUBKEY XXXXX
```

密钥过期，重新执行第 3 步的 key 添加命令。

**2. colcon build 找不到 Python 包**

```
ModuleNotFoundError: No module named 'catkin_pkg'
```

```bash
pip install catkin_pkg empy lark
```

**3. RViz 启动报 OpenGL 错**

虚拟机里常见，装一下：

```bash
sudo apt install mesa-utils libgl1-mesa-glx
```
