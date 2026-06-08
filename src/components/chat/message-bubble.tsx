import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import type { ChatMessage } from '@/src/types/api';

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.senderType === 1;

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser ? (
        <View style={styles.messageAvatar}>
          <Image source={require('../../../assets/images/robot-fill.png')} style={styles.messageAvatarImage} />
        </View>
      ) : null}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>{message.content}</Text>
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>{message.createdAt}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
