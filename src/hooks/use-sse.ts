/**
 * @file useSse Hook
 * @description 封装 EventSource 生命周期管理，提供 SSE 流式数据消费能力。
 *
 * 功能：
 *   - 连接/断开控制
 *   - 连接状态追踪（idle → connecting → connected → error）
 *   - 自定义事件类型分发（meta / token / done）
 *   - token 文本增量拼接
 *   - 原始事件日志收集（用于调试/展示 SSE 协议细节）
 *   - 组件卸载时自动清理连接
 *
 * 使用示例：
 *   const { status, events, fullText, connect, disconnect } = useSse();
 *   connect('/api/sse-demo?topic=sse-intro&speed=50');
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/** 单条 SSE 事件记录 */
export interface SseEvent {
  id: number;
  type: string;
  data: string;
  timestamp: number;
}

/** 连接状态枚举 */
export type SseStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useSse() {
  const [status, setStatus] = useState<SseStatus>('idle');
  const [events, setEvents] = useState<SseEvent[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);

  // 使用 ref 避免闭包陈旧问题，同时不触发不必要的重渲染
  const esRef = useRef<EventSource | null>(null);
  const counterRef = useRef(0);

  /** 拼接所有 token 得到完整文本 */
  const fullText = tokens.join('');

  /**
   * 建立 SSE 连接
   * @param url - SSE 端点 URL
   */
  const connect = useCallback((url: string) => {
    // 先断开旧连接
    if (esRef.current) {
      esRef.current.close();
    }

    // 重置状态
    setStatus('connecting');
    setEvents([]);
    setTokens([]);
    counterRef.current = 0;

    const es = new EventSource(url);
    esRef.current = es;

    // 打开连接
    es.onopen = () => {
      setStatus('connected');
    };

    // EventSource 在连接失败 / 服务端断连时会触发 onerror
    // 注意：EventSource 原生支持自动重连，CLOSED 状态才标记为 error
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus('error');
      }
    };

    /** 将事件追加到日志 */
    const addEvent = (type: string, data: string) => {
      counterRef.current += 1;
      setEvents((prev) => [
        ...prev,
        {
          id: counterRef.current,
          type,
          data,
          timestamp: Date.now(),
        },
      ]);
    };

    // 监听自定义 SSE 事件类型
    es.addEventListener('meta', (e: Event) => { // 服务端会先发送一个meta事件：告知客户端流的基本信息
      const msg = e as MessageEvent;
      addEvent('meta', msg.data);
    });

    // 服务端返回的流式数据
    es.addEventListener('token', (e: Event) => {
      const msg = e as MessageEvent;
      try {
        const parsed = JSON.parse(msg.data);
        setTokens((prev) => [...prev, parsed.text]);
      } catch {
        setTokens((prev) => [...prev, msg.data]);
      }
      addEvent('token', msg.data);
    });

    // 服务端数据发送完毕
    es.addEventListener('done', (e: Event) => {
      const msg = e as MessageEvent;
      addEvent('done', msg.data);
      setStatus('idle');
      es.close();
    });
  }, []);

  /** 手动断开连接 */
  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setStatus('idle');
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
    };
  }, []);

  return { status, events, tokens, fullText, connect, disconnect };
}
