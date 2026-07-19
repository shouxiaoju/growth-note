/**
 * @file SSE Demo API Route
 * @description 模拟 AI 大模型流式输出的 Server-Sent Events 端点。
 *
 * 请求格式：
 *   GET /api/sse-demo?topic=sse-intro&speed=50
 *
 * 查询参数：
 *   topic - 预置文本主题（sse-intro / sse-vs-ws / how-sse-works）
 *   speed - 每字输出间隔毫秒数（10-500，默认 50）
 *
 * SSE 事件类型：
 *   event: meta   → 元信息（主题、总字符数）
 *   event: token  → 单个字符的文本片段（逐字推送，模拟 LLM token 输出）
 *   event: done   → 流结束信号（含总 token 数统计）
 *
 * 连接管理：监听 request.signal 的 abort 事件，客户端断开时立即释放资源。
 */

export async function GET(request: Request) {
  // request.url 是标准 HTTP 网址，用 new URL 可以轻松拆解域名、路径、Query 参数。
  const { searchParams } = new URL(request.url); 
  // 获取请求参数中的输出速率
  const speed = Math.max(
    10,
    Math.min(500, parseInt(searchParams.get('speed') || '50', 10))
  );
  // 获取请求参数中的预置文本
  const topic = searchParams.get('topic') || 'sse-intro';

  // 根据参数获取文本
  const text = getTopicText(topic);

  const { signal } = request;
  
  // TextEncoder 将字符串编码为 Uint8Array
  const encoder = new TextEncoder(); 

  // ReadableStream 表示可读流它让你能够边生成边发送数据，而不是等所有数据都准备好再一次性返回
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 初始启动逻辑，可以在这里开始发送数据
        // 1. 发送 meta 事件：告知客户端流的基本信息
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({ topic, totalChars: text.length })}\n\n`
          )
        );

        // 2. 模拟 AI 思考延迟
        await delay(signal, 400);

        // 3. 逐字推送（模拟 LLM token 输出）
        for (let i = 0; i < text.length; i++) {
          if (signal.aborted) {
            controller.close();
            return;
          }

          const char = text[i];
          controller.enqueue(
            encoder.encode(
              `id: ${i + 1}\nevent: token\ndata: ${JSON.stringify({ text: char, index: i })}\n\n`
            )
          );

          // 随机微调间隔，模拟真实 LLM 输出节奏
          const jitter = Math.random() * 20 - 10;
          await delay(signal, speed + jitter);
        }

        // 4. 发送 done 事件：通知客户端流结束
        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ totalTokens: text.length })}\n\n`
          )
        );

        controller.close();
      } catch (err: unknown) {
        // AbortError 是正常情况（客户端主动断开），不需要记录
        if ((err as Error)?.name !== 'AbortError') {
          console.error('SSE stream error:', err);
        }
        controller.close();
      }
    },
  });

  // Response 表示 HTTP 响应
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // 禁用 nginx 缓冲（生产环境关键）
    },
  });
}

/** 支持 AbortSignal 的延迟函数 */
function delay(signal: AbortSignal, ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** 预置主题文本，用于模拟不同场景的流式输出 */
function getTopicText(topic: string): string {
  const topics: Record<string, string> = {
    'sse-intro':
      'Server-Sent Events（SSE）是一种服务器向客户端推送实时数据的技术。与传统的 HTTP 请求-响应模式不同，SSE 允许服务器在建立连接后，持续向客户端单向发送数据流。这使得它非常适合 AI 流式对话、实时通知、股票行情等场景。',
    'sse-vs-ws':
      'SSE 和 WebSocket 都是实时通信技术，但各有侧重。SSE 是单向的（服务器→客户端），基于标准 HTTP 协议，实现简单且天然支持断线重连。WebSocket 是全双工的，协议更复杂但适用于需要双向通信的场景如在线游戏。对于 AI 对话流式输出这种单向场景，SSE 是更轻量的选择。',
    'how-sse-works':
      'SSE 的工作原理很简单：客户端通过 EventSource API 发起一个 HTTP GET 请求，服务器返回 Content-Type: text/event-stream 响应头，然后保持连接不关闭。服务器可以随时向这个连接写入数据，格式为 event 字段加 data 字段。客户端通过监听对应事件类型来接收数据。',
  };
  return topics[topic] || Object.values(topics)[0];
}
