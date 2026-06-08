export function getRiskText(level: number) {
  if (level === 3) return '危机';
  if (level === 2) return '预警';
  if (level === 1) return '需要关注';
  return '正常';
}
