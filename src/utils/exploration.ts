import type { CollectionEntry } from 'astro:content'

export type ExplorationTopic = 'ros' | 'vision' | 'simulation'

export function getExplorationTopics(post: CollectionEntry<'posts'>): ExplorationTopic[] {
  const text = [post.data.title, ...post.data.tags].join(' ').toLowerCase().replace(/\s/g, '')
  const topics: ExplorationTopic[] = []
  if (/ros|机器人|urdf/.test(text)) topics.push('ros')
  if (/opencv|lbp|pca|lda|视觉|图像|人脸/.test(text)) topics.push('vision')
  if (/gazebo|仿真|urdf|xacro/.test(text)) topics.push('simulation')
  return topics
}

export function getPrimaryTopic(topics: ExplorationTopic[]): ExplorationTopic | 'other' {
  return topics.includes('vision')
    ? 'vision'
    : topics.includes('simulation')
      ? 'simulation'
      : topics.includes('ros')
        ? 'ros'
        : 'other'
}
