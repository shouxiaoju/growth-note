/**
 * @file 代码块容器组件（客户端组件）
 * @description 包装 <pre> 元素，添加复制按钮和相对定位容器。
 *   复制按钮默认隐藏，hover 代码块时显示。
 */

'use client';

import { useRef, useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import { CopyButton } from './copy-button';

export function PreBlock(props: HTMLAttributes<HTMLPreElement>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 从容器内的 <code> 元素中提取纯文本
  const getText = useCallback(() => {
    const code = containerRef.current?.querySelector('code');
    return code?.textContent ?? '';
  }, []);

  return (
    <div ref={containerRef} className="relative group/code-block">
      <CopyButton getText={getText} />
      <pre
        {...props}
        className="bg-muted text-foreground rounded-lg p-4 my-4 text-sm border border-border overflow-x-hidden"
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
    </div>
  );
}
