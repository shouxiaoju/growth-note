/**
 * @file 动态图标组件
 * @description 根据图标名称字符串渲染对应的 lucide-react 图标。
 *              用于 categories.ts 等数据驱动的图标场景。
 */
import {
  BookOpen,
  Pin,
  Folder,
  Tag,
  Calendar,
  FileText,
  PenLine,
  Search,
  Sun,
  Moon,
  X,
  Menu,
  User,
  Wrench,
  Mail,
  Globe,
  Monitor,
  Bot,
  Github,
  MessageCircle,
  Code2,
  Server,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/** 图标名称到 lucide 组件的映射表 */
const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  pin: Pin,
  folder: Folder,
  tag: Tag,
  calendar: Calendar,
  'file-text': FileText,
  'pen-line': PenLine,
  search: Search,
  sun: Sun,
  moon: Moon,
  x: X,
  menu: Menu,
  user: User,
  wrench: Wrench,
  mail: Mail,
  globe: Globe,
  monitor: Monitor,
  bot: Bot,
  github: Github,
  'message-circle': MessageCircle,
  'code-2': Code2,
  server: Server,
  sparkles: Sparkles,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * 根据名称动态渲染 lucide 图标
 * @param name - 图标名称，需在 iconMap 中注册
 * @param className - 额外的 CSS 类名
 * @param size - 图标大小，默认 24
 */
export function DynamicIcon({ name, className, size }: DynamicIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} size={size} />;
}

export { iconMap };
export type { DynamicIconProps };
