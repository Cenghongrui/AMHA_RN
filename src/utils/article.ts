import type { ArticleDetail, ArticleListItem } from '@/src/types/api';

export function getArticleTags(article: ArticleDetail | ArticleListItem) {
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

export function formatArticleContent(content?: string) {
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
