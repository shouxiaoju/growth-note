/**
 * @file 关于页面
 * @description 个人介绍页面，包含：
 *   - 个人信息（头像占位、姓名、职业、简介）
 *   - 技术栈标签云
 *   - 联系方式（GitHub、邮箱等）
 *   - 网站搭建故事
 *
 * 当前为静态页面，数据直接写在组件中。
 * 未来可扩展为从配置文件或 CMS 读取。
 */

export default function AboutPage() {
  // 技术栈标签
  const techStack = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Vue',
    'Node.js',
    'Tailwind CSS',
    'HTML5',
    'CSS3',
    'Webpack',
    'Vite',
    'Git',
    'Prompt Engineering',
    'AI Agent',
    'RAG',
    '微信小程序',
  ];

  // 联系方式
  const contacts = [
    { icon: '💻', label: 'GitHub', value: 'github.com/liuxiansheng', href: '#' },
    { icon: '📧', label: '邮箱', value: 'liuxiansheng@example.com', href: 'mailto:liuxiansheng@example.com' },
    { icon: '💬', label: '微信', value: 'liuxiansheng_dev', href: undefined },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* ========== 个人信息区 ========== */}
      <div className="text-center mb-12">
        {/* 头像占位 */}
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
          👨‍💻
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">瘦小橘</h1>
        <p className="text-lg text-muted-foreground">前端开发工程师</p>
        <p className="text-muted-foreground mt-4 max-w-md mx-auto">
          热爱前端技术，专注于 React 生态和 AI 应用开发。
          坚信「记录所学，分析所思，沉淀所悟」，用笔记构建自己的知识体系。
        </p>
      </div>

      {/* ========== 技术栈标签云 ========== */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>🛠️</span> 技术栈
        </h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ========== 联系方式 ========== */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>📬</span> 联系方式
        </h2>
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.label}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              <span className="text-xl">{contact.icon}</span>
              <div>
                <div className="text-sm text-muted-foreground">
                  {contact.label}
                </div>
                {contact.href ? (
                  <a
                    href={contact.href}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {contact.value}
                  </a>
                ) : (
                  <span className="text-foreground">{contact.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== 关于本站 ========== */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span>📖</span> 关于本站
        </h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-foreground leading-7">
          <p>
            这是我的个人学习笔记网站，用来记录和整理平时学习的技术知识。
            参考菜鸟教程的分类风格 + MDN 的文档结构 + 阮一峰博客的个人风格，
            旨在打造一个分类清晰、搜索便捷的个人知识库。
          </p>
          <p>
            本站使用 <strong>Next.js</strong> 构建，内容使用{' '}
            <strong>MDX</strong> 格式编写，支持 Markdown 语法和 React 组件嵌入。
            代码推送到 Git 仓库即可自动部署更新。
          </p>
          <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg italic">
            「记录所学，分析所思，沉淀所悟」—— 这是本站的核心理念。
            不只是转载知识，更重要的是加入自己的分析和理解。
          </blockquote>
        </div>
      </section>
    </div>
  );
}
