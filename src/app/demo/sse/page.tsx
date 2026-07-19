/**
 * @file SSE 流式输出 Demo 页面
 * @description 演示 Server-Sent Events 的完整工作流程，模拟 AI 大模型逐字输出效果。
 *   左侧展示流式文本（带打字机光标），右侧展示原始 SSE 事件日志。
 *   访问路径：/demo/sse
 */

'use client';

import { useState, useCallback } from 'react';
import { useSse } from '@/hooks/use-sse';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

/** 预置主题选项 */
const TOPICS = [
  { value: 'sse-intro', label: 'SSE 是什么' },
  { value: 'sse-vs-ws', label: 'SSE vs WebSocket' },
  { value: 'how-sse-works', label: 'SSE 工作原理' },
];

/** 速度选项 */
const SPEEDS = [
  { value: '20', label: '🚀 快 (20ms)' },
  { value: '50', label: '⚡ 中 (50ms)' },
  { value: '150', label: '🐢 慢 (150ms)' },
];

/** 连接状态对应的 Badge 样式 */
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  idle: { label: '⏳ 空闲', variant: 'outline' },
  connecting: { label: '🔗 连接中...', variant: 'secondary' },
  connected: { label: '🟢 已连接', variant: 'default' },
  error: { label: '🔴 连接失败', variant: 'destructive' },
};

export default function SseDemoPage() {
  const { status, events, fullText, connect, disconnect } = useSse();
  const [topic, setTopic] = useState('sse-intro');
  const [speed, setSpeed] = useState('50');

  const isStreaming = status === 'connecting' || status === 'connected';

  const handleStart = useCallback(() => {
    connect(`/api/sse-demo?topic=${topic}&speed=${speed}`);
  }, [connect, topic, speed]);

  const handleStop = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const currentStatus = statusConfig[status];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* ===== 标题区 ===== */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">SSE 流式输出 Demo</h1>
        <p className="text-muted-foreground mt-2">
          模拟 AI 大模型逐字输出，右侧实时展示底层 SSE 协议事件
        </p>
      </header>

      {/* ===== 控制面板 ===== */}
      <div className="flex flex-wrap items-end gap-4 mb-6 p-4 rounded-lg border border-border bg-card">
        {/* 主题选择 */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground font-medium">对话主题</span>
          <Select value={topic} onValueChange={setTopic} disabled={isStreaming}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 速度选择 */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs text-muted-foreground font-medium">输出速度</span>
          <Select value={speed} onValueChange={setSpeed} disabled={isStreaming}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEEDS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 按钮组 */}
        <div className="flex items-center gap-2">
          <Button onClick={handleStart} disabled={isStreaming}>
            ▶ 开始
          </Button>
          <Button onClick={handleStop} disabled={!isStreaming} variant="outline">
            ■ 停止
          </Button>
        </div>

        {/* 状态标签 */}
        <div className="flex items-center">
          <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
        </div>

        {/* 统计 */}
        <span className="text-xs text-muted-foreground ml-auto">
          收到 <span className="font-mono font-semibold text-foreground">{events.length}</span> 个事件
          &nbsp;|&nbsp;
          输出 <span className="font-mono font-semibold text-foreground">{fullText.length}</span> 字
        </span>
      </div>

      {/* ===== 主内容区：双栏布局 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：流式文本展示 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              流式输出效果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[280px] rounded-lg border border-border bg-muted/30 p-5">
              {fullText ? (
                <p className="text-foreground leading-7 whitespace-pre-wrap break-all">
                  {fullText}
                  {isStreaming && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
                </p>
              ) : (
                <p className="text-muted-foreground leading-7 italic">
                  {isStreaming
                    ? '等待第一个 token...'
                    : '点击上方「开始」按钮，模拟 AI 大模型流式输出'}
                </p>
              )}
            </div>

            {/* 完成提示 */}
            {fullText && !isStreaming && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {events.some((e) => e.type === 'done')
                  ? `✅ 流式输出完成 · ${events.length} 个 SSE 事件 · ${fullText.length} 个字符`
                  : `⏹ 已手动停止 · 已输出 ${fullText.length} 个字符`}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 右侧：原始事件日志 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              SSE 事件日志
              <span className="text-xs text-muted-foreground font-normal ml-auto">
                event: type / data: payload
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] rounded-lg border border-border bg-muted/30 p-3">
              {events.length > 0 ? (
                <div className="space-y-1 font-mono text-xs">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex gap-2 py-0.5 border-b border-border/30 last:border-0"
                    >
                      <span className="shrink-0 text-muted-foreground w-7 text-right">
                        #{evt.id}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 h-4 px-1 text-[10px] font-mono"
                      >
                        {evt.type}
                      </Badge>
                      <span className="text-foreground truncate" title={evt.data}>
                        {evt.data}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-12">
                  暂无事件，开始 SSE 连接后将在此展示每条原始事件
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* ===== 底部：SSE 知识点 ===== */}
      {/* <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">📖 这个 Demo 涉及哪些 SSE 知识点</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[
              {
                title: 'Content-Type',
                desc: '服务端设置 text/event-stream 响应头，浏览器识别为 SSE 流而非普通 HTTP 响应。',
              },
              {
                title: 'Event 格式',
                desc: 'event: / data: / id: / retry: 四个字段组成标准 SSE 消息格式，事件之间以空行分隔。',
              },
              {
                title: '自定义事件类型',
                desc: '通过 event: token / meta / done 区分不同事件，客户端用 addEventListener 监听。',
              },
              {
                title: '增量拼接',
                desc: '客户端逐字接收 token 事件，累积拼接为完整文本，实现打字机效果。',
              },
              {
                title: 'EventSource API',
                desc: '浏览器原生 API，支持自动重连、自定义事件监听，比 fetch + ReadableStream 更简单。',
              },
              {
                title: '连接管理',
                desc: '服务端监听 AbortSignal 检测客户端断开，客户端通过 close() 主动断开并清理资源。',
              },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded-md bg-background border border-border">
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
