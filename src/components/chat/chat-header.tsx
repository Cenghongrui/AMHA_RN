import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

type ChatHeaderProps = {
  topInset: number;
  onCreateNewSession: () => void;
  onOpenDrawer: () => void;
  onOpenKnowledge: () => void;
};

export function ChatHeader({ topInset, onCreateNewSession, onOpenDrawer, onOpenKnowledge }: ChatHeaderProps) {
  return (
    <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
      <IconButton
        icon="menu"
        size={24}
        iconColor="#111827"
        accessibilityLabel="打开历史会话"
        onPress={onOpenDrawer}
      />
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
          <IconButton
            icon="emoticon-happy-outline"
            size={22}
            iconColor="#111827"
            accessibilityLabel="打开情绪日志"
          />
        </Link>
        <IconButton
          icon="book-open-variant"
          size={22}
          iconColor="#111827"
          accessibilityLabel="打开知识库"
          onPress={onOpenKnowledge}
        />
        <IconButton
          icon="plus"
          size={23}
          iconColor="#111827"
          accessibilityLabel="新建会话"
          onPress={onCreateNewSession}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
