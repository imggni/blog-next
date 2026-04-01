---
name: nextjs-component-generator
description: 生成 Next.js 组件（Server/Client，Props+样式）｜触发：nextjs组件/生成nextjs组件/创建nextjs页面/nextjs页面
---

# Next.js组件生成技能（Trae Skill）

## 指令（Trae执行规则）
1. 接收组件名称、组件类型（客户端/服务端）、Props、功能描述，生成完整.tsx组件文件
2. 严格遵循nextjs-specific规则，确保TS类型规范、路由适配、样式合规
3. 结构固定：TSDoc注释→Props接口定义→组件声明（标注"use client"/"use server"）→渲染逻辑→事件处理→样式导入→导出
4. 自动导入必要依赖（next/navigation、react等），无需手动导入；客户端组件自动导入useState/useEffect等Hooks
5. 生成后提示组件优化点（如动态导入、图片优化、状态管理建议）

## 示例输出模板（客户端组件）
```tsx
/**
 * 用户卡片组件（客户端）
 */
'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import styles from './UserCard.module.css'

type User = {
  id: string
  name: string
  avatar: string
  phone: string
}

interface UserCardProps {
  user: User
  onTap?: (userId: string) => void
}

export default function UserCard({ user, onTap }: UserCardProps) {
  const [isHover, setIsHover] = useState(false)

  const className = useMemo(() => {
    return `${styles.card} ${isHover ? styles.hover : ''}`.trim()
  }, [isHover])

  return (
    <button
      type="button"
      id="user-card"
      className={className}
      onClick={() => onTap?.(user.id)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Image
        src={user.avatar}
        alt={user.name}
        width={48}
        height={48}
        className={styles.avatar}
      />
      <div className={styles.content}>
        <h3 className={styles.name}>{user.name}</h3>
        <p className={styles.phone}>{user.phone}</p>
      </div>
    </button>
  )
}
```

## 示例输出模板（服务端组件）
```tsx
import Link from 'next/link'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div id="layout-container" className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Next.js App
        </Link>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navItem}>
            关于我们
          </Link>
          <Link href="/contact" className={styles.navItem}>
            联系我们
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Next.js App，保留所有权利
      </footer>
    </div>
  )
}
```
