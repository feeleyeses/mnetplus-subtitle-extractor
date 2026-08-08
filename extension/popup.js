const titleEl = document.getElementById('title');
const tracksEl = document.getElementById('tracks');
const preparedEl = document.getElementById('prepared');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const prepareBtn = document.getElementById('prepare');

let activeTabId = null;
let currentInfo = null;

function showError(message) {
  errorEl.textContent = message || '发生未知错误。';
}

function clearError() {
  errorEl.textContent = '';
}

function showStatus(message) {
  statusEl.style.display = 'block';
  statusEl.textContent = message;
}

function clearStatus() {
  statusEl.style.display = 'none';
  statusEl.textContent = '';
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('无法读取当前标签页。');
  return tab;
}

function renderTracks(info) {
  titleEl.textContent = info.title;
  tracksEl.innerHTML = '';

  info.tracks.forEach((track) => {
    const label = document.createElement('label');
    label.className = 'track';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = track.language;
    checkbox.checked = false;

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

  prepareBtn.disabled = false;
}

function renderPrepared(items) {
  preparedEl.innerHTML = '';

  if (!items?.length) {
    preparedEl.innerHTML = '<div class="empty">尚未生成字幕资源。</div>';
    return;
  }

  const heading = document.createElement('div');
  heading.className = 'section-title';
  heading.textContent = '已准备好的字幕';
  preparedEl.appendChild(heading);

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'prepared-item';

    const body = document.createElement('div');
    body.className = 'prepared-body';

    const name = document.createElement('div');
    name.className = 'label';
    name.textContent = `${item.label || item.language} · ${item.count} 条`;

    const meta = document.createElement('div');
    meta.className = 'meta filename';
    meta.textContent = item.filename;

    const save = document.createElement('button');
    save.className = 'save-one';
    save.textContent = '保存';
    save.onclick = async () => {
      clearError();
      save.disabled = true;
      save.textContent = '打开保存窗口…';
      try {
        const response = await chrome.tabs.sendMessage(activeTabId, {
          type: 'MNET_SUB_SAVE_PREPARED',
          language: item.language
        });
        if (!response?.ok) throw new Error(response?.error || '保存失败。');
        showStatus(`已发起保存：${response.filename}\n如果你在系统保存窗口点了“取消”，资源仍会保留在这里，可以再次点“保存”。`);
      } catch (error) {
        showError(error.message);
      } finally {
        save.disabled = false;
        save.textContent = '保存';
      }
    };

    body.append(name, meta);
    row.append(body, save);
    preparedEl.appendChild(row);
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'MNET_SUB_PROGRESS') return;
  showStatus(`正在生成 ${message.language}…\n${message.done}/${message.total} 秒 · 已收集 ${message.count} 条字幕`);
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

    currentInfo = response.info;
    renderTracks(response.info);
    renderPrepared(response.prepared || []);
  } catch (error) {
    titleEl.textContent = '无法识别当前页面';
    showError(error.message);
    prepareBtn.disabled = true;
  }
})();

prepareBtn.addEventListener('click', async () => {
  const languages = [...document.querySelectorAll('#tracks input[type="checkbox"]:checked')].map((input) => input.value);
  if (!languages.length) {
    showError('请至少选择一种字幕。');
    return;
  }

  clearError();
  prepareBtn.disabled = true;
  clearStatus();
  showStatus(`准备生成：${languages.join(', ')}`);

  try {
    const response = await chrome.tabs.sendMessage(activeTabId, {
      type: 'MNET_SUB_PREPARE',
      languages
    });

    if (!response?.ok) throw new Error(response?.error || '字幕生成失败。');

    renderPrepared(response.prepared || []);
    showStatus('生成完成。请在“已准备好的字幕”里逐个点击“保存”。\n即使保存窗口里点了取消，也可以重新打开扩展再次保存，无需重新生成。');

    document.querySelectorAll('#tracks input[type="checkbox"]:checked').forEach((input) => {
      input.checked = false;
    });
  } catch (error) {
    showError(error.message);
    showStatus('字幕生成未完成。');
  } finally {
    prepareBtn.disabled = false;
  }
});
