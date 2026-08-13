const titleEl=document.getElementById('title'),tracksEl=document.getElementById('tracks'),preparedEl=document.getElementById('prepared'),statusEl=document.getElementById('status'),errorEl=document.getElementById('error'),prepareBtn=document.getElementById('prepare'),hintEl=document.getElementById('hint'),languageBtn=document.getElementById('language-btn'),languageMenu=document.getElementById('language-menu'),appTitleEl=document.getElementById('app-title');
let activeTabId=null,currentInfo=null,preparedItems=[],currentLang='en',localeMessages={};

const localeFolder=lang=>lang==='zh-CN'?'zh_CN':'en';
async function loadLocaleMessages(lang){
  const url=chrome.runtime.getURL(`_locales/${localeFolder(lang)}/messages.json`);
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Unable to load locale: ${lang}`);
  localeMessages=await response.json();
}
function formatLocaleEntry(entry,args){
  if(!entry)return '';
  let text=String(entry.message||'');
  const placeholders=entry.placeholders||{};
  for(const [name,meta] of Object.entries(placeholders)){
    const match=String(meta.content||'').match(/^\$(\d+)$/);
    const value=match?args[Number(match[1])-1]:'';
    text=text.replace(new RegExp(`\\$${name}\\$`,'gi'),String(value??''));
  }
  return text;
}
const t=(key,...args)=>formatLocaleEntry(localeMessages[key],args)||key;
const trackKeyMap={ko:'trackKo',en:'trackEn',ja:'trackJa',zh_CN:'trackZhCN',zh_TW:'trackZhTW',id:'trackId'};
const trackLabel=(language,fallback='')=>{const key=trackKeyMap[language];return key?t(key):(fallback||language);};
const showError=m=>errorEl.textContent=m||t('unknownError'),clearError=()=>errorEl.textContent='',showStatus=m=>{statusEl.style.display='block';statusEl.textContent=m;},clearStatus=()=>{statusEl.style.display='none';statusEl.textContent='';};

async function loadLanguage(){
  const stored=await chrome.storage.local.get('uiLanguage');
  if(stored.uiLanguage==='en'||stored.uiLanguage==='zh-CN')return stored.uiLanguage;
  return chrome.i18n.getUILanguage().toLowerCase()==='zh-cn'?'zh-CN':'en';
}
async function setLanguage(lang){
  currentLang=lang==='zh-CN'?'zh-CN':'en';
  await chrome.storage.local.set({uiLanguage:currentLang});
  await loadLocaleMessages(currentLang);
  applyLanguage();
}
function applyLanguage(){
  document.documentElement.lang=currentLang;
  document.title=t('appName');
  appTitleEl.textContent=t('appName');
  prepareBtn.textContent=t('prepare');
  hintEl.textContent=t('baseHint');
  document.querySelectorAll('.language-option').forEach(x=>{
    x.classList.toggle('active',x.dataset.lang===currentLang);
    x.textContent=(x.dataset.lang===currentLang?'✓ ':'')+(x.dataset.lang==='en'?'English':'简体中文');
  });
  if(currentInfo){renderTracks(currentInfo);renderPrepared(preparedItems);}
  else titleEl.textContent=t('detecting');
}
languageBtn.addEventListener('click',e=>{e.stopPropagation();languageMenu.hidden=!languageMenu.hidden;});
document.addEventListener('click',()=>languageMenu.hidden=true);
document.querySelectorAll('.language-option').forEach(option=>option.addEventListener('click',async e=>{e.stopPropagation();languageMenu.hidden=true;await setLanguage(option.dataset.lang);}));

async function getActiveTab(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw new Error(t('noActiveTab'));return tab;}
function formatBytes(n){if(!Number.isFinite(n))return '';if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`;}
function renderTracks(info){titleEl.textContent=info.title;tracksEl.innerHTML='';info.tracks.forEach(track=>{const label=document.createElement('label');label.className='track';const cb=document.createElement('input');cb.type='checkbox';cb.value=track.language;cb.checked=false;const body=document.createElement('div'),name=document.createElement('div');name.className='label';name.textContent=trackLabel(track.language,track.label);if(track.ai){const ai=document.createElement('span');ai.className='ai';ai.textContent=`(${t('aiGenerated')})`;name.appendChild(ai);}if(preparedItems.some(x=>x.language===track.language)){const done=document.createElement('span');done.className='generated';done.textContent=t('generated');name.appendChild(done);}const meta=document.createElement('div');meta.className='meta';meta.textContent=track.language;body.append(name,meta);label.append(cb,body);tracksEl.appendChild(label);});prepareBtn.disabled=false;}
function isMissingReceiver(error){const message=String(error?.message||error||'').toLowerCase();return message.includes('receiving end does not exist')||message.includes('could not establish connection');}
async function sendRaw(type,payload={}){return await chrome.tabs.sendMessage(activeTabId,{type,...payload});}
async function send(type,payload={}){let r;try{r=await sendRaw(type,payload);}catch(error){if(!isMissingReceiver(error))throw error;await chrome.scripting.executeScript({target:{tabId:activeTabId},files:['content.js']});await new Promise(resolve=>setTimeout(resolve,80));r=await sendRaw(type,payload);}if(!r?.ok)throw new Error(r?.error||t('operationFailed'));return r;}
function selectedPrepared(){return [...preparedEl.querySelectorAll('.prepared-check:checked')].map(x=>x.value);}
function updateBatchButtons(){const n=selectedPrepared().length,save=document.getElementById('save-selected'),del=document.getElementById('delete-selected');if(save){save.disabled=!n;save.textContent=n?t('saveSelectedN',n):t('saveSelected');}if(del){del.disabled=!n;del.textContent=n?t('deleteSelectedN',n):t('deleteSelected');}}
function renderPrepared(items){preparedItems=items||[];preparedEl.innerHTML='';if(!preparedItems.length){const empty=document.createElement('div');empty.className='empty';empty.textContent=t('empty');preparedEl.appendChild(empty);if(currentInfo)renderTracks(currentInfo);return;}
const head=document.createElement('div');head.className='section-head';const sectionTitle=document.createElement('div');sectionTitle.className='section-title';sectionTitle.textContent=t('preparedTitle');const clear=document.createElement('button');clear.className='clear-link';clear.textContent=t('clearAll');head.append(sectionTitle,clear);preparedEl.appendChild(head);
const cache=document.createElement('div');cache.className='cache-hint';const strong=document.createElement('strong');strong.textContent=t('cacheTitle');cache.append(strong,document.createElement('br'),document.createTextNode(t('cacheHint')));preparedEl.appendChild(cache);
preparedItems.forEach(item=>{const row=document.createElement('div');row.className='prepared-item';const cb=document.createElement('input');cb.type='checkbox';cb.className='prepared-check';cb.value=item.language;cb.onchange=updateBatchButtons;const body=document.createElement('div');body.className='prepared-body';const name=document.createElement('div');name.className='label';name.textContent=`${trackLabel(item.language,item.label)} · ${t('items',item.count)}${item.size?` · ${formatBytes(item.size)}`:''}`;const meta=document.createElement('div');meta.className='meta filename';meta.textContent=item.filename;const save=document.createElement('button');save.className='save-one';save.textContent=t('save');save.onclick=async()=>{clearError();save.disabled=true;try{await send('MNET_SUB_SAVE_PREPARED',{languages:[item.language]});showStatus(t('saveStarted',item.filename));}catch(e){showError(e.message);}finally{save.disabled=false;}};body.append(name,meta);row.append(cb,body,save);preparedEl.appendChild(row);});
const batch=document.createElement('div');batch.className='batch';const saveSelected=document.createElement('button');saveSelected.id='save-selected';saveSelected.disabled=true;saveSelected.textContent=t('saveSelected');saveSelected.onclick=async()=>{const languages=selectedPrepared();if(!languages.length)return;try{clearError();await send('MNET_SUB_SAVE_PREPARED',{languages});showStatus(t('batchSave',languages.length));}catch(e){showError(e.message);}};const deleteSelected=document.createElement('button');deleteSelected.id='delete-selected';deleteSelected.className='danger';deleteSelected.disabled=true;deleteSelected.textContent=t('deleteSelected');deleteSelected.onclick=async()=>{const languages=selectedPrepared();if(!languages.length)return;try{clearError();const r=await send('MNET_SUB_DELETE_PREPARED',{languages});renderPrepared(r.prepared);showStatus(t('batchDelete',languages.length));}catch(e){showError(e.message);}};batch.append(saveSelected,deleteSelected);preparedEl.appendChild(batch);
clear.onclick=()=>{if(document.getElementById('clear-confirm'))return;const box=document.createElement('div');box.id='clear-confirm';box.className='confirm';box.innerHTML=t('clearConfirm',preparedItems.length);const actions=document.createElement('div');actions.className='confirm-actions';const cancel=document.createElement('button');cancel.className='secondary';cancel.textContent=t('cancel');cancel.onclick=()=>box.remove();const yes=document.createElement('button');yes.className='danger';yes.textContent=t('confirmClear');yes.onclick=async()=>{try{const r=await send('MNET_SUB_CLEAR_PREPARED');renderPrepared(r.prepared);showStatus(t('cacheCleared'));}catch(e){showError(e.message);}};actions.append(cancel,yes);box.appendChild(actions);head.after(box);};if(currentInfo)renderTracks(currentInfo);}
chrome.runtime.onMessage.addListener(message=>{if(message?.type==='MNET_SUB_PROGRESS')showStatus(t('progress',message.language,message.done,message.total,message.count));});

(async()=>{
  currentLang=await loadLanguage();
  await loadLocaleMessages(currentLang);
  applyLanguage();
  try{
    const tab=await getActiveTab();activeTabId=tab.id;
    if(!/^https:\/\/(?:www\.)?mnetplus\.world\/media\//i.test(tab.url||'')||!String(tab.url).includes('/videos/'))throw new Error(t('wrongPage'));
    const r=await send('MNET_SUB_GET_INFO');currentInfo=r.info;preparedItems=r.prepared||[];renderTracks(currentInfo);renderPrepared(preparedItems);
  }catch(e){titleEl.textContent=t('unrecognized');showError(e.message);prepareBtn.disabled=true;}
})();
prepareBtn.addEventListener('click',async()=>{const languages=[...document.querySelectorAll('#tracks input[type="checkbox"]:checked')].map(x=>x.value);if(!languages.length){showError(t('chooseOne'));return;}const replacing=languages.filter(l=>preparedItems.some(x=>x.language===l));clearError();prepareBtn.disabled=true;showStatus(replacing.length?t('replacing',languages.join(', '),replacing.join(', ')):t('generating',languages.join(', ')));try{const r=await send('MNET_SUB_PREPARE',{languages});renderPrepared(r.prepared||[]);showStatus(t('complete'));}catch(e){showError(e.message);showStatus(t('incomplete'));}finally{prepareBtn.disabled=false;}});
