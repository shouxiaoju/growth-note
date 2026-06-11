/**
 * @file 左侧分类导航侧边栏（客户端组件）
 * @description 文档页的左侧分类目录，支持：
 *   - 顶级分类折叠/展开（点击分类名称切换）
 *   - 子分类折叠/展开（点击 ▼ 箭头切换），展开显示该分类下的文章列表
 *   - 文章计数展示
 *   - 当前选中分类/文章高亮
 *   - 自动展开当前路由所在的子分类
 *   - 响应式：桌面端固定侧边栏，移动端隐藏
 *
 * 数据流：
 *   categories.ts (categoryConfig) → 本组件内构建分类树 → 渲染侧边栏 UI
 *   文章计数通过 API (/api/article-counts) 在客户端动态获取
 *
 * 样式说明：
 *   - 桌面端：固定宽度 260px，左侧钉住
 *   - 移动端：默认隐藏（由 Header 的汉堡菜单控制，未来可扩展）
 *   - 选中分类使用 bg-primary/10 + text-primary 高亮
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { categoryConfig } from '@/lib/categories';

/** 分类树节点（包含服务端返回的文章计数和文章列表） */
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

export function Sidebar() {
  const pathname = usePathname();
  // 分类树数据（初始为空，从 API 获取后填充）
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  // 各顶级分类的折叠状态，默认全部展开
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // 各子分类的折叠状态，默认展开当前路由所在的子分类
  const [subExpanded, setSubExpanded] = useState<Record<string, boolean>>({});

  // 从 API 获取分类树数据（含文章计数）
  useEffect(() => {
    fetch('/api/article-counts')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {
        // API 失败时使用本地配置（不含计数）
      });
  }, []);

  // 当分类数据或路由变化时，自动展开当前路由所在的子分类
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

  // 切换分类折叠状态
  const toggleExpand = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // 切换子分类折叠状态
  const toggleSubExpand = (slug: string) => {
    setSubExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // 判断当前路径是否匹配某分类（用于高亮）
  const isActive = (slug: string) => pathname.startsWith(`/docs/${slug}`);

  return (
    <aside className="hidden md:block w-[260px] shrink-0 border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="py-4 px-3">
        {/* 侧边栏标题 */}
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          分类目录
        </div>

        {categories.length > 0
          ? // 有 API 数据时，渲染带文章计数的分类树
            categories.map((cat) => (
              <div key={cat.slug} className="mb-2">
                {/* 顶级分类：点击可折叠/展开 */}
                <button
                  onClick={() => toggleExpand(cat.slug)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(cat.slug)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="flex-1 text-left">{cat.name}</span>
                  {/* 折叠/展开指示箭头 */}
                  <span
                    className={`text-xs transition-transform ${
                      expanded[cat.slug] !== false ? 'rotate-0' : '-rotate-90'
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* 子分类列表（可折叠） */}
                {expanded[cat.slug] !== false && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {cat.children.map((child) => (
                      <div key={child.slug}>
                        {/* 子分类标题行：点击展开折叠 + 跳转 */}
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleSubExpand(child.slug)}
                            className="text-xs text-muted-foreground hover:text-foreground p-1 transition-colors shrink-0"
                            aria-label={subExpanded[child.slug] ? '折叠' : '展开'}
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
                            className={`flex items-center justify-between flex-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
                              isActive(child.slug)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <span>{child.name}</span>
                            {/* 文章计数 */}
                            {child.count > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {child.count}
                              </span>
                            )}
                          </Link>
                        </div>

                        {/* 子分类下的文章列表（可折叠） */}
                        {subExpanded[child.slug] && child.articles.length > 0 && (
                          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
                            {child.articles.map((article) => (
                              <Link
                                key={article.slug}
                                href={`/docs/${article.slug}`}
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
          : // 无 API 数据时的 fallback：仅展示分类名称
            Object.entries(categoryConfig).map(([key, config]) => (
              <div key={key} className="mb-2">
                <button
                  onClick={() => toggleExpand(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(key)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{config.icon}</span>
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
                        <div key={childSlug}>
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleSubExpand(`${key}/${childSlug}`)}
                              className="text-xs text-muted-foreground hover:text-foreground p-1 transition-colors shrink-0"
                              aria-label={subExpanded[`${key}/${childSlug}`] ? '折叠' : '展开'}
                            >
                              <span
                                className={`inline-block transition-transform ${
                                  subExpanded[`${key}/${childSlug}`] ? 'rotate-0' : '-rotate-90'
                                }`}
                              >
                                ▼
                              </span>
                            </button>
                            <Link
                              key={childSlug}
                              href={`/docs/${key}/${childSlug}`}
                              className={`flex-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
                                isActive(`${key}/${childSlug}`)
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              <span>{childName}</span>
                            </Link>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
      </nav>
    </aside>
  );
}
