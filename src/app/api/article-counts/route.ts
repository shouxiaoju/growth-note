/**
 * @file 文章计数 API 路由
 * @description 为侧边栏提供分类树数据（含文章计数），供客户端组件 Sidebar 动态获取。
 *
 * 请求格式：
 *   GET /api/article-counts
 *
 * 响应格式：
 *   成功 → HTTP 200 + CategoryNode[] JSON 数组
 *
 * 为什么需要此接口：
 *   Sidebar 是客户端组件，不能直接导入 content.ts（依赖 Node.js 的 fs 模块），
 *   因此通过 API Route 在服务端读取文件系统后返回数据给客户端。
 */

import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/content';

export async function GET() {
  const categories = getCategories();
  return NextResponse.json(categories);
}
