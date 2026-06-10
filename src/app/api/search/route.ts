/**
 * @file 搜索 API 路由
 * @description 提供全文搜索接口，在文章标题、描述、标签中匹配关键词。
 *
 * 请求格式：
 *   GET /api/search?q=关键词
 *
 * 响应格式：
 *   成功 → HTTP 200 + ArticleMeta[] JSON 数组
 *   无关键词 → HTTP 200 + 空数组 []
 *
 * 使用场景：
 *   - 搜索弹窗（SearchDialog 组件）实时调用
 *   - 未来可扩展为 Algolia DocSearch 的替代方案
 */

import { NextResponse } from 'next/server';
import { searchArticles } from '@/lib/content';

export async function GET(request: Request) {
  // 从 URL 查询参数获取搜索关键词
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  // 无关键词时返回空结果
  if (!query.trim()) {
    return NextResponse.json([]);
  }

  // 调用内容模块的搜索函数
  const results = searchArticles(query);
  return NextResponse.json(results);
}
