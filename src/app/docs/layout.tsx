/**
 * @file 文档页布局
 * @description /docs 路径下所有页面的共享布局，提供左侧分类导航侧边栏。
 *
 * 布局结构：
 *   DocsLayout
 *     └── Sidebar（左侧分类导航，客户端组件，支持折叠/展开）
 *         └── children（文章列表页 或 文章详情页）
 *
 * 注意：文章详情页的 TOC 目录和 上一篇/下一篇 导航
 *       在 docs/[...slug]/page.tsx 中单独处理，不在此布局中。
 */

import { Sidebar } from '@/components/layout/sidebar';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-w-[1400px] mx-auto">
      {/* 左侧分类导航侧边栏（客户端组件，支持折叠和当前分类高亮） */}
      <Sidebar />
      {/* 右侧内容区 */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
