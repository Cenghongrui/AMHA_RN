import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, PanResponder, ScrollView, StyleSheet, TextInput as NativeTextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getArticleDetail,
  getKnowledgeList,
  getSessionEmotion,
  getSessionHistory,
  getSessionMessages,
  startSession,
  streamChatMessage,
} from '@/src/api/front-end';
import { AuthModal } from '@/src/components/AuthModal';
import { ArticleDetailModal } from '@/src/components/chat/article-detail-modal';
import { ChatHeader } from '@/src/components/chat/chat-header';
import { ChatInput } from '@/src/components/chat/chat-input';
import { HistoryDrawer } from '@/src/components/chat/history-drawer';
import { KnowledgeModal } from '@/src/components/chat/knowledge-modal';
import { MessageList } from '@/src/components/chat/message-list';
import { defaultEmotion, mockArticles, mockHistory, suggestedPrompts } from '@/src/constants/chat';
import type { ArticleDetail, ArticleListItem, ChatMessage, ChatSession, CurrentSession, EmotionAnalysis } from '@/src/types/api';
import { subscribeAuthEvent } from '@/src/utils/auth-events';
import { getErrorMessage } from '@/src/utils/error';
import { getRiskText } from '@/src/utils/risk';
import { tokenStorage } from '@/src/utils/token-storage';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(340, width * 0.86);
  const inputRef = useRef<NativeTextInput | null>(null);
  const messagesScrollRef = useRef<ScrollView | null>(null);
  const drawerTranslateX = useRef(new Animated.Value(-drawerWidth)).current;
  const drawerBackdropOpacity = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [knowledgeVisible, setKnowledgeVisible] = useState(false);
  const [articleDetailVisible, setArticleDetailVisible] = useState(false);
  const [articleDetailLoading, setArticleDetailLoading] = useState(false);
  const [articleDetailError, setArticleDetailError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | ArticleListItem | null>(null);
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    sessionId: `temp_${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新会话',
  });
  const [sessionHistory, setSessionHistory] = useState<ChatSession[]>(mockHistory);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis>(defaultEmotion);
  const [articles, setArticles] = useState<ArticleListItem[]>(mockArticles);
  const [inputFocused, setInputFocused] = useState(false);
  const [authVisible, setAuthVisible] = useState(() => !tokenStorage.getToken());
  const [authReason, setAuthReason] = useState(() =>
    tokenStorage.getToken() ? '' : '请先登录，登录后即可同步会话历史和情绪记录',
  );

  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
  }, []);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        toValue: -drawerWidth,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(drawerBackdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
    });
  }, [drawerBackdropOpacity, drawerTranslateX, drawerWidth]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 42 && Math.abs(gesture.dy) < 28,
        onPanResponderRelease: (_, gesture) => {
          if (!drawerVisible && Math.abs(gesture.dx) > 72) {
            openDrawer();
          }

          if (drawerVisible && gesture.dx < -64) {
            closeDrawer();
          }
        },
      }),
    [closeDrawer, drawerVisible, openDrawer],
  );

  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      messagesScrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuthEvent((event) => {
      setAuthReason(event.message);
      setAuthVisible(true);
    });

    if (!tokenStorage.getToken()) {
      setAuthReason('请先登录，登录后即可同步会话历史和情绪记录');
      setAuthVisible(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToLatestMessage(true);
    }
  }, [messages, scrollToLatestMessage]);

  useEffect(() => {
    loadSessionHistory();
    loadKnowledge();
  }, []);

  useEffect(() => {
    if (!drawerVisible) {
      return;
    }

    drawerTranslateX.setValue(-drawerWidth);
    drawerBackdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(drawerBackdropOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerBackdropOpacity, drawerTranslateX, drawerVisible, drawerWidth]);

  useEffect(() => {
    const showEvent = process.env.EXPO_OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = process.env.EXPO_OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = Math.max(event.endCoordinates.height - insets.bottom, 0);

      Animated.timing(keyboardOffset, {
        toValue: keyboardHeight,
        duration: event.duration && event.duration > 0 ? event.duration : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => scrollToLatestMessage(true));
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event.duration && event.duration > 0 ? event.duration : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom, keyboardOffset, scrollToLatestMessage]);

  const loadSessionHistory = async () => {
    try {
      const res = await getSessionHistory({ pageNum: 1, pageSize: 20 });

      if (res.records?.length) {
        setSessionHistory(res.records);
      }
    } catch {
      setSessionHistory(mockHistory);
    }
  };

  const loadKnowledge = async () => {
    try {
      const res = await getKnowledgeList({
        sortField: 'publishedAt',
        sortDirection: 'desc',
        currentPage: 1,
        size: 8,
      });

      if (res.records?.length) {
        setArticles(res.records);
      }
    } catch {
      setArticles(mockArticles);
    }
  };

  const createNewSession = () => {
    setCurrentSession({
      sessionId: `temp_${Date.now()}`,
      status: 'TEMP',
      sessionTitle: '新会话',
    });
    setMessages([]);
    setCurrentEmotion(defaultEmotion);
    if (drawerVisible) {
      closeDrawer();
    }
  };

  const selectSession = async (item: ChatSession) => {
    closeDrawer();
    setCurrentSession({
      sessionId: `session_${item.id}`,
      status: 'ACTIVE',
      sessionTitle: item.sessionTitle,
    });

    try {
      const [sessionMessages, emotion] = await Promise.all([getSessionMessages(item.id), getSessionEmotion(item.id)]);
      setMessages(sessionMessages);
      setCurrentEmotion(emotion);
    } catch {
      setMessages([
        {
          id: `history_${item.id}`,
          senderType: 2,
          content: item.lastMessageContent || '这条历史会话暂时无法从接口拉取，稍后可以重试。',
          createdAt: item.lastMessageTime || item.startetAt || item.startedAt || '',
        },
      ]);
    }
  };

  const applySuggestion = (prompt: string) => {
    setInputValue(prompt);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openArticleDetail = async (item: ArticleListItem) => {
    setArticleDetailVisible(true);
    setSelectedArticle(item);
    setArticleDetailError('');
    setArticleDetailLoading(true);

    try {
      const detail = await getArticleDetail(item.id);
      setSelectedArticle(detail);
    } catch (error) {
      setArticleDetailError(getErrorMessage(error, '文章详情加载失败，请稍后重试'));
    } finally {
      setArticleDetailLoading(false);
    }
  };

  const closeArticleDetail = () => {
    setArticleDetailVisible(false);
    setArticleDetailError('');
  };

  const handleAuthenticated = () => {
    setAuthVisible(false);
    setAuthReason('');
    createNewSession();
    loadSessionHistory();
    loadKnowledge();
  };

  const sendMessage = async () => {
    const content = inputValue.trim();

    if (!content || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      senderType: 1,
      content,
      createdAt: '刚刚',
    };

    setInputValue('');
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    let activeSessionId = currentSession.sessionId;
    let aiMessageId = '';

    try {
      if (currentSession.status === 'TEMP') {
        const sessionTitle = `宁渡AI - ${new Date().toLocaleString()}`;
        const res = await startSession({
          initialMessage: content,
          sessionTitle,
        });

        activeSessionId = res.sessionId;
        setCurrentSession({
          sessionId: res.sessionId,
          status: res.status,
          sessionTitle,
        });
        loadSessionHistory();
      }

      aiMessageId = `ai_${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          senderType: 2,
          content: '',
          createdAt: '正在输入中...',
        },
      ]);

      const fullContent = await streamChatMessage(
        {
          sessionId: activeSessionId,
          userMessage: content,
        },
        (chunk) => {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === aiMessageId
                ? {
                    ...item,
                    content: item.content + chunk,
                  }
                : item,
            ),
          );
        },
      );

      setMessages((prev) =>
        prev.map((item) =>
          item.id === aiMessageId
            ? {
                ...item,
                content: fullContent || item.content || '我在这里，继续和我说说吧。',
                createdAt: '刚刚',
              }
            : item,
        ),
      );

      try {
        const emotion = await getSessionEmotion(activeSessionId);
        setCurrentEmotion(emotion);
      } catch {
        setCurrentEmotion(defaultEmotion);
      }
    } catch {
      const fallbackMessage: ChatMessage = {
        id: aiMessageId || `ai_${Date.now()}`,
        senderType: 2,
        content: '我听到了。这个版本先完成移动端页面和接口封装，后续接入登录后我会把这里替换成真实流式回复。',
        createdAt: '刚刚',
      };

      setMessages((prev) => {
        if (!aiMessageId) {
          return [...prev, fallbackMessage];
        }

        return prev.map((item) => (item.id === aiMessageId ? fallbackMessage : item));
      });
    } finally {
      setIsSending(false);
    }
  };

  const hasMessages = messages.length > 0;
  const riskText = getRiskText(currentEmotion.riskLevel);

  return (
    <View style={styles.screen} {...panResponder.panHandlers}>
      <ChatHeader
        topInset={insets.top}
        onCreateNewSession={createNewSession}
        onOpenDrawer={openDrawer}
        onOpenKnowledge={() => setKnowledgeVisible(true)}
      />

      <View style={styles.chatBody}>
        <MessageList
          ref={messagesScrollRef}
          messages={messages}
          suggestedPrompts={suggestedPrompts}
          onApplySuggestion={applySuggestion}
          onContentChanged={() => hasMessages && scrollToLatestMessage(true)}
          onLayoutReady={() => hasMessages && scrollToLatestMessage(false)}
        />

        <ChatInput
          bottomInset={insets.bottom}
          inputFocused={inputFocused}
          inputRef={inputRef}
          isSending={isSending}
          suggestedPrompts={suggestedPrompts}
          value={inputValue}
          onApplySuggestion={applySuggestion}
          onBlur={() => setInputFocused(false)}
          onChangeText={setInputValue}
          onFocus={() => setInputFocused(true)}
          onSend={sendMessage}
        />
        <Animated.View style={[styles.keyboardSpacer, { height: keyboardOffset }]} />
      </View>

      <HistoryDrawer
        backdropOpacity={drawerBackdropOpacity}
        currentEmotion={currentEmotion}
        drawerWidth={drawerWidth}
        riskText={riskText}
        sessionHistory={sessionHistory}
        topInset={insets.top}
        translateX={drawerTranslateX}
        visible={drawerVisible}
        onClose={closeDrawer}
        onCreateNewSession={createNewSession}
        onSelectSession={selectSession}
      />

      <KnowledgeModal
        articles={articles}
        topInset={insets.top}
        visible={knowledgeVisible}
        onClose={() => setKnowledgeVisible(false)}
        onOpenArticle={openArticleDetail}
      />

      <ArticleDetailModal
        article={selectedArticle}
        error={articleDetailError}
        loading={articleDetailLoading}
        visible={articleDetailVisible}
        onClose={closeArticleDetail}
      />

      <AuthModal visible={authVisible} reason={authReason} onAuthenticated={handleAuthenticated} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },
  chatBody: {
    flex: 1,
    overflow: 'hidden',
  },
  keyboardSpacer: {
    backgroundColor: '#fff',
  },
});
