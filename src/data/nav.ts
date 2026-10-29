export type NavItem = { href: string; label: string }

// 全站导航：Header、首页 Hero、Footer 共用同一份数据
export const navItems: NavItem[] = [
  { href: '/', label: '首页' },
  { href: '/projects', label: '项目' },
  { href: '/archive', label: '文章' },
  { href: '/narrow', label: '技术' },
  { href: '/about', label: '关于' }
]
