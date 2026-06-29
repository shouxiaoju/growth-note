/**
 * @file 顶部导航栏（客户端组件）
 * @description 全站共享的顶部导航，包含：
 *   - Logo + 站点名称（点击回到首页）
 *   - 分类导航链接（前端开发、AI 开发、关于）
 *   - 搜索按钮（Command+K 快捷键唤起搜索弹窗）
 *   - 暗黑模式切换按钮
 *   - 移动端汉堡菜单
 *
 * 交互特性：
 *   - 滚动时导航栏添加底部阴影，增强层次感
 *   - 搜索弹窗支持 Ctrl+K / Cmd+K 快捷键
 *   - 移动端菜单覆盖全屏，点击外部关闭
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, Search, Sun, Moon, X, Menu } from 'lucide-react';
import { SearchDialog } from '@/components/search-dialog';
import { MobileNavDrawer } from '@/components/layout/mobile-nav-drawer';

export function Header() {
  // 当前路由路径
  const pathname = usePathname();
  // 移动端菜单展开状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 搜索弹窗展开状态
  const [searchOpen, setSearchOpen] = useState(false);
  // 暗黑模式
  const { theme, setTheme } = useTheme();
  // 客户端挂载标记（防止 hydration 不匹配）
  const [mounted, setMounted] = useState(false);
  // 滚动阴影标记
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听滚动，为导航栏添加阴影
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 全局快捷键：Ctrl+K / Cmd+K 唤起搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 判断链接是否处于激活状态
  // 关于页精确匹配，分类页匹配路径前缀
  const isActive = (href: string) => {
    if (href === '/about') return pathname === '/about';
    // 文档分类：匹配路径前缀（如 /docs/frontend/... 或 /docs/ai/...）
    const prefix = href.replace(/\/[^/]+$/, ''); // 取分类根路径
    return pathname === href || pathname.startsWith(prefix + '/');
  };

  // 导航链接配置
  const navLinks = [
    { href: '/docs/frontend/html', label: '前端开发' },
    { href: '/docs/backend/java', label: '后端开发' },
    { href: '/about', label: '关于' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border transition-shadow ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo + 站点名称 */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="text-primary" size={22} />
            <span className="font-semibold text-foreground hidden sm:inline">
              精进手记
            </span>
          </Link>

          {/* 桌面端导航链接 */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作区：搜索 + 暗黑模式 + 移动端菜单 */}
          <div className="flex items-center gap-2">
            {/* 搜索按钮 */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md transition-colors"
            >
              <Search size={16} />
              <span className="hidden sm:inline">搜索</span>
              <kbd className="hidden sm:inline text-xs bg-background border border-border px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>

            {/* 暗黑模式切换 */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="切换暗黑模式"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* 移动端分类导航按钮（底部抽屉） */}
            <MobileNavDrawer />

            {/* 移动端汉堡菜单按钮 */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 移动端展开菜单 */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm py-2 transition-colors ${
                  isActive(link.href)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* 搜索弹窗（独立于 Header 渲染，以 z-index 确保在最上层） */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
