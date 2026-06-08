import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, IconButton, Text } from 'react-native-paper';

import type { ArticleDetail, ArticleListItem } from '@/src/types/api';
import { formatArticleContent, getArticleTags } from '@/src/utils/article';

type ArticleDetailModalProps = {
  article: ArticleDetail | ArticleListItem | null;
  error: string;
  loading: boolean;
  visible: boolean;
  onClose: () => void;
};

export function ArticleDetailModal({ article, error, loading, visible, onClose }: ArticleDetailModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.articleDetailOverlay}>
        <Pressable style={styles.articleDetailBackdrop} onPress={onClose} />
        <View style={styles.articleDetailPanel}>
          <View style={styles.articleDetailHeader}>
            <View style={styles.articleDetailTitleGroup}>
              <Text numberOfLines={2} variant="titleLarge" style={styles.articleDetailTitle}>
                {article?.title || '文章详情'}
              </Text>
              <Text style={styles.articleDetailMeta}>
                {article?.authorName || '宁渡AI'} · 阅读 {article?.readCount ?? 0}
              </Text>
            </View>
            <IconButton icon="close" size={22} onPress={onClose} />
          </View>

          {article?.categoryName || article?.tags ? (
            <View style={styles.articleDetailTagRow}>
              {article.categoryName ? <Chip compact>{article.categoryName}</Chip> : null}
              {getArticleTags(article).map((tag) => (
                <Chip key={tag} compact>
                  {tag}
                </Chip>
              ))}
            </View>
          ) : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.articleDetailContent}>
            {loading ? (
              <View style={styles.articleDetailLoading}>
                <ActivityIndicator />
                <Text style={styles.articleDetailLoadingText}>正在加载文章详情...</Text>
              </View>
            ) : null}

            {error ? <Text style={styles.articleDetailError}>{error}</Text> : null}

            {article?.summary ? (
              <View style={styles.articleDetailSummaryBox}>
                <Text style={styles.articleDetailSummary}>{article.summary}</Text>
              </View>
            ) : null}

            <Text selectable style={styles.articleDetailText}>
              {formatArticleContent(article?.content || article?.summary)}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
