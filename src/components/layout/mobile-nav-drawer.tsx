/**
 * @file 移动端底部导航抽屉（客户端组件）
 * @description 移动端专用的底部弹出式分类导航，功能包括：
 *   - 使用 Vaul Drawer 从底部滑出，拖拽手柄可上下拖动
 *   - 渲染与左侧侧边栏完全相同的分类树结构
 *   - 支持顶级分类折叠/展开
 *   - 支持子分类折叠/展开，展开显示文章列表
 *   - 当前选中分类/文章高亮
 *   - 点击任意链接后自动关闭抽屉
 *   - 仅在移动端（md 断点以下）使用
 *
 * 数据流：
 *   /api/article-counts → 分类树数据 → 渲染导航 UI
 *   失败时 fallback 到 categories.ts 本地配置
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PanelBottom } from 'lucide-react';
import { categoryConfig } from '@/lib/categories';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

/** 分类树节点（与服务端 API 返回结构一致） */
interface CategoryNode {
  name: string;
  icon: string;
  description: string;
  slug: string;
  children: {
    name: string;
    slug: string;
    count: number;
    articles: { title: string; slug: string }[];
  }[];
}

export function MobileNavDrawer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);

  // 从 API 获取分类树数据
  useEffect(() => {
    fetch('/api/article-counts')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  // 自动展开当前路由所在的子分类
  useEffect(() => {
    if (categories.length === 0) return;
    categories.forEach((cat) => {
      cat.children.forEach((child) => {
        if (pathname.startsWith(`/docs/${child.slug}`)) {
          setSubExpanded((prev) => ({ ...prev, [child.slug]: true }));
        }
      });
    });
  }, [categories, pathname]);

  const toggleExpand = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleSubExpand = (slug: string) => {
    setSubExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const isActive = (slug: string) => pathname.startsWith(`/docs/${slug}`);

  /** 关闭抽屉（供链接点击时调用） */
  const handleLinkClick = () => setOpen(false);

  /** 渲染分类导航树（与 Sidebar 一致） */
  const renderNavTree = () => (
    <nav className="px-1">
      {categories.length > 0
        ? categories.map((cat) => (
            <div key={cat.slug} className="mb-2">
              {/* 顶级分类 */}
              <button
                onClick={() => toggleExpand(cat.slug)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md transition-colors ${
                  isActive(cat.slug)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <DynamicIcon name={cat.icon} size={16} />
                <span className="flex-1 text-left">{cat.name}</span>
                <span
                  className={`text-xs transition-transform ${
                    expanded[cat.slug] !== false ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* 子分类列表 */}
              {expanded[cat.slug] !== false && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {cat.children.map((child) => (
                    <div key={child.slug}>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleSubExpand(child.slug)}
                          className="text-xs text-muted-foreground hover:text-foreground p-1 transition-colors shrink-0"
                        >
                          <span
                            className={`inline-block transition-transform ${
                              subExpanded[child.slug] ? 'rotate-0' : '-rotate-90'
                            }`}
                          >
                            ▼
                          </span>
                        </button>
                        <Link
                          href={`/docs/${child.slug}`}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between flex-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
                            isActive(child.slug)
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <span>{child.name}</span>
                          {child.count > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              {child.count}
                            </span>
                          )}
                        </Link>
                      </div>

                      {/* 文章列表 */}
                      {subExpanded[child.slug] && child.articles.length > 0 && (
                        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
                          {child.articles.map((article) => (
                            <Link
                              key={article.slug}
                              href={`/docs/${article.slug}`}
                              onClick={handleLinkClick}
                              className={`block px-2 py-1 text-sm rounded-md transition-colors truncate ${
                                pathname === `/docs/${article.slug}`
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              {article.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        : // fallback：无 API 数据时使用本地配置
          Object.entries(categoryConfig).map(([key, config]) => (
            <div key={key} className="mb-2">
              <button
                onClick={() => toggleExpand(key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md transition-colors ${
                  isActive(key)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <DynamicIcon name={config.icon} size={16} />
                <span className="flex-1 text-left">{config.name}</span>
                <span
                  className={`text-xs transition-transform ${
                    expanded[key] !== false ? 'rotate-0' : '-rotate-90'
                  }`}
                >
                  ▼
                </span>
              </button>
              {expanded[key] !== false && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {Object.entries(config.children).map(
                    ([childSlug, childName]) => (
                      <Link
                        key={childSlug}
                        href={`/docs/${key}/${childSlug}`}
                        onClick={handleLinkClick}
                        className={`block px-2 py-1.5 text-sm rounded-md transition-colors ${
                          isActive(`${key}/${childSlug}`)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {childName}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
    </nav>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {/* 触发按钮：仅在移动端显示 */}
      <DrawerTrigger asChild>
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="打开分类导航"
        >
          <PanelBottom size={20} />
        </button>
      </DrawerTrigger>

      {/* 底部抽屉内容 */}
      <DrawerContent className="max-h-[75vh]">
        <DrawerHeader className="border-b border-border shrink-0">
          <DrawerTitle className="text-sm font-semibold flex items-center gap-2">
            <PanelBottom size={16} />
            分类导航
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-3 py-3 flex-1">
          {renderNavTree()}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
