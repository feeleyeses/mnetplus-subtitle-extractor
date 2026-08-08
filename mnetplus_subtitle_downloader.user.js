// ==UserScript==
// @name         Mnet Plus Subtitle Downloader
// @namespace    https://github.com/feeleyeses/mnetplus-subtitle-extractor
// @version      1.0.0
// @description  Detect available Mnet Plus subtitle tracks and export selected tracks as SRT.
// @author       feeleyeses
// @match        https://mnetplus.world/media/*/videos/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const API_BASE = 'https://api.mnetplus.world/media/v1/public';
  const BTN_ID = 'mnetplus-subtitle-downloader-btn';
  const MODAL_ID = 'mnetplus-subtitle-downloader-modal';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function getCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const item = part.trim();
      if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
    }
    return null;
  }

  function getVideoId() {
    const m = location.pathname.match(/\/videos\/([0-9a-fA-F]{24})(?:\/|$)/);
    return m ? m[1].toLowerCase() : null;
  }

  function getLocaleParts() {
    const localePath = location.pathname.match(/\/media\/([^/]+)\/videos\//)?.[1] || 'en';
    const localeMap = {
      'zh-CN': ['zh', 'CN'],
      'zh-TW': ['zh', 'TW'],
      ko: ['ko', 'KR'],
      ja: ['ja', 'JP'],
      en: ['en', 'US'],
    };
    return localeMap[localePath] || ['en', 'US'];
  }

  function buildHeaders() {
    const [langCode, countryCode] = getLocaleParts();
    const deviceId = getCookie('mnet-unique-id') || crypto.randomUUID();
    const browserName = getCookie('mnet-browser-name') || 'Chrome';
    const accessToken = getCookie('_mnet_atk');

    if (!accessToken) {
      throw new Error('未找到 Mnet Plus 登录令牌。请先登录 Mnet Plus，然后刷新当前视频页。');
    }

    return {
      Accept: '*/*',
      'X-Lang-Country': `${langCode}:${countryCode}`,
      'X-User-Agent': `${langCode}:${countryCode}::WEB:${browserName}:::${deviceId}`,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  async function apiGet(url, retries = 3) {
    let last;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: buildHeaders(),
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          let body = '';
          try { body = await res.text(); } catch {}
          throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `\n${body.slice(0, 300)}` : ''}`);
        }
        return await res.json();
      } catch (err) {
        last = err;
        if (i + 1 < retries) await sleep(700 * (i + 1));
      }
    }
    throw last;
  }

  function srtTime(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) * 1000));
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const ms = total % 1000;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  function toSrt(cues) {
    return cues.map((cue, i) => {
      const end = cue.start + Math.max(cue.duration, 0.001);
      return `${i + 1}\n${srtTime(cue.start)} --> ${srtTime(end)}\n${cue.text}`;
    }).join('\n\n') + '\n';
  }

  function safeName(name) {
    return (name || 'mnetplus-video')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/[. ]+$/g, '')
      .slice(0, 120) || 'mnetplus-video';
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/x-subrip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  async function downloadLanguage(videoId, captionId, language, durationSec, onProgress) {
    const map = new Map();
    let interval = 15;

    for (let second = 0; second <= durationSec + interval; second += interval) {
      const q = new URLSearchParams({ language, displaySecond: String(second) });
      const payload = await apiGet(`${API_BASE}/videos/${videoId}/captions/${captionId}/cues?${q}`);
      const returnedInterval = Number(payload.captionIntervalSecond);
      if (Number.isFinite(returnedInterval) && returnedInterval > 0) interval = returnedInterval;

      const contentMap = payload.contentMap || {};
      for (const item of Object.values(contentMap)) {
        if (!item || item.content == null) continue;
        const start = Number(item.displaySecond);
        const duration = Number(item.displayDurationSecond);
        const text = String(item.content).trim();
        if (!Number.isFinite(start) || !Number.isFinite(duration) || !text) continue;
        map.set(`${start}\u0000${text}`, { start, duration, text });
      }

      if (second % 150 === 0 || second >= durationSec) {
        onProgress?.(Math.min(second, durationSec), durationSec, map.size);
      }
    }

    return [...map.values()].sort((a, b) => a.start - b.start || a.duration - b.duration || a.text.localeCompare(b.text));
  }

  function injectStyles() {
    if (document.getElementById('mnetplus-subtitle-downloader-style')) return;
    const style = document.createElement('style');
    style.id = 'mnetplus-subtitle-downloader-style';
    style.textContent = `
      #${BTN_ID}{position:fixed;right:20px;bottom:24px;z-index:2147483647;border:0;border-radius:999px;padding:11px 16px;background:#ff1f8f;color:#fff;font:600 14px/1.2 Arial,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.3);cursor:pointer}
      #${BTN_ID}:hover{filter:brightness(1.07)}
      #${MODAL_ID}{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:Arial,"Microsoft YaHei",sans-serif}
      #${MODAL_ID} .box{width:min(520px,calc(100vw - 32px));max-height:80vh;overflow:auto;background:#171717;color:#fff;border-radius:16px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.5)}
      #${MODAL_ID} h3{margin:0 0 8px;font-size:20px}
      #${MODAL_ID} .title{opacity:.72;font-size:13px;margin-bottom:16px;word-break:break-word}
      #${MODAL_ID} .track{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-top:1px solid #333}
      #${MODAL_ID} .track input{margin-top:3px;transform:scale(1.15)}
      #${MODAL_ID} .code{opacity:.62;font-size:12px;margin-top:3px}
      #${MODAL_ID} .ai{color:#ff84be;margin-left:6px;font-size:12px}
      #${MODAL_ID} .actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
      #${MODAL_ID} button{border:0;border-radius:10px;padding:9px 14px;cursor:pointer;font-weight:600}
      #${MODAL_ID} .cancel{background:#333;color:#fff}
      #${MODAL_ID} .download{background:#ff1f8f;color:#fff}
      #${MODAL_ID} .status{margin-top:14px;padding:10px 12px;background:#222;border-radius:10px;font-size:13px;white-space:pre-wrap;display:none}
    `;
    document.head.appendChild(style);
  }

  function closeModal() {
    document.getElementById(MODAL_ID)?.remove();
  }

  async function openDownloader() {
    try {
      const videoId = getVideoId();
      if (!videoId) throw new Error('当前页面不是可识别的 Mnet Plus 视频页。');

      const button = document.getElementById(BTN_ID);
      const oldText = button?.textContent;
      if (button) {
        button.disabled = true;
        button.textContent = '识别字幕中…';
      }

      const info = await apiGet(`${API_BASE}/guests/videos/${videoId}`);
      const caption = info.videoCaption || {};
      const captionId = caption.videoCaptionId;
      const configs = Array.isArray(caption.languageConfigs) ? caption.languageConfigs : [];
      if (!captionId || !configs.length) throw new Error('这个视频没有检测到可下载的字幕轨。');

      if (button) {
        button.disabled = false;
        button.textContent = oldText || '下载字幕';
      }

      closeModal();
      const overlay = document.createElement('div');
      overlay.id = MODAL_ID;
      overlay.innerHTML = `
        <div class="box">
          <h3>选择要下载的字幕</h3>
          <div class="title"></div>
          <div class="tracks"></div>
          <div class="status"></div>
          <div class="actions">
            <button class="cancel">取消</button>
            <button class="download">下载选中字幕</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      overlay.querySelector('.title').textContent = info.name || videoId;
      const tracks = overlay.querySelector('.tracks');
      configs.forEach((cfg, idx) => {
        const row = document.createElement('label');
        row.className = 'track';
        row.innerHTML = `
          <input type="checkbox" value="${cfg.language}" ${idx < 3 ? 'checked' : ''}>
          <div>
            <div>${cfg.languageLabel || cfg.language}${cfg.aiGeneratedLabel ? `<span class="ai">${cfg.aiGeneratedLabel}</span>` : ''}</div>
            <div class="code">${cfg.language}</div>
          </div>`;
        tracks.appendChild(row);
      });

      overlay.querySelector('.cancel').onclick = closeModal;
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

      overlay.querySelector('.download').onclick = async () => {
        const selected = [...overlay.querySelectorAll('input[type="checkbox"]:checked')].map((x) => x.value);
        if (!selected.length) return alert('请至少选择一种字幕。');

        const dlBtn = overlay.querySelector('.download');
        const cancelBtn = overlay.querySelector('.cancel');
        const status = overlay.querySelector('.status');
        dlBtn.disabled = true;
        cancelBtn.disabled = true;
        status.style.display = 'block';

        try {
          const durationSec = Math.max(1, Math.ceil(Number(info.videoLength || 0) / 1000));
          const baseName = safeName(info.name || videoId);

          for (const language of selected) {
            status.textContent = `正在下载 ${language}…`;
            const cues = await downloadLanguage(videoId, captionId, language, durationSec, (done, total, count) => {
              status.textContent = `正在下载 ${language}…\n${done}/${total} 秒 · 已收集 ${count} 条字幕`;
            });
            downloadText(`${baseName}.${language}.srt`, toSrt(cues));
            status.textContent = `${language} 完成：${cues.length} 条字幕。`;
            await sleep(700);
          }

          status.textContent = `完成！已下载：${selected.join(', ')}\n请查看浏览器“下载”文件夹。`;
          dlBtn.textContent = '完成';
          dlBtn.disabled = false;
          dlBtn.onclick = closeModal;
          cancelBtn.style.display = 'none';
        } catch (err) {
          status.textContent = `下载失败：${err?.message || err}`;
          dlBtn.disabled = false;
          cancelBtn.disabled = false;
        }
      };
    } catch (err) {
      const button = document.getElementById(BTN_ID);
      if (button) {
        button.disabled = false;
        button.textContent = '下载字幕';
      }
      alert(`Mnet Plus 字幕工具：\n\n${err?.message || err}`);
    }
  }

  function mountButton() {
    injectStyles();
    if (document.getElementById(BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.textContent = '下载字幕';
    btn.onclick = openDownloader;
    document.body.appendChild(btn);
  }

  mountButton();

  // Mnet Plus uses client-side navigation. Keep the button available after route changes.
  const observer = new MutationObserver(() => {
    if (getVideoId()) mountButton();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
