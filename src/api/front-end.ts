import { fetch as expoFetch } from 'expo/fetch';

import service, { API_BASE_URL } from '@/src/utils/request';
import type {
  ArticleDetail,
  ArticleListItem,
  ArticlePageQuery,
  ChatMessage,
  ChatSession,
  EmotionAnalysis,
  EmotionDiaryRequest,
  Id,
  LoginRequest,
  LoginResult,
  PageResult,
  RegisterRequest,
  SessionPageQuery,
  StartSessionRequest,
  StartSessionResult,
  StreamChatRequest,
  StreamChunk,
} from '@/src/types/api';
import { tokenStorage } from '@/src/utils/token-storage';
import { notifyAuthExpired } from '@/src/utils/auth-events';

export async function login(data: LoginRequest): Promise<LoginResult> {
  const result = await service.post<LoginResult, LoginRequest>('/user/login', data);

  if (result.token) {
    tokenStorage.setToken(result.token);
  }

  return result;
}

export function register(data: RegisterRequest): Promise<unknown> {
  return service.post<unknown, RegisterRequest>('/user/add', data);
}

export async function logout(): Promise<unknown> {
  try {
    return await service.post('/user/logout');
  } finally {
    tokenStorage.removeToken();
  }
}

export function startSession(data: StartSessionRequest): Promise<StartSessionResult> {
  return service.post<StartSessionResult, StartSessionRequest>('/psychological-chat/session/start', data);
}

export function getSessionHistory(params: SessionPageQuery): Promise<PageResult<ChatSession>> {
  return service.get<PageResult<ChatSession>>('/psychological-chat/sessions', { params });
}

export function deleteSession(sessionId: Id): Promise<unknown> {
  return service.delete(`/psychological-chat/sessions/${sessionId}`);
}

export function getSessionMessages(sessionId: Id): Promise<ChatMessage[]> {
  return service.get<ChatMessage[]>(`/psychological-chat/sessions/${sessionId}/messages`);
}

export function getSessionEmotion(sessionId: Id): Promise<EmotionAnalysis> {
  const normalizedId = String(sessionId).startsWith('session_') ? sessionId : `session_${sessionId}`;

  return service.get<EmotionAnalysis>(`/psychological-chat/session/${normalizedId}/emotion`);
}

export function addEmotionDiary(data: EmotionDiaryRequest): Promise<unknown> {
  return service.post<unknown, EmotionDiaryRequest>('/emotion-diary', data);
}

export function getKnowledgeList(params: ArticlePageQuery): Promise<PageResult<ArticleListItem>> {
  return service.get<PageResult<ArticleListItem>>('/knowledge/article/page', { params });
}

export function getArticleDetail(id: Id): Promise<ArticleDetail> {
  return service.get<ArticleDetail>(`/knowledge/article/${id}`);
}

export function getStreamChatUrl() {
  return `${API_BASE_URL}/psychological-chat/stream`;
}

export async function streamChatMessage(data: StreamChatRequest, onChunk: (content: string) => void) {
  const response = await expoFetch(getStreamChatUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Token: tokenStorage.getToken(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('当前运行环境不支持流式读取');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const eventName = part
        .split('\n')
        .find((line) => line.startsWith('event:'))
        ?.replace('event:', '')
        .trim();

      if (eventName === 'done') {
        return fullContent;
      }

      const dataLine = part
        .split('\n')
        .find((line) => line.startsWith('data:'))
        ?.replace('data:', '')
        .trim();

      if (!dataLine) {
        continue;
      }

      const payload = JSON.parse(dataLine) as StreamChunk;
      const ok = String(payload.code) === '200';
      const content = payload.data?.content || '';

      if (!ok) {
        if (String(payload.code) === '-1') {
          tokenStorage.removeToken();
          notifyAuthExpired(payload.message || payload.msg || '登录状态已过期，请重新登录');
        }

        throw new Error(payload.message || payload.msg || 'AI回复失败');
      }

      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }
  }

  return fullContent;
}
