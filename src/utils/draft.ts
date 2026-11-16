import { getCollection, type CollectionEntry } from 'astro:content'
import { isDraftPost } from './post'

/**
 * 文章列表：排除草稿与项目详情。
 */
export async function getFilteredPosts() {
  const posts = await getCollection('posts')
  return posts.filter((post: CollectionEntry<'posts'>) => !isDraftPost(post) && post.data.kind === 'article')
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

/** 首页文章流：全部已发布文章，按时间倒序 */
export async function getPostStream() {
  return await getSortedFilteredPosts()
}
