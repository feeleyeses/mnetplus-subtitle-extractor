# Chrome Extension（实验版）

这是 Mnet Plus Subtitle Downloader 的 Manifest V3 Chrome 扩展实验版。

## 安装

1. 下载或 clone 整个仓库。
2. Chrome 打开 `chrome://extensions/`。
3. 开启右上角「开发者模式」。
4. 点击「加载已解压的扩展程序」。
5. 选择本仓库的 `extension/` 文件夹。
6. 建议把扩展固定到浏览器工具栏。

## 使用

1. 正常登录 Mnet Plus。
2. 打开一个 Mnet Plus 视频页面。
3. 点击工具栏里的 **Mnet Plus Subtitle Downloader**。
4. 扩展会读取当前视频真实提供的字幕轨。
5. 勾选需要的语言。
6. 点击「下载选中字幕」。
7. 等待完成，并在浏览器下载目录查看 `.srt`。

## 字幕轨

扩展不会写死语言。它根据视频元数据中的 `languageConfigs` 动态显示当前视频实际提供的字幕，例如：

- `ko` 韩国语
- `en` 英语
- `ja` 日本语
- `zh_CN` 中文简体
- `zh_TW` 中文繁体

如果 Mnet Plus 给某个轨道返回 AI 自动生成标记，扩展会一并显示。

## 当前状态

**Experimental / 实验版。**

目前已经完成：

- Manifest V3 配置
- Mnet Plus 视频页 content script
- 浏览器工具栏 popup
- 自动识别字幕轨
- 多选字幕轨
- 下载进度显示
- SRT 导出

仍需真实浏览器测试：

- 长视频连续下载时 popup 生命周期是否影响任务
- Chrome 多文件下载权限提示
- Mnet Plus 客户端路由切换后 content script 的行为
- 不同账号 / 地区 / 字幕配置的视频兼容性

在这些测试完成前，日常使用仍推荐仓库根目录的 Tampermonkey 用户脚本 `mnetplus_subtitle_downloader.user.js`。

## 安全说明

扩展只在匹配的 Mnet Plus 视频页面工作，并使用当前浏览器中已经存在的正常登录状态请求字幕。请勿将 Cookie、Authorization token 或 HAR 文件公开分享。

本项目仅供个人学习、语言学习、字幕研究、可访问性研究和技术学习。详见仓库根目录 README。
