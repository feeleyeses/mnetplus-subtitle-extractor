const titleEl = document.getElementById('title');
const tracksEl = document.getElementById('tracks');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const downloadBtn = document.getElementById('download');

let activeTabId = null;

function showError(message) {
  errorEl.textContent = message || '发生未知错误。';
  downloadBtn.disabled = true;
}

function showStatus(message) {
  statusEl.style.display = 'block';
  statusEl.textContent = message;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('无法读取当前标签页。');
  return tab;
}

function renderTracks(info) {
  titleEl.textContent = info.title;
  tracksEl.innerHTML = '';

  info.tracks.forEach((track, index) => {
    const label = document.createElement('label');
    label.className = 'track';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = track.language;
    checkbox.checked = index < 3;

    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'label';
    name.textContent = track.label;

    if (track.ai) {
      const ai = document.createElement('span');
      ai.className = 'ai';
      ai.textContent = track.ai;
      name.appendChild(ai);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = track.language;

    body.append(name, meta);
    label.append(checkbox, body);
    tracksEl.appendChild(label);
  });

  downloadBtn.disabled = false;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'MNET_SUB_PROGRESS') return;
  showStatus(`正在下载 ${message.language}…\n${message.done}/${message.total} 秒 · 已收集 ${message.count} 条字幕`);
});

(async () => {
  try {
    const tab = await getActiveTab();
    activeTabId = tab.id;

    if (!tab.url?.includes('mnetplus.world/media/') || !tab.url.includes('/videos/')) {
      throw new Error('请先打开一个 Mnet Plus 视频页面，再点击扩展。');
    }

    const response = await chrome.tabs.sendMessage(activeTabId, { type: 'MNET_SUB_GET_INFO' });
    if (!response?.ok) throw new Error(response?.error || '字幕识别失败。');
    renderTracks(response.info);
  } catch (error) {
    titleEl.textContent = '无法识别当前页面';
    showError(error.message);
  }
})();

downloadBtn.addEventListener('click', async () => {
  const languages = [...document.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  if (!languages.length) {
    showError('请至少选择一种字幕。');
    return;
  }

  errorEl.textContent = '';
  downloadBtn.disabled = true;
  showStatus(`准备下载：${languages.join(', ')}`);

  try {
    const response = await chrome.tabs.sendMessage(activeTabId, {
      type: 'MNET_SUB_DOWNLOAD',
      languages
    });

    if (!response?.ok) throw new Error(response?.error || '下载失败。');

    const summary = response.results.map((item) => `${item.language}: ${item.count} 条`).join('\n');
    showStatus(`完成！\n${summary}\n\n请查看浏览器下载文件夹。`);
    downloadBtn.textContent = '已完成';
  } catch (error) {
    showError(error.message);
    showStatus('下载未完成。');
    downloadBtn.disabled = false;
  }
});
