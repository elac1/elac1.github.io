---
title: 'ROS 2 Launch 文件：从入门到日常使用'
pubDate: '2026-09-28'
description: 'Launch 文件是 ROS 2 中批量启动节点、配置参数的核心工具。从基本结构到完整仿真实例，理清 launch 文件的完整操作流程。'
tags:
  - ROS2
  - ROS
  - 机器人
category: '垂直领域研究'
featured: false
---

> Launch 文件是 ROS 2 中批量启动节点、配置参数的核心工具。这篇博客帮你理清 launch 文件的完整操作流程：怎么写、怎么用、日常开发中怎么组织。

## 为什么需要 Launch 文件

假设你的仿真环境需要同时启动：

- Gazebo（物理仿真）
- robot_state_publisher（发布 TF）
- spawn_entity.py（在 Gazebo 中生成机器人）
- RViz2（可视化）

如果不用 launch 文件，你需要开 4 个终端，分别输入 4 条命令。用 launch 文件，一条命令搞定：

```bash
ros2 launch my_package simulation.launch.py
```

## Launch 文件的基本结构

### 最简单的 Launch 文件

创建 `launch/my_first_launch.py`：

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='turtlesim',
            executable='turtlesim_node',
            name='my_turtle'
        ),
    ])
```

运行：

```bash
ros2 launch my_package my_first_launch.py
```

这会启动 turtlesim 节点，并把它重命名为 `my_turtle`。

### Launch 文件的核心组成

```python
from launch import LaunchDescription
from launch.actions import ...      # 高级操作
from launch_ros.actions import Node  # 节点启动

def generate_launch_description():
    return LaunchDescription([
        # 在这里放各种 Action
    ])
```

`generate_launch_description()` 函数必须返回一个 `LaunchDescription` 对象，里面包含你要执行的所有 Action。

## 你最常用的 Launch 操作

### 1. 启动一个节点

```python
Node(
    package='包名',
    executable='可执行文件名',
    name='节点别名',           # 可选，重命名节点
    namespace='命名空间',       # 可选
    parameters=[参数字典],      # 可选
    remappings=[话题重映射],    # 可选
)
```

实际例子：

```python
Node(
    package='robot_state_publisher',
    executable='robot_state_publisher',
    parameters=[{'robot_description': robot_desc}]
)
```

### 2. 包含另一个 Launch 文件

```python
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource

IncludeLaunchDescription(
    PythonLaunchDescriptionSource(
        '/path/to/other_launch.py'
    )
)
```

实际例子（启动 Gazebo）：

```python
from ament_index_python.packages import get_package_share_directory
import os

pkg_gazebo = get_package_share_directory('gazebo_ros')

IncludeLaunchDescription(
    PythonLaunchDescriptionSource(
        os.path.join(pkg_gazebo, 'launch', 'gazebo.launch.py')
    )
)
```

### 3. 传递参数给包含的 Launch 文件

```python
IncludeLaunchDescription(
    PythonLaunchDescriptionSource(
        os.path.join(pkg_gazebo, 'launch', 'gazebo.launch.py')
    ),
    launch_arguments={
        'world': '/path/to/world.world',
        'paused': 'true',
    }.items()
)
```

### 4. 声明 Launch 参数（让外部可以传参）

```python
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

# 声明参数
DeclareLaunchArgument(
    'world',
    default_value='empty.world',
    description='Path to the world file'
)

# 使用参数
world_path = LaunchConfiguration('world')
```

运行时传参：

```bash
ros2 launch my_package simulation.launch.py world:=my_world.world
```

### 5. 执行 Shell 命令

```python
from launch.actions import ExecuteProcess

ExecuteProcess(
    cmd=['ros2', 'topic', 'pub', '/cmd_vel', 'geometry_msgs/Twist',
         '{linear: {x: 0.2}, angular: {z: 0.0}}'],
    output='screen'
)
```

### 6. 条件执行

```python
from launch.conditions import IfCondition, UnlessCondition
from launch.actions import DeclareLaunchArgument

# 声明一个布尔参数
DeclareLaunchArgument('use_rviz', default_value='true')

# 根据参数决定是否启动 RViz
Node(
    package='rviz2',
    executable='rviz2',
    condition=IfCondition(LaunchConfiguration('use_rviz'))
)
```

运行时：

```bash
# 启动 RViz
ros2 launch my_package sim.launch.py use_rviz:=true

# 不启动 RViz
ros2 launch my_package sim.launch.py use_rviz:=false
```

## 完整仿真 Launch 文件实例

下面是一个典型的差速小车仿真 launch 文件，涵盖了日常开发中最常用的操作：

```python
import os
from launch import LaunchDescription
from launch.actions import (
    IncludeLaunchDescription,
    DeclareLaunchArgument,
)
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from ament_index_python.packages import get_package_share_directory
import xacro

def generate_launch_description():

    # ========== 包路径 ==========
    pkg_gazebo = get_package_share_directory('gazebo_ros')
    pkg_robot = get_package_share_directory('my_robot')

    # ========== 声明 Launch 参数 ==========
    use_rviz_arg = DeclareLaunchArgument(
        'use_rviz', default_value='true',
        description='Whether to launch RViz2'
    )

    world_arg = DeclareLaunchArgument(
        'world', default_value='empty.world',
        description='Path to Gazebo world file'
    )

    # ========== 处理 URDF/Xacro ==========
    xacro_file = os.path.join(pkg_robot, 'urdf', 'robot.xacro')
    robot_description = xacro.process_file(xacro_file).toxml()

    # ========== Gazebo 启动参数 ==========
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(pkg_gazebo, 'launch', 'gazebo.launch.py')
        ),
        launch_arguments={
            'world': LaunchConfiguration('world'),
        }.items()
    )

    # ========== 节点定义 ==========
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{'robot_description': robot_description}]
    )

    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', 'my_robot'
        ]
    )

    rviz = Node(
        package='rviz2',
        executable='rviz2',
        arguments=['-d', os.path.join(pkg_robot, 'rviz', 'config.rviz')],
        condition=IfCondition(LaunchConfiguration('use_rviz'))
    )

    # ========== 返回 LaunchDescription ==========
    return LaunchDescription([
        use_rviz_arg,
        world_arg,
        gazebo,
        robot_state_publisher,
        spawn_entity,
        rviz,
    ])
```

### 运行方式

```bash
# 默认启动（包含 RViz）
ros2 launch my_robot simulation.launch.py

# 指定世界文件
ros2 launch my_robot simulation.launch.py world:=my_world.world

# 不启动 RViz
ros2 launch my_robot simulation.launch.py use_rviz:=false
```

## Launch 文件的完整工作流程

### 流程 1：从零开始写 Launch 文件

```
1. 创建包结构
   my_package/
   ├── launch/
   │   └── my_launch.py
   ├── urdf/
   │   └── robot.xacro
   └── rviz/
       └── config.rviz

2. 在 launch/ 目录下写 .py 文件

3. 运行测试
   ros2 launch my_package my_launch.py

4. 调试修改，重复步骤 2-3
```

### 流程 2：调试 Launch 文件

```bash
# 查看 launch 文件中声明的参数
ros2 launch my_package my_launch.py -s

# 查看 launch 文件的帮助信息
ros2 launch my_package my_launch.py -h

# 只检查语法，不实际执行（ROS 2 Iron+）
ros2 launch my_package my_launch.py --show-args
```

### 流程 3：Launch 文件组织建议

日常开发中，建议按功能拆分 launch 文件：

```
launch/
├── robot_description.launch.py    # 只启动 robot_state_publisher
├── gazebo.launch.py               # 只启动 Gazebo + spawn
├── rviz.launch.py                 # 只启动 RViz2
└── simulation.launch.py           # 包含以上三个，一键启动
```

这样你可以单独测试每个部分，也可以一键启动完整仿真。

## 常见问题

### Q1：Launch 文件报错 "package not found"

**原因**：包没有正确编译或 source。

**解决**：

```bash
# 重新编译
colcon build --packages-select my_package

# 重新 source
source install/setup.bash
```

### Q2：Launch 文件中找不到文件路径

**原因**：路径拼接错误。

**解决**：始终用 `get_package_share_directory` 获取包路径：

```python
pkg_path = get_package_share_directory('my_package')
file_path = os.path.join(pkg_path, 'urdf', 'robot.urdf')
```

### Q3：Launch 参数传不进去

**原因**：没有声明 `DeclareLaunchArgument`。

**解决**：在 `LaunchDescription` 中先声明参数，再使用：

```python
DeclareLaunchArgument('my_arg', default_value='default')
# 然后才能用 LaunchConfiguration('my_arg')
```

### Q4：节点启动顺序不对

**原因**：Launch 文件中的节点是并行启动的，没有依赖关系。

**解决**：用 `RegisterEventHandler` + `OnProcessStart` 控制顺序，或用 `TimerAction` 延迟启动。

## 总结

Launch 文件的核心就是这几件事：

| 操作 | 代码 |
|------|------|
| 启动节点 | `Node(package=..., executable=...)` |
| 包含其他 launch | `IncludeLaunchDescription(...)` |
| 声明参数 | `DeclareLaunchArgument(...)` |
| 使用参数 | `LaunchConfiguration(...)` |
| 条件执行 | `condition=IfCondition(...)` |
| 执行命令 | `ExecuteProcess(cmd=[...])` |

日常开发中，90% 的 launch 文件都是这几个操作的组合。把上面的完整仿真实例看懂、改几遍，基本就够用了。
