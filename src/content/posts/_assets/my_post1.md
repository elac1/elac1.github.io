# git 知识库

`git 是一个分布式版本控制的软件`



[TOC]

---



## git 是什么?

### git 是一个分布式版本控制的软件

- 分布式 --  > 可以将多人任务,分布给队伍中的人,实现多人协作

- 版本控制 -- > 可以控制项目的版本 可以随时回滚版本

- 软件 -- > 都可以下载  

  [git]: https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git

  

---



## git 本地命令



### 1. git init

> 作用 : 将一个 文件夹 初始化为 git本地仓库, 生成隐藏的 .git 目录,存放版本的全部数据
>
> 简单理解 : 让 git 来管理这个文件夹

```
# 进入你的项目文件夹
cd my_project
# 初始化为git仓库
git init
```

`如果重复执行 git init 是不能回到文件夹的初始状态的,只会提示已经是 git仓库`



### 2. git status

> 作用：查看**工作区、暂存区**当前状态。看哪些文件修改、新增、删除，哪些已经加入暂存区。

```
# 查看仓库状态
git status
```



### 3. git add

> 作用 : 把**工作区**的文件改动,提交到**暂存区**

```
# 1. 添加单个文件到暂存区
git add 文件名

# 2. 添加多个指定文件
git add 文件1 文件2

# 3. 添加当前目录下所有改动（新增、修改、删除）
git add .
```



### 4. git commit

> 作用：把**暂存区里面已经add的改动，永久保存到本地版本库**，生成一条新的版本记录。
> ⚠️注意：只提交暂存区内容，工作区没add的修改不会被保存。

```bash
# 最常用：-m 后面写本次提交说明
git commit -m "填写本次修改描述"
```



### 5. git reset

> 作用 : 版本回退. 移动HEAD 指针
>
> ⚠️重要：**只作用于本地仓库，不要对已经push上传到远程的commit随便reset**

```
# 格式: git reset [模式] 版本hash
git reset --hard 版本hash
```



### 6. git diff

> 作用 : 对比查看改动, 看工作区和暂存区之间的代码差异

```
# 查看工作区还没有add的改动
git diff

# 查看暂存区和版本库之间差异（已经git add之后看）
git diff --cached
```

- `git diff 和git status 的区别`

```
`git status`：**看概况**，只告诉你哪些文件发生变化。
`git diff`：**看细节**，展示文件里面具体改了哪几行代码
```



### 7. git reflog

> 作用 :　记录本地仓库**所有HEAD指针移动记录**。commit、reset、切换分支都会留下日志。
>
> 救急命令：找回被 `git reset` 丢弃、看不到在 `git log` 里的版本

```
# 查看本地全部操作记录
git reflog
```



### 8. git branch

> 作用：分支管理命令，可以**查看、创建、删除本地分支**。只操作本地，不会自动同步远程

```
# 查看所有本地分支，* 代表当前正在使用的分支
git branch

# 创建新分支（不会自动切换过去）
git branch dev

# 删除本地分支
git branch -d dev

# 强制删除分支（分支没有合并完成时用大写 -D）
git branch -D dev
```



### 9. git checkout

> 作用：旧版分支切换命令，同时具备恢复文件功能。
>
> ⚠️Git 2.23版本之后推荐使用 `git switch` 切换分支，checkout功能混杂，容易踩坑。

```
# 切换到已有分支
git checkout dev

# 创建并立刻切换到新分支
git checkout -b feature
```

### 10. git merge

> 作用 : 分支合并. 把指定分支的代码合并进**当前正在停留的分支**

```
# 将 dev分支 合并到我现在所处的分支
git merge dev
```



### -示图

![git](C:\Users\bgq\Desktop\git.png)

---



## git 远程仓库

> 概念：远程仓库存放在网络上 (GitHub/Gitee)，实现代码备份、多人协作。
> 完整链路：本地仓库 ↔ 远程仓库。



### 1. git clone

> 作用 : 把远程仓库下载到本地电脑,自动创建本地仓库并且绑定远程

```
git clone 远程地址
```



### 2. git remote

> 作用 : 管理远程仓库地址,查看,添加,修改远程仓库链接

```
# 查看已经绑定的远程仓库（最常用）
git remote -v

# 添加远程仓库，origin是远程仓库默认别名
git remote add origin 仓库地址

# 修改已经存在的远程地址
git remote set-url origin 新仓库地址
```



### 3. git push

> 作用：将本地已经 commit 的版本上传推送至远程仓库。

```
# 第一次推送，-u 设置上游绑定关系
git push -u origin master

# 已经绑定上游，简写，推送【当前所在分支】
git push

# 显式指定推送分支，不受当前所在分支影响
git push origin master
```

- `-u`：建立本地分支与远程分支的绑定，绑定后可以简写`git push`。

- ⚠️没有设置 `-u`，直接`git push`会报错。

- ⚠️403 报错：没有该仓库写入权限。



### 4. git pull

> 作用：拉取远程分支最新代码，**自动合并到当前所在本地分支**。
>
> 等价于 `git fetch` + `git merge`

```
# 已绑定上游，简写
git pull

# 完整写法
git pull origin main
```

> git pull 的含义 等价于
>
> -> git fetch 获取远程分支的最新代码 　
>
> -> git merge origin/分支 

- 如果本地和远程修改同一处代码，会产生**合并冲突**，需要手动处理。
- 冲突在本地解决之后再push,不会说在github里面 pr 出现冲突.

> 💡开发习惯：push 之前先 pull，同步远程最新代码，减少冲突。



---



## 实际场景

### 1.PR 在实际开发中的使用场景

> ✅实际开发非常常用，分两种场景：开源项目、公司团队内部。



#### 1. 开源项目

- 你没有仓库写权限，不能直接push主仓库。
- Fork → 自己仓库修改 → 提交PR，维护者审核代码再合并。

> 所有给开源仓库贡献代码，几乎都走PR。



#### 2. 企业内部开发

公司内部一般**不用fork**，仓库给团队成员开放访问权限。
流程：

1. 在同一个仓库内，新建功能分支 `dev/xxx`
2. 本地写完代码，push到远程这个功能分支
3. 在GitHub/GitLab网页发起PR（公司内部叫MR，Merge Request）
4. 同事、组长在线评审你的代码：找bug、提修改意见
5. 修改完毕审核通过，再合并到main/main主分支。

> 公司内部：**不fork，在同一个仓库建分支，PR做代码评审**，这是日常高频工作。



#### 3.PR核心价值，不只是合并代码

1. **代码评审CR**：别人可以在线看你的每一行改动，提意见。
2. 自动检测冲突，运行自动化测试。
3. 所有改动留痕，谁改、谁审核全部记录。

---

### 2.报错场景

#### 1. push 403 Permission denied

`(权限拒绝)`

- 原因:  没有这个仓库的写入权限.

  

#### 2.Automatic merge failed; fix conflicts and then commit the result.

`(冲突)`

- 原因: 本地和远程修改了**同一个文件的同一处行**，git 不知道保留哪一份代码

  

#### ３.fatal: not a valid object name: 'master'

`(无commit提交)`

- 原因: 刚init完仓库是空的，master分支只是一个名字，背后没有任何版本数据。 没有任何快照，git不知道新分支该拿什么作为起点，所以切不过去。

  - git分支本质是指向一个**commit提交对象**的指针。

  - git init完成，仓库里**一条commit都没有**，master指针都不存在。

  - 此时可以创建分支记录，但是没有任何版本快照，不能切换分支。

    

#### 4. error: failed to push some refs

`(推送被拒绝)`

- **原因**  :远程仓库有别人新提交的代码，你的本地版本比远程旧，git不让直接push覆盖。

- **解决** : 先拉取远程代码合并到本地，再推送

  ```
  git pull origin main
  # 处理可能出现的冲突
  git push
  ```

  

#### 5. fatal: remote origin already exists

`远程已存在`

- **原因** :执行`git remote add origin xxx`，origin 远程别名已经配置过，重复添加。

- **解决**

  ```
  # 查看现有的远程地址
  git remote -v
  
  # 修改已有origin地址
  git remote set-url origin 新地址
  
  # 或者先删除旧origin，再add
  git remote remove origin
  git remote add origin 新地址
  ```

  

#### 6. fatal: refusing to merge unrelated histories

`(分支独立,无关)`

- **原因**: 两个分支 / 仓库完全独立，没有共同的 commit 祖先，git 默认拒绝合并。

- **常见场景**：git init 本地项目，后期绑定一个已有内容的远程仓库。

- **解决（加参数允许合并无关联历史）**

  ```
  git merge main --allow-unrelated-histories
  ```


