export type Project = {
  name: string
  description: string
  tech: string[]
  href: string
}

// 项目页数据：直接修改这里即可增删项目
// 目前暂无正式项目，先清空；后续按下面的结构往里加即可
export const projects: Project[] = []
