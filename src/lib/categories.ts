/**
 * @file 分类配置文件（客户端安全）
 * @description 定义笔记站点的分类体系结构，包括分类层级、图标、描述等展示信息。
 *              本文件不依赖 Node.js 模块（如 fs），可安全在客户端组件中导入。
 *              而内容读取逻辑（如文章计数）放在 content.ts（服务端）中处理。
 *
 * 数据结构层级：
 *   顶级分类（CategoryInfo）→ 子分类（SubCategoryInfo）→ 文章（ArticleMeta，见 content.ts）
 *
 * 对应路由映射：
 *   /docs/frontend/html       → 前端开发 / HTML5
 *   /docs/ai/prompt-engineering → AI 开发 / Prompt 工程
 */

/** 顶级分类信息，用于侧边栏、首页分类卡片等展示 */
export interface CategoryInfo {
  name: string;         // 分类显示名称，如"前端开发"
  slug: string;         // URL 路径标识，如"frontend"
  icon: string;         // 图标 emoji，如"🌐"
  description: string;  // 分类描述文本
  children: SubCategoryInfo[]; // 子分类列表
  articleCount: number; // 该分类下文章总数（由 content.ts 填充）
}

/** 子分类下的文章摘要（用于侧边栏展开后的文章列表） */
export interface ArticleSummary {
  title: string;
  slug: string;
}

/** 子分类信息，对应每个技术方向 */
export interface SubCategoryInfo {
  name: string;         // 子分类显示名称，如"HTML5"
  slug: string;         // 完整 URL 路径标识，如"frontend/html"
  articleCount: number; // 该子分类下文章数（由 content.ts 填充）
  articles: ArticleSummary[]; // 该子分类下的文章列表（用于侧边栏展开）
}

/**
 * 分类配置表
 * key: 顶级分类 slug（对应 content/ 目录下的文件夹名）
 * value: 分类展示配置
 *
 * ⚠️ 新增分类步骤：
 *   1. 在此对象中添加配置
 *   2. 在 content/ 目录下创建对应的文件夹和 MDX 文件
 *   3. MDX 文件的 frontmatter 中 category 字段需匹配 "key/childKey" 格式
 */
export const categoryConfig: Record<string, { name: string; icon: string; description: string; children: Record<string, string> }> = {
  frontend: {
    name: '前端开发',
    icon: '🌐',
    description: 'HTML · CSS · JS · React · TS · 小程序',
    children: {
      html: 'HTML5',
      css: 'CSS3',
      javascript: 'JavaScript',
      react: 'React',
      typescript: 'TypeScript',
      //miniapp: '微信小程序',
    },
  },
  backend: {
    name: '后端开发',
    icon: '🖥️',
    description: 'Java · Spring Boot · MySQL（即将上线）',
    children: {
      java: 'Java',
      springboot: 'Spring Boot',
      mysql: 'MySQL',
      python:'Python'
    },
  },
  ai: {
    name: 'AI / 智能开发',
    icon: '🤖',
    description: 'Prompt · Agent · RAG · 工具链 · 大模型',
    children: {
      'prompt-engineering': 'Prompt 工程',
      'agent-development': 'Agent 开发',
      'ai-tools': 'AI 工具',
      rag: 'RAG',
      llm: '大模型',
    },
  },
};
