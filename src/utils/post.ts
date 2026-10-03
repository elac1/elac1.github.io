import type { CollectionEntry } from 'astro:content'

/**
 * 从 content collection 的 post.id 中提取干净的 URL slug。
 * 支持两种格式：
 *   - 传统平铺：'my-post.md' -> 'my-post'
 *   - bundle 格式：'my-post/index.md' -> 'my-post'
 */
export function getPostSlug(post: CollectionEntry<'posts'>): string {
  return post.id.replace(/\/index\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, '')
}

/**
 * 判断一篇文章是否为草稿（bundle 或平铺的 _ 前缀）
 */
export function isDraftPost(post: CollectionEntry<'posts'>): boolean {
  return post.id.startsWith('_')
}

/**
 * 从文章 id 中提取目录路径（不含文件名），用于 bundle 格式。
 * 例如 'my-post/index.md' -> 'my-post'
 */
export function getPostDir(post: CollectionEntry<'posts'>): string {
  const parts = post.id.split('/')
  if (parts.length > 1) {
    return parts.slice(0, -1).join('/')
  }
  return post.id.replace(/\.(md|mdx)$/, '')
}
