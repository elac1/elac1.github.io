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