/**
 * Publish a draft post
 *
 * 用法：
 *   pnpm publish my-post         # 把 _my-post.md 重命名为 my-post.md
 *   pnpm publish my-post.md      # 可带可不带 .md 后缀
 *   pnpm publish _my-post        # 也接受带下划线前缀的输入
 *
 * 行为：
 *   1. 去掉文件名的 `_` 前缀
 *   2. 把 frontmatter 的 pubDate 更新为今天
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const postsDir = 'src/content/posts'

const rawArg = process.argv.slice(2)[0]
if (!rawArg) {
  console.error('⚠️ 用法：pnpm publish <文件名>')
  console.error('   例：pnpm publish my-post')
  process.exit(1)
}

// 解析文件名（去掉 .md 后缀、去掉前导下划线）
const stripped = rawArg.replace(/\.md$/i, '').replace(/^_/, '')
const draftName = `_${stripped}.md`
const finalName = `${stripped}.md`
const draftPath = join(postsDir, draftName)
const finalPath = join(postsDir, finalName)

if (!existsSync(draftPath)) {
  console.error(`😇 草稿不存在：${draftPath}`)
  if (existsSync(finalPath)) {
    console.error(`   但已存在正式文章：${finalPath}（可能已经发布过了）`)
  }
  process.exit(1)
}

if (existsSync(finalPath)) {
  console.error(`⚠️ 目标文件已存在：${finalPath}`)
  console.error('   请先删除草稿或重命名再发布。')
  process.exit(1)
}

// 读草稿内容
const content = readFileSync(draftPath, 'utf-8')

// 更新 pubDate 为今天
const today = new Date().toISOString().split('T')[0]
let updated = content

// 匹配 pubDate: 'YYYY-MM-DD' 或 pubDate: YYYY-MM-DD
const pubDateMatch = updated.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?$/m)
if (pubDateMatch) {
  updated = updated.replace(/^pubDate:.*$/m, `pubDate: '${today}'`)
  console.log(`📅 发布日期：${pubDateMatch[1]} → ${today}`)
} else {
  console.log('ℹ️ 未找到 pubDate 字段，跳过日期更新')
}

// 写入新文件并删旧草稿
writeFileSync(finalPath, updated, 'utf-8')
unlinkSync(draftPath)

console.log(`✅ 已发布：${finalPath}`)
console.log(`   已删除草稿：${draftPath}`)
