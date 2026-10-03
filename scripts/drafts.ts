/**
 * List all draft posts
 *
 * 用法：pnpm drafts
 *
 * 扫描 src/content/posts/ 下两种形式的草稿：
 *   - bundle 目录：`_文章名/index.md`
 *   - 旧式平铺：`_文章名.md`
 * 列出目录名/文件名、最后修改时间和 frontmatter 里的标题。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const postsDir = 'src/content/posts'

function extractTitle(content: string): string {
  const match = content.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)
  return match ? match[1] : '(未设置标题)'
}

function extractPubDate(content: string): string {
  const match = content.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?\s*$/m)
  return match ? match[1] : ''
}

function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function readFileTitle(file: string): { title: string; mtime: Date; pubDate: string } {
  const content = readFileSync(file, 'utf-8')
  return {
    title: extractTitle(content),
    pubDate: extractPubDate(content),
    mtime: statSync(file).mtime
  }
}

// 收集草稿
const drafts: { name: string; type: 'dir' | 'file'; title: string; pubDate: string; mtime: Date; publish: string }[] = []

for (const entry of readdirSync(postsDir)) {
  // bundle 目录形式：_xxx/index.md
  if (entry.startsWith('_') && !entry.includes('.')) {
    const indexFile = join(postsDir, entry, 'index.md')
    if (existsSync(indexFile)) {
      const info = readFileTitle(indexFile)
      const publishName = entry.replace(/^_/, '')
      drafts.push({
        name: `${entry}/`,
        type: 'dir',
        title: info.title,
        pubDate: info.pubDate,
        mtime: info.mtime,
        publish: publishName
      })
      continue
    }
  }
  // 旧式平铺：_xxx.md
  if (entry.startsWith('_') && entry.endsWith('.md')) {
    const info = readFileTitle(join(postsDir, entry))
    const publishName = entry.replace(/^_/, '').replace(/\.md$/, '')
    drafts.push({
      name: entry,
      type: 'file',
      title: info.title,
      pubDate: info.pubDate,
      mtime: info.mtime,
      publish: publishName
    })
  }
}

drafts.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

if (drafts.length === 0) {
  console.log('📭 暂无草稿')
  console.log('   创建草稿：pnpm new "_标题"  或  pnpm new')
  process.exit(0)
}

console.log(`📝 草稿列表（${drafts.length} 篇）\n`)
for (const f of drafts) {
  console.log(`  ${f.name}`)
  console.log(`    标题：${f.title}`)
  if (f.pubDate) console.log(`    发布日期：${f.pubDate}`)
  console.log(`    修改：${formatDate(f.mtime)}`)
  console.log(`    发布：pnpm release ${f.publish}\n`)
}