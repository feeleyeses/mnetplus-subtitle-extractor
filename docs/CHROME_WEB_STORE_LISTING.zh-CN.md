# Chrome Web Store 上架文案（简体中文）

本文件用于填写 Chrome Web Store 后台的简体中文本地化信息，也可作为英文版 `CHROME_WEB_STORE_LISTING.md` 的中文对照。

## 产品名称

**Mnet Plus Subtitle Downloader**

## 简短说明

**为 Mnet Plus 提供简单的字幕导出。**

## 详细说明

Mnet Plus Subtitle Downloader 是一个非官方 Chrome 扩展，用于导出当前登录用户在 Mnet Plus 视频页面中本来就可以访问的字幕轨。

扩展会自动识别当前视频实际提供的字幕语言，让用户选择需要的字幕，并生成标准 UTF-8 SRT 文件。生成后的字幕会先暂存在当前视频标签页中，用户可以在确认后再保存到本地。

### 功能

- 自动识别当前 Mnet Plus 视频实际提供的字幕轨。
- 当 Mnet Plus 提供相关标记时，可区分官方字幕与 AI 自动生成字幕。
- 将选中的字幕轨导出为标准 `.srt` 文件。
- 支持一次生成多个字幕语言。
- 支持单独保存、多选保存、多选删除以及清空全部。
- 已生成字幕会暂存在当前视频标签页中，因此即使在系统“另存为”窗口误点取消，也无需重新生成字幕。
- 扩展界面支持 English / 简体中文。
- 首次使用时，如果 Chrome UI 语言为 `zh-CN`，默认显示简体中文；其他所有 Chrome UI 语言默认显示 English。
- 用户手动选择的界面语言会保存在本地。

### 隐私

扩展没有开发者自建后端，也不会把 Cookie、Authorization 凭证、浏览历史或字幕内容发送给开发者。

扩展只使用当前浏览器中已经存在的 Mnet Plus 登录状态，请求当前账号本身正常有权访问的字幕数据。

目前通过 `chrome.storage.local` 保存的唯一扩展偏好是界面语言。

### 重要限制

- 本扩展只导出字幕，不下载视频流。
- 不绕过 DRM、订阅、付费墙、地区限制或其他技术访问控制。
- 如果当前视频本身没有向用户提供某个字幕轨，本扩展也无法额外提供。
- Mnet Plus 未来可能调整网页内部 API，从而暂时影响兼容性。

本项目为非官方项目，与 Mnet Plus / CJ ENM 无官方关联、授权、背书或赞助关系。

## 单一用途（Single purpose）

**将当前 Mnet Plus 视频中已经向用户提供的字幕轨导出为 SRT 文件。**

## 权限用途说明

### `activeTab`

用户打开扩展后，用于与当前活动的 Mnet Plus 视频标签页通信，以识别当前视频并完成字幕导出所需的页面交互。

### `storage`

只用于记住用户选择的界面语言（English / 简体中文）。

### `scripting`

当受支持的 Mnet Plus 页面中缺少扩展的消息接收端时，用于兜底注入扩展自带的本地 `content.js`。例如用户重新加载扩展，但原来的 Mnet Plus 视频标签页仍然保持打开时。

### Host access：`https://mnetplus.world/*`

用于在受支持的 Mnet Plus 媒体页面运行扩展并与当前页面通信。

### Host access：`https://api.mnetplus.world/*`

用于向 Mnet Plus 服务请求当前视频的元数据及字幕 cue 数据。

## 数据使用填写参考

仅在扩展行为保持当前状态时使用以下答案：

- 出售用户数据：**否**
- 将用户数据用于广告：**否**
- 将用户数据用于信用评估或借贷：**否**
- 将用户数据传输给无关第三方：**否**
- 将用户数据用于与扩展单一用途无关的目的：**否**
- 开发者自建后端：**否**
- Analytics / Tracking：**否**
- Remote code execution：**否**

扩展会直接与获取字幕所必需的 Mnet Plus 服务通信。

## 建议分类

在实际 Chrome Web Store Dashboard 中选择当时可用的、最接近 Productivity / Tools 的分类。

## 建议语言

- English — 主 listing 语言
- 简体中文 — 本地化 listing

## 视觉素材

已确认的视觉方向：**Concept C**

- 字幕 / caption 气泡框；
- `CC` 字样；
- `//` 识别元素；
- 黑色 / 近黑底；
- Hot Pink 强调色；
- 不使用或模仿 Mnet Plus 官方 `M` / `M+` Logo。

商店截图应使用真实扩展 UI。宣传图可以进行视觉设计，但不得让用户误以为本扩展是 Mnet Plus 官方产品。

## 支持 / 联系方式

在独立支持页面建立之前，可使用 GitHub 仓库和 Issue tracker。

## 隐私政策

提交时可使用仓库公开的 `PRIVACY.md` 页面 URL；未来如果建立独立官网，再替换为专门托管的隐私政策页面。
