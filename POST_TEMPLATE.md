# 写文章操作模板（复制即用）

> 这是一份"照着做就能发文章"的模板。每次写新文章时打开本文件，按顺序操作即可。
> 配套的背景说明见 [BLOG_GUIDE.md](./BLOG_GUIDE.md)。

- 线上博客：https://elac1.github.io/
- 文章存放目录：`src/content/posts/`
- 文章网址规则：文件名 `xxx.md` → 网址 `https://elac1.github.io/xxx/`

---

## 一、全流程速览（共 5 步）

```text
1. 新建 md 文件（pnpm new，或手动建）
2. 填写开头的 frontmatter（标题、日期、摘要、标签、栏目）
3. 写正文（Markdown，语法模板见第三节）
4. 本地预览：pnpm dev，打开 http://localhost:4321/ 检查
5. 发布：git add → commit → push，等 1~2 分钟自动上线
```

---

## 二、新建文章

### 方法 A：命令行（推荐）

```bash
pnpm new                      # 交互式：依次问 标题 / 标签 / 是否草稿
pnpm new "文章标题"            # 直接创建（注意：文件名只接受英文，中文标题请用方法 B）
pnpm new "_草稿标题"           # 创建草稿（文件名以 _ 开头，不会发布）
```

> 注意：脚本会把标题转成英文 kebab-case 文件名，中文会被过滤掉。中文标题建议用方法 B。

### 方法 B：手动创建（写中文文章推荐）

1. 在 `src/content/posts/` 下新建文件，文件名用**英文小写 + 连字符**，例如：
   `hardware-basics.md`、`ros2-nav2-debug.md`
2. 文件名开头加 `_` 表示草稿，不会出现在线上，例如：`_hardware-basics.md`

### frontmatter 模板（复制到文章最顶部，含 `---` 两行）

```markdown
---
title: '文章标题'
pubDate: '2026-09-19'
description: '一句话说明这篇文章讲什么，会显示在文章卡片和搜索结果里'
tags:
  - 标签1
  - 标签2
category: 学习笔记
featured: false
---
```

### frontmatter 字段逐项说明

| 字段 | 必填 | 填什么 | 示例 |
|------|------|--------|------|
| `title` | ✅ 必填 | 文章标题，中文可以，建议用单引号包起来 | `'控制板、舵机、IMU：一次搞懂'` |
| `pubDate` | ✅ 必填 | 发布日期，格式 `YYYY-MM-DD` | `'2026-09-19'` |
| `description` | 建议填 | 一两句话摘要，显示在卡片上；不填会自动截取正文纯文本前 80 字（末尾加 `…`） | `'硬件入门第一篇……'` |
| `tags` | 可选 | 标签列表，每个一行、前面加 `-` | `- 硬件` |
| `category` | 二选一 | **只能填这两个词之一**（见下表），决定文章进哪个栏目 | `学习笔记` |
| `featured` | 可选 | `true` 上首页精选；`false` 不上首页。默认 `false` | `false` |
| `image` | 可选 | 封面图路径，一般用不到 | `/images/cover.png` |

**category 栏目对照（必须一字不差）：**

| 填什么 | 出现在哪个栏目 | 适合放什么 |
|--------|---------------|-----------|
| `垂直领域研究` | https://elac1.github.io/narrow/ （窄门） | 机器人、ROS 2 等实战研究、部署调参、效果分析 |
| `学习笔记` | https://elac1.github.io/notes/ （学习笔记） | 工具用法、概念理解、踩坑总结 |
| 不填 | 只进归档页 https://elac1.github.io/archive 和标签页 | 不想归入栏目时 |

### 草稿相关命令

```bash
pnpm drafts                 # 查看现在有哪些草稿
pnpm publish hardware-basics # 草稿转正：自动把 _hardware-basics.md 改名并把日期更新为今天
```

---

## 三、正文 Markdown 语法模板（本博客支持的全部常用写法）

> - 大标题（H1）由 frontmatter 的 `title` 自动渲染，**正文从 `##`（二级标题）开始写**，
>   不要在正文里再写一个一级标题，也不要写一个和 title 一模一样的二级标题（否则标题会显示两遍）。
> - 右侧目录**只收录二级和三级标题**（`##`、`###`），四级及以下不进目录。
> - 阅读时长功能目前在配置里是关闭的，文章页不显示，不用管。

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

### 6. 图片

**做法（简单可靠）：**

1. 把图片放到 `public/` 目录下，建议按文章建子文件夹，例如：
   `public/images/hardware-basics/board.jpg`
2. 在正文里用绝对路径引用：

```markdown
![控制板实物图，接上了按钮和 LED](/images/hardware-basics/board.jpg)
```

**图注规则（本博客特有，注意）：**

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

### 8. 嵌入卡片和视频（本博客特有指令）

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

## 四、发布前检查清单

- [ ] 文件在 `src/content/posts/` 下，文件名是英文 kebab-case
- [ ] **不该发布的文章文件名以 `_` 开头**（草稿）
- [ ] 文件最顶部有完整的 frontmatter，`title` 和 `pubDate` 都填了
- [ ] `category` 是 `垂直领域研究` 或 `学习笔记`（或故意不填）
- [ ] 想上首页就加 `featured: true`
- [ ] 正文第一个标题用的是 `##`，没有自己写一级标题
- [ ] 代码块都标了语言名
- [ ] 图片路径能打开、alt 图注符合预期
- [ ] `pnpm dev` 本地打开 http://localhost:4321/ 肉眼检查过

### 本地预览

```bash
pnpm dev        # 启动后保持窗口开着，浏览器开 http://localhost:4321/，改文件自动刷新
```

### 提交并上线

```bash
git add .
git commit -m "新增：硬件入门系列第一篇"
git push origin main
```

推送后约 1~2 分钟自动构建部署。去这里看构建状态：
https://github.com/elac1/elac1.github.io/actions

- 绿色 ✓ = 上线成功，刷新 https://elac1.github.io/ 查看（没变化就 `Ctrl + Shift + R` 硬刷新）
- 红色 ✗ = 构建失败，点进去看报错，最常见原因是 **frontmatter 缺字段或格式错误**

### 推送前想先在本地完整验证（可选）

```bash
pnpm build      # 完整构建 + 类型检查，和线上构建流程一致，过了再 push 基本不会红
```

---

## 五、写完后怎么改 / 怎么删

```bash
# 修改文章：直接编辑 md 文件，保存后
git add .
git commit -m "修改：补充接线图说明"
git push origin main

# 删除文章：删掉 src/content/posts/ 下对应 md 文件，然后
git add .
git commit -m "删除：xxx"
git push origin main
```

---

## 六、常用命令速查

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 本地预览（http://localhost:4321/） |
| `pnpm build` | 完整构建检查（推送前自查） |
| `pnpm new` | 新建文章 |
| `pnpm drafts` | 查看所有草稿 |
| `pnpm publish 文件名` | 草稿转正（去下划线 + 日期改今天） |
| `git add . && git commit -m "说明" && git push origin main` | 提交并上线 |

---

## 七、本次待办：hardware-basics.md 的处理记录

> 状态：frontmatter 由作者自己填好（`title`、`pubDate`、`description`、
> `tags: 硬件`、`category: '垂直领域研究'`、`featured: true`），格式正确。
> 文章会出现在**窄门**栏目（https://elac1.github.io/narrow/ ）**和首页**。

### 已由助手修复（2026-09-19）

1. **系列目录两条断链**（已用锚点算法对算验证）：
   - 第 2 条缺"它"字：`#舵机能精准转到指定角度靠的是什么` → `#舵机它能精准转到指定角度靠的是什么`
   - 第 5 条多了双连字符：`#舵机--控制板--imu--...` → `#舵机-控制板-imu-舵机控制板能做什么`
2. **删掉正文开头与 title 一字不差的二级标题**（否则大标题显示两遍、还占目录第一条），导语保留。
3. **两处裸贴的 B 站链接**（引用块里的"【标题】URL"纯文本）改为本博客原生的视频嵌入：
   `::bilibili{id="BV15X4y157ay"}`、`::bilibili{id="BV1SL4y1j7N7"}`，并去掉了 vd_source 追踪参数。
   如果不想要内嵌播放器，可换成普通链接：`[视频标题](https://www.bilibili.com/video/BV号)`。
4. **重写"两轮自平衡机器人"例子为"四足机器人（机器狗）"**：原例子里舵机控制板驱动舵机无法让两轮车站立
   （两轮平衡车靠的是轮子电机 + 电机驱动板前后加速）；四足机器人的每条腿都由多个舵机驱动，
   IMU 测躯干倾斜 → 控制板算步态 → 舵机控制板驱动腿部舵机，四个部件全部用上且原理成立。
   结尾"云台和平衡车"一句同步改为"云台和四足机器人"。
5. **五个小节的开头称谓统一**："上一篇/这一篇/写舵机那篇" → "上一节/这一节"；
   目录标题"系列文章"改为"本文导航"。
6. **连续旋转舵机表述更正**：调的还是 `write()`，但数值表示速度而非角度
   （`write(90)` 停转，`write(0)`/`write(180)` 两个方向满速）。

> 保留未改的两处"平衡车"（IMU 章节里"无人机、平衡车、机器人"的用途举例、
> IMU+控制板配合的平衡车例子）本身原理正确——IMU 确实用在平衡车上，问题只在"舵机驱动平衡"。

### 发布步骤

```bash
pnpm dev      # 打开 http://localhost:4321/narrow/ ，测 5 个锚点跳转、两个视频卡片、代码块
pnpm build    # 可选：完整构建自查
git add .
git commit -m "新增：硬件入门——控制板、舵机、IMU"
git push origin main
```

推送后到 https://github.com/elac1/elac1.github.io/actions 等绿色 ✓，
再访问 https://elac1.github.io/hardware-basics/ 检查。
