/**
 * List all draft posts
 *
 * 用法：pnpm drafts
 *
 * 扫描 src/content/posts/ 下文件名以 `_` 开头的 .md 文件，
 * 列出文件名、最后修改时间和 frontmatter 里的标题。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const postsDir = 'src/content/posts'

function extractTitle(content: string): string {
  const match = content.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)
  return match ? match[1] : '(未设置标题)'
}

function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const files = readdirSync(postsDir)
  .filter((f) => f.startsWith('_') && f.endsWith('.md'))
  .map((f) => {
    const fullPath = join(postsDir, f)
    const stat = statSync(fullPath)
    const content = readFileSync(fullPath, 'utf-8')
    return {
      name: f,
      title: extractTitle(content),
      mtime: stat.mtime
    }
  })
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

if (files.length === 0) {
  console.log('📭 暂无草稿')
  console.log('   创建草稿：pnpm new "_标题"  或  pnpm new')
  process.exit(0)
}

console.log(`📝 草稿列表（${files.length} 篇）\n`)
for (const f of files) {
  console.log(`  ${f.name}`)
  console.log(`    标题：${f.title}`)
  console.log(`    修改：${formatDate(f.mtime)}`)
  const publishName = f.name.replace(/^_/, '').replace(/\.md$/, '')
  console.log(`    发布：pnpm publish ${publishName}\n`)
}
