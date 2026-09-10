# 博客操作说明书

## 项目地址

- 本地：`c:\Users\bgq\Desktop\elac1.github.io`
- 线上：https://elac1.github.io/
- 仓库：https://github.com/elac1/elac1.github.io

## 三大栏目

| 栏目 | 网址 | 放什么 |
|------|------|--------|
| 首页（重要内容） | https://elac1.github.io/ | 标记了 `featured: true` 的文章，精选展示 |
| 窄门 | https://elac1.github.io/narrow/ | 机器人、ROS 2 等方向的实战研究、部署调参、效果分析 |
| 学习笔记 | https://elac1.github.io/notes/ | 工具用法、概念理解、踩坑总结 |

## 写新文章

### 方式 1：命令行（推荐）

```bash
# 交互式创建，会问你标题、标签、是否草稿
pnpm new

# 直接指定标题
pnpm new "文章标题"

# 创建草稿（文件名以 _ 开头，不会发布）
pnpm new "_草稿标题"
```

### 方式 2：手动创建

在 `src/content/posts/` 下新建 `.md` 文件，文件名英文 kebab-case（如 `ros2-slam-note.md`），开头写 frontmatter：

```markdown
---
title: '文章标题'
pubDate: '2026-09-10'
description: '一两句话说清楚这篇文章讲什么，会显示在卡片上'
tags:
  - ROS2
  - 导航
category: 垂直领域研究
featured: false          # true = 上首页；false = 只在栏目页
---

正文从这里开始...
```

### frontmatter 字段说明

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `title` | ✅ | 字符串 | 文章标题 |
| `pubDate` | ✅ | 日期 | 格式 `YYYY-MM-DD`，如 `2026-09-10` |
| `description` | ❌ | 字符串 | 卡片上显示的摘要；不填则自动从正文提取前 80 字 |
| `tags` | ❌ | 数组 | 标签，如 `["ROS2", "导航"]`，可点进标签页看同类文章 |
| `category` | ❌ | 字符串 | `垂直领域研究` 或 `学习笔记`，决定放哪个栏目 |
| `featured` | ❌ | 布尔 | `true` 上首页，`false` 只在栏目页。默认 `false` |
| `image` | ❌ | 字符串 | 封面图路径，用得少 |

### 草稿和正式文章

| 状态 | 文件名 | 是否发布 |
|------|--------|---------|
| 草稿 | `_my-draft.md`（开头下划线） | ❌ 不出现在列表 |
| 正式 | `my-draft.md` | ✅ 发布 |

**草稿转正**：

```bash
pnpm publish my-draft     # 自动去掉下划线 + 更新 pubDate 为今天
```

**查看所有草稿**：

```bash
pnpm drafts
```

## 上传到线上（3 步）

```bash
# 1. 本地预览，确认效果
pnpm dev

# 2. 提交并推送到 GitHub（首次需要配置 git）
git add .
git commit -m "简单描述这次改了什么"
git push origin main

# 3. 等约 1-2 分钟，GitHub 自动构建部署，刷新 https://elac1.github.io/ 就能看到
```

**只推送不提交**（已经 commit 过的情况）：

```bash
git push origin main
```

## 日常开发命令

```bash
pnpm dev          # 启动本地预览（http://localhost:4321/），改完自动刷新
pnpm build        # 完整构建检查（含类型检查、搜索索引生成）
pnpm new          # 新建文章
pnpm drafts       # 查看所有草稿
pnpm publish 名字  # 草稿转正

git add .
git commit -m "说明"
git push origin main   # 推送部署
```

## 给文章加首页推荐

在 frontmatter 里加 `featured: true`：

```markdown
---
title: 'Nav2 导航实战'
pubDate: '2026-09-02'
description: '从零搭建能自主导航的机器人'
tags:
  - ROS2
  - 导航
category: 垂直领域研究
featured: true          # ← 加这一行就会上首页
---
```

## 常见问题

**Q: 推完线上没变化？**
A: GitHub Actions 构建需要约 1 分钟。打开 https://github.com/elac1/elac1.github.io/actions 看最新 run 是不是绿色 ✓。如果红色 ✗，点进去看哪个步骤报错。

**Q: 本地预览正常，推送后线上样式变了？**
A: 先 `Ctrl + Shift + R` 硬刷新绕过缓存。还不行就等 2 分钟再刷。

**Q: 忘了加 category 或 tags？**
A: 直接在 md 文件 frontmatter 里补一行，然后 `git add . && git commit -m "补字段" && git push origin main`。

**Q: 想改文章内容？**
A: 直接编辑 md 文件，保存 → `git add . && git commit -m "修改说明" && git push origin main`。

**Q: 想删除一篇文章？**
A: 删 `src/content/posts/` 下对应的 md 文件，然后提交推送。

## 目录结构

```
elac1.github.io/
├── src/
│   ├── content/
│   │   ├── posts/           # 博客文章（.md）
│   │   └── about/about.md   # 首页"关于"区域
│   ├── pages/
│   │   ├── index.astro      # 首页（只显示 featured 文章）
│   │   ├── narrow/          # 窄门栏目
│   │   ├── notes/           # 学习笔记栏目
│   │   ├── archive.astro    # 归档页
│   │   ├── tags/            # 标签页
│   │   └── about.astro      # 关于页
│   └── components/          # UI 组件
├── scripts/                 # pnpm new/publish/drafts 脚本
└── package.json
```
