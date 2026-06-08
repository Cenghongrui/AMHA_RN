import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Icon, Text, TextInput } from 'react-native-paper';
import { useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

const emotionStatus = [
  '绝望崩溃',
  '消沉抑郁',
  '焦虑烦躁',
  '低落不悦',
  '平静淡然',
  '轻松惬意',
  '愉悦舒心',
  '欢欣满足',
  '兴奋欣喜',
  '极致幸福',
];

const emotionOptions: { name: string; image: ImageSourcePropType }[] = [
  { name: '开心', image: require('../assets/images/开心.png') },
  { name: '平静', image: require('../assets/images/平静.png') },
  { name: '焦虑', image: require('../assets/images/焦虑.png') },
  { name: '悲伤', image: require('../assets/images/悲伤.png') },
  { name: '兴奋', image: require('../assets/images/兴奋.png') },
  { name: '疲惫', image: require('../assets/images/疲惫.png') },
  { name: '惊讶', image: require('../assets/images/惊讶.png') },
  { name: '困惑', image: require('../assets/images/困惑.png') },
];

const sleepOptions = ['很差', '较差', '一般', '良好', '优秀'];
const stressOptions = ['很低', '较低', '中等', '较高', '很高'];

export default function ModalScreen() {
  const [score, setScore] = useState(50);
  const [selectedEmotion, setSelectedEmotion] = useState('开心');
  const [sleepQuality, setSleepQuality] = useState('一般');
  const [stressLevel, setStressLevel] = useState('中等');
  const [emotionTriggers, setEmotionTriggers] = useState('');
  const [diaryContent, setDiaryContent] = useState('');

  const scorePercent = `${score}%` as const;
  const scoreColor = getScoreColor(score);
  const moodText = emotionStatus[Math.min(9, Math.floor((score - 1) / 10))];

  const resetForm = () => {
    setScore(50);
    setSelectedEmotion('开心');
    setSleepQuality('一般');
    setStressLevel('中等');
    setEmotionTriggers('');
    setDiaryContent('');
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <LinearGradient colors={['#fff7ed', '#9b5de5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Image source={require('../assets/images/like.png')} style={styles.heroIcon} />
        <View style={styles.heroTextGroup}>
          <Text variant="headlineMedium" style={styles.heroTitle}>
            情绪日记
          </Text>
          <Text variant="bodyMedium" style={styles.heroSubtitle}>
            记录今天的心情、触发因素和生活状态
          </Text>
        </View>
      </LinearGradient>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleIcon}>
              <Icon source="brightness-5" color="#f59e0b" size={24} />
            </View>
            <View style={styles.titleTextGroup}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                今日情绪评分
              </Text>
              <Text variant="bodySmall" style={styles.sectionHint}>
                您今天的情绪整体如何？
              </Text>
            </View>
          </View>

          <View style={styles.scorePanel}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
            <View style={styles.scoreInfo}>
              <Text variant="titleSmall" style={styles.moodText}>
                {moodText}
              </Text>
              <Text variant="bodySmall" style={styles.scoreHint}>
                1 分偏低落，100 分偏积极
              </Text>
            </View>
          </View>

          <View style={styles.sliderWrap}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: scorePercent, backgroundColor: scoreColor }]} />
            </View>
            <Slider
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={score}
              onValueChange={setScore}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#111827"
              style={styles.slider}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleIcon}>
              <Icon source="emoticon-outline" color="#7c3aed" size={24} />
            </View>
            <View style={styles.titleTextGroup}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                主要情绪
              </Text>
              <Text variant="bodySmall" style={styles.sectionHint}>
                选择最接近今天状态的一项
              </Text>
            </View>
          </View>

          <View style={styles.emotionGrid}>
            {emotionOptions.map((item) => {
              const selected = selectedEmotion === item.name;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => setSelectedEmotion(item.name)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.emotionItem,
                    selected && styles.emotionItemSelected,
                    pressed && styles.emotionItemPressed,
                  ]}>
                  <View style={styles.emotionInner}>
                    <Image source={item.image} style={styles.emotionImage} />
                    <Text style={[styles.emotionName, selected && styles.emotionNameSelected]}>{item.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleIcon}>
              <Icon source="note-edit-outline" color="#2563eb" size={24} />
            </View>
            <View style={styles.titleTextGroup}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                详细记录
              </Text>
              <Text variant="bodySmall" style={styles.sectionHint}>
                简单写下今天影响情绪的事情
              </Text>
            </View>
          </View>

          <TextInput
            mode="outlined"
            label="情绪触发因素"
            placeholder="请输入情绪触发因素"
            value={emotionTriggers}
            onChangeText={setEmotionTriggers}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="今日感想"
            placeholder="请输入今日感想"
            value={diaryContent}
            onChangeText={setDiaryContent}
            multiline
            numberOfLines={5}
            style={styles.input}
          />

          <View style={styles.chipSection}>
            <Text variant="titleSmall" style={styles.fieldTitle}>
              睡眠质量
            </Text>
            <View style={styles.chipRow}>
              {sleepOptions.map((item) => (
                <Chip key={item} selected={sleepQuality === item} onPress={() => setSleepQuality(item)} style={styles.chip}>
                  {item}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.chipSection}>
            <Text variant="titleSmall" style={styles.fieldTitle}>
              压力等级
            </Text>
            <View style={styles.chipRow}>
              {stressOptions.map((item) => (
                <Chip key={item} selected={stressLevel === item} onPress={() => setStressLevel(item)} style={styles.chip}>
                  {item}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Button mode="outlined" onPress={resetForm} style={styles.actionButton}>
              重置
            </Button>
            <Button mode="contained" onPress={() => {}} style={styles.actionButton}>
              提交
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function getScoreColor(score: number) {
  const percent = (score - 1) / 99;
  const red = Math.round(239 + (34 - 239) * percent);
  const green = Math.round(68 + (197 - 68) * percent);
  const blue = Math.round(68 + (94 - 68) * percent);

  return `rgb(${red}, ${green}, ${blue})`;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
    backgroundColor: '#f7f9fc',
  },
  hero: {
    minHeight: 132,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 58,
    height: 58,
  },
  heroTextGroup: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 20,
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  cardContent: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextGroup: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: '#374151',
    fontWeight: '700',
  },
  sectionHint: {
    color: '#6b7280',
  },
  scorePanel: {
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scoreValue: {
    width: 64,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  scoreInfo: {
    flex: 1,
    gap: 4,
  },
  moodText: {
    color: '#111827',
    fontWeight: '700',
  },
  scoreHint: {
    color: '#6b7280',
  },
  sliderWrap: {
    height: 44,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
  },
  slider: {
    width: '100%',
    height: 44,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emotionItem: {
    width: '47.8%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 12,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionItemSelected: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  emotionItemPressed: {
    opacity: 0.72,
  },
  emotionInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emotionImage: {
    width: 42,
    height: 42,
  },
  emotionName: {
    color: '#374151',
    fontWeight: '600',
  },
  emotionNameSelected: {
    color: '#15803d',
  },
  input: {
    backgroundColor: '#fff',
  },
  chipSection: {
    gap: 10,
  },
  fieldTitle: {
    color: '#374151',
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f9fafb',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});
