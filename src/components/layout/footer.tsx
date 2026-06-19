/**
 * @file 页脚组件
 * @description 全站共享的页脚，包含：
 *   - 版权信息
 *   - 站点导航链接
 *   - 外部链接（GitHub 等）
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 版权信息 */}
          <div className="text-sm text-muted-foreground">
            © 2026 瘦小橘 | 记录所学，分析所思，沉淀所悟
          </div>

          {/* 站内导航 */}
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              首页
            </Link>
            <Link
              href="/docs/frontend/html"
              className="hover:text-foreground transition-colors"
            >
              前端开发
            </Link>
            <Link
              href="/docs/ai/prompt-engineering"
              className="hover:text-foreground transition-colors"
            >
              AI 开发
            </Link>
            <Link
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              关于
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
