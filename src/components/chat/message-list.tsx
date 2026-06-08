import { forwardRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { MessageBubble } from '@/src/components/chat/message-bubble';
import type { ChatMessage } from '@/src/types/api';

type MessageListProps = {
  messages: ChatMessage[];
  suggestedPrompts: string[];
  onApplySuggestion: (prompt: string) => void;
  onContentChanged: () => void;
  onLayoutReady: () => void;
};

export const MessageList = forwardRef<ScrollView, MessageListProps>(function MessageList(
  { messages, suggestedPrompts, onApplySuggestion, onContentChanged, onLayoutReady },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      style={styles.messagesList}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onLayout={onLayoutReady}
      onContentSizeChange={onContentChanged}
      contentContainerStyle={styles.messagesContent}>
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.assistantAvatarLarge}>
            <Image source={require('../../../assets/images/robot-fill.png')} style={styles.assistantAvatarImage} />
          </View>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            今天想聊点什么？
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            我会认真听你说，也会结合情绪记录和知识库给出温和的建议。
          </Text>
          <View style={styles.promptGrid}>
            {suggestedPrompts.map((item) => (
              <Pressable key={item} style={styles.promptItem} onPress={() => onApplySuggestion(item)}>
                <Text style={styles.promptText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        messages.map((message) => <MessageBubble key={String(message.id)} message={message} />)
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
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
});
