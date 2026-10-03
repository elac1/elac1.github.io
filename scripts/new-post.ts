/**
 * Create a new post with frontmatter
 *
 * 用法：
 *   pnpm new "标题"            # 非交互模式，直接用参数（tags 空）
 *   pnpm new                   # 交互模式，依次问 标题/tags/是否草稿
 *   pnpm new "_标题"           # 文件名以 _ 开头表示草稿
 *
 * 每篇文章存在自己的目录（post bundle），图片可放在文章目录下，方便管理：
 *   src/content/posts/我的文章/
 *   └── index.md
 *       images/
 *   src/content/posts/_草稿/         # 草稿目录以 _ 开头
 *   └── index.md
 *
 * 草稿不会出现在博客列表，发布时用 `pnpm release <目录名>` 去掉下划线前缀。
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const rl = readline.createInterface({ input: stdin, output: stdout })

async function main() {
  const argvArgs: string[] = process.argv.slice(2)
  const hasArgvTitle = argvArgs.length > 0

  let rawTitle: string
  let tagsInput = ''
  let isDraft = false

  if (hasArgvTitle) {
    // 兼容老用法：命令行带参数时跳过交互
    rawTitle = argvArgs.join(' ')
    console.log(`✅ 直接创建：${rawTitle}`)
  } else {
    // 交互模式
    console.log('📝 新建文章\n')

    rawTitle = (await rl.question('标题：')).trim()
    if (!rawTitle) {
      console.error('⚠️ 标题不能为空')
      rl.close()
      process.exit(1)
    }

    tagsInput = (await rl.question('标签（逗号分隔，可空）：')).trim()

    const draftInput = (await rl.question('作为草稿？(y/N)：')).trim().toLowerCase()
    isDraft = draftInput === 'y' || draftInput === 'yes'
    rl.close()
  }

  // 草稿：目录名加下划线前缀
  const isDraftFromName = rawTitle.startsWith('_')
  if (isDraftFromName) {
    isDraft = true
    rawTitle = rawTitle.slice(1)
  }

  // 生成目录名（kebab-case）
  let dirName: string = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!dirName) dirName = `post-${Date.now()}`
  const dirFull = (isDraft ? '_' : '') + dirName
  const targetFile: string = join('src/content/posts', dirFull, 'index.md')

  if (existsSync(targetFile)) {
    console.error(`😇 文件已存在：${targetFile}`)
    process.exit(1)
  }

  mkdirSync(dirname(targetFile), { recursive: true })

  // 解析 tags
  const tags = tagsInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)

  // 生成 frontmatter
  const today = new Date().toISOString().split('T')[0]
  const safeTitle = rawTitle.replace(/'/g, "\\'")
  let content = `---\ntitle: '${safeTitle}'\npubDate: '${today}'\n`
  if (tags.length > 0) {
    content += `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}\n`
  }
  content += `---\n\n`

  try {
    writeFileSync(targetFile, content)
    const postDir = join('src/content/posts', dirFull)
    if (isDraft) {
      console.log(`📝 草稿已创建：${postDir}/`)
      console.log(`   图片可放在：${postDir}/images/`)
      console.log(`   发布时运行：pnpm release ${dirName}`)
    } else {
      console.log(`✅ 文章已创建：${postDir}/`)
      console.log(`   图片可放在：${postDir}/images/`)
    }
  } catch (error) {
    console.error('⚠️ 创建失败：', error)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  rl.close()
  process.exit(1)
})