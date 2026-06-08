import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Icon, IconButton, Text } from 'react-native-paper';

import type { ChatSession, EmotionAnalysis } from '@/src/types/api';

type HistoryDrawerProps = {
  backdropOpacity: Animated.Value;
  currentEmotion: EmotionAnalysis;
  drawerWidth: number;
  riskText: string;
  sessionHistory: ChatSession[];
  topInset: number;
  translateX: Animated.Value;
  visible: boolean;
  onClose: () => void;
  onCreateNewSession: () => void;
  onSelectSession: (item: ChatSession) => void;
};

export function HistoryDrawer({
  backdropOpacity,
  currentEmotion,
  drawerWidth,
  riskText,
  sessionHistory,
  topInset,
  translateX,
  visible,
  onClose,
  onCreateNewSession,
  onSelectSession,
}: HistoryDrawerProps) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.drawerOverlay}>
        <Animated.View style={[styles.drawerScrim, { opacity: backdropOpacity }]}>
          <Pressable style={styles.drawerScrimPressable} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              width: drawerWidth,
              paddingTop: topInset + 14,
              transform: [{ translateX }],
            },
          ]}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerBrand}>
              <View style={styles.drawerAvatar}>
                <Image source={require('../../../assets/images/robot-fill.png')} style={styles.drawerAvatarImage} />
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
            <IconButton icon="close" size={22} onPress={onClose} />
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
              <Button mode="text" compact onPress={onCreateNewSession}>
                新建
              </Button>
            </View>

            <View style={styles.sessionList}>
              {sessionHistory.map((item) => (
                <Pressable key={String(item.id)} style={styles.sessionItem} onPress={() => onSelectSession(item)}>
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
  );
}

const styles = StyleSheet.create({
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
});
