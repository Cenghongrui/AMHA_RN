import type { RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput as NativeTextInput, type TextStyle, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

type ChatInputProps = {
  bottomInset: number;
  inputFocused: boolean;
  inputRef: RefObject<NativeTextInput | null>;
  isSending: boolean;
  suggestedPrompts: string[];
  value: string;
  onApplySuggestion: (prompt: string) => void;
  onBlur: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onSend: () => void;
};

const INPUT_CONTROL_HEIGHT = 40;
const INPUT_BOX_INSET = 4;
const webInputResetStyle =
  process.env.EXPO_OS === 'web'
    ? ({
        outlineStyle: 'none',
        outlineWidth: 0,
      } as unknown as TextStyle)
    : undefined;

export function ChatInput({
  bottomInset,
  inputFocused,
  inputRef,
  isSending,
  suggestedPrompts,
  value,
  onApplySuggestion,
  onBlur,
  onChangeText,
  onFocus,
  onSend,
}: ChatInputProps) {
  return (
    <View style={[styles.inputShell, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {inputFocused ? (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.focusPromptContent}
          style={styles.focusPromptStrip}>
          {suggestedPrompts.map((item) => (
            <Pressable key={item} style={styles.focusPromptItem} onPress={() => onApplySuggestion(item)}>
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
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="请输入您想要分享的内容..."
          placeholderTextColor="#9ca3af"
          maxLength={500}
          returnKeyType="send"
          showSoftInputOnFocus
          onSubmitEditing={onSend}
          style={[styles.input, webInputResetStyle]}
        />
        <IconButton
          icon="send"
          size={20}
          mode="contained"
          disabled={!value.trim() || isSending}
          onPress={onSend}
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    height: INPUT_CONTROL_HEIGHT + INPUT_BOX_INSET * 2,
    minHeight: INPUT_CONTROL_HEIGHT + INPUT_BOX_INSET * 2,
    borderRadius: (INPUT_CONTROL_HEIGHT + INPUT_BOX_INSET * 2) / 2,
    borderWidth: 1,
    borderColor: '#dedee5',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 16,
    paddingRight: INPUT_BOX_INSET,
    paddingVertical: INPUT_BOX_INSET,
  },
  input: {
    flex: 1,
    height: INPUT_CONTROL_HEIGHT,
    minHeight: INPUT_CONTROL_HEIGHT,
    maxHeight: INPUT_CONTROL_HEIGHT,
    color: '#111827',
    fontSize: 15,
    lineHeight: INPUT_CONTROL_HEIGHT,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: INPUT_CONTROL_HEIGHT,
    height: INPUT_CONTROL_HEIGHT,
    borderRadius: INPUT_CONTROL_HEIGHT / 2,
    margin: 0,
  },
});
