import type { ArticleListItem, ChatSession, EmotionAnalysis } from '@/src/types/api';

export const mockHistory: ChatSession[] = [
  {
    id: 1001,
    sessionTitle: '最近一次压力疏导',
    lastMessageContent: '我们一起把压力来源拆小一点，再决定下一步。',
    startetAt: '今天 14:30',
    messageCount: 12,
    durationMinutes: 18,
  },
  {
    id: 1002,
    sessionTitle: '睡眠状态复盘',
    lastMessageContent: '睡前减少信息输入，给大脑一个缓冲区。',
    startetAt: '昨天 22:18',
    messageCount: 9,
    durationMinutes: 12,
  },
  {
    id: 1003,
    sessionTitle: '焦虑触发因素整理',
    lastMessageContent: '先识别触发点，再设计可执行的应对动作。',
    startetAt: '06-02 19:05',
    messageCount: 16,
    durationMinutes: 25,
  },
];

export const mockArticles: ArticleListItem[] = [
  {
    id: 1,
    title: '焦虑来临时，如何先稳住身体反应',
    categoryName: '焦虑调节',
    authorName: '宁渡AI',
    readCount: 1280,
    summary: '从呼吸、肌肉放松和注意力转移三个角度，建立短时自我稳定方法。',
  },
  {
    id: 2,
    title: '睡前反刍停不下来怎么办',
    categoryName: '睡眠',
    authorName: '宁渡AI',
    readCount: 946,
    summary: '用记录、延迟思考和睡前仪式感，降低夜晚大脑过度活跃。',
  },
  {
    id: 3,
    title: '情绪日记为什么能帮助自我理解',
    categoryName: '情绪管理',
    authorName: '宁渡AI',
    readCount: 1732,
    summary: '把感受、事件和行为放在一起看，能更容易找到情绪模式。',
  },
];

export const defaultEmotion: EmotionAnalysis = {
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态平稳正常',
  riskDescription: '',
  improvementSuggestions: ['记录一次今天的小变化', '安排一段不被打扰的休息时间'],
};

export const suggestedPrompts = ['我今天有点焦虑', '帮我整理一下压力来源', '我想做一次情绪复盘'];
