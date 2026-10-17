import { getCollection, type CollectionEntry } from 'astro:content'
import { isDraftPost } from './post'

/**
 * Get all posts, filtering out posts whose filenames start with _
 */
export async function getFilteredPosts() {
  const posts = await getCollection('posts')
  return posts.filter((post: CollectionEntry<'posts'>) => !isDraftPost(post))
}

/**
 * Get all posts sorted by publication date, filtering out posts whose filenames start with _
 */
export async function getSortedFilteredPosts() {
  const posts = await getFilteredPosts()
  return posts.sort(
    (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

/** 首页文章流每页篇数 */
export const POST_PAGE_SIZE = 6

/** 首页文章流：全部已发布文章，按时间倒序 */
export async function getPostStream() {
  return await getSortedFilteredPosts()
}

/** 按「YYYY 年 M 月」分组，保持传入顺序 */
export function groupByMonth<T extends { data: { pubDate: Date } }>(posts: T[]) {
  const groups: { label: string; posts: T[] }[] = []
  let current: { label: string; posts: T[] } | null = null
  for (const post of posts) {
    const d = post.data.pubDate
    const label = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`
    if (!current || current.label !== label) {
      current = { label, posts: [] }
      groups.push(current)
    }
    current.posts.push(post)
  }
  return groups
}
