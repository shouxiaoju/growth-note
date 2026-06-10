/**
 * @file 首页
 * @description 个人学习笔记网站的首页，包含以下区块：
 *   1. Hero 区 - 站点名称 + 一句话介绍 + CTA 按钮
 *   2. 最近更新 - 展示最新 6 篇笔记卡片
 *   3. 知识分类 - 两大分类入口卡片（前端/AI）+ 文章数量统计
 *   4. 热门标签 - 常用技术标签展示
 *
 * 数据源：通过调用 content.ts 的服务端函数 getAllArticles() 和 getCategories()
 * 获取文章和分类数据，在服务端渲染后直接返回 HTML，SEO 友好。
 */

import Link from 'next/link';
import { getAllArticles, getCategories } from '@/lib/content';
import type { ArticleMeta } from '@/lib/content';
import type { CategoryInfo } from '@/lib/categories';

/**
 * 格式化日期为中文格式
 * "2026-06-02" → "06月02日"
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return `${parts[1]}月${parts[2]}日`;
}

/**
 * 最近更新笔记卡片
 * 展示文章标题、简介、日期和分类标签
 */
function RecentCard({ article }: { article: ArticleMeta }) {
  // 从分类路径提取子分类名，如 "frontend/javascript" → "JavaScript"
  const categoryLabel = article.category.split('/').pop() || '';
  const categoryUpper =
    categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);

  return (
    <Link
      href={`/docs/${article.slug}`}
      className="group block rounded-lg border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* 分类标签 + 日期 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
          {categoryUpper}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(article.date)}
        </span>
      </div>
      {/* 文章标题 */}
      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
        {article.title}
      </h3>
      {/* 文章简介 */}
      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
        {article.description}
      </p>
      {/* 标签列表 */}
      {article.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

/**
 * 知识分类入口卡片
 * 展示分类名称、图标、描述和文章数量
 */
function CategoryCard({ category }: { category: CategoryInfo }) {
  return (
    <Link
      href={`/docs/${category.children[0]?.slug || category.slug}`}
      className="group block rounded-lg border border-border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {category.articleCount} 篇笔记
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{category.description}</p>
      {/* 子分类标签 */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {category.children.map((child) => (
          <span
            key={child.slug}
            className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
          >
            {child.name}
          </span>
        ))}
      </div>
    </Link>
  );
}

/**
 * 首页主组件（服务端组件）
 * 在服务端获取数据后直接渲染 HTML
 */
export default function HomePage() {
  const allArticles = getAllArticles();
  const categories = getCategories();

  // 最近更新：取最新的 6 篇
  const recentArticles = allArticles.slice(0, 6);

  // 热门标签：从所有文章中统计出现频率最高的标签
  const tagCount: Record<string, number> = {};
  allArticles.forEach((a) =>
    a.tags.forEach((t) => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    })
  );
  const popularTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  return (
    <div className="min-h-screen">
      {/* ========== Hero 区 ========== */}
      <section className="relative bg-gradient-to-b from-primary/5 to-transparent py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            📚 精进手记
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            「记录所学，分析所思，沉淀所悟」
          </p>
          <Link
            href="/docs/frontend/html"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            开始探索
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* ========== 最近更新 ========== */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span>📌</span> 最近更新
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentArticles.map((article) => (
              <RecentCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        {/* ========== 知识分类 ========== */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span>📂</span> 知识分类
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>

        {/* ========== 热门标签 ========== */}
        {popularTags.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span>🏷️</span> 热门标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                >
                  {tag}{' '}
                  <span className="text-xs opacity-60">({count})</span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
