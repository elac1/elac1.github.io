---
title: 'Git 知识库'
pubDate: '2026-09-09'
description: '系统整理 Git 本地命令、远程仓库操作、PR 流程与常见报错场景，一篇文章搞定日常协作。'
tags:
  - Git
  - 工具
category: 学习笔记
---

`git 是一个分布式版本控制的软件`

## git 是什么?

Git 是一个**分布式版本控制系统**。每个开发者的电脑上都有一份完整的代码仓库副本（包括所有历史提交），不依赖中央服务器也能工作。

## 本地操作

### 基本流程

```bash
git add .          # 把修改加入暂存区
git commit -m "说明"  # 提交到本地仓库
git push origin main  # 推送到远程
```

### 常用命令速查

| 命令 | 作用 |
|------|------|
| `git status` | 查看当前状态（哪些文件改了） |
| `git diff` | 查看具体改了什么 |
| `git log --oneline` | 查看提交历史 |
| `git stash` | 临时存起修改，之后恢复 |
| `git checkout -- <file>` | 丢弃某个文件的修改 |
| `git reset --hard HEAD~1` | 撤销最近一次提交（慎用！） |

## 远程协作

### 克隆和推送

```bash
git clone <仓库地址>      # 克隆远程仓库
git pull origin main      # 拉取远程最新代码并合并
git push origin main      # 推送本地提交到远程
```

### 分支工作流

```bash
git checkout -b feature/new-thing  # 创建并切换到新分支
# ... 改代码 ...
git checkout main                  # 切回主分支
git merge feature/new-thing        # 合并功能分支
git branch -d feature/new-thing    # 删除已合并的分支
```

## PR 流程（GitHub/GitLab）

1. Fork 仓库 → 2. 创建分支 → 3. 提交修改 → 4. Push 到自己的 Fork → 5. 发起 Pull Request → 6. Code Review → 7. Merge

## 常见报错

**1. merge conflict**

两个分支改了同一行代码。手动打开冲突文件，选保留哪个版本，然后：

```bash
git add <冲突文件>
git commit
```

**2. fatal: refusing to merge unrelated histories**

两个仓库历史完全不同。加 `--allow-unrelated-histories`：

```bash
git pull origin main --allow-unrelated-histories
```

**3. push 被拒：non-fast-forward**

远程有你本地没有的提交。先 pull 再 push：

```bash
git pull --rebase origin main
git push origin main
```
