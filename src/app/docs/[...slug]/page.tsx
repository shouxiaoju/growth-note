/**
 * @file 文档动态路由页面
 * @description 处理 /docs/[...slug] 路径，支持两种页面模式：
 *
 *   模式 1 - 分类列表页：slug 为分类路径，如 /docs/frontend/javascript
 *            显示该分类下所有文章的列表
 *
 *   模式 2 - 文章详情页：slug 为完整文章路径，如 /docs/frontend/javascript/basics
 *            显示文章内容、TOC 目录、上一篇/下一篇导航
 *
 * 路由匹配逻辑：
 *   尝试将 slug 作为文章 slug 查找 → 找到则渲染详情页
 *   找不到则将 slug 作为分类路径 → 渲染列表页
 *   都找不到 → 返回 404
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getArticlesByCategory, getCategories, getPrevNextArticles, getTocFromContent } from '@/lib/content';
import { ArticleContent } from '@/components/docs/article-content';
import { TableOfContents } from '@/components/docs/toc';
import { PrevNextNav } from '@/components/docs/prev-next';

/** 为文章详情页生成动态元数据（SEO 优化） */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const article = getArticleBySlug(slugStr);

  if (article) {
    return {
      title: article.meta.title,
      description: article.meta.description,
    };
  }

  // 分类列表页的元数据
  const categories = getCategories();
  const parts = slugStr.split('/');
  const topSlug = parts[0];
  const cat = categories.find((c) => c.slug === topSlug);

  return {
    title: cat ? cat.name : '文档',
    description: cat?.description,
  };
}

/**
 * 页面主组件
 * 根据 slug 判断渲染分类列表页还是文章详情页
 */
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugStr = slug.join('/');

  // ========== 模式 1：尝试匹配文章详情页 ==========
  const article = getArticleBySlug(slugStr);

  if (article) {
    // 获取同分类下的上一篇/下一篇文章
    const { prev, next } = getPrevNextArticles(
      article.meta.category,
      article.meta.slug
    );
    // 从文章正文提取目录结构
    const toc = getTocFromContent(article.content);

    return (
      <div className="flex">
        {/* 文章主内容区 */}
        <div className="flex-1 min-w-0 px-6 py-8 max-w-4xl">
          {/* 文章元信息：标题、日期、标签 */}
          <header className="mb-8 border-b border-border pb-6">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {article.meta.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>📅 {article.meta.date}</span>
              {article.meta.tags.length > 0 && (
                <div className="flex gap-1.5">
                  {article.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted px-2 py-0.5 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* MDX 文章正文渲染（客户端组件，使用 next-mdx-remote） */}
          <ArticleContent content={article.content} />

          {/* 上一篇 / 下一篇 导航 */}
          <PrevNextNav prev={prev} next={next} />
        </div>

        {/* 右侧目录（TOC）：仅桌面端显示 */}
        {toc.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto py-8">
            <TableOfContents toc={toc} />
          </aside>
        )}
      </div>
    );
  }

  // ========== 模式 2：分类列表页 ==========
  const categories = getCategories();
  const parts = slugStr.split('/');
  const topSlug = parts[0];
  const category = categories.find((c) => c.slug === topSlug);

  if (!category) {
    notFound();
  }

  // 如果是多级 slug（如 "frontend/javascript"），取对应子分类
  let categoryName = category.name;
  let articles = getArticlesByCategory(slugStr);
  let subCategoryName = '';

  if (parts.length > 1) {
    const subSlug = parts[parts.length - 1];
    const subCategory = category.children.find(
      (c) => c.slug === slugStr || c.slug.endsWith(`/${subSlug}`)
    );
    if (subCategory) {
      subCategoryName = subCategory.name;
    }
    // 如果没有精确匹配到子分类的文章，则显示顶级分类下所有文章
    if (articles.length === 0) {
      articles = getArticlesByCategory(slugStr);
    }
  }

  // 面包屑导航
  const breadcrumb = subCategoryName
    ? `${category.name} / ${subCategoryName}`
    : category.name;

  return (
    <div className="px-6 py-8 max-w-4xl">
      {/* 面包屑 */}
      <div className="text-sm text-muted-foreground mb-2">{breadcrumb}</div>
      {/* 分类标题 */}
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span>{category.icon}</span>
        {subCategoryName || category.name}
      </h1>

      {/* 文章列表 */}
      {articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((a) => (
            <a
              key={a.slug}
              href={`/docs/${a.slug}`}
              className="block rounded-lg border border-border p-4 hover:shadow-sm hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">📖 {a.title}</h3>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {a.date}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {a.description}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">📝</p>
          <p>该分类下暂无笔记，持续更新中...</p>
        </div>
      )}
    </div>
  );
}
