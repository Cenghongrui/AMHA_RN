import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Text } from 'react-native-paper';

import type { ArticleListItem } from '@/src/types/api';

type KnowledgeModalProps = {
  articles: ArticleListItem[];
  topInset: number;
  visible: boolean;
  onClose: () => void;
  onOpenArticle: (item: ArticleListItem) => void;
};

export function KnowledgeModal({ articles, topInset, visible, onClose, onOpenArticle }: KnowledgeModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.knowledgeScreen, { paddingTop: topInset + 12 }]}>
        <View style={styles.knowledgeHeader}>
          <View style={styles.knowledgeTitleRow}>
            <Image source={require('../../../assets/images/book.png')} style={styles.knowledgeIcon} />
            <View>
              <Text variant="titleLarge" style={styles.knowledgeTitle}>
                心理健康知识库
              </Text>
              <Text variant="bodySmall" style={styles.knowledgeSubtitle}>
                推荐阅读与心理健康文章
              </Text>
            </View>
          </View>
          <IconButton icon="close" size={22} onPress={onClose} />
        </View>

        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.knowledgeList}>
          <View style={styles.recommendStrip}>
            <Text variant="titleSmall" style={styles.recommendTitle}>
              推荐阅读
            </Text>
            {articles.slice(0, 3).map((item) => (
              <Pressable key={String(item.id)} style={styles.recommendItem} onPress={() => onOpenArticle(item)}>
                <Text numberOfLines={2} style={styles.recommendItemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.recommendItemMeta}>阅读量 {item.readCount ?? 0}</Text>
              </Pressable>
            ))}
          </View>

          {articles.map((item) => (
            <Pressable key={String(item.id)} onPress={() => onOpenArticle(item)}>
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
  );
}

const styles = StyleSheet.create({
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
});
