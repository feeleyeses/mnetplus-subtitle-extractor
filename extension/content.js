(() => {
  'use strict';

  const API_BASE = 'https://api.mnetplus.world/media/v1/public';
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const preparedFiles = new Map();
  let cacheVideoId = getVideoId();

  function getCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const item = part.trim();
      if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
    }
    return null;
  }

  function getVideoId() {
    const match = location.pathname.match(/\/videos\/([0-9a-fA-F]{24})(?:\/|$)/);
    return match ? match[1].toLowerCase() : null;
  }

  function syncVideoCache() {
    const current = getVideoId();
    if (cacheVideoId && current && cacheVideoId !== current) preparedFiles.clear();
    cacheVideoId = current;
    return current;
  }

  function localeParts() {
    const locale = location.pathname.match(/\/media\/([^/]+)\/videos\//)?.[1] || 'en';
    const map = {'zh-CN':['zh','CN'],'zh-TW':['zh','TW'],ko:['ko','KR'],ja:['ja','JP'],en:['en','US']};
    return map[locale] || ['en', 'US'];
  }

  function headers() {
    const token = getCookie('_mnet_atk');
    if (!token) throw new Error('未检测到 Mnet Plus 登录状态，请先登录并刷新视频页面。');
    const [lang, country] = localeParts();
    const deviceId = getCookie('mnet-unique-id') || crypto.randomUUID();
    const browserName = getCookie('mnet-browser-name') || 'Chrome';
    return {Accept:'*/*','X-Lang-Country':`${lang}:${country}`,'X-User-Agent':`${lang}:${country}::WEB:${browserName}:::${deviceId}`,Authorization:`Bearer ${token}`};
  }

  async function apiGet(url, retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {method:'GET',headers:headers(),credentials:'include',cache:'no-store'});
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        return await response.json();
      } catch (error) {
        lastError = error;
        if (i + 1 < retries) await sleep(600 * (i + 1));
      }
    }
    throw lastError;
  }

  function srtTime(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) * 1000));
    const h = Math.floor(total / 3600000), m = Math.floor((total % 3600000) / 60000), s = Math.floor((total % 60000) / 1000), ms = total % 1000;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
  }

  function toSrt(cues) {
    return cues.map((cue,index) => `${index+1}\n${srtTime(cue.start)} --> ${srtTime(cue.start + Math.max(cue.duration,0.001))}\n${cue.text}`).join('\n\n') + '\n';
  }

  function safeName(name) {
    return (name || 'mnetplus-video').replace(/[\\/:*?"<>|]+/g,'_').replace(/[. ]+$/g,'').slice(0,120) || 'mnetplus-video';
  }

  function saveText(filename, text) {
    const blob = new Blob([text], {type:'application/x-subrip;charset=utf-8'});
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.style.display = 'none';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  async function getInfo() {
    const videoId = syncVideoCache();
    if (!videoId) throw new Error('当前页面不是可识别的 Mnet Plus 视频页。');
    const info = await apiGet(`${API_BASE}/guests/videos/${videoId}`), caption = info.videoCaption || {};
    const configs = Array.isArray(caption.languageConfigs) ? caption.languageConfigs : [];
    if (!caption.videoCaptionId || !configs.length) throw new Error('当前视频没有检测到可下载字幕。');
    return {videoId,title:info.name || videoId,videoLength:Number(info.videoLength || 0),captionId:caption.videoCaptionId,tracks:configs.map(item => ({language:item.language,label:item.languageLabel || item.language,ai:item.aiGeneratedLabel || ''}))};
  }

  const preparedKey = (videoId, language) => `${videoId}:${language}`;
  function publicItem(item) { return {language:item.language,label:item.label,ai:item.ai,filename:item.filename,count:item.count,size:new Blob([item.text]).size}; }
  function listPrepared(videoId) { return [...preparedFiles.values()].filter(item => item.videoId === videoId).map(publicItem); }

  async function prepareLanguage(info, track) {
    const durationSec = Math.max(1, Math.ceil(info.videoLength / 1000)), cues = new Map();
    let interval = 15;
    for (let second = 0; second <= durationSec + interval; second += interval) {
      const query = new URLSearchParams({language:track.language,displaySecond:String(second)});
      const payload = await apiGet(`${API_BASE}/videos/${info.videoId}/captions/${info.captionId}/cues?${query}`);
      const returnedInterval = Number(payload.captionIntervalSecond);
      if (Number.isFinite(returnedInterval) && returnedInterval > 0) interval = returnedInterval;
      for (const item of Object.values(payload.contentMap || {})) {
        if (!item || item.content == null) continue;
        const start = Number(item.displaySecond), duration = Number(item.displayDurationSecond), text = String(item.content).trim();
        if (!Number.isFinite(start) || !Number.isFinite(duration) || !text) continue;
        cues.set(`${start}\u0000${text}`, {start,duration,text});
      }
      if (second % 150 === 0 || second >= durationSec) chrome.runtime.sendMessage({type:'MNET_SUB_PROGRESS',language:track.language,done:Math.min(second,durationSec),total:durationSec,count:cues.size}).catch(() => {});
    }
    const sorted = [...cues.values()].sort((a,b) => a.start-b.start || a.duration-b.duration || a.text.localeCompare(b.text));
    const prepared = {videoId:info.videoId,language:track.language,label:track.label,ai:track.ai,filename:`${safeName(info.title)}.${track.language}.srt`,count:sorted.length,text:toSrt(sorted)};
    preparedFiles.set(preparedKey(info.videoId,track.language), prepared);
    return publicItem(prepared);
  }

  chrome.runtime.onMessage.addListener((message,_sender,sendResponse) => {
    if (message?.type === 'MNET_SUB_GET_INFO') {
      getInfo().then(info => sendResponse({ok:true,info,prepared:listPrepared(info.videoId)})).catch(error => sendResponse({ok:false,error:error.message})); return true;
    }
    if (message?.type === 'MNET_SUB_PREPARE') {
      (async () => { try {
        const info = await getInfo(), selected = Array.isArray(message.languages) ? message.languages : [], byLanguage = new Map(info.tracks.map(track => [track.language,track]));
        for (const language of selected) { const track = byLanguage.get(language); if (track) { await prepareLanguage(info,track); await sleep(250); } }
        sendResponse({ok:true,prepared:listPrepared(info.videoId)});
      } catch (error) { sendResponse({ok:false,error:error.message}); } })(); return true;
    }
    if (message?.type === 'MNET_SUB_SAVE_PREPARED') {
      (async () => { try {
        const info = await getInfo(), languages = Array.isArray(message.languages) ? message.languages : [message.language].filter(Boolean), saved = [];
        for (const language of languages) { const item = preparedFiles.get(preparedKey(info.videoId,language)); if (!item) continue; saveText(item.filename,item.text); saved.push(item.filename); await sleep(300); }
        if (!saved.length) throw new Error('没有找到可保存的已生成字幕。');
        sendResponse({ok:true,saved});
      } catch (error) { sendResponse({ok:false,error:error.message}); } })(); return true;
    }
    if (message?.type === 'MNET_SUB_DELETE_PREPARED') {
      (async () => { try {
        const info = await getInfo(), languages = Array.isArray(message.languages) ? message.languages : [];
        for (const language of languages) preparedFiles.delete(preparedKey(info.videoId,language));
        sendResponse({ok:true,prepared:listPrepared(info.videoId)});
      } catch (error) { sendResponse({ok:false,error:error.message}); } })(); return true;
    }
    if (message?.type === 'MNET_SUB_CLEAR_PREPARED') {
      (async () => { try { const info = await getInfo(); for (const key of [...preparedFiles.keys()]) if (key.startsWith(`${info.videoId}:`)) preparedFiles.delete(key); sendResponse({ok:true,prepared:[]}); } catch (error) { sendResponse({ok:false,error:error.message}); } })(); return true;
    }
  });
})();
