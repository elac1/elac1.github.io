---
title: 'VS Code 配置 C/C++ 开发环境（Windows 版）'
pubDate: '2026-08-28'
description: '从零开始在 Windows 上搭好 C/C++ 开发环境：MinGW 安装、Code Runner、Tasks 和 launch.json 调试配置，一份能用的配置文件直接抄。'
tags:
  - C语言
  - 工具
category: 学习笔记
---

## 安装 MinGW

1. 去 [winlibs.com](https://winlibs.com/) 下载 UCRT 版本（选 POSIX 线程）
2. 解压到 `C:\mingw64`（路径不能有空格！）
3. 把 `C:\mingw64\bin` 加到系统 PATH
4. 新开终端验证：`g++ --version`

## VS Code 必备插件

| 插件 | 作用 |
|------|------|
| C/C++（Microsoft） | 语法高亮 + IntelliSense + 调试 |
| Code Runner | 一键运行代码（Ctrl+Alt+N） |
| Error Lens | 直接在代码里显示错误，不用看 Problems 面板 |

## launch.json 调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "C++ Debug",
      "type": "cppdbg",
      "request": "launch",
      "program": "${fileDirname}/${fileBasenameNoExtension}.exe",
      "args": [],
      "stopAtEntry": false,
      "cwd": "${fileDirname}",
      "environment": [],
      "externalConsole": false,
      "MIMode": "gdb",
      "miDebuggerPath": "C:/mingw64/bin/gdb.exe",
      "preLaunchTask": "build cpp"
    }
  ]
}
```

## 一个忠告

如果你的项目开始有多个 .c/.cpp 文件了，**赶紧转 CMake**。Code Runner 只能跑单文件，多文件编译会让你崩溃。
