export type Project = {
  name: string
  description: string
  tech: string[]
  href: string
}

// 项目页数据：直接修改这里即可增删项目
export const projects: Project[] = [
  {
    name: 'OpenCV 人脸识别：6 种经典特征对比',
    description:
      '不训练神经网络，在同一 1-NN 分类器下对比原始像素、LBP、LBPH、PCA、LDA、Fisherface，准确率从 90.00% 提升到 99.17%。',
    tech: ['OpenCV', 'PCA', 'LDA', 'Python'],
    href: '/opencv-face-recognition/'
  },
  {
    name: 'LBP 灾害场景识别',
    description:
      '用八邻域 LBP、256 维直方图与卡方距离完成五类灾害场景分类，并通过光照实验定位强光导致的误分类。',
    tech: ['OpenCV', 'LBP', 'ROS 2'],
    href: '/lbp-disaster-recognition/'
  },
  {
    name: '陆地天空双栖机器人建模',
    description:
      '四旋翼 + 四轮的 URDF / xacro 工程：分零件建模、集中定义尺寸参数、坐标系与关节树校验，并在 RViz2 中核对 TF。',
    tech: ['ROS 2', 'URDF', 'xacro'],
    href: '/land-air-robot-urdf/'
  },
  {
    name: 'ROS 2 Launch 工程化',
    description:
      '从单节点启动到完整仿真：参数声明、条件启动、事件处理器与多 launch 文件拆分，整理成日常可复用的写法。',
    tech: ['ROS 2', 'Python', 'Gazebo'],
    href: '/ros2-launch-file/'
  },
  {
    name: 'Gazebo 仿真环境清理',
    description:
      '定位残留 gzserver 占用端口、/clock 与 /tf 冲突的问题，给出确认方法与一键清场脚本。',
    tech: ['Gazebo', 'ROS 2', 'Shell'],
    href: '/gazebo-zombie-process/'
  }
]
