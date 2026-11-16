export type Project = {
  name: string
  description: string
  tech: string[]
  href: string
  cover?: string
}

// 项目页数据：直接修改这里即可增删项目
export const projects: Project[] = [
  {
    name: 'ROS 2 城市巡检机器人',
    description: '独立实现地面自主巡航、灾情图像识别、穿窗飞行、空中灯光提示与返航降落的连续仿真任务。',
    tech: ['ROS 2', 'Gazebo', 'OpenCV', 'Python'],
    href: '/ican-emergency-inspection/',
    cover: '/images/covers/ican-emergency-inspection.webp'
  }
]
