import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as NativeTextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Icon, IconButton, Text } from 'react-native-paper';
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
import type { ArticleDetail, ArticleListItem, ChatMessage, ChatSession, CurrentSession, EmotionAnalysis } from '@/src/types/api';
import { subscribeAuthEvent } from '@/src/utils/auth-events';
import { tokenStorage } from '@/src/utils/token-storage';

const mockHistory: ChatSession[] = [
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

const mockArticles: ArticleListItem[] = [
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

const defaultEmotion: EmotionAnalysis = {
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态平稳正常',
  riskDescription: '',
  improvementSuggestions: ['记录一次今天的小变化', '安排一段不被打扰的休息时间'],
};

const suggestedPrompts = ['我今天有点焦虑', '帮我整理一下压力来源', '我想做一次情绪复盘'];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(340, width * 0.86);
  const inputRef = useRef<NativeTextInput | null>(null);
  const drawerTranslateX = useRef(new Animated.Value(-drawerWidth)).current;
  const drawerBackdropOpacity = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const messagesScrollRef = useRef<ScrollView | null>(null);

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
      const res = await getSessionHistory({ currentPage: 1, size: 20 });

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

  const riskText = getRiskText(currentEmotion.riskLevel);

  return (
    <View style={styles.screen} {...panResponder.panHandlers}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="menu" size={24} iconColor="#111827" onPress={openDrawer} />
        <View style={styles.topTitleGroup}>
          <Text variant="titleMedium" style={styles.topTitle}>
            宁渡AI
          </Text>
          <Text variant="bodySmall" style={styles.topSubtitle}>
            AI心理健康助手
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Link href="/modal" asChild>
            <IconButton icon="emoticon-happy-outline" size={22} iconColor="#111827" />
          </Link>
          <IconButton icon="book-open-variant" size={22} iconColor="#111827" onPress={() => setKnowledgeVisible(true)} />
          <IconButton icon="plus" size={23} iconColor="#111827" onPress={createNewSession} />
        </View>
      </View>

      <View style={styles.chatBody}>
        <ScrollView
          ref={messagesScrollRef}
          style={styles.messagesList}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onLayout={() => messages.length > 0 && scrollToLatestMessage(false)}
          onContentSizeChange={() => messages.length > 0 && scrollToLatestMessage(true)}
          contentContainerStyle={styles.messagesContent}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.assistantAvatarLarge}>
                <Image source={require('../assets/images/robot-fill.png')} style={styles.assistantAvatarImage} />
              </View>
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                今天想聊点什么？
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                我会认真听你说，也会结合情绪记录和知识库给出温和的建议。
              </Text>
              <View style={styles.promptGrid}>
                {suggestedPrompts.map((item) => (
                  <Pressable key={item} style={styles.promptItem} onPress={() => applySuggestion(item)}>
                    <Text style={styles.promptText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => <MessageBubble key={String(message.id)} message={message} />)
          )}
        </ScrollView>

        <View style={[styles.inputShell, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {inputFocused ? (
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="always"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.focusPromptContent}
              style={styles.focusPromptStrip}>
              {suggestedPrompts.map((item) => (
                <Pressable key={item} style={styles.focusPromptItem} onPress={() => applySuggestion(item)}>
                  <Text numberOfLines={1} style={styles.focusPromptText}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <View style={styles.inputBox}>
            <NativeTextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="请输入您想要分享的内容..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              showSoftInputOnFocus
              style={styles.input}
            />
            <IconButton
              icon="send"
              size={20}
              mode="contained"
              disabled={!inputValue.trim() || isSending}
              onPress={sendMessage}
              style={styles.sendButton}
            />
          </View>
        </View>
        <Animated.View style={[styles.keyboardSpacer, { height: keyboardOffset }]} />
      </View>

      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.drawerOverlay}>
          <Animated.View style={[styles.drawerScrim, { opacity: drawerBackdropOpacity }]}>
            <Pressable style={styles.drawerScrimPressable} onPress={closeDrawer} />
          </Animated.View>
          <Animated.View
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                paddingTop: insets.top + 14,
                transform: [{ translateX: drawerTranslateX }],
              },
            ]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrand}>
                <View style={styles.drawerAvatar}>
                  <Image source={require('../assets/images/robot-fill.png')} style={styles.drawerAvatarImage} />
                </View>
                <View>
                  <Text variant="titleMedium" style={styles.drawerTitle}>
                    AI心理健康助手
                  </Text>
                  <View style={styles.onlineRow}>
                    <View style={styles.onlineDot} />
                    <Text variant="bodySmall" style={styles.onlineText}>
                      在线服务中
                    </Text>
                  </View>
                </View>
              </View>
              <IconButton icon="close" size={22} onPress={closeDrawer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.drawerContent}>
              <LinearGradient colors={['#fff7ed', '#f5f3ff']} style={styles.gardenCard}>
                <View style={styles.gardenTop}>
                  <Text variant="titleMedium" style={styles.gardenTitle}>
                    情绪花园
                  </Text>
                  <Chip compact>{riskText}</Chip>
                </View>
                <View style={styles.gardenScoreRow}>
                  <Text style={styles.gardenEmotion}>{currentEmotion.primaryEmotion}</Text>
                  <Text style={styles.gardenScore}>{currentEmotion.emotionScore}</Text>
                </View>
                <Text variant="bodySmall" style={styles.gardenSuggestion}>
                  {currentEmotion.suggestion}
                </Text>
                {currentEmotion.improvementSuggestions.length > 0 ? (
                  <View style={styles.actionList}>
                    {currentEmotion.improvementSuggestions.slice(0, 3).map((item) => (
                      <View key={item} style={styles.actionItem}>
                        <Icon source="sparkles" size={15} color="#7c3aed" />
                        <Text variant="bodySmall" style={styles.actionText}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </LinearGradient>

              <View style={styles.historyHead}>
                <Text variant="titleSmall" style={styles.historyTitle}>
                  会话历史
                </Text>
                <Button mode="text" compact onPress={createNewSession}>
                  新建
                </Button>
              </View>

              <View style={styles.sessionList}>
                {sessionHistory.map((item) => (
                  <Pressable key={String(item.id)} style={styles.sessionItem} onPress={() => selectSession(item)}>
                    <Text numberOfLines={1} style={styles.sessionTitle}>
                      {item.sessionTitle}
                    </Text>
                    <Text numberOfLines={2} style={styles.sessionPreview}>
                      {item.lastMessageContent || '暂无最近消息'}
                    </Text>
                    <View style={styles.sessionMeta}>
                      <Text style={styles.sessionMetaText}>{item.startetAt || item.startedAt || '最近'}</Text>
                      <Text style={styles.sessionMetaText}>{item.messageCount || 0} 条</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={knowledgeVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setKnowledgeVisible(false)}>
        <View style={[styles.knowledgeScreen, { paddingTop: insets.top + 12 }]}>
          <View style={styles.knowledgeHeader}>
            <View style={styles.knowledgeTitleRow}>
              <Image source={require('../assets/images/book.png')} style={styles.knowledgeIcon} />
              <View>
                <Text variant="titleLarge" style={styles.knowledgeTitle}>
                  心理健康知识库
                </Text>
                <Text variant="bodySmall" style={styles.knowledgeSubtitle}>
                  推荐阅读与心理健康文章
                </Text>
              </View>
            </View>
            <IconButton icon="close" size={22} onPress={() => setKnowledgeVisible(false)} />
          </View>

          <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.knowledgeList}>
            <View style={styles.recommendStrip}>
              <Text variant="titleSmall" style={styles.recommendTitle}>
                推荐阅读
              </Text>
              {articles.slice(0, 3).map((item) => (
                <Pressable key={String(item.id)} style={styles.recommendItem} onPress={() => openArticleDetail(item)}>
                  <Text numberOfLines={2} style={styles.recommendItemTitle}>
                    {item.title}
                  </Text>
                  <Text style={styles.recommendItemMeta}>阅读量 {item.readCount ?? 0}</Text>
                </Pressable>
              ))}
            </View>

            {articles.map((item) => (
              <Pressable key={String(item.id)} onPress={() => openArticleDetail(item)}>
                <Card style={styles.articleCard}>
                  <Card.Content style={styles.articleContent}>
                    <View style={styles.articleTop}>
                      <Text numberOfLines={2} variant="titleMedium" style={styles.articleTitle}>
                        {item.title}
                      </Text>
                      {item.categoryName ? <Chip compact>{item.categoryName}</Chip> : null}
                    </View>
                    <Text numberOfLines={3} style={styles.articleSummary}>
                      {item.summary || item.content || '这篇文章将帮助你更好地理解心理健康与情绪管理。'}
                    </Text>
                    <View style={styles.articleMeta}>
                      <Text style={styles.articleMetaText}>{item.authorName || '宁渡AI'}</Text>
                      <Text style={styles.articleMetaText}>阅读 {item.readCount ?? 0}</Text>
                    </View>
                  </Card.Content>
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={articleDetailVisible} transparent animationType="fade" onRequestClose={closeArticleDetail}>
        <View style={styles.articleDetailOverlay}>
          <Pressable style={styles.articleDetailBackdrop} onPress={closeArticleDetail} />
          <View style={styles.articleDetailPanel}>
            <View style={styles.articleDetailHeader}>
              <View style={styles.articleDetailTitleGroup}>
                <Text numberOfLines={2} variant="titleLarge" style={styles.articleDetailTitle}>
                  {selectedArticle?.title || '文章详情'}
                </Text>
                <Text style={styles.articleDetailMeta}>
                  {selectedArticle?.authorName || '宁渡AI'} · 阅读 {selectedArticle?.readCount ?? 0}
                </Text>
              </View>
              <IconButton icon="close" size={22} onPress={closeArticleDetail} />
            </View>

            {selectedArticle?.categoryName || selectedArticle?.tags ? (
              <View style={styles.articleDetailTagRow}>
                {selectedArticle.categoryName ? <Chip compact>{selectedArticle.categoryName}</Chip> : null}
                {getArticleTags(selectedArticle).map((tag) => (
                  <Chip key={tag} compact>
                    {tag}
                  </Chip>
                ))}
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.articleDetailContent}>
              {articleDetailLoading ? (
                <View style={styles.articleDetailLoading}>
                  <ActivityIndicator />
                  <Text style={styles.articleDetailLoadingText}>正在加载文章详情...</Text>
                </View>
              ) : null}

              {articleDetailError ? <Text style={styles.articleDetailError}>{articleDetailError}</Text> : null}

              {selectedArticle?.summary ? (
                <View style={styles.articleDetailSummaryBox}>
                  <Text style={styles.articleDetailSummary}>{selectedArticle.summary}</Text>
                </View>
              ) : null}

              <Text selectable style={styles.articleDetailText}>
                {formatArticleContent(selectedArticle?.content || selectedArticle?.summary)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AuthModal visible={authVisible} reason={authReason} onAuthenticated={handleAuthenticated} />
    </View>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.senderType === 1;

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser ? (
        <View style={styles.messageAvatar}>
          <Image source={require('../assets/images/robot-fill.png')} style={styles.messageAvatarImage} />
        </View>
      ) : null}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.content}</Text>
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>{message.createdAt}</Text>
      </View>
    </View>
  );
}

function getArticleTags(article: ArticleDetail | ArticleListItem) {
  if (article.tagArray?.length) {
    return article.tagArray;
  }

  return article.tags
    ? article.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function formatArticleContent(content?: string) {
  const text = stripHtml(content || '').trim();

  return text || '暂无文章详情内容';
}

function stripHtml(content: string) {
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n');
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getRiskText(level: number) {
  if (level === 3) return '危机';
  if (level === 2) return '预警';
  if (level === 1) return '需要关注';
  return '正常';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f7f8',
  },
  topBar: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ececf1',
  },
  topTitleGroup: {
    flex: 1,
  },
  topTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  topSubtitle: {
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBody: {
    flex: 1,
    overflow: 'hidden',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  emptyState: {
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  assistantAvatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececf1',
  },
  assistantAvatarImage: {
    width: 42,
    height: 42,
  },
  emptyTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  emptyText: {
    maxWidth: 300,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 22,
  },
  promptGrid: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  promptItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececf1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  promptText: {
    color: '#374151',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarImage: {
    width: 18,
    height: 18,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: '#111827',
    borderBottomRightRadius: 6,
  },
  messageText: {
    color: '#111827',
    lineHeight: 21,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    color: '#9ca3af',
    fontSize: 11,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.68)',
  },
  inputShell: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ececf1',
  },
  focusPromptStrip: {
    marginBottom: 8,
  },
  focusPromptContent: {
    gap: 8,
    paddingRight: 6,
  },
  focusPromptItem: {
    height: 34,
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#f7f7f8',
    borderWidth: 1,
    borderColor: '#ececf1',
    paddingHorizontal: 12,
  },
  focusPromptText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    minHeight: 54,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#dedee5',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 116,
    color: '#111827',
    fontSize: 15,
    lineHeight: 21,
    paddingTop: 11,
    paddingBottom: 9,
  },
  sendButton: {
    margin: 0,
    marginBottom: 2,
  },
  keyboardSpacer: {
    backgroundColor: '#fff',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  drawerScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
  },
  drawerScrimPressable: {
    flex: 1,
  },
  drawerPanel: {
    height: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarImage: {
    width: 24,
    height: 24,
  },
  drawerTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  onlineText: {
    color: '#059669',
  },
  drawerContent: {
    gap: 14,
    paddingBottom: 28,
  },
  gardenCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f1e7ff',
  },
  gardenTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gardenTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  gardenScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  gardenEmotion: {
    color: '#7c3aed',
    fontSize: 28,
    fontWeight: '800',
  },
  gardenScore: {
    color: '#111827',
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  gardenSuggestion: {
    color: '#6b7280',
    lineHeight: 19,
  },
  actionList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    color: '#374151',
  },
  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  sessionList: {
    gap: 9,
  },
  sessionItem: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#f7f7f8',
    gap: 6,
  },
  sessionTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  sessionPreview: {
    color: '#6b7280',
    lineHeight: 18,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionMetaText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  knowledgeScreen: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  knowledgeHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececf1',
  },
  knowledgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  knowledgeIcon: {
    width: 42,
    height: 42,
  },
  knowledgeTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  knowledgeSubtitle: {
    color: '#6b7280',
  },
  knowledgeList: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  recommendStrip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  recommendTitle: {
    color: '#111827',
    fontWeight: '800',
  },
  recommendItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    paddingLeft: 10,
    gap: 4,
  },
  recommendItemTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  recommendItemMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  articleCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  articleContent: {
    gap: 10,
  },
  articleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  articleTitle: {
    flex: 1,
    color: '#111827',
    fontWeight: '800',
  },
  articleSummary: {
    color: '#6b7280',
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  articleMetaText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  articleDetailOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.38)',
  },
  articleDetailBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  articleDetailPanel: {
    maxHeight: '82%',
    borderRadius: 22,
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#111827',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  articleDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  articleDetailTitleGroup: {
    flex: 1,
    paddingTop: 8,
  },
  articleDetailTitle: {
    color: '#111827',
    fontWeight: '900',
    lineHeight: 26,
  },
  articleDetailMeta: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 12,
  },
  articleDetailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  articleDetailContent: {
    gap: 12,
    paddingTop: 14,
    paddingBottom: 8,
  },
  articleDetailLoading: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  articleDetailLoadingText: {
    color: '#6b7280',
  },
  articleDetailError: {
    color: '#b91c1c',
    lineHeight: 20,
  },
  articleDetailSummaryBox: {
    borderRadius: 14,
    backgroundColor: '#f7f7f8',
    padding: 12,
  },
  articleDetailSummary: {
    color: '#374151',
    lineHeight: 21,
    fontWeight: '600',
  },
  articleDetailText: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 24,
  },
});
