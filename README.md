# AMHA_RN

AMHA_RN 是一个基于 Expo + React Native 的 AI 心理健康助手移动端项目。项目复用了 Web 端已有的后端接口能力，在移动端重构了 AI 对话、情绪日记、知识库、登录注册和历史会话等用户侧功能。

## 功能特性

- AI 对话首页：打开 App 直接进入对话界面，整体布局参考 ChatGPT 移动端。
- 会话历史：左滑或点击菜单打开历史会话列表，并展示情绪花园概览。
- 流式回复：对接心理咨询 SSE 接口，支持 AI 回复逐段追加展示。
- 自动滚动：当前对话内容更新时自动滚动到底部。
- 登录注册：未登录或登录过期时自动弹出半透明登录/注册弹窗。
- 情绪日记：支持 1-100 情绪评分、主要情绪、睡眠质量、压力等级和日记内容填写。
- 知识库：展示心理健康文章列表，点击卡片弹出文章详情。
- 接口封装：使用 axios 统一封装普通请求，使用 `expo/fetch` 处理流式请求。

## 技术栈

- Expo SDK 56
- React Native 0.85
- Expo Router
- TypeScript
- React Native Paper
- Axios
- expo-linear-gradient
- @react-native-community/slider

## 快速开始

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run start
```

启动 Web 预览：

```bash
npm run web
```

启动 iOS 或 Android：

```bash
npm run ios
npm run android
```

## 环境变量

项目默认会尝试通过 Expo 当前局域网地址访问 Web 端代理：

```text
http://<Expo host>:5174/api
```

也可以通过环境变量手动指定接口地址：

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:5174/api
```

常用环境变量：

```text
EXPO_PUBLIC_API_BASE_URL     手动指定完整 API baseURL
EXPO_PUBLIC_API_PROXY_PORT   指定代理端口，默认 5174
EXPO_PUBLIC_AUTH_TOKEN       开发调试时临时注入 token
```

如果真机调试，请确保手机和电脑在同一局域网内，并且后端或 Web 端代理地址可以被手机访问。

## 目录结构

```text
app/
  _layout.tsx        全局 Stack 和 React Native Paper Provider
  index.tsx          AI 对话主界面、历史会话、知识库弹窗
  modal.tsx          情绪日记页面
  +not-found.tsx     404 页面

src/
  api/               后端接口封装
  components/        业务组件
  types/             接口类型定义
  utils/             请求、token、认证事件、API 地址解析

assets/images/       页面图标和情绪图片资源
```

## 接口说明

主要用户侧接口包括：

- `/user/login`
- `/user/add`
- `/psychological-chat/sessions`
- `/psychological-chat/session/start`
- `/psychological-chat/stream`
- `/psychological-chat/session/{sessionId}/emotion`
- `/emotion-diary`
- `/knowledge/article/page`
- `/knowledge/article/{id}`

普通接口通过 `src/utils/request.ts` 统一处理 token、响应 code 和登录过期逻辑；流式聊天接口在 `src/api/front-end.ts` 中使用 `expo/fetch` 读取 `text/event-stream`。

## 本地验证

类型检查：

```bash
npx tsc --noEmit
```

导出 Web 静态产物：

```bash
npx expo export --platform web --output-dir /private/tmp/amha-rn-export
```

## 说明

当前项目是移动端重构版本，并不是把 Vue Web 代码直接迁移到 React Native；Web 端业务接口和产品逻辑被复用，移动端 UI、交互和状态管理在 React Native 中重新实现。
