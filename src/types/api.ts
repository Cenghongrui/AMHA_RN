import type { AxiosRequestConfig } from 'axios';

export type Id = number | string;
export type SenderType = 1 | 2;
export type SessionStatus = 'TEMP' | 'ACTIVE' | 'CLOSED' | 'COMPLETED';
export type UserType = 1 | 2;

export interface ApiEnvelope<T> {
  code: string | number;
  data: T;
  msg?: string;
  message?: string;
}

export interface HttpClient {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current?: number;
  size?: number;
  pages?: number;
}

export interface PaginationQuery {
  currentPage?: number;
  size?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface UserInfo {
  id?: Id;
  username?: string;
  nickname?: string;
  userType: UserType;
  email?: string;
  phone?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  gender: number;
  userType: UserType;
  nickname: string;
}

export interface StartSessionRequest {
  initialMessage: string;
  sessionTitle: string;
}

export interface StartSessionResult {
  sessionId: string;
  status: SessionStatus;
}

export interface CurrentSession {
  sessionId: string;
  status: SessionStatus;
  sessionTitle: string;
}

export interface ChatSession {
  id: Id;
  sessionId?: string;
  status?: SessionStatus;
  sessionTitle: string;
  startedAt?: string;
  startetAt?: string;
  lastMessageContent?: string;
  lastMessageTime?: string;
  messageCount?: number;
  durationMinutes?: number;
}

export interface ChatMessage {
  id: Id;
  senderType: SenderType;
  content: string;
  createdAt: string;
  isError?: boolean;
}

export interface SessionPageQuery extends PaginationQuery {
  userId?: Id;
}

export interface EmotionAnalysis {
  primaryEmotion: string;
  emotionScore: number;
  isNegative: boolean;
  riskLevel: number;
  suggestion: string;
  riskDescription?: string;
  improvementSuggestions: string[];
}

export interface StreamChatRequest {
  sessionId: string;
  userMessage: string;
}

export interface StreamChunkPayload {
  content?: string;
}

export interface StreamChunk {
  code: string | number;
  data?: StreamChunkPayload;
  message?: string;
  msg?: string;
}

export interface EmotionDiaryRequest {
  moodScore: number;
  sleepQuality: number;
  stressLevel: number;
  dominantEmotion?: string;
  emotionTriggers?: string;
  diaryContent: string;
  diaryDate?: string;
}

export type ArticleStatus = 0 | 1 | 2;

export interface ArticlePageQuery extends PaginationQuery {
  title?: string;
  categoryId?: number | string;
  status?: ArticleStatus | '';
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ArticleListItem {
  id: Id;
  title: string;
  categoryId?: number;
  categoryName?: string;
  authorName?: string;
  readCount?: number;
  updatedAt?: string;
  publishedAt?: string;
  coverImage?: string;
  summary?: string;
  content?: string;
  tags?: string;
  tagArray?: string[];
  status?: ArticleStatus;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  coverImage: string;
  categoryId: number;
  summary: string;
  tags: string;
}
