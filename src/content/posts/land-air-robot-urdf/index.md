---
title: '陆地天空双栖机器人：四旋翼 + 四轮，用 URDF + xacro 建模'
pubDate: '2026-10-03'
description: '按文件夹组织的 URDF 建模工程：机身、机臂、旋翼组、轮组与 IMU 的实现方式，含坐标系与关节树、编译校验、RViz2 显示与 TF 数值核对。'
tags:
  - ROS2
  - URDF
  - 机器人
category: '垂直领域研究'
featured: false
---

> 本文给出“四旋翼 + 四轮”双模态机器人的完整 URDF 建模工程。模型按零件拆分为多个 xacro 文件，尺寸参数集中定义一处，重复件用宏生成。
> 内容包括构型与尺寸参数、坐标系与关节树、目录划分、各模型文件的实现要点，以及编译校验、RViz2 显示与 TF 数值核对的方法。
> 仿真接入（Gazebo）与飞行控制留待后续。

## 一、构型与参数

### 1.1 构型说明

sky_rover 是一台四旋翼与四轮底盘共用一个机身的双模态机器人：旋翼负责飞行、垂直起降与空中姿态保持，四个轮组负责落地之后的地面移动。两套动力装置共用同一块机身板，因此整机只有一棵坐标树、一份参数表和一个顶层装配文件，展开后得到 15 个 link 与 14 个 joint。

- **轮组兼作起落架**：落地支撑由机身四角外侧的四个轮组承担，模型中不出现独立的起落架支柱或缓冲机构，零件数量与关节数量都相应减少。落地冲击直接作用在轮子与轮轴上。
- **机臂采用 “+” 型布局**：四条机臂沿机身坐标系的 x、y 轴伸出，机臂与旋翼相对机身中心的偏移只沿单一坐标轴，URDF 里写的是纯数值，不需要三角函数。与之相对的是 “X” 型布局（cross frame），机臂指向四个象限，偏移量需要按 45° 分解到两个轴上。
- **地面转向采用滑动转向**：底盘没有转向舵机，方向改变由左右两侧轮组的转速差实现，也就是 skid steer。四轮独立驱动在结构上成立，但模型里不额外表达驱动分组，左右各两个轮组在仿真阶段绑定到同一驱动轴即可。

### 1.2 尺寸与质量参数

整机尺寸、质量与安装偏移集中在 `common/params.xacro` 中定义，下表是这组参数的取值与含义。

| 参数 | 值 | 说明 |
|------|-----|------|
| `body_length` / `body_width` | 0.24 m / 0.24 m | 机身方形板 |
| `body_height` | 0.06 m | 机身厚 |
| `body_mass` | 1.6 kg | |
| `body_half` | 0.12 m | `body_length/2` |
| `arm_length` | 0.14 m | 机臂长 |
| `arm_width` / `arm_height` | 0.02 m / 0.02 m | 机臂截面 |
| `arm_mass` | 0.05 kg | |
| `arm_center` | 0.19 m | `body_half + arm_length/2` |
| `arm_half` | 0.07 m | `arm_length/2` |
| `rotor_offset` | 0.26 m | `body_half + arm_length` |
| `motor_length` | 0.04 m | 电机高 |
| `hub_radius` | 0.015 m | 电机半径 |
| `rotor_radius` | 0.10 m | 桨盘半径 |
| `rotor_thickness` | 0.006 m | 桨盘厚 |
| `rotor_mass` | 0.04 kg | |
| `rotor_z` | 0.04 m | `motor_length` |
| `wheel_radius` | 0.05 m | |
| `wheel_width` | 0.025 m | |
| `wheel_mass` | 0.12 kg | |
| `wheel_offset_xy` | 0.145 m | 轮心到机身中心的 x、y 距离 |
| `imu_size` | 0.04 m | IMU 立方体边长 |
| `imu_mass` | 0.02 kg | |
| `ground_clearance` | 0.05 m | 机身底面离地间隙 |
| `base_z` | 0.08 m | `ground_clearance + body_height/2` |
| `wheel_offset_z` | −0.03 m | `wheel_radius − base_z` |

三条关键关系决定了参数之间不能各自独立取值：

1. `base_z` 是机身中心离地高度，取 `ground_clearance + body_height/2 = 0.08 m`，保证机身底面离地 0.05 m。轮心的 z 坐标由 `wheel_offset_z = wheel_radius − base_z = −0.03 m` 反推，负号表示轮心位于机身中心下方，其绝对值恰好让四个轮组同时贴地。
2. 轮心到机身中心的水平距离 `wheel_offset_xy` 为 0.145 m，机身半宽 `body_half` 为 0.12 m，轮组整体位于机身外廓之外，两者不干涉。
3. 桨盘半径 `rotor_radius` 为 0.10 m，桨心距机身中心 `rotor_offset` 为 0.26 m，桨盘不覆盖机身；相邻两个桨心的距离为 0.368 m，大于两倍桨半径 0.20 m，桨叶之间不干涉。

### 1.3 坐标系与关节树

坐标约定遵循 REP-103：右手系，x 轴指向机头，y 轴指向左侧，z 轴指向上方，本模型的机身、机臂、旋翼与轮组坐标系全部与之对齐，不需要额外的坐标变换。`base_footprint` 是贴地的虚拟坐标系，没有 visual、collision 与 inertial，只表示机器人在支撑面上的投影点；导航、里程计与建图通常以它为参考，模型里它作为根 link 存在，机身本体通过一个 fixed 关节挂在它下面。

```text
base_footprint
└── base_link                       (fixed, z = base_z)
    ├── front_arm_link              (fixed, +x)
    │   └── front_rotor_link        (continuous, z 轴)
    ├── back_arm_link               (fixed, −x)
    │   └── back_rotor_link         (continuous, z 轴)
    ├── left_arm_link               (fixed, +y)
    │   └── left_rotor_link         (continuous, z 轴)
    ├── right_arm_link              (fixed, −y)
    │   └── right_rotor_link        (continuous, z 轴)
    ├── front_left_wheel_link       (continuous, y 轴)
    ├── front_right_wheel_link      (continuous, y 轴)
    ├── rear_left_wheel_link        (continuous, y 轴)
    ├── rear_right_wheel_link       (continuous, y 轴)
    └── imu_link                    (fixed, 机身顶面)
```

关节类型按是否需要相对运动选择：机臂与 IMU 相对机身没有相对运动，使用 `fixed`；轮组需要整周滚动、旋翼需要整周旋转，使用 `continuous`。`continuous` 关节不写上下限，转动不会被限位截断。

## 二、工程结构

### 2.1 环境与依赖

模型本身是文本文件，显示与校验依赖 ROS 2 与若干标准工具包，以 Humble 为例一次装齐：

```bash
sudo apt install ros-humble-xacro ros-humble-joint-state-publisher ros-humble-joint-state-publisher-gui ros-humble-robot-state-publisher ros-humble-rviz2 ros-humble-tf2-tools ros-humble-ament-index-python
```

各包分工如下：`xacro` 把宏展开成 URDF；`robot_state_publisher` 读取 URDF 并广播各个 link 的 TF；`joint_state_publisher_gui` 为可动关节提供滑块并发布 `/joint_states`；`rviz2` 负责可视化；`tf2_ros` 与 `tf2_tools` 用于查询和导出坐标变换；`ament-index-python` 提供 `get_package_share_directory()`，launch 文件通过它定位 install 空间中的模型路径。工作空间与功能包的建立方式如下：

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_cmake sky_rover
```

两个 `setup.bash` 的作用不同：ROS 2 安装目录下的那个把 `ros2`、`xacro`、`rviz2` 等系统命令加入环境，工作空间里的 `install/setup.bash` 在系统环境之上叠加本工作空间的功能包。前者通常已经写入 shell 启动文件，后者每执行一次 `colcon build` 都需要重新 source，否则 `ros2 launch` 找到的仍是上一次构建的副本。

### 2.2 目录划分

模型文件按用途分目录存放。单文件模型在部件数量增加后定位困难，多人并行修改容易冲突，部件也无法单独复制到另一个工程复用，按“一个文件夹一类零件”拆开可以避免这三个问题。划分遵循三条规则：

1. 参数集中在 `common/params.xacro`，其他文件只引用，不重新定义同名参数与宏。
2. 一个部件一个文件夹；同一部件的重复件在文件内用宏生成，宏定义与四次调用写在同一个文件里。
3. 传感器单独一个文件夹，一个传感器一个文件；新增一个传感器等于新建一个文件，再在顶层加一行 include。

目录结构如下：

```text
sky_rover/
├── package.xml
├── CMakeLists.txt
├── launch/
│   └── display.launch.py
└── urdf/
    ├── sky_rover.urdf.xacro     # 顶层：只负责 include，不放几何
    ├── common/                  # 全机共用
    │   ├── params.xacro         # 尺寸、质量、安装偏移
    │   ├── materials.xacro      # 材质与颜色
    │   └── inertia.xacro        # 惯量计算宏
    ├── body/                    # 机身
    │   └── base.xacro
    ├── arm/                     # 机臂
    │   └── arm.xacro
    ├── rotor/                   # 旋翼组（电机 + 桨盘）
    │   └── rotor.xacro
    ├── wheel/                   # 轮组（兼作起落架）
    │   └── wheel.xacro
    └── sensor/                  # 传感器
        └── imu.xacro
```

先建立两个顶层目录：

```bash
cd ~/ros2_ws/src/sky_rover
mkdir -p urdf launch
touch urdf/.gitkeep launch/.gitkeep
```

`.gitkeep` 是空占位文件：`install(DIRECTORY ...)` 在源目录不存在时会直接报错，先放一个占位文件可以让 `colcon build` 在目录还没有内容时也能通过。`urdf/` 下面的 `common/`、`body/`、`arm/`、`rotor/`、`wheel/`、`sensor/` 在第三节逐个建立，构建配置不需要跟着改 —— `install(DIRECTORY urdf launch ...)` 是递归复制，子目录增加不影响 `CMakeLists.txt`。

### 2.3 package.xml 与 CMakeLists.txt

功能包清单声明包名、版本、维护者与依赖：

```xml
<?xml version="1.0"?>
<package format="3">
  <name>sky_rover</name>
  <version>0.0.1</version>
  <description>陆地天空双栖机器人（四旋翼 + 四轮）的 URDF 模型</description>
  <maintainer email="elac@example.com">elac</maintainer>
  <license>MIT</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <exec_depend>robot_state_publisher</exec_depend>
  <exec_depend>xacro</exec_depend>
  <exec_depend>joint_state_publisher</exec_depend>
  <exec_depend>joint_state_publisher_gui</exec_depend>
  <exec_depend>rviz2</exec_depend>
  <exec_depend>tf2_ros</exec_depend>
  <exec_depend>tf2_tools</exec_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

本包不含可执行代码，因此依赖只声明 `<exec_depend>`，构建工具依赖仅需 `ament_cmake` 一项。`robot_state_publisher`、`xacro`、`joint_state_publisher`、`joint_state_publisher_gui`、`rviz2` 与 `tf2` 相关包都在运行时才被 launch 文件调用，写进 `<exec_depend>` 可以让 `rosdep` 一次性装齐。

构建配置：

```cmake
cmake_minimum_required(VERSION 3.8)
project(sky_rover)

find_package(ament_cmake REQUIRED)

# 这个包只有模型和 launch 文件，没有可执行代码。
# install(DIRECTORY) 会递归复制整个目录，所以 urdf/ 下面再分多少层子目录
# 都不用改这里 —— 以后加零件、加传感器也不用动构建配置。
install(
  DIRECTORY urdf launch
  DESTINATION share/${PROJECT_NAME}
)

ament_package()
```

`find_package(ament_cmake REQUIRED)` 与 `ament_package()` 是 `ament_cmake` 包的最小骨架；`install(DIRECTORY urdf launch DESTINATION share/${PROJECT_NAME})` 把 `urdf/` 与 `launch/` 递归复制到 install 空间，模型文件与 launch 文件因此都能被 `get_package_share_directory()` 找到。修改 `package.xml`、`CMakeLists.txt`、任何 `.xacro` 文件或 launch 文件之后都需要重新执行 `colcon build`：`ros2 launch` 读取的是 install 空间中的副本，而不是 `src/` 下的源文件。

## 三、模型文件

以下按目录逐个给出文件全文与关键点，每节顺序一致：先说明该文件夹的职责，再给文件内容，最后列出参数与写法的依据。各子目录用 `mkdir -p` 逐个建立，不需要修改构建配置。

### 3.1 common/：参数、材质、惯量宏

`common/` 存放全机共用的三类内容：尺寸与质量参数、材质颜色、惯量计算宏。零件文件只引用这里定义的名字，不重复定义。

`params.xacro` 是全机唯一一份参数表：

```xml
<?xml version="1.0"?>
<!-- ============================================================
     全机唯一一份参数表。
     所有尺寸、质量、安装偏移都定义在这里；零件文件只引用，不重定义。
     想改整机大小，只改这个文件就够了。
     （pi 是 xacro 内置常量，不需要自己定义。）
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- 机身：一块方形板 -->
  <xacro:property name="body_length" value="0.24"/>
  <xacro:property name="body_width"  value="0.24"/>
  <xacro:property name="body_height" value="0.06"/>
  <xacro:property name="body_mass"   value="1.6"/>
  <xacro:property name="body_half"   value="${body_length/2}"/>

  <!-- 机臂：+ 型布局，前后左右各一条 -->
  <xacro:property name="arm_length" value="0.14"/>
  <xacro:property name="arm_width"  value="0.02"/>
  <xacro:property name="arm_height" value="0.02"/>
  <xacro:property name="arm_mass"   value="0.05"/>
  <xacro:property name="arm_center" value="${body_half + arm_length/2}"/>
  <xacro:property name="arm_half"   value="${arm_length/2}"/>
  <xacro:property name="rotor_offset" value="${body_half + arm_length}"/>

  <!-- 旋翼：电机 + 桨盘 -->
  <xacro:property name="motor_length"    value="0.04"/>
  <xacro:property name="hub_radius"      value="0.015"/>
  <xacro:property name="rotor_radius"    value="0.10"/>
  <xacro:property name="rotor_thickness" value="0.006"/>
  <xacro:property name="rotor_mass"      value="0.04"/>
  <xacro:property name="rotor_z"         value="${motor_length}"/>

  <!-- 轮子：同时充当起落架 -->
  <xacro:property name="wheel_radius"    value="0.05"/>
  <xacro:property name="wheel_width"     value="0.025"/>
  <xacro:property name="wheel_mass"      value="0.12"/>
  <xacro:property name="wheel_offset_xy" value="0.145"/>

  <!-- IMU 传感器 -->
  <xacro:property name="imu_size" value="0.04"/>
  <xacro:property name="imu_mass" value="0.02"/>

  <!-- 高度关系：机身底面留 ground_clearance，轮心高度靠 wheel_radius 反推。
       这两个表达式是"改尺寸不出错"的关键，不要改成手写数字。 -->
  <xacro:property name="ground_clearance" value="0.05"/>
  <xacro:property name="base_z" value="${ground_clearance + body_height/2}"/>
  <xacro:property name="wheel_offset_z" value="${wheel_radius - base_z}"/>

</robot>
```

- 所有尺寸、质量与安装偏移都在这个文件里定义一次，改整机大小只需要改这里。
- `base_z` 与 `wheel_offset_z` 写成表达式而不是手写常数：前者由 `ground_clearance + body_height/2` 得出，后者由 `wheel_radius − base_z` 反推，改机身厚度或轮径时贴地关系自动保持。
- `pi` 是 xacro 内置常量，直接写 `${pi/2}` 即可，不需要自己定义。

`materials.xacro` 定义颜色：

```xml
<?xml version="1.0"?>
<!-- ============================================================
     颜色定义。
     URDF 规定 <material> 必须是 <robot> 的直接子元素，
     所以单独放一个文件，由顶层 include 进 <robot> 里。
     零件文件里只写 <material name="blue"/> 这样按名字引用。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <material name="body">  <color rgba="0.25 0.35 0.75 1.0"/></material>
  <material name="dark">  <color rgba="0.15 0.15 0.18 1.0"/></material>
  <material name="prop">  <color rgba="0.85 0.85 0.90 0.85"/></material>
  <material name="rubber"><color rgba="0.10 0.10 0.10 1.0"/></material>
  <material name="imu">   <color rgba="0.85 0.35 0.20 1.0"/></material>

</robot>
```

- URDF 规定 `<material>` 必须是 `<robot>` 的直接子元素，因此颜色单独成文件，由顶层 include 到根标签下，零件文件里只写 `<material name="body"/>` 这样按名字引用。
- 按名字引用不匹配时 xacro 与 RViz 都不报错，零件只是退化为默认灰色，颜色异常时先检查名字是否与定义一致。
- 桨盘材质 `prop` 的 alpha 为 0.85，半透明效果用于在 RViz 中透视桨盘下方的电机与机臂。

`inertia.xacro` 提供惯量计算宏：

```xml
<?xml version="1.0"?>
<!-- ============================================================
     惯量计算宏：RViz 用不到，Gazebo 必须有。
     零件文件按自己的形状调用，不要手写惯量数字。
     roll / yaw 两个参数是给"躺倒的圆柱"和"伸出方向的机臂"用的：
     惯量椭球要跟着零件一起转，否则方向是错的。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <xacro:macro name="box_inertia" params="m x y z yaw:=0">
    <inertial>
      <origin xyz="0 0 0" rpy="0 0 ${yaw}"/>
      <mass value="${m}"/>
      <inertia ixx="${m*(y*y+z*z)/12}" ixy="0.0" ixz="0.0"
               iyy="${m*(x*x+z*z)/12}" iyz="0.0"
               izz="${m*(x*x+y*y)/12}"/>
    </inertial>
  </xacro:macro>

  <xacro:macro name="cylinder_inertia" params="m r h roll:=0">
    <inertial>
      <origin xyz="0 0 0" rpy="${roll} 0 0"/>
      <mass value="${m}"/>
      <inertia ixx="${m*(3*r*r+h*h)/12}" ixy="0.0" ixz="0.0"
               iyy="${m*(3*r*r+h*h)/12}" iyz="0.0"
               izz="${m*r*r/2}"/>
    </inertial>
  </xacro:macro>

</robot>
```

- RViz 不使用惯量，`inertial` 只在 Gazebo 等物理仿真中起作用，但建议在建模阶段就把它写全，避免接入仿真时返工。
- 两个宏分别对应长方体与圆柱，零件按自身形状调用，不手写惯量数值。
- `roll` 与 `yaw` 参数用来让惯量张量的方向与零件姿态一致：躺倒的圆柱做轮子需要传 `roll`，沿 y 轴伸出的机臂需要传 `yaw`；省略时两者都取 0。

### 3.2 body/：机身与 base_footprint

`body/` 存放机身。全机只有一件，文件里直接写 link 与 joint，不使用宏。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     机身：贴地坐标系 base_footprint + 机身本体 base_link。
     全机只有一件，不需要宏，直接写 link 和 joint。
     依赖：common/params.xacro（尺寸）、common/materials.xacro（颜色）、
          common/inertia.xacro（惯量宏）—— 由顶层按顺序先 include。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- 贴地的虚拟坐标系：本身没有几何，只表示机器人在地面的投影点 -->
  <link name="base_footprint"/>

  <joint name="base_joint" type="fixed">
    <parent link="base_footprint"/>
    <child link="base_link"/>
    <origin xyz="0 0 ${base_z}" rpy="0 0 0"/>
  </joint>

  <!-- 机身本体：所有零件的父坐标系 -->
  <link name="base_link">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <box size="${body_length} ${body_width} ${body_height}"/>
      </geometry>
      <material name="body"/>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <box size="${body_length} ${body_width} ${body_height}"/>
      </geometry>
    </collision>
    <xacro:box_inertia m="${body_mass}" x="${body_length}" y="${body_width}" z="${body_height}"/>
  </link>

</robot>
```

- `base_footprint` 是空 link，只有名字没有几何，作用是把机器人投影到支撑面。
- `base_joint` 是 `fixed` 关节，`origin` 仍然必须显式写出 `z = base_z`：`fixed` 关节省略 `origin` 等价于零偏移，机身中心会落在支撑面上，机身下半部分嵌入地面。
- `base_link` 同时包含 visual、collision 与 inertial 三部分：visual 决定 RViz 中显示的方块，collision 供 Gazebo 做碰撞检测，inertial 由 `box_inertia` 宏按 `body_mass` 与三边长度生成。

### 3.3 arm/：机臂

`arm/` 存放四条机臂，四条机臂形状完全相同，只有安装位置与朝向不同，因此用一个宏生成，末尾四次调用就是布局表。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     机臂：+ 型布局，前后左右各一条。
     四条臂形状完全一样，只有"装在哪、朝哪个方向"不同，
     所以写成一个宏，末尾调用四次 —— 布局集中在那四行里。
     依赖：common/params.xacro、common/materials.xacro、common/inertia.xacro。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <xacro:macro name="arm" params="prefix dx dy yaw">
    <link name="${prefix}_arm_link">
      <visual>
        <origin xyz="0 0 0" rpy="0 0 ${yaw}"/>
        <geometry>
          <box size="${arm_length} ${arm_width} ${arm_height}"/>
        </geometry>
        <material name="dark"/>
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="0 0 ${yaw}"/>
        <geometry>
          <box size="${arm_length} ${arm_width} ${arm_height}"/>
        </geometry>
      </collision>
      <xacro:box_inertia m="${arm_mass}" x="${arm_length}" y="${arm_width}" z="${arm_height}" yaw="${yaw}"/>
    </link>

    <joint name="${prefix}_arm_joint" type="fixed">
      <parent link="base_link"/>
      <child link="${prefix}_arm_link"/>
      <!-- 注意：这里 rpy 是 0，子坐标系和 base_link 同向。
           左右两条臂的 box 转向靠的是视觉/碰撞/惯量里的 yaw，
           不是关节的 rpy —— 所以旋翼的偏移可以直接用 dy 写。 -->
      <origin xyz="${dx} ${dy} 0" rpy="0 0 0"/>
    </joint>
  </xacro:macro>

  <!-- 四条机臂的布局：改布局只改这四行 -->
  <xacro:arm prefix="front" dx="${arm_center}"  dy="0"              yaw="0"/>
  <xacro:arm prefix="back"  dx="${-arm_center}" dy="0"              yaw="0"/>
  <xacro:arm prefix="left"  dx="0"              dy="${arm_center}"  yaw="${pi/2}"/>
  <xacro:arm prefix="right" dx="0"              dy="${-arm_center}" yaw="${pi/2}"/>

</robot>
```

- 宏参数为 `prefix dx dy yaw`：`prefix` 决定 link 与 joint 的名字前缀，`dx`、`dy` 是机臂中心相对 `base_link` 的偏移，`yaw` 是长条几何绕 z 轴的朝向。
- `arm_joint` 的 `origin` 中 `rpy` 为 0，子坐标系与 `base_link` 严格同向；左右两条机臂的横向朝向由 visual、collision 与 inertial 上的 `yaw = π/2` 实现，这样做只旋转几何与惯量，不旋转坐标系。
- 坐标系不旋转是 3.4 节旋翼偏移可以直接写 `dy` 的前提：如果关节把子坐标系转了 90°，旋翼的偏移量就必须跟着做坐标变换。
- `arm_center = body_half + arm_length/2 = 0.19 m` 让机臂内端面贴合机身侧面；`rotor_offset = body_half + arm_length = 0.26 m` 是桨心到机身中心的距离，在 5.3 节用于核对 TF。

### 3.4 rotor/：旋翼组

`rotor/` 存放四个旋翼组，每个旋翼组由一片桨盘与一台电机组成；四个旋翼形状相同，同样用宏生成。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     旋翼：电机 + 桨盘。四个形状一样，用宏生成。
     父 link 是"自己那条机臂"，所以偏移量是相对机臂中心的：
     x 或 y = ±arm_half（0.07），不是 rotor_offset（0.26）。
     转向靠 axis 的正负号表达：四旋翼要"相邻反向、对角同向"，
     所以 front / back 传 +1，left / right 传 -1。
     依赖：common/params.xacro、common/materials.xacro、common/inertia.xacro。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <xacro:macro name="rotor" params="prefix dx dy spin">
    <link name="${prefix}_rotor_link">
      <!-- 桨盘 -->
      <visual>
        <origin xyz="0 0 0" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${rotor_radius}" length="${rotor_thickness}"/>
        </geometry>
        <material name="prop"/>
      </visual>
      <!-- 电机：从机臂平面长到桨盘下方。origin 的负偏移就是这么来的 -->
      <visual>
        <origin xyz="0 0 ${-motor_length/2}" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${hub_radius}" length="${motor_length}"/>
        </geometry>
        <material name="dark"/>
      </visual>
      <!-- 碰撞只算桨盘：电机是细长小件，碰撞体越简单仿真越稳 -->
      <collision>
        <origin xyz="0 0 0" rpy="0 0 0"/>
        <geometry>
          <cylinder radius="${rotor_radius}" length="${rotor_thickness}"/>
        </geometry>
      </collision>
      <xacro:cylinder_inertia m="${rotor_mass}" r="${rotor_radius}" h="${rotor_thickness}"/>
    </link>

    <joint name="${prefix}_rotor_joint" type="continuous">
      <parent link="${prefix}_arm_link"/>
      <child link="${prefix}_rotor_link"/>
      <origin xyz="${dx} ${dy} ${rotor_z}" rpy="0 0 0"/>
      <!-- spin 传 ±1：写 -1 不是"装反了"，而是这个关节的正方向绕 z 反向 -->
      <axis xyz="0 0 ${spin}"/>
      <dynamics damping="0.001" friction="0.0"/>
    </joint>
  </xacro:macro>

  <!-- 相邻反向、对角同向 -->
  <xacro:rotor prefix="front" dx="${arm_half}"  dy="0"            spin="1"/>
  <xacro:rotor prefix="back"  dx="${-arm_half}" dy="0"            spin="1"/>
  <xacro:rotor prefix="left"  dx="0"            dy="${arm_half}"  spin="-1"/>
  <xacro:rotor prefix="right" dx="0"            dy="${-arm_half}" spin="-1"/>

</robot>
```

- 旋翼关节的父 link 是所属机臂，因此 `origin` 的偏移量相对机臂中心，取 `±arm_half`（0.07 m），而不是相对机身中心的 `rotor_offset`（0.26 m）；两者相加等于 0.26 m。
- 每个旋翼 link 有两个 visual：桨盘与电机；collision 只有一块，只覆盖桨盘。碰撞体保留主要外廓，细长的电机不参与碰撞，仿真求解更稳定。
- 电机的 visual 用 `origin z = −motor_length/2` 从机臂平面向下延伸，桨盘位于 `rotor_z = motor_length = 0.04 m` 处，也就是电机顶端。
- 转向由 `axis xyz="0 0 ${spin}"` 的正负号表达，`spin` 取 ±1。按右手定则，`axis` 的方向定义关节正方向；四旋翼需要相邻反向、对角同向，反扭矩才能相互抵消。

| 旋翼 | 安装位置 (x, y) | `axis` | 转向 |
|------|----------------|--------|------|
| `front` | (0.26, 0) | `0 0 1` | 正转 |
| `left` | (0, 0.26) | `0 0 -1` | 反转 |
| `back` | (−0.26, 0) | `0 0 1` | 正转 |
| `right` | (0, −0.26) | `0 0 -1` | 反转 |

`spin` 取 −1 表示该关节的正方向绕 z 轴反向，不是零件装反，四个旋翼的几何与安装方式完全一致。

### 3.5 wheel/：轮组

`wheel/` 存放四个轮组。轮组既负责地面移动，也充当整机的起落架；地面转向依靠左右两侧差速，属于滑动转向，转向过程中轮胎存在滑移，里程计精度低于两轮差速结构。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     轮子：四个，同时充当起落架。
     装在机身四角外侧（±wheel_offset_xy），绕 y 轴前后滚。
     轮心的 z 用 wheel_offset_z（负值，往下沉），
     它由 wheel_radius - base_z 算出，保证四个轮子同时着地。
     依赖：common/params.xacro、common/materials.xacro、common/inertia.xacro。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <xacro:macro name="wheel" params="prefix dx dy">
    <link name="${prefix}_wheel_link">
      <!-- 圆柱默认轴向沿 z，转 90° 才"躺下"变成轮子 -->
      <visual>
        <origin xyz="0 0 0" rpy="${pi/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
        <material name="rubber"/>
      </visual>
      <collision>
        <origin xyz="0 0 0" rpy="${pi/2} 0 0"/>
        <geometry>
          <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
        </geometry>
      </collision>
      <xacro:cylinder_inertia m="${wheel_mass}" r="${wheel_radius}" h="${wheel_width}" roll="${pi/2}"/>
    </link>

    <joint name="${prefix}_wheel_joint" type="continuous">
      <parent link="base_link"/>
      <child link="${prefix}_wheel_link"/>
      <origin xyz="${dx} ${dy} ${wheel_offset_z}" rpy="0 0 0"/>
      <!-- 绕 y 轴转 = 前后滚。地面转向靠左右两侧差速（滑动转向） -->
      <axis xyz="0 1 0"/>
      <dynamics damping="0.01" friction="0.0"/>
    </joint>
  </xacro:macro>

  <xacro:wheel prefix="front_left"  dx="${wheel_offset_xy}"  dy="${wheel_offset_xy}"/>
  <xacro:wheel prefix="front_right" dx="${wheel_offset_xy}"  dy="${-wheel_offset_xy}"/>
  <xacro:wheel prefix="rear_left"   dx="${-wheel_offset_xy}" dy="${wheel_offset_xy}"/>
  <xacro:wheel prefix="rear_right"  dx="${-wheel_offset_xy}" dy="${-wheel_offset_xy}"/>

</robot>
```

- URDF 的 `<cylinder>` 默认轴向沿 z，轮子需要 `rpy = π/2 0 0` 才是躺倒的姿态；惯量宏同步传 `roll = π/2`，惯量张量的方向才与几何一致。
- `axis xyz="0 1 0"` 表示轮子绕 y 轴旋转，即前后滚动；写成绕 x 轴会让轮组侧向翻转。
- 轮心 z 坐标取 `wheel_offset_z`（负值），其绝对值由 `base_z − wheel_radius` 决定，保证轮心离地高度等于 `wheel_radius`，四个轮组同时着地。
- 起落架功能：轮组位于机身四角外侧（±0.145 m），机身半宽 0.12 m，轮子半厚 0.0125 m，轮子内侧面在 0.1325 m 处，位于机身外廓之外；四个接地点构成 0.29 m × 0.29 m 的支撑面，大于机身外廓。落地冲击由轮组承担，轮子与轮轴选型时需要按冲击载荷校核。

### 3.6 sensor/：IMU

`sensor/` 存放传感器，一个传感器一个文件，当前包含一个 IMU。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     传感器：IMU。
     全部传感器都放这个文件夹，一个传感器一个文件：
       sensor/imu.xacro   ← 现在这个
       sensor/lidar.xacro ← 以后加雷达时新建，然后在顶层加一行 include
     装的位置在机身顶面中心；它的朝向是给以后的飞行控制用的
     （姿态反馈），现在先把坐标系放对。
     依赖：common/params.xacro、common/materials.xacro、common/inertia.xacro。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">

  <link name="imu_link">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <box size="${imu_size} ${imu_size} ${imu_size}"/>
      </geometry>
      <material name="imu"/>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <box size="${imu_size} ${imu_size} ${imu_size}"/>
      </geometry>
    </collision>
    <xacro:box_inertia m="${imu_mass}" x="${imu_size}" y="${imu_size}" z="${imu_size}"/>
  </link>

  <joint name="imu_joint" type="fixed">
    <parent link="base_link"/>
    <child link="imu_link"/>
    <!-- 机身顶面中心：半个机身厚 + 半个 IMU 边长 -->
    <origin xyz="0 0 ${body_height/2 + imu_size/2}" rpy="0 0 0"/>
  </joint>

</robot>
```

- IMU 安装在机身顶面中心：`origin z = body_height/2 + imu_size/2 = 0.05 m`，这是相对 `base_link` 的偏移，加上 `base_z` 后绝对高度为 0.13 m。
- IMU 坐标系与 `base_link` 同向（`rpy = 0`），后续姿态控制可以直接使用它输出的角速度与线性加速度，不需要额外旋转。
- 扩展规则：新增传感器（例如激光雷达）时新建 `sensor/lidar.xacro`，文件内含 `lidar_link` 与 `lidar_joint`，再在顶层加一行 include 即可；`CMakeLists.txt` 与 launch 文件都不需要修改。

### 3.7 顶层装配文件

顶层文件 `urdf/sky_rover.urdf.xacro` 不含任何几何，只负责按顺序 include 各部件文件。

```xml
<?xml version="1.0"?>
<!-- ============================================================
     顶层文件：只负责"组装"，不放任何几何。
     加一个新零件 = 在对应文件夹里新建一个文件 + 在下面加一行 include。
     ============================================================ -->
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="sky_rover">

  <!-- 顺序有讲究：先参数和公共资源，再零件。
       零件文件里会用到参数和惯量宏，所以必须排在它们后面，
       否则 xacro 会报 name 'xxx' is not defined。 -->

  <!-- 1. 全机参数、颜色、惯量宏 -->
  <xacro:include filename="common/params.xacro"/>
  <xacro:include filename="common/materials.xacro"/>
  <xacro:include filename="common/inertia.xacro"/>

  <!-- 2. 各部件：一个文件夹一个部件 -->
  <xacro:include filename="body/base.xacro"/>
  <xacro:include filename="arm/arm.xacro"/>
  <xacro:include filename="rotor/rotor.xacro"/>
  <xacro:include filename="wheel/wheel.xacro"/>

  <!-- 3. 传感器 -->
  <xacro:include filename="sensor/imu.xacro"/>
  <!-- 以后加雷达，就在这里再加一行：
       <xacro:include filename="sensor/lidar.xacro"/> -->

</robot>
```

- `common/` 下的三个文件必须排在所有零件文件之前。xacro 在 include 时立即展开并求值，零件文件里的 `${body_length}` 之类表达式在参数尚未定义时会直接报 `name 'xxx' is not defined`。
- `filename` 是相对当前文件的路径，不是相对工作目录或包根目录的路径。
- xacro 会递归展开 include，因此 `ros2 launch` 与命令行的 `xacro` 命令始终只指向这一个顶层文件，子目录中的文件不需要单独调用。

## 四、编译与校验

构建功能包并重新加载环境：

```bash
cd ~/ros2_ws
colcon build --packages-select sky_rover
source install/setup.bash
```

展开模型并做结构校验：

```bash
cd src/sky_rover/urdf
xacro sky_rover.urdf.xacro > /tmp/sky_rover.urdf
check_urdf /tmp/sky_rover.urdf
```

`check_urdf` 输出形如：

```text
Successfully Parsed XML
root Link: base_footprint has 1 child(ren)
...（随后逐级打印完整关节树）
```

判据有三项：出现 `Successfully Parsed XML`；根 link 为 `base_footprint`；随后打印的关节树与 1.3 节的结构一致，即根下面只有一个 `base_link`，`base_link` 下面挂四条机臂、四个轮组与 IMU。再用 `grep -c '<link' /tmp/sky_rover.urdf` 与 `grep -c '<joint' /tmp/sky_rover.urdf` 做计数自检，两个数字应分别为 15 与 14，与 1.1 节的规模一致。

`check_urdf` 只校验关节树拓扑与标签完整性，不判断几何是否合理：轮子是否贴地、桨盘是否与机身干涉、IMU 是否装在顶面，这些都要靠第五节的可视化检查确认。此外，`xacro` 与 `check_urdf` 通过只说明源文件本身没有语法问题，RViz 显示的是 install 空间中的副本，模型改动后必须先构建再启动。

## 五、在 RViz2 中显示与验证

### 5.1 display.launch.py

launch 文件放在 `launch/` 下，一次启动显示所需的三个节点：

```python
import os

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.substitutions import Command
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue


def generate_launch_description():
    pkg_share = get_package_share_directory('sky_rover')
    # 只指向顶层文件；分文件的事由顶层里的 include 去解决
    xacro_file = os.path.join(pkg_share, 'urdf', 'sky_rover.urdf.xacro')

    # 把 xacro 展开成 URDF 字符串，交给 robot_state_publisher
    robot_description = ParameterValue(
        Command(['xacro ', xacro_file]),
        value_type=str
    )

    return LaunchDescription([
        # 1. 解析 URDF 并发布 TF
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': robot_description}],
            output='screen'
        ),
        # 2. 给每个可动关节一个滑块（4 个轮子 + 4 个旋翼）
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            output='screen'
        ),
        # 3. 可视化
        Node(
            package='rviz2',
            executable='rviz2',
            output='screen'
        ),
    ])
```

- 三个节点的分工：`robot_state_publisher` 接收 `robot_description` 与 `/joint_states`，计算并广播所有 link 之间的 TF；`joint_state_publisher_gui` 为每个可动关节生成一个滑块，把关节位置发布到 `/joint_states`；`rviz2` 订阅 TF 与 `robot_description`，把模型显示出来。
- `Command(['xacro ', xacro_file])` 中 `xacro` 后面的空格不能省略，否则两个字符串会拼成 `xacro/path/to/...`，命令行找不到该文件。
- 外层 `ParameterValue(..., value_type=str)` 不能省略：`Command` 的替换结果会被 launch 做类型推断，XML 文本可能被解析成其他类型并报参数类型错误，显式声明为字符串可以避免。

启动命令：

```bash
ros2 launch sky_rover display.launch.py
```

### 5.2 RViz 配置与显示判据

RViz 启动后需要三项配置：`Global Options → Fixed Frame` 设为 `base_footprint`；`Add → RobotModel`，把 `Description Topic` 选为 `/robot_description`；`Add → TF`，按需打开 `Show Names` 与 `Show Axes`。

判据一：`joint_state_publisher_gui` 面板上应当出现 8 个滑块，对应 4 个 `*_rotor_joint` 与 4 个 `*_wheel_joint`；`base_joint`、4 个 `*_arm_joint` 与 `imu_joint` 都是 `fixed` 关节，没有滑块属于正常现象。

判据二：拖动轮组滑块，轮子绕 y 轴前后滚动；如果轮子绕车身侧向翻转，说明 `axis` 写错了轴。拖动旋翼滑块时，四个桨盘应表现为相邻反向、对角同向。

### 5.3 用 TF 数值核对模型

RViz 只能看出形状是否大致正确，具体数值用 `tf2_echo` 查询：

```bash
ros2 run tf2_ros tf2_echo base_footprint base_link
ros2 run tf2_ros tf2_echo base_footprint imu_link
ros2 run tf2_ros tf2_echo base_link front_rotor_link
ros2 run tf2_ros tf2_echo base_link front_left_wheel_link
```

预期平移如下：

| 查询 | 预期平移 | 数值来源 |
|------|---------|---------|
| `base_footprint → base_link` | `[0, 0, 0.08]` | `base_z` |
| `base_footprint → imu_link` | `[0, 0, 0.13]` | `base_z + (body_height/2 + imu_size/2) = 0.08 + 0.05` |
| `base_link → front_rotor_link` | `[0.26, 0, 0.04]` | `arm_center + arm_half = 0.19 + 0.07 = rotor_offset`；z 为 `rotor_z` |
| `base_link → front_left_wheel_link` | `[0.145, 0.145, −0.03]` | `wheel_offset_xy` 与 `wheel_offset_z` |

第三条是累积变换：`base_link` 到 `front_rotor_link` 中间经过 `front_arm_link`，因此 x 为 0.26 m 而不是旋翼关节自身的 0.07 m。如果查询结果是 0.07，说明查的是 `front_arm_link → front_rotor_link` 这一段。整棵 TF 树可以用 `ros2 run tf2_tools view_frames` 导出，命令在当前目录生成 `frames.pdf` 与 `frames.gv`，用于确认 15 个 link 之间的连接关系与 1.3 节的关节树一致。

## 六、常见错误与排查

| 现象 | 原因 | 处理 |
|------|------|------|
| 轮组悬空、机身贴地 | `base_z` 直接写成 `wheel_radius` | `base_z` 用 `ground_clearance + body_height/2`，轮心 z 由 `wheel_radius − base_z` 反推 |
| 旋翼位置错误（挤入机身或远离机身） | 误以为机臂关节的 `yaw` 会旋转子坐标系 | 关节 `origin` 的 `rpy` 为 0，旋翼相对机臂中心的偏移取 `±arm_half` |
| 四个桨盘同向旋转 | 四个 `axis` 都写成 `0 0 1` | 用 `spin` 传 ±1：front 与 back 为 1，left 与 right 为 −1 |
| `xacro` 报 `name 'xxx' is not defined` | include 顺序错误，零件文件排在 `common/params.xacro` 之前 | 把 `common/` 三行放在所有零件文件之前 |
| 新增零件文件未生效或报根标签错误 | 被 include 的文件缺少 `<robot xmlns:xacro="...">` 根标签 | 每个被 include 的文件都是含根标签的完整 xacro 片段 |
| 报文件找不到（路径看起来正确） | `filename` 写成相对工作目录或包根目录的路径 | `filename` 相对当前文件解析 |
| 修改 `params.xacro` 后不生效或出现重复定义告警 | 零件文件里重复定义了同名参数或宏 | 参数与宏只在 `common/` 中定义一次 |
| launch 报模型文件不存在，或 `get_package_share_directory()` 返回的目录里没有 `urdf` | `install(DIRECTORY ...)` 漏掉目录 | `install(DIRECTORY urdf launch DESTINATION share/${PROJECT_NAME})` 两个目录都列出 |
| 修改模型后 RViz 仍显示旧模型 | 没有重新 `colcon build` | 修改模型、launch 或 `package.xml` 后重新构建，并在新终端 source |
| RViz 空白，状态栏提示没有变换 | `Fixed Frame` 仍为 `map` | 改为 `base_footprint` |
| 添加 TF 后仍然看不到模型 | 没有添加 RobotModel，或它的 `Description Topic` 为空 | 添加 RobotModel 并把 `Description Topic` 选为 `/robot_description` |
| 模型尺寸外观正常，Gazebo 中姿态异常 | 惯量宏遗漏 `roll` 或 `yaw`，惯量张量方向与零件姿态不一致 | 轮组传 `roll`，沿 y 轴伸出的机臂传 `yaw` |
| RViz 显示的模型不是本工程模型，且 TF 数值与设计不符 | 同一 ROS 域内存在其他机器人节点，`/robot_description`、`/tf`、`base_footprint`、`base_link` 等通用名称冲突 | 为该工程分配独立域：`export ROS_DOMAIN_ID=<未占用编号>` 后重启；用 `ros2 topic info /robot_description -v` 检查发布者数量，应为 1 |

## 七、后续工作

**Gazebo 仿真接入**：模型已经包含 collision 与 inertial，接入仿真的工作是新增 Gazebo 插件与 launch 文件，模型结构不需要改动。地面行驶需要差速驱动插件，左右各两个轮组绑定到同一驱动轴，插件参数中的轮距与轮径取自 `params.xacro`。同时需要配置世界文件与实体生成流程，让模型从 `robot_description` 生成到仿真世界中。

**飞行控制**：下一步是旋翼推力建模与姿态控制回路，链路为 IMU 姿态反馈经过控制器解算后分配到四个旋翼的推力指令上。`imu_link` 的坐标方向与旋翼 `axis` 的正负号在这个环节直接决定反馈量的符号与控制量的分配关系，模型中把 IMU 与 `base_link` 对齐、把旋翼转向按相邻反向配置，就是为了让这两处不需要额外的符号修正。推力上限与响应延迟需要按实际电机与桨叶的实测数据标定。

**地面导航**：滑动转向底盘接入 `slam_toolbox` 与 Nav2 时，里程计精度受轮胎滑移影响，仅靠轮速积分的位姿误差会随时间累积。通常的做法是融合 IMU 的角速度做航向修正，或者对轮式里程计做标定以补偿滑移。轮距、轮径与 `wheel_offset_xy` 是这两项工作的输入参数。
