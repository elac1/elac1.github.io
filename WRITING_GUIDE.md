# 博客写作完全指南

> 本指南适用于 `elac1.github.io` 博客项目，涵盖从创建文章到发布上线的完整流程。
> 
> - 线上博客：https://elac1.github.io/
> - 本地预览：http://localhost:4321/
> - 文章目录：`src/content/posts/`

---

## 一、快速开始（5 分钟发一篇文章）

```bash
# 1. 新建文章（会问你标题和标签）
pnpm new

# 2. 在编辑器里打开生成的 index.md，写内容

# 3. 本地预览，检查效果
pnpm dev

# 4. 确认没问题后，提交并推送
git add .
git commit -m "新增：我的第一篇文章"
git push origin main

# 等 1-2 分钟，GitHub Actions 自动构建部署，刷新网站即可看到
```

---

## 二、文章目录结构（新格式）

每篇文章都有自己的独立目录，方便管理图片和资源：

```
src/content/posts/
├── my-first-post/          ← 正式文章
│   ├── index.md            ← 文章内容
│   └── images/             ← 图片放这里
│       ├── cover.jpg
│       └── diagram.png
├── _draft-article/         ← 草稿（_ 开头，不会发布）
│   └── index.md
└── another-post/
    ├── index.md
    └── images/
        └── screenshot.png
```

**旧格式兼容**：平铺的 `.md` 文件（如 `old-post.md`）仍然可以正常显示，但建议新文章都用目录格式。

---

## 三、创建文章

### 方法 A：命令行交互（推荐）

```bash
pnpm new
```

脚本会依次问你：
1. **标题**：文章的中文标题
2. **标签**：用逗号分隔，如 `ROS2,导航,硬件`
3. **是否草稿**：输入 `y` 表示先存为草稿，稍后发布

### 方法 B：直接指定标题

```bash
pnpm new "控制板入门教程"
```

这会直接创建文章，标签为空，不是草稿。

### 方法 C：手动创建

在 `src/content/posts/` 下新建目录，例如 `my-post/`，然后在里面创建 `index.md`：

```markdown
---
title: '文章标题'
pubDate: '2026-10-03'
description: '一两句话摘要，显示在卡片上'
tags:
  - 标签1
  - 标签2
category: 学习笔记
featured: false
---

正文从这里开始...
```

---

## 四、Frontmatter 字段说明

文章开头的 `---` 之间的部分是 frontmatter，必须填写以下字段：

| 字段 | 必填 | 类型 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | ✅ | 字符串 | 文章标题 | `'控制板入门'` |
| `pubDate` | ✅ | 日期 | 发布日期，格式 `YYYY-MM-DD` | `'2026-10-03'` |
| `description` | 建议填 | 字符串 | 摘要，显示在卡片和搜索结果；不填则自动截取正文前 80 字 | `'硬件入门第一篇……'` |
| `tags` | 可选 | 数组 | 标签列表 | `- ROS2`<br>`- 导航` |
| `category` | 二选一 | 字符串 | 决定文章进哪个栏目（见下表） | `学习笔记` |
| `featured` | 可选 | 布尔 | `true` 上首页精选；默认 `false` | `false` |
| `image` | 可选 | 字符串 | 封面图路径，一般用不到 | `/images/cover.png` |

### Category 栏目对照

| 填什么 | 出现在哪个栏目 | 适合放什么 |
|--------|---------------|-----------|
| `垂直领域研究` | https://elac1.github.io/narrow/ （窄门） | 机器人、ROS 2 实战研究、部署调参、效果分析 |
| `学习笔记` | https://elac1.github.io/notes/ （学习笔记） | 工具用法、概念理解、踩坑总结 |
| 不填 | 只进归档页和标签页 | 不想归入栏目时 |

### 让文章上首页

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

---

## 五、正文 Markdown 语法

> - 大标题（H1）由 frontmatter 的 `title` 自动渲染，**正文从 `##`（二级标题）开始写**。
> - 右侧目录**只收录二级和三级标题**（`##`、`###`）。
> - 不要在正文里再写一个一级标题，也不要写一个和 title 一模一样的二级标题（否则标题会显示两遍）。

### 1. 标题与文字

```markdown
## 二级标题（进右侧目录）

### 三级标题（进右侧目录）

#### 四级标题（不进右侧目录）

普通文字直接写。**加粗**，*斜体*，~~删除线~~，`行内代码`。

> 这是引用块，适合放要点总结。
> 可以换行接着写。

---   （三个减号是分割线）
```

### 2. 列表

```markdown
- 无序列表项
- 无序列表项
  - 缩进两空格表示子项

1. 有序列表第一项
2. 有序列表第二项

- [x] 已完成的任务项
- [ ] 未完成的任务项
```

### 3. 代码块

````markdown
```cpp
if (按钮按下) {
  灯亮;
}
```

```bash
git status
```
````

- 开头三个反引号后写**语言名**（`cpp`、`bash`、`python`、`ts`、`json`、`yaml` 等），会有语法高亮。
- 代码块右上角的"复制"按钮是自动加的，不用管。
- 不写语言名也能显示，但没有高亮。

### 4. 表格

```markdown
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容 | 内容 | 内容 |
```

### 5. 链接

```markdown
[显示的文字](https://example.com)          # 外部链接（新窗口打开）
[上一篇文章](/git-knowledge/)                # 站内文章链接，填 /文件名/
```

### 6. 图片（重点！）

**做法：**

1. 把图片放到文章目录下的 `images/` 文件夹，例如：
   ```
   src/content/posts/my-post/images/board.jpg
   ```
2. 在正文里用相对路径引用：

```markdown
![控制板实物图](./images/board.jpg)
```

或者用绝对路径（以 `/` 开头）：

```markdown
![控制板实物图](/images/my-post/board.jpg)
```

**图注规则：**

- 中括号里的 alt 文字会自动变成图片**下方的图注**。
- 不想显示图注：把 alt 留空，或在 alt 里包含下划线 `_`：

```markdown
![](路径)            # 无图注
![接线示意图_a](路径)  # alt 含下划线 _，也不显示图注
```

- 图片可以点击放大查看，这是自动的。

### 7. 数学公式（KaTeX）

```markdown
行内公式：$E = mc^2$

独占一行的公式：

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

### 8. 嵌入卡片和视频

每种指令**单独占一行**，照着抄、只换括号里的内容：

```markdown
::link{url="https://example.com/某篇文章"}

::github{repo="owner/仓库名"}

::youtube{id="视频的11位ID"}
::youtube{url="https://www.youtube.com/watch?v=视频ID"}

::bilibili{id="BV1xxxxxxxxxx"}
::bilibili{url="https://www.bilibili.com/video/BV1xxxxxxxxxx"}

::x{url="https://x.com/用户名/status/推文ID"}

::spotify{url="https://open.spotify.com/track/曲目ID"}

::neodb{url="https://neodb.social/movie/条目ID"}
```

| 指令 | 效果 |
|------|------|
| `::link` | 普通网页的链接卡片（自动抓标题/描述/图） |
| `::github` | GitHub 仓库卡片（stars、forks 等） |
| `::youtube` / `::bilibili` | 嵌入视频播放器 |
| `::x` | 嵌入 X（推特）推文 |
| `::spotify` | 嵌入 Spotify 音乐/播客 |
| `::neodb` | 嵌入 NeoDB 书影音卡片 |

### 9. 页内跳转（系列文章目录用得到）

```markdown
[跳到某一节](#标题转成的锚点)
```

锚点由本博客的目录插件自动生成，**只有 `##` 和 `###` 标题能跳转**，规则按顺序为：

1. 英文字母转小写（`IMU` → `imu`）
2. 只保留中文、英文、数字、空格、连字符；冒号、逗号、问号、加号等符号**直接删掉**
3. 连续空格合并成**一个**连字符
4. 多个连续连字符合并成一个，去掉首尾连字符
5. 标题重名时第二个起自动加后缀 `-1`、`-2`

例 1：标题 `### 舵机：它能精准转到指定角度，靠的是什么？`
→ `#舵机能精准转到指定角度靠的是什么`

例 2：标题 `## 舵机 + 控制板 + IMU，能做什么`
加号和逗号被删除，` + ` 留下的两个空格合并为一个连字符：
→ `#舵机-控制板-imu-能做什么`（是**单连字符**，不是 `--`）

> 拿不准时：先 `pnpm dev` 打开文章，把右侧目录里标题的链接复制出来用，最保险。

### 10. 脚注（不常用）

```markdown
正文里这样标[^1]。

[^1]: 在文章底部写脚注内容。
```

---

## 六、草稿管理

### 创建草稿

```bash
pnpm new "_草稿标题"     # 目录名前加 _，不会出现在线上
```

或交互式创建时选择 `y`。

### 查看所有草稿

```bash
pnpm drafts
```

输出类似：
```
📝 草稿列表（2 篇）

  _hardware-basics/
    标题：控制板、舵机、IMU：一次搞懂
    发布日期：2026-09-19
    修改：2026-09-19 10:30
    发布：pnpm release hardware-basics

  _ros2-nav2/
    标题：Nav2 导航配置
    发布日期：2026-09-18
    修改：2026-09-18 15:20
    发布：pnpm release ros2-nav2
```

### 草稿转正（发布）

```bash
pnpm release 名字      # 去掉目录名的 _ 前缀 + 更新 pubDate 为今天
```

例如：
```bash
pnpm release hardware-basics
```

这会把 `_hardware-basics/` 改名为 `hardware-basics/`，并把 `index.md` 里的 `pubDate` 更新为今天的日期。

---

## 七、本地预览

```bash
pnpm dev
```

启动后保持窗口开着，浏览器打开 http://localhost:4321/，改文件自动刷新。

**检查清单：**
- [ ] 标题显示正确
- [ ] 右侧目录链接能跳转
- [ ] 图片能正常显示
- [ ] 代码块有高亮
- [ ] 链接能点击

---

## 八、发布上线（3 步）

```bash
# 1. 本地预览，确认效果
pnpm dev

# 2. 提交并推送到 GitHub
git add .
git commit -m "新增：控制板入门教程"
git push origin main

# 3. 等约 1-2 分钟，GitHub 自动构建部署
#    刷新 https://elac1.github.io/ 就能看到
```

**只推送不提交**（已经 commit 过的情况）：
```bash
git push origin main
```

**查看构建状态：**
打开 https://github.com/elac1/elac1.github.io/actions
- 绿色 ✓ = 上线成功
- 红色 ✗ = 构建失败，点进去看报错

---

## 九、常见问题

### Q: 推完线上没变化？
A: GitHub Actions 构建需要约 1 分钟。去 https://github.com/elac1/elac1.github.io/actions 看最新 run 是不是绿色 ✓。如果红色 ✗，点进去看哪个步骤报错。

### Q: 本地预览正常，推送后线上样式变了？
A: 先 `Ctrl + Shift + R` 硬刷新绕过缓存。还不行就等 2 分钟再刷。

### Q: 忘了加 category 或 tags？
A: 直接在 `index.md` 的 frontmatter 里补一行，然后 `git add . && git commit -m "补字段" && git push origin main`。

### Q: 想改文章内容？
A: 直接编辑 `index.md`，保存 → `git add . && git commit -m "修改说明" && git push origin main`。

### Q: 想删除一篇文章？
A: 删掉 `src/content/posts/` 下对应的目录，然后提交推送。
```bash
rm -rf src/content/posts/old-post/
git add .
git commit -m "删除：旧文章"
git push origin main
```

### Q: 图片太大，加载慢？
A: 博客会自动优化图片（转为 WebP 格式并压缩），你只需要保证原图不要过大（建议宽度不超过 1200px）。

### Q: 想给文章换个分类？
A: 修改 `index.md` 里的 `category` 字段，然后提交推送。

### Q: 想让文章上首页？
A: 在 frontmatter 里加 `featured: true`，然后提交推送。

---

## 十、常用命令速查

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 本地预览（http://localhost:4321/） |
| `pnpm build` | 完整构建检查（推送前自查） |
| `pnpm new` | 新建文章 |
| `pnpm new "标题"` | 直接创建文章 |
| `pnpm drafts` | 查看所有草稿 |
| `pnpm release 名字` | 草稿转正（去下划线 + 日期改今天） |
| `git add . && git commit -m "说明" && git push origin main` | 提交并上线 |

---

## 十一、目录结构总览

```
elac1.github.io/
├── src/
│   ├── content/
│   │   ├── posts/           # 博客文章（每个文章一个目录）
│   │   │   ├── my-post/
│   │   │   │   ├── index.md
│   │   │   │   └── images/
│   │   │   └── _draft/
│   │   │       └── index.md
│   │   └── about/about.md   # 首页"关于"区域
│   ├── pages/
│   │   ├── index.astro      # 首页（只显示 featured 文章）
│   │   ├── narrow/          # 窄门栏目
│   │   ├── notes/           # 学习笔记栏目
│   │   ├── archive.astro    # 归档页
│   │   ├── tags/            # 标签页
│   │   └── about.astro      # 关于页
│   └── components/          # UI 组件
├── scripts/                 # pnpm new/release/drafts 脚本
├── package.json
├── WRITING_GUIDE.md         # 本文档
└── POST_TEMPLATE.md         # 文章模板（备用参考）
```

---

## 十二、最佳实践

1. **标题要清晰**：让读者一眼就知道文章讲什么
2. **摘要要精炼**：`description` 用一两句话概括核心内容
3. **标签要准确**：方便读者通过标签找到相关文章
4. **图片要压缩**：虽然博客会自动优化，但原图太大仍会影响上传速度
5. **代码要标注语言**：方便语法高亮
6. **定期备份**：重要文章可以在本地另存一份

---

祝你写作愉快！🎉
