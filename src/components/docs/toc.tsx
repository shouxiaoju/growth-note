/**
 * @file 文章目录 (TOC) 组件（客户端组件）
 * @description 在文章详情页右侧显示的目录导航，功能包括：
 *   - 从 h2-h4 标题自动生成目录结构
 *   - 层级缩进显示（h2 无缩进，h3 缩进一级，h4 缩进两级）
 *   - 点击目录项平滑滚动到对应标题位置
 *   - 当前阅读位置高亮（滚动时自动更新）
 *
 * 数据源：
 *   content.ts 的 getTocFromContent() 函数从 MDX 正文提取标题结构，
 *   生成 { id, text, level } 数组传入本组件。
 *
 * 交互说明：
 *   - 使用 Intersection Observer API 监听标题元素进入视口
 *   - 自动高亮当前正在阅读的目录项
 *   - 仅在桌面端显示（lg 断点以上），移动端隐藏
 */

'use client';

import { useEffect, useState } from 'react';

/** TOC 条目结构 */
interface TocItem {
  id: string;    // 标题的 DOM id，用于锚点跳转
  text: string;  // 标题文本
  level: number; // 标题层级（2-4）
}

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  // 当前高亮的目录项 id
  const [activeId, setActiveId] = useState<string>('');

  // 使用 Intersection Observer 监听标题可见性
  useEffect(() => {
    // 收集所有标题 DOM 元素
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    // 创建 Intersection Observer：标题进入视口时更新高亮状态
    const observer = new IntersectionObserver(
      (entries) => {
        // 找到当前可见的标题，更新高亮
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // 根元素顶部偏移 20%，确保标题在视口上方 20% 位置时就被标记为"当前"
        rootMargin: '-20% 0px -80% 0px',
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [toc]);

  // 点击目录项：平滑滚动到对应标题
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (toc.length === 0) return null;

  return (
    <div className="text-sm">
      {/* 目录标题 */}
      <div className="font-semibold text-foreground mb-3">目录</div>
      <nav>
        {toc.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`block w-full text-left py-1.5 transition-colors hover:text-primary ${
              // 根据层级设置缩进：h2 无缩进，h3 缩进 1 级，h4 缩进 2 级
              item.level === 3
                ? 'pl-3'
                : item.level === 4
                ? 'pl-6'
                : ''
            } ${
              // 当前高亮项使用主色，其他项使用弱化色
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
