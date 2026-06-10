/**
 * @file 搜索弹窗组件（客户端组件）
 * @description 全局搜索功能，支持：
 *   - 输入关键词实时搜索文章（标题、描述、标签匹配）
 *   - 搜索结果高亮显示匹配的分类标签
 *   - 键盘快捷键 Ctrl+K / Cmd+K 唤起
 *   - ESC 键或点击遮罩层关闭
 *   - 搜索防抖（300ms），避免频繁请求
 *
 * 数据流：
 *   用户输入 → 防抖 300ms → GET /api/search?q=xxx → 返回匹配文章列表 → 渲染结果
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ArticleMeta } from '@/lib/content';

interface SearchDialogProps {
  open: boolean;    // 弹窗是否打开
  onClose: () => void; // 关闭回调
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  // 搜索关键词
  const [query, setQuery] = useState('');
  // 搜索结果列表
  const [results, setResults] = useState<ArticleMeta[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // 打开时聚焦输入框
      setQuery('');
      setResults([]);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 防抖搜索：输入变化后 300ms 发起请求
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // 搜索失败时静默处理，保留上次结果
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms 防抖

    return () => clearTimeout(timer);
  }, [query]);

  // 从分类路径提取子分类名用于标签展示
  const getCategoryLabel = (category: string) => {
    const parts = category.split('/');
    return parts[parts.length - 1];
  };

  if (!open) return null;

  return (
    // 遮罩层
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      {/* 弹窗主体 */}
      <div
        className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <span className="text-muted-foreground">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索笔记..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          {/* 关闭快捷键提示 */}
          <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* 搜索结果列表 */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              搜索中...
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              未找到相关笔记
            </div>
          )}

          {!loading &&
            results.map((article) => (
              <Link
                key={article.slug}
                href={`/docs/${article.slug}`}
                className="block px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                onClick={onClose}
              >
                <div className="flex items-center gap-2">
                  {/* 分类标签 */}
                  <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {getCategoryLabel(article.category)}
                  </span>
                  <span className="font-medium text-foreground text-sm">
                    {article.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {article.description}
                </p>
              </Link>
            ))}

          {/* 初始状态提示 */}
          {!loading && !query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              输入关键词开始搜索
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
