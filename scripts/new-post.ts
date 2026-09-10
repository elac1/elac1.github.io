/**
 * Create a new post with frontmatter
 *
 * 用法：
 *   pnpm new "标题"            # 非交互模式，直接用参数（tags 空）
 *   pnpm new                   # 交互模式，依次问 标题/tags/是否草稿
 *   pnpm new "_标题"           # 文件名以 _ 开头表示草稿
 *
 * 草稿不会出现在博客列表，发布时用 `pnpm publish <文件名>` 去掉下划线前缀。
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

  // 草稿：文件名加下划线前缀
  const isDraftFromName = rawTitle.startsWith('_')
  if (isDraftFromName) {
    isDraft = true
    rawTitle = rawTitle.slice(1)
  }

  // 生成文件名（kebab-case）
  const fileName: string = (isDraft ? '_' : '') + rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const targetFile: string = `${fileName}.md`
  const fullPath: string = join('src/content/posts', targetFile)

  if (existsSync(fullPath)) {
    console.error(`😇 文件已存在：${fullPath}`)
    process.exit(1)
  }

  mkdirSync(dirname(fullPath), { recursive: true })

  // 解析 tags
  const tags = tagsInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)

  // 生成 frontmatter
  const today = new Date().toISOString().split('T')[0]
  let content = `---\ntitle: ${rawTitle}\npubDate: '${today}'\n`
  if (tags.length > 0) {
    content += `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}\n`
  }
  content += `---\n\n`

  try {
    writeFileSync(fullPath, content)
    if (isDraft) {
      console.log(`📝 草稿已创建：${fullPath}`)
      console.log(`   发布时运行：pnpm publish ${fileName.replace(/^_/, '')}`)
    } else {
      console.log(`✅ 文章已创建：${fullPath}`)
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
