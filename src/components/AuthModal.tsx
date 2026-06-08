import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Icon, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { login, register } from '@/src/api/front-end';
import type { LoginRequest, RegisterRequest } from '@/src/types/api';

type AuthMode = 'login' | 'register';

type AuthModalProps = {
  visible: boolean;
  reason?: string;
  onAuthenticated: () => void;
};

const initialLoginForm: LoginRequest = {
  username: '',
  password: '',
};

const initialRegisterForm: RegisterRequest = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 0,
  userType: 1,
  nickname: '',
};

export function AuthModal({ visible, reason, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginForm, setLoginForm] = useState<LoginRequest>(initialLoginForm);
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(initialRegisterForm);
  const [secureLoginPassword, setSecureLoginPassword] = useState(true);
  const [secureRegisterPassword, setSecureRegisterPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateLoginForm = (field: keyof LoginRequest, value: string) => {
    setMessage('');
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateRegisterForm = (field: keyof RegisterRequest, value: string) => {
    setMessage('');
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const switchMode = (nextMode: string) => {
    setMode(nextMode as AuthMode);
    setMessage('');
  };

  const submitLogin = async () => {
    const username = loginForm.username.trim();
    const password = loginForm.password;

    if (!username || !password) {
      setMessage('请输入账号和密码');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await login({ username, password });
      setLoginForm(initialLoginForm);
      onAuthenticated();
    } catch (error) {
      setMessage(getErrorMessage(error, '登录失败，请检查账号或密码'));
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    const username = registerForm.username.trim();
    const email = registerForm.email.trim();
    const nickname = registerForm.nickname.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;

    if (!username || !email || !nickname || !password || !confirmPassword) {
      setMessage('请填写用户名、邮箱、昵称和密码');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await register({
        ...registerForm,
        username,
        email,
        nickname,
        phone: registerForm.phone?.trim(),
      });
      setLoginForm({ username, password: '' });
      setRegisterForm(initialRegisterForm);
      setMode('login');
      setMessage('注册成功，请登录');
    } catch (error) {
      setMessage(getErrorMessage(error, '注册失败，请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.panel}>
            <View style={styles.brandMark}>
              <Icon source="shield-heart-outline" size={30} color="#111827" />
            </View>

            <Text variant="headlineSmall" style={styles.title}>
              欢迎来到宁渡AI
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {reason || '登录后同步会话历史、情绪花园和个人记录'}
            </Text>

            <SegmentedButtons
              value={mode}
              onValueChange={switchMode}
              style={styles.segmented}
              buttons={[
                { value: 'login', label: '登录', icon: 'login' },
                { value: 'register', label: '注册', icon: 'account-plus-outline' },
              ]}
            />

            {mode === 'login' ? (
              <View style={styles.form}>
                <TextInput
                  mode="outlined"
                  label="账号"
                  placeholder="请输入用户名或邮箱"
                  value={loginForm.username}
                  onChangeText={(value) => updateLoginForm('username', value)}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="account-outline" />}
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="密码"
                  placeholder="请输入密码"
                  value={loginForm.password}
                  onChangeText={(value) => updateLoginForm('password', value)}
                  secureTextEntry={secureLoginPassword}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={secureLoginPassword ? 'eye-outline' : 'eye-off-outline'}
                      onPress={() => setSecureLoginPassword((prev) => !prev)}
                    />
                  }
                  style={styles.field}
                />
                <Button mode="contained" loading={loading} disabled={loading} onPress={submitLogin} style={styles.primaryButton}>
                  登录
                </Button>
              </View>
            ) : (
              <View style={styles.form}>
                <TextInput
                  mode="outlined"
                  label="用户名"
                  value={registerForm.username}
                  onChangeText={(value) => updateRegisterForm('username', value)}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="account-outline" />}
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="邮箱"
                  value={registerForm.email}
                  onChangeText={(value) => updateRegisterForm('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" />}
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="昵称"
                  value={registerForm.nickname}
                  onChangeText={(value) => updateRegisterForm('nickname', value)}
                  left={<TextInput.Icon icon="card-account-details-outline" />}
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="手机号"
                  value={registerForm.phone}
                  onChangeText={(value) => updateRegisterForm('phone', value)}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone-outline" />}
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="密码"
                  value={registerForm.password}
                  onChangeText={(value) => updateRegisterForm('password', value)}
                  secureTextEntry={secureRegisterPassword}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={secureRegisterPassword ? 'eye-outline' : 'eye-off-outline'}
                      onPress={() => setSecureRegisterPassword((prev) => !prev)}
                    />
                  }
                  style={styles.field}
                />
                <TextInput
                  mode="outlined"
                  label="确认密码"
                  value={registerForm.confirmPassword}
                  onChangeText={(value) => updateRegisterForm('confirmPassword', value)}
                  secureTextEntry={secureRegisterPassword}
                  left={<TextInput.Icon icon="lock-check-outline" />}
                  style={styles.field}
                />
                <Button mode="contained" loading={loading} disabled={loading} onPress={submitRegister} style={styles.primaryButton}>
                  创建账户
                </Button>
              </View>
            )}

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  panel: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#111827',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 12,
  },
  title: {
    color: '#111827',
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },
  segmented: {
    marginTop: 18,
    marginBottom: 14,
  },
  form: {
    gap: 10,
  },
  field: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 12,
  },
  message: {
    marginTop: 12,
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 19,
  },
});
