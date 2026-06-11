/**
 * @file 内容管理核心模块（仅限服务端使用）
 * @description 负责从 content/ 目录读取 MDX/Markdown 文件，解析 frontmatter 元数据，
 *              提供文章列表、分类统计、搜索、TOC 提取等数据接口。
 *
 * ⚠️ 本文件使用了 Node.js 的 fs 和 path 模块，只能在服务端组件和 API Route 中导入，
 *    不可在客户端组件中直接导入（会导致构建错误）。
 *    客户端需要的分类展示数据请使用 categories.ts 中的 categoryConfig。
 *
 * 数据流：
 *   content/*.mdx 文件 → gray-matter 解析 frontmatter → ArticleMeta → 页面组件消费
 *
 * MDX frontmatter 格式约定：
 *   ---
 *   title: 文章标题
 *   description: 文章简介
 *   date: 2026-06-01
 *   tags: [标签1, 标签2]
 *   category: frontend/html       ← 必须匹配 "顶级分类/子分类" 格式
 *   order: 1                       ← 同分类内的排序序号
 *   ---
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { categoryConfig } from './categories';
import type { CategoryInfo } from './categories';

/** content/ 目录的绝对路径，所有 MDX 笔记文件存放于此 */
const contentDir = path.join(process.cwd(), 'content');

/**
 * 文章元数据接口
 * 由 MDX frontmatter 解析而来，贯穿整个站点用于展示和路由
 */
export interface ArticleMeta {
  title: string;       // 文章标题
  description: string; // 文章简介（用于列表页和搜索结果展示）
  date: string;        // 发布日期，格式 "YYYY-MM-DD"（已序列化为字符串，避免 React 渲染 Date 对象报错）
  tags: string[];      // 标签数组（用于搜索匹配和展示）
  category: string;    // 分类路径，如 "frontend/javascript"（需与 categories.ts 中的配置匹配）
  order: number;       // 同分类内的排序序号（用于"上一篇/下一篇"导航和列表排序）
  slug: string;        // URL 友好的唯一标识，如 "frontend/javascript/basics"（由文件路径自动生成）
}

/**
 * 从 MDX 文件中解析元数据
 * @param filePath - 文件绝对路径
 * @param relativePath - 相对于 content/ 目录的路径（用于生成 slug）
 * @returns 文章元数据，解析失败返回 null
 */
function getArticleMeta(filePath: string, relativePath: string): ArticleMeta | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    // 移除文件扩展名作为 slug，如 "frontend/html/basics.mdx" → "frontend/html/basics"
    const slug = relativePath.replace(/\.mdx?$/, '');

    return {
      title: data.title || slug,
      description: data.description || '',
      // 处理 gray-matter 可能返回 Date 对象的情况，统一转为字符串
      date: typeof data.date === 'string' ? data.date : data.date?.toISOString?.()?.split('T')[0] || '',
      tags: data.tags || [],
      category: data.category || '',
      order: data.order ?? 0,
      slug,
    };
  } catch {
    return null;
  }
}

/**
 * 递归遍历目录，收集所有 MDX/MD 文件的相对路径
 * @param dir - 要遍历的目录绝对路径
 * @param baseDir - 当前相对路径前缀（递归拼接用）
 * @returns 相对路径数组，如 ["frontend/html/basics.mdx", "ai/llm/architecture.mdx"]
 */
function walkDir(dir: string, baseDir: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, relPath));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(relPath);
    }
  }

  return files;
}

/**
 * 获取所有文章元数据，按日期倒序排列（最新的在前）
 * 用于首页"最近更新"列表和搜索
 */
export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(contentDir)) return [];

  const files = walkDir(contentDir);
  const articles = files
    .map((file) => {
      const fullPath = path.join(contentDir, file);
      return getArticleMeta(fullPath, file);
    })
    .filter((a): a is ArticleMeta => a !== null);

  return articles.sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * 获取指定分类下的所有文章，按 order 字段排序
 * @param category - 分类路径，如 "frontend/javascript"
 * @returns 该分类下的文章列表
 */
export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles()
    .filter((a) => a.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * 根据 slug 获取单篇文章的完整内容
 * @param slug - 文章 slug，如 "frontend/javascript/basics"
 * @returns 文章元数据 + MDX 正文内容，未找到返回 null
 */
export function getArticleBySlug(slug: string): { meta: ArticleMeta; content: string } | null {
  // 优先查找 .mdx 文件，其次 .md 文件
  const mdxPath = path.join(contentDir, `${slug}.mdx`);
  const mdPath = path.join(contentDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    meta: {
      title: data.title || slug,
      description: data.description || '',
      date: typeof data.date === 'string' ? data.date : data.date?.toISOString?.()?.split('T')[0] || '',
      tags: data.tags || [],
      category: data.category || '',
      order: data.order ?? 0,
      slug,
    },
    content, // MDX 正文（已去除 frontmatter），交给 ArticleContent 组件渲染
  };
}

/**
 * 构建完整的分类树，包含每个分类和子分类的文章计数
 * 用于侧边栏和首页分类卡片的数据源
 */
export function getCategories(): CategoryInfo[] {
  const allArticles = getAllArticles();

  return Object.entries(categoryConfig).map(([key, config]) => {
    const children = Object.entries(config.children).map(
      ([childSlug, childName]) => {
        const childArticles = allArticles.filter(
          (a) => a.category === `${key}/${childSlug}`
        );
        const articleCount = childArticles.length;
        const articles = childArticles
          .sort((a, b) => a.order - b.order)
          .map((a) => ({ title: a.title, slug: a.slug }));
        return { name: childName, slug: `${key}/${childSlug}`, articleCount, articles };
      }
    );

    const articleCount = allArticles.filter((a) =>
      a.category.startsWith(`${key}/`)
    ).length;

    return {
      name: config.name,
      slug: key,
      icon: config.icon,
      description: config.description,
      children,
      articleCount,
    };
  });
}

/**
 * 获取当前文章的前一篇和后一篇文章（同分类内按 order 排序）
 * 用于文章详情页底部的"上一篇/下一篇"导航
 * @param category - 当前文章的分类路径
 * @param currentSlug - 当前文章的 slug
 */
export function getPrevNextArticles(
  category: string,
  currentSlug: string
): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const articles = getArticlesByCategory(category).sort(
    (a, b) => a.order - b.order
  );
  const currentIndex = articles.findIndex((a) => a.slug === currentSlug);

  return {
    prev: currentIndex > 0 ? articles[currentIndex - 1] : null,
    next:
      currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null,
  };
}

/**
 * 全文搜索：在文章标题、描述、标签中搜索匹配关键词
 * 用于 /api/search 接口和搜索弹窗
 * @param query - 搜索关键词
 * @returns 匹配的文章列表
 */
export function searchArticles(query: string): ArticleMeta[] {
  const lowerQuery = query.toLowerCase();
  return getAllArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 从 MDX 正文内容中提取标题结构，生成目录 (TOC) 数据
 * 仅提取 h2-h4 级别标题，h1 用于文章主标题不纳入 TOC
 *
 * @param content - 已去除 frontmatter 的 MDX 正文
 * @returns TOC 条目数组，每项包含 id（锚点）、text（标题文本）、level（层级 2-4）
 *
 * 示例输出：
 *   [{ id: "1-什么是异步编程", text: "1. 什么是异步编程", level: 2 }, ...]
 */
export function getTocFromContent(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const toc: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // 生成 URL 安全的锚点 ID：中文保留，特殊字符替换为连字符
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');
    toc.push({ id, text, level });
  }

  return toc;
}
