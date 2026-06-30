/**
 * @file 根布局组件
 * @description 全站共享的 HTML 骨架，定义了：
 *   - 页面元数据（title、description、keywords）
 *   - 主题提供者（ThemeProvider，实现暗黑模式切换）
 *   - 全局布局结构：Header + main + Footer
 *   - 开发环境的 Inspector 工具
 *
 * 布局层级：
 *   RootLayout（本文件）
 *     ├── Header（顶部导航栏：Logo、搜索、暗黑模式切换）
 *     ├── main
 *     │   ├── HomePage（首页）
 *     │   ├── DocsLayout → DocPage（文档页：侧边栏 + 内容 + TOC）
 *     │   └── AboutPage（关于页）
 *     └── Footer（页脚：版权信息、链接）
 */

import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    // 默认标题 + 子页面模板标题（如 "JavaScript 基础语法 | 乐码手记"）
    default: '乐码手记',
    template: '%s | 乐码手记',
  },
  description:
    '记录和分析个人学习笔记的技术知识库网站，分类清晰、搜索便捷',
  keywords: [
    '学习笔记',
    '前端开发',
    'JavaScript',
    'React',
    'TypeScript',
    'AI',
    'Prompt工程',
    '知识库',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 开发环境下启用 React DevTools Inspector，方便定位组件源码
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    // suppressHydrationWarning: 避免暗黑模式在 HTML 标签上添加 class 导致的 hydration 警告
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {/* 主题提供者：管理 light/dark/system 三种模式，通过 class="dark" 切换 */}
        <ThemeProvider>
          {isDev && <Inspector />}
          {/* 顶部导航栏（客户端组件，包含搜索弹窗和暗黑模式切换） */}
          <Header />
          {/* 页面主体内容，flex-1 保证 Footer 始终在底部 */}
          <main className="flex-1">{children}</main>
          {/* 页脚 */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
