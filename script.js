/* ============================================================
   SimpleMed — script.js
   ============================================================ */

// ── ✏️  CONFIGURE YOUR N8N WEBHOOK URL HERE ───────────────
const WEBHOOK_URL = 'Enter your webhook url';
// ──────────────────────────────────────────────────────────

// ── State ──────────────────────────────────────────────────
let selectedFile = null;
let selectedLang = 'English';
let resultText   = '';

// ── DOM ────────────────────────────────────────────────────
const dropZone   = document.getElementById('dropZone');
const fileInput  = document.getElementById('fileInput');
const dzDefault  = document.getElementById('dzDefault');
const dzPreview  = document.getElementById('dzPreview');
const previewIcon = document.getElementById('previewIcon');
const previewName = document.getElementById('previewName');
const previewSize = document.getElementById('previewSize');
const removeBtn  = document.getElementById('removeFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnLabel   = document.getElementById('btnLabel');
const btnLoader  = document.getElementById('btnLoader');

const stateEmpty   = document.getElementById('stateEmpty');
const stateLoading = document.getElementById('stateLoading');
const stateError   = document.getElementById('stateError');
const outputContent = document.getElementById('outputContent');
const outputTools  = document.getElementById('outputTools');
const errorMsg     = document.getElementById('errorMsg');
const copyBtn      = document.getElementById('copyBtn');
const downloadBtn  = document.getElementById('downloadBtn');
const retryBtn     = document.getElementById('retryBtn');
const toast        = document.getElementById('toast');

// ── Language Selector ───────────────────────────────────────
document.getElementById('langGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedLang = btn.dataset.lang;
});

// ── File Helpers ───────────────────────────────────────────
const ALLOWED_TYPES = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp'];
const MAX_MB = 20;

function emoji(file) {
  return file.type === 'application/pdf' ? '📄' : '🖼️';
}
function fmtSize(bytes) {
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast('Unsupported type. Use PDF, JPG, PNG or WEBP.', 'error');
    return false;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast('File too large. Max 20 MB.', 'error');
    return false;
  }
  return true;
}
function setFile(file) {
  if (!validateFile(file)) return;
  selectedFile = file;
  previewIcon.textContent = emoji(file);
  previewName.textContent = file.name;
  previewSize.textContent = fmtSize(file.size);
  dzDefault.style.display = 'none';
  dzPreview.style.display = 'flex';
  analyzeBtn.disabled = false;
  showToast('File selected: ' + file.name, 'success');
}
function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  dzDefault.style.display = 'flex';
  dzPreview.style.display = 'none';
  analyzeBtn.disabled = true;
}

// ── Drag & Drop ────────────────────────────────────────────
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});
removeBtn.addEventListener('click', e => { e.stopPropagation(); clearFile(); });

// ── Show State ─────────────────────────────────────────────
function showState(name) {
  stateEmpty.style.display   = name === 'empty'   ? 'flex' : 'none';
  stateLoading.style.display = name === 'loading' ? 'flex' : 'none';
  stateError.style.display   = name === 'error'   ? 'flex' : 'none';
  outputContent.style.display = name === 'result' ? 'block' : 'none';
  outputTools.style.display  = name === 'result'  ? 'flex'  : 'none';
}

// ── Loading Step Animator ──────────────────────────────────
let stepInterval;
function startSteps() {
  const steps = ['ls1','ls2','ls3'];
  let i = 0;
  steps.forEach(id => { const el = document.getElementById(id); el.className = 'lstep'; });
  document.getElementById(steps[0]).classList.add('active');
  stepInterval = setInterval(() => {
    document.getElementById(steps[i]).classList.remove('active');
    document.getElementById(steps[i]).classList.add('done');
    i++;
    if (i < steps.length) document.getElementById(steps[i]).classList.add('active');
    else clearInterval(stepInterval);
  }, 1600);
}
function stopSteps() { clearInterval(stepInterval); }

// ── Build FormData payload ─────────────────────────────────
// The file is appended directly — no Base64 conversion.
// n8n receives it as a binary attachment in the Webhook node.
function buildFormData() {
  const form = new FormData();
  form.append('file', selectedFile, selectedFile.name); // raw file
  form.append('language',  selectedLang);
  form.append('fileName',  selectedFile.name);
  form.append('fileType',  selectedFile.type);
  form.append('timestamp', new Date().toISOString());
  return form;
}

// ── Render Result ──────────────────────────────────────────
function renderResult(data) {
  let text = '';

  if (typeof data === 'string') {
    text = data;
  } else if (typeof data === 'object') {
    // Try common keys from n8n AI node responses
    text = data.output || data.text || data.result || data.summary ||
           data.message || data.response || JSON.stringify(data, null, 2);
  }

  resultText = text;

  const langLabel = selectedLang !== 'English' ? `<span class="result-lang-tag">🌐 ${selectedLang}</span>` : '';
  const okBadge = `<span class="result-ok">✓ Analysis Complete</span>`;

  outputContent.innerHTML = `
    <div>${langLabel}${okBadge}</div>
    <div class="result-summary">${escHtml(text).replace(/\n/g, '<br/>')}</div>
  `;
  showState('result');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Analyze ────────────────────────────────────────────────
analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return showToast('Please select a file.', 'error');

  // Loading state
  analyzeBtn.disabled = true;
  btnLabel.style.display = 'none';
  btnLoader.style.display = 'flex';
  showState('loading');
  startSteps();
  resultText = '';

  try {
    // Send file directly as multipart/form-data.
    // Do NOT set Content-Type manually — the browser adds the
    // correct boundary string automatically when using FormData.
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body:   buildFormData(),
    });

    stopSteps();

    if (!res.ok) throw new Error(`Server responded with ${res.status}: ${res.statusText}`);

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();

    analyzeBtn.disabled = false;
    btnLabel.style.display = 'flex';
    btnLoader.style.display = 'none';

    renderResult(data);
    showToast('Report analyzed!', 'success');

  } catch (err) {
    stopSteps();
    analyzeBtn.disabled = false;
    btnLabel.style.display = 'flex';
    btnLoader.style.display = 'none';
    errorMsg.textContent = err.message || 'Network error. Check your webhook URL.';
    showState('error');
    showToast('Analysis failed.', 'error');
    console.error('[SimpleMed]', err);
  }
});

// ── Retry ─────────────────────────────────────────────────
retryBtn.addEventListener('click', () => showState('empty'));

// ── Copy ──────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultText || outputContent.innerText);
    showToast('Copied!', 'success');
  } catch { showToast('Copy failed.', 'error'); }
});

// ── Download ───────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  const text = resultText || outputContent.innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `SimpleMed_${Date.now()}.txt` });
  a.click(); URL.revokeObjectURL(url);
  showToast('Downloaded!', 'success');
});

// ── Toast ──────────────────────────────────────────────────
let toastT;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove('show'), 3000);
}
