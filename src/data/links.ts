export interface FriendLink {
  name: string
  url: string
  desc?: string
  avatar?: string
}

// 友链数据：新增/修改/删除友链直接改这个数组即可
export const friendLinks: FriendLink[] = [
  {
    name: 'elac 的博客',
    url: 'https://elac1.github.io/',
    desc: '本站，一名 ROS 学习者的机器人学习笔记'
  }
  // 示例：
  // {
  //   name: '朋友的名字',
  //   url: 'https://example.com',
  //   desc: '一句话描述',
  //   avatar: 'https://example.com/avatar.png'
  // }
]
