// Phosphor icon for each lesson topic (English and Arabic names), shared by cards and lesson pages.
export const TOPIC_ICON: Record<string, string> = {
  Prompting: 'chat-text', 'كتابة البرومبت': 'chat-text',
  Productivity: 'lightning', 'الإنتاجية': 'lightning',
  Business: 'briefcase', 'الأعمال': 'briefcase',
  Automation: 'flow-arrow', 'الأتمتة': 'flow-arrow',
  Finance: 'calculator', 'المالية': 'calculator',
  CMA: 'graduation-cap', ChatGPT: 'chat-circle-dots', Claude: 'sparkle',
  Excel: 'table', 'Power BI': 'chart-bar', Word: 'file-text', Outlook: 'envelope-simple', Teams: 'users-three',
};
export const topicIcon = (topic: string) => TOPIC_ICON[topic] || 'book-open';
