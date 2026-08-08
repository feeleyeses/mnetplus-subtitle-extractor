# Mnet Plus Subtitle Extractor

一个轻量的 Python 工具，用于读取 **Mnet Plus 网页播放器公开调用的字幕 API**，并将可用字幕轨导出为 `.srt`（可选同时导出 JSON）。

它适合这样的场景：网页播放器能显示字幕，但常见在线字幕下载器或浏览器扩展并不支持 Mnet Plus。

## 功能

- 输入 Mnet Plus 视频链接或视频 ID
- 自动读取 `videoCaptionId`
- 自动列出当前视频提供的字幕语言
- 标注 Mnet Plus 返回的 AI 自动生成字幕
- 批量抓取字幕 cue，自动去重并按时间排序
- 导出标准 UTF-8 SRT
- 可选导出 JSON，便于后续校对、翻译或数据处理
- 仅使用 Python 标准库，无需安装第三方依赖

## 使用要求

- Python 3.10+（推荐 3.11+）
- 能正常访问 `mnetplus.world` 与 `api.mnetplus.world`
- 视频本身需要在你所在地区、账号权限与 Mnet Plus 正常规则下可访问

本工具不会绕过 DRM、登录、付费墙、地区限制或其他访问控制。

## 快速开始

克隆仓库后：

```bash
python mnetplus_subs.py "https://mnetplus.world/media/zh-CN/videos/6a7581996b4b0e2c30b281a5" --list
```

列出字幕轨后，下载全部可用字幕：

```bash
python mnetplus_subs.py "https://mnetplus.world/media/zh-CN/videos/6a7581996b4b0e2c30b281a5"
```

只下载韩语、英语和简体中文：

```bash
python mnetplus_subs.py "https://mnetplus.world/media/zh-CN/videos/6a7581996b4b0e2c30b281a5" --langs ko,en,zh_CN
```

同时保存 JSON：

```bash
python mnetplus_subs.py "VIDEO_URL" --langs ko,en --json
```

指定输出目录：

```bash
python mnetplus_subs.py "VIDEO_URL" --out-dir my-subs
```

## 字幕语言与 AI 标记

工具不会自行猜测哪些字幕是官方人工字幕、哪些是自动生成字幕，而是直接显示 Mnet Plus 视频元数据返回的状态。例如某个视频可能返回：

```text
ko: 韩国语 (AI 自动生成)
en: 英语
ja: 日本语 (AI 自动生成)
zh_CN: 中文 简体 (AI 自动生成)
zh_TW: 中文 繁体 (AI 自动生成)
```

这使得人工字幕可以用来辅助校准自动生成字幕，但工具本身不会自动“纠错”字幕文本。

## 工作原理

Mnet Plus 网页播放器会请求公开媒体接口获取视频信息。视频元数据中包含：

- 视频 ID
- 视频总时长
- `videoCaptionId`
- 字幕语言配置
- AI 自动生成标记（如有）

播放器随后按播放时间请求 caption cue。该工具复用同一类公开请求，在视频时长范围内按间隔抓取 cue，并根据时间和文本去重，最后转换成 SRT。

接口属于 Mnet Plus 的非公开开发者接口实现细节，未来可能发生变化。如失效，请先在浏览器 DevTools → Network 中确认网页播放器当前使用的请求结构，再提交 Issue。

## 重要声明 / Personal-use notice

**本项目仅用于个人学习、语言学习、字幕研究、可访问性研究及技术学习。**

- 本工具不提供、托管或附带任何 Mnet Plus 视频或字幕内容。
- 字幕、节目、视频及相关知识产权归其各自权利人所有。
- 请勿使用本工具批量转载、重新发布、销售、商业分发或建立未经授权的字幕资源库。
- 下载或保存字幕前，请确认你的使用方式符合 Mnet Plus 的服务条款、当地法律以及相关权利人的要求。
- 本项目不旨在绕过 DRM、身份验证、付费墙、地区限制或其他技术访问控制。
- 你应当仅处理自己有权访问的内容，并对自己的使用行为负责。

如果权利人认为本项目中的技术说明存在问题，请通过 GitHub Issue 联系维护者。

## 隐私与安全

正常使用本脚本**不需要导出浏览器 Cookie 或 HAR 文件**。请不要把包含登录 Cookie、Authorization token 或其他会话信息的 HAR 文件公开上传到 GitHub。

## 开发与测试

运行测试：

```bash
python -m unittest discover -s tests -v
```

## License

代码使用 MIT License。MIT License 仅适用于本仓库中的源代码，不授予任何第三方视频、字幕、商标或其他内容的使用权。
