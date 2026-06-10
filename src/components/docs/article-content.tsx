/**
 * @file 文章正文渲染组件（客户端组件）
 * @description 将 MDX 正文内容渲染为 HTML，功能包括：
 *   - 使用 next-mdx-remote 解析和渲染 MDX 内容
 *   - 自定义 MDX 组件映射（覆盖默认 HTML 标签的样式）
 *   - 代码块语法高亮（通过 rehype-highlight 插件 + highlight.js CSS）
 *   - 表格、引用块、列表等元素的样式优化
 *
 * MDX 组件映射说明：
 *   h2-h4 → 带锚点的标题（id 用于 TOC 跳转）
 *   pre → 代码块容器（圆角、背景色、横向滚动）
 *   code → 行内代码（背景色、圆角、等宽字体）
 *   table → 带边框和条纹的表格
 *   blockquote → 左侧蓝色竖线引用块
 *   a → 带 hover 效果的链接
 *
 * 注意：本组件为客户端组件，因为 next-mdx-remote 的 MDXRemote
 *       需要在客户端环境中序列化和反序列化 MDX 内容。
 */

'use client';

import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';

interface ArticleContentProps {
  content: string; // 已去除 frontmatter 的 MDX 正文
}

/**
 * 自定义 MDX 组件映射
 * 覆盖 MDX 渲染时使用的默认 HTML 标签，添加 Tailwind 样式
 */
const mdxComponents = {
  // 各级标题：添加锚点 id（由 rehype-slug 自动生成）和底部边框
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-border"
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="text-xl font-semibold text-foreground mt-8 mb-3"
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      {...props}
      className="text-lg font-semibold text-foreground mt-6 mb-2"
    />
  ),
  // 段落
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-foreground leading-7 mb-4" />
  ),
  // 代码块容器
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className="bg-code-background text-foreground rounded-lg p-4 overflow-x-auto my-4 text-sm border border-border"
    />
  ),
  // 行内代码
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className={`bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono ${
        // 如果父元素是 pre（代码块），则不添加额外的内联样式
        (props as { parentName?: string }).parentName === 'pre'
          ? 'bg-transparent p-0'
          : ''
      }`}
    />
  ),
  // 超链接：新窗口打开 + hover 效果
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  // 无序列表
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-inside mb-4 space-y-1 text-foreground" />
  ),
  // 有序列表
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-inside mb-4 space-y-1 text-foreground" />
  ),
  // 引用块：左侧蓝色竖线
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 rounded-r-lg text-foreground italic"
    />
  ),
  // 表格：带边框和条纹
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table
        {...props}
        className="w-full border-collapse border border-border text-sm"
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} className="bg-muted" />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="border border-border px-3 py-2 text-left font-semibold text-foreground"
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="border border-border px-3 py-2 text-foreground" />
  ),
  // 水平分割线
  hr: () => <hr className="border-border my-8" />,
  // 图片：圆角 + 阴影
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      className="max-w-full rounded-lg shadow-sm my-4"
      alt={props.alt || ''}
    />
  ),
};

export function ArticleContent({ content }: ArticleContentProps) {
  // 序列化后的 MDX 源（异步处理）
  const [mdxSource, setMdxSource] = useState<Awaited<
    ReturnType<typeof serialize>
  > | null>(null);

  // 将原始 MDX 字符串序列化为可渲染的 MDXRemote 数据
  useEffect(() => {
    serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],     // 支持 GFM 语法（表格、删除线等）
        rehypePlugins: [rehypeSlug, rehypeHighlight], // 自动生成锚点 id + 代码高亮
      },
    }).then(setMdxSource);
  }, [content]);

  // 序列化完成前显示加载状态
  if (!mdxSource) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  return <MDXRemote {...mdxSource} components={mdxComponents} />;
}
