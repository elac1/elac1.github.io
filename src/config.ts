import type { ThemeConfig } from './types'

export const themeConfig: ThemeConfig = {
  // SITE INFO ///////////////////////////////////////////////////////////////////////////////////////////
  site: {
    website: 'https://elac1.github.io/',
    title: 'elac 的博客',
    author: 'elac',
    description: '记录 ROS 2、机器人仿真与机器视觉实践，也分享 Python 和算法学习笔记。',
    language: 'zh-CN',
    tagline: '间接性踌躇满志，持续性记录生活。',
    github: 'https://github.com/elac1',
    leetcode: 'https://leetcode.cn/'
  },

  // GENERAL SETTINGS ////////////////////////////////////////////////////////////////////////////////////
  general: {
    contentWidth: '56rem', // 与 --layout-max 保持一致：Header / 列表页 / 文章容器
    centeredLayout: true,
    themeToggle: true,
    postListDottedDivider: false,
    footer: true,
    fadeAnimation: true
  },

  // DATE SETTINGS ///////////////////////////////////////////////////////////////////////////////////////
  date: {
    dateFormat: 'YYYY-MM-DD',
    dateSeparator: '.',
    dateOnRight: true
  },

  // POST SETTINGS ///////////////////////////////////////////////////////////////////////////////////////
  post: {
    readingTime: false,
    toc: true,
    imageViewer: true,
    copyCode: true,
    linkCard: true,
    katex: true
  },

  // FOOTER EXTRAS ///////////////////////////////////////////////////////////////////////////////////////
  techStack: ['ROS 2', 'Python', 'OpenCV', 'Gazebo', 'Docker'],
  friendLinks: [
    { name: 'GitHub', href: 'https://github.com/elac1' }
  ]
}
