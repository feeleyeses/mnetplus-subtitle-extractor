# Mnet Plus Subtitle Downloader

一个用于 **Mnet Plus 网页视频字幕导出** 的个人学习工具。它会读取当前视频真实提供的字幕轨，标注 Mnet Plus 返回的 AI 自动生成状态，并把你勾选的字幕导出为标准 UTF-8 `.srt`。

> 推荐使用方式：**Tampermonkey 用户脚本**。安装一次后，打开任意 Mnet Plus 视频，直接点击页面右下角的「下载字幕」。

## 主要功能

- 自动识别当前 Mnet Plus 视频 ID
- 自动读取 `videoCaptionId`
- 自动识别当前视频实际提供的字幕语言
- 显示 Mnet Plus 返回的语言名称与 AI 自动生成标记
- 自由勾选要下载的字幕轨
- 批量抓取 caption cue，去重并按时间排序
- 导出标准 SRT
- 支持 Mnet Plus 站内切换不同视频后继续使用

例如某个视频可能提供：

```text
韩国语 (AI 自动生成)   ko
英语                  en
日本语 (AI 自动生成)   ja
中文 简体 (AI 自动生成) zh_CN
中文 繁体 (AI 自动生成) zh_TW
```

不同视频提供的字幕轨可能不同，本工具以当前视频接口实际返回的结果为准，不写死语言列表。

## 推荐安装：Tampermonkey 用户脚本

### 1. 安装 Tampermonkey

在 Chrome / Edge 安装 Tampermonkey，并在浏览器扩展设置中允许用户脚本运行。

### 2. 安装本项目脚本

打开下面这个文件的 Raw 页面：

```text
https://raw.githubusercontent.com/feeleyeses/mnetplus-subtitle-extractor/main/mnetplus_subtitle_downloader.user.js
```

Tampermonkey 会弹出安装页面，点击「安装」。

### 3. 使用

1. 登录 Mnet Plus。
2. 打开任意视频页面，例如：

```text
https://mnetplus.world/media/zh-CN/videos/VIDEO_ID
```

3. 页面右下角会出现「下载字幕」。
4. 点击后，工具会自动读取这个视频支持的字幕轨。
5. 勾选需要的语言。
6. 点击「下载选中字幕」。
7. SRT 会保存到浏览器下载文件夹。

如果浏览器提示“允许此网站下载多个文件”，请选择允许。

## Chrome Extension（实验版）

仓库中的 `extension/` 是一个 Manifest V3 Chrome 扩展实验版。它把字幕选择界面放到浏览器工具栏弹窗里，不依赖 Tampermonkey。

当前建议：

- 日常使用：优先 Tampermonkey 用户脚本
- 想体验更像正式产品的方式：测试 `extension/`

### 本地安装实验版扩展

1. 下载或 clone 本仓库。
2. 打开：

```text
chrome://extensions/
```

3. 开启右上角「开发者模式」。
4. 点击「加载已解压的扩展程序」。
5. 选择仓库中的 `extension` 文件夹。
6. 打开一个已登录的 Mnet Plus 视频页。
7. 点击浏览器工具栏里的扩展图标。
8. 扩展会自动读取字幕轨，你可以勾选后下载。

实验版尚未发布到 Chrome Web Store，因此目前需要手动加载解压目录。

## 备用 / 开发方式

仓库保留了一些在开发过程中使用过的方式，主要用于调试、接口研究或后续维护：

- `browser_console_extractor.js`：DevTools Console 版本
- `mnetplus_subs.py`：Python CLI 实验版
- `download_subtitles.ps1` / `download_subtitles.bat`：Windows 实验入口

由于字幕 cue 请求可能依赖当前浏览器登录态，这些独立脚本不作为普通用户的首选路径。**用户脚本版本已经在真实 Mnet Plus 登录页面中验证可用。**

## 工作原理

Mnet Plus 网页会先请求视频元数据，其中包含：

- 视频 ID
- 视频总时长
- `videoCaptionId`
- 字幕语言配置
- AI 自动生成标记（如有）

随后播放器会按播放时间请求字幕 cue。工具在用户已经正常登录并有权访问该视频的浏览器环境中，复用同类请求读取字幕，按时间去重后转换为 SRT。

接口属于 Mnet Plus 网页内部实现细节，未来可能变化。如果失效，可通过 DevTools → Network 重新确认当前请求结构并提交 Issue。

## 隐私与安全

正常使用用户脚本或扩展时：

- 不需要导出 HAR
- 不需要手动复制 Cookie
- 不需要把 Authorization token 发给第三方
- 不会把登录令牌写入下载出的字幕文件

请不要公开上传包含 Cookie、Authorization token 或其他会话信息的 HAR 文件。

## 重要声明 / Personal-use notice

**本项目仅用于个人学习、语言学习、字幕研究、可访问性研究及技术学习。**

- 本工具不提供、托管或附带任何 Mnet Plus 视频或字幕内容。
- 字幕、节目、视频及相关知识产权归其各自权利人所有。
- 请勿使用本工具批量转载、重新发布、销售、商业分发或建立未经授权的字幕资源库。
- 下载或保存字幕前，请确认你的使用方式符合 Mnet Plus 的服务条款、当地法律以及相关权利人的要求。
- 本项目不旨在绕过 DRM、付费墙、地区限制或其他技术访问控制。
- 你应当仅处理自己正常有权访问的内容，并对自己的使用行为负责。

## 开发与测试

Python 旧版测试：

```bash
python -m unittest discover -s tests -v
```

## License

代码使用 MIT License。MIT License 仅适用于本仓库中的源代码，不授予任何第三方视频、字幕、商标或其他内容的使用权。
