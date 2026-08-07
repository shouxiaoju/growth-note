/**
 * @file 代码块复制按钮（客户端组件）
 * @description 点击按钮将代码文本复制到剪贴板，复制成功后显示勾号图标
 */

'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  /** 返回要复制的文本内容 */
  getText: () => string;
}

export function CopyButton({ getText }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 降级方案：使用 textarea 兼容旧浏览器
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getText]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/code-block:opacity-100 focus:opacity-100"
      aria-label={copied ? '已复制' : '复制代码'}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
