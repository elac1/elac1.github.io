/**
 * Publish a draft post
 *
 * 用法：
 *   pnpm release my-post         # 把 _my-post/ 目录改为 my-post/ 并更新日期
 *   pnpm release my-post.md      # 兼容旧用法，可带 .md 后缀
 *   pnpm release _my-post        # 也接受带下划线前缀的输入
 *
 * 行为：
 *   1. 把草稿目录（`_` 前缀）改名为正式目录
 *   2. 把 index.md 的 pubDate 更新为今天
 *   3. 草稿目录里的图片等其他文件会一并保留
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { renameSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const postsDir = 'src/content/posts'

const rawArg = process.argv.slice(2)[0]
if (!rawArg) {
  console.error('⚠️ 用法：pnpm release <目录名>')
  console.error('   例：pnpm release my-post')
  process.exit(1)
}

// 解析目录名（去掉 .md 后缀、去掉前导下划线）
const stripped = rawArg.replace(/\/?index\.md$/i, '').replace(/\.md$/i, '').replace(/^_/, '')
const draftDir = join(postsDir, `_${stripped}`)
const finalDir = join(postsDir, stripped)
const draftPath = join(draftDir, 'index.md')
const finalPath = join(finalDir, 'index.md')

// 同时兼容旧的平铺格式：_my-post.md -> my-post.md
const oldDraftFile = join(postsDir, `_${stripped}.md`)
const oldFinalFile = join(postsDir, `${stripped}.md`)

const useNewFormat = existsSync(draftPath)
const useOldFormat = existsSync(oldDraftFile)

if (!useNewFormat && !useOldFormat) {
  console.error(`😇 草稿不存在：${draftPath}`)
  console.error(`                      ${oldDraftFile}`)
  if (existsSync(finalPath) || existsSync(oldFinalFile)) {
    console.error(`   但已存在正式文章，可能已经发布过了。`)
  }
  process.exit(1)
}

if (useNewFormat && (existsSync(finalPath) || existsSync(join(postsDir, stripped)))) {
  console.error(`⚠️ 目标目录已存在：${finalDir}`)
  console.error('   请先删除旧目录或重命名再发布。')
  process.exit(1)
}
if (useOldFormat && existsSync(oldFinalFile)) {
  console.error(`⚠️ 目标文件已存在：${oldFinalFile}`)
  process.exit(1)
}

// ---------- 处理旧式平铺格式：转为 bundle 目录 ----------
if (!useNewFormat && useOldFormat) {
  const contentDir = join(postsDir, stripped)
  const newIndex = join(contentDir, 'index.md')
  const renamed = renameFile(oldDraftFile, newIndex)
  if (!renamed) process.exit(1)
  // 更新日期
  const today = new Date().toISOString().split('T')[0]
  updatePubDate(newIndex, today)
  console.log(`✅ 已发布（旧格式已转为新 bundle 格式）：${contentDir}/`)
  console.log(`   已删除草稿：${oldDraftFile}`)
  process.exit(0)
}

// ---------- 新式 bundle 格式 ----------
// 更新 pubDate 为今天
const content = readFileSync(draftPath, 'utf-8')
const today = new Date().toISOString().split('T')[0]
let updated = content

const pubDateMatch = updated.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?$/m)
if (pubDateMatch) {
  updated = updated.replace(/^pubDate:.*$/m, `pubDate: '${today}'`)
  console.log(`📅 发布日期：${pubDateMatch[1]} → ${today}`)
} else {
  console.log('ℹ️ 未找到 pubDate 字段，跳过日期更新')
}

// 写入新 index.md 并整体重命名目录
writeFileSync(draftPath, updated, 'utf-8')
try {
  renameSync(draftDir, finalDir)
} catch (err) {
  console.error('⚠️ 重命名目录失败：', err)
  process.exit(1)
}

console.log(`✅ 已发布：${finalDir}/`)
console.log(`   已删除草稿目录：${draftDir}/`)

function renameFile(from: string, to: string): boolean {
  try {
    renameSync(from, to)
    return true
  } catch (err) {
    console.error('⚠️ 重命名失败：', err)
    return false
  }
}

function updatePubDate(file: string, date: string) {
  const c = readFileSync(file, 'utf-8')
  if (c.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?$/m)) {
    writeFileSync(file, c.replace(/^pubDate:.*$/m, `pubDate: '${date}'`), 'utf-8')
  }
}