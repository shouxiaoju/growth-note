/**
 * @file 主题提供者组件（客户端组件）
 * @description 基于 next-themes 封装的主题提供者，实现暗黑模式切换功能：
 *   - 支持三种模式：light（浅色）、dark（暗色）、system（跟随系统）
 *   - 通过在 <html> 标签上添加/移除 class="dark" 实现主题切换
 *   - 主题偏好自动持久化到 localStorage
 *   - 页面加载时立即应用主题，避免闪烁（FOUC）
 *
 * 使用方式：
 *   在根布局 layout.tsx 中包裹所有子组件：
 *   <ThemeProvider>
 *     <Header />  ← 可通过 useTheme() 读取和修改主题
 *     {children}
 *   </ThemeProvider>
 *
 * 注意：suppressHydrationWarning 需在 <html> 标签上设置，
 *       因为 next-themes 会在客户端修改 <html> 的 class，
 *       导致服务端和客户端 HTML 不完全一致。
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"          // 通过 class="dark" 切换主题
      defaultTheme="system"       // 默认跟随系统
      enableSystem                // 启用系统偏好检测
      disableTransitionOnChange   // 切换时禁用过渡动画，避免闪烁
    >
      {children}
    </NextThemesProvider>
  );
}
