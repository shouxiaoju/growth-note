/**
 * @file 上一篇/下一篇导航组件
 * @description 在文章详情页底部显示的同分类文章导航，功能包括：
 *   - 上一篇：指向同分类内排序更小的文章
 *   - 下一篇：指向同分类内排序更大的文章
 *   - 无前一篇文章时左侧显示"已经是第一篇"
 *   - 无后一篇文章时右侧显示"已经是最后一篇"
 *
 * 数据源：
 *   content.ts 的 getPrevNextArticles() 返回 { prev, next } 对象
 *
 * 样式说明：
 *   - 两个导航项左右分布，中间分隔线
 *   - hover 时背景色变化 + 向对应方向微偏移
 */

import Link from 'next/link';
import type { ArticleMeta } from '@/lib/content';

interface PrevNextNavProps {
  prev: ArticleMeta | null;  // 上一篇文章元数据，null 表示无
  next: ArticleMeta | null;  // 下一篇文章元数据，null 表示无
}

export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  // 既没有上一篇也没有下一篇时不渲染
  if (!prev && !next) return null;

  return (
    <nav className="flex items-stretch gap-4 mt-12 pt-8 border-t border-border">
      {/* 上一篇（左侧） */}
      <div className="flex-1">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="group block rounded-lg border border-border p-4 hover:shadow-sm hover:bg-muted/50 transition-all"
          >
            <div className="text-xs text-muted-foreground mb-1">← 上一篇</div>
            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border border-border p-4 opacity-50">
            <div className="text-xs text-muted-foreground mb-1">← 上一篇</div>
            <div className="text-muted-foreground text-sm">已经是第一篇</div>
          </div>
        )}
      </div>

      {/* 下一篇（右侧） */}
      <div className="flex-1 text-right">
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="group block rounded-lg border border-border p-4 hover:shadow-sm hover:bg-muted/50 transition-all"
          >
            <div className="text-xs text-muted-foreground mb-1">下一篇 →</div>
            <div className="font-medium text-foreground group-hover:text-primary transition-colors">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="rounded-lg border border-border p-4 opacity-50">
            <div className="text-xs text-muted-foreground mb-1">下一篇 →</div>
            <div className="text-muted-foreground text-sm">已经是最后一篇</div>
          </div>
        )}
      </div>
    </nav>
  );
}
