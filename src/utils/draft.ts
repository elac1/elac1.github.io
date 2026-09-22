import { getCollection, type CollectionEntry } from 'astro:content'

/**
 * Get all posts, filtering out posts whose filenames start with _
 */
export async function getFilteredPosts() {
  const posts = await getCollection('posts')
  return posts.filter((post: CollectionEntry<'posts'>) => !post.id.startsWith('_'))
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

/** 文章流每页篇数（双列布局，6 = 3 行） */
export const POST_PAGE_SIZE = 6

/** 「最新文章」只收录近 N 天发布的文章 */
export const STREAM_WINDOW_DAYS = 7

/**
 * 将文章拆为「置顶」与「常规文章流」。
 * 置顶文章只在首页顶部展示，不进入分页流，避免重复。
 * 文章流只保留近 STREAM_WINDOW_DAYS 天内的文章（更早的文章仍可在归档/栏目/标签页找到）。
 */
export async function getFeaturedAndStream() {
  const posts = await getSortedFilteredPosts()
  const cutoff = Date.now() - STREAM_WINDOW_DAYS * 24 * 60 * 60 * 1000
  return {
    featured: posts.filter((p: CollectionEntry<'posts'>) => p.data.featured),
    stream: posts.filter((p: CollectionEntry<'posts'>) => p.data.pubDate.valueOf() >= cutoff)
  }
}
