/* =========================================================================
   LIVE EDIT — Trình chỉnh sửa văn bản trực quan cho trang HTML tĩnh
   -------------------------------------------------------------------------
   Cách dùng: chèn 1 dòng này vào ngay trước </body> của mỗi trang:
       <script src="live-edit.js"></script>

   - Mặc định KHÔNG hiện gì cho khách vào xem trang.
   - Chỉ khi mở trang kèm ?edit  (ví dụ: homepage.html?edit)  thì thanh
     công cụ chỉnh sửa mới xuất hiện.
   - Sếp bấm "Bật chỉnh sửa" → click thẳng vào chữ để sửa → bấm
     "Lưu & Tải xuống" để nhận về file HTML mới đã sửa.

   Không cần cài đặt, không cần internet, không đụng tới code gốc.
   ========================================================================= */
(function () {
  'use strict';

  /* ----------------------------- CẤU HÌNH ------------------------------ */
  var CONFIG = {
    // Cách bật thanh công cụ:
    //   'query'  -> chỉ hiện khi địa chỉ có ?edit   (KHUYẾN NGHỊ)
    //   'always' -> luôn hiện (dùng khi làm bản nội bộ, không public)
    activation: 'query',
    queryFlag: 'edit',       // tên tham số kích hoạt: ...html?edit
    autosave: true           // tự lưu bản nháp vào trình duyệt để tránh mất
  };

  /* ------------------------- KIỂM TRA KÍCH HOẠT ------------------------ */
  function isActivated() {
    if (CONFIG.activation === 'always') return true;
    var q = window.location.search || '';
    var h = window.location.hash || '';
    return new RegExp('[?&#]' + CONFIG.queryFlag + '(=|&|$)').test(q + h);
  }
  if (!isActivated()) return;

  /* Các thẻ chứa văn bản sẽ cho phép chỉnh sửa (click vào là sửa được) */
  var TEXT_TAGS = [
    'P','H1','H2','H3','H4','H5','H6','LI','A','SPAN','STRONG','EM','B','I',
    'U','SMALL','BLOCKQUOTE','FIGCAPTION','BUTTON','LABEL','SUMMARY','DT','DD',
    'TD','TH','CAPTION','CITE','Q','MARK','TIME','ABBR','DIV'
  ];
  var SKIP_INSIDE = ['SCRIPT','STYLE','SVG','NOSCRIPT','HEAD','CODE','PRE'];

  var editing = false;      // đang ở chế độ chỉnh sửa?
  var dirty = false;        // đã có thay đổi chưa lưu?
  var draftKey = 'live-edit-draft::' + window.location.pathname;

  /* ------------------------------ STYLE -------------------------------- */
  var style = document.createElement('style');
  style.setAttribute('data-le-ui', '');
  style.textContent = [
    '#le-bar{position:fixed;left:16px;bottom:16px;z-index:2147483647;',
    'display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;',
    'background:#0f172a;color:#fff;border-radius:14px;max-width:calc(100vw - 32px);',
    'box-shadow:0 12px 30px rgba(0,0,0,.35);font:600 14px/1.3 system-ui,Segoe UI,Arial,sans-serif;}',
    '#le-bar .le-title{display:flex;align-items:center;gap:7px;margin-right:4px;',
    'padding-right:10px;border-right:1px solid rgba(255,255,255,.18);font-weight:700;}',
    '#le-bar .le-dot{width:9px;height:9px;border-radius:50%;background:#64748b;}',
    '#le-bar.le-on .le-dot{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.25);}',
    '#le-bar button{cursor:pointer;border:0;border-radius:10px;padding:9px 14px;',
    'font:inherit;color:#fff;background:#334155;transition:.15s;white-space:nowrap;}',
    '#le-bar button:hover{filter:brightness(1.12);}',
    '#le-bar .le-toggle{background:#2563eb;}',
    '#le-bar.le-on .le-toggle{background:#f59e0b;color:#1f2937;}',
    '#le-bar .le-save{background:#16a34a;}',
    '#le-bar .le-undo{background:#475569;}',
    '#le-bar .le-hint{font-weight:500;opacity:.85;font-size:12.5px;max-width:230px;}',
    /* Vùng chữ có thể sửa */
    '[data-le-editable]{outline:1.5px dashed rgba(37,99,235,.55);outline-offset:2px;',
    'border-radius:3px;transition:background .12s,outline-color .12s;cursor:text;}',
    '[data-le-editable]:hover{outline-color:#2563eb;background:rgba(37,99,235,.06);}',
    '[data-le-editable]:focus{outline:2px solid #16a34a;background:rgba(22,163,74,.08);}',
    '#le-toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:2147483647;',
    'background:#111827;color:#fff;padding:11px 18px;border-radius:10px;font:600 14px system-ui;',
    'box-shadow:0 10px 26px rgba(0,0,0,.3);opacity:0;transition:.25s;pointer-events:none;}',
    '#le-toast.le-show{opacity:1;bottom:96px;}'
  ].join('');
  document.head.appendChild(style);

  /* ------------------------------ THANH CÔNG CỤ ------------------------ */
  var bar = document.createElement('div');
  bar.id = 'le-bar';
  bar.setAttribute('data-le-ui', '');
  bar.innerHTML =
    '<span class="le-title"><span class="le-dot"></span>Live&nbsp;Edit</span>' +
    '<button type="button" class="le-toggle">✏️ Bật chỉnh sửa</button>' +
    '<button type="button" class="le-save">💾 Lưu &amp; Tải xuống</button>' +
    '<button type="button" class="le-undo">↩️ Hoàn tác tất cả</button>' +
    '<span class="le-hint">Bấm “Bật chỉnh sửa”, rồi click vào chữ để sửa.</span>';
  document.body.appendChild(bar);

  var btnToggle = bar.querySelector('.le-toggle');
  var btnSave   = bar.querySelector('.le-save');
  var btnUndo   = bar.querySelector('.le-undo');
  var hint      = bar.querySelector('.le-hint');

  /* --------------------------- HÀM TIỆN ÍCH ---------------------------- */
  function toast(msg) {
    var t = document.getElementById('le-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'le-toast';
      t.setAttribute('data-le-ui', '');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('le-show');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('le-show'); }, 2200);
  }

  // Một phần tử có "chữ trực tiếp" (text node không rỗng ngay bên trong)?
  function hasDirectText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim() !== '') return true;
    }
    return false;
  }

  function insideSkipped(el) {
    var p = el;
    while (p && p !== document.body) {
      if (SKIP_INSIDE.indexOf(p.tagName) !== -1) return true;
      if (p.hasAttribute && p.hasAttribute('data-le-ui')) return true;
      p = p.parentElement;
    }
    return false;
  }

  /* ------------------ BẬT / TẮT CHẾ ĐỘ CHỈNH SỬA ---------------------- */
  function enableEditing() {
    var all = document.body.querySelectorAll(TEXT_TAGS.join(','));
    all.forEach(function (el) {
      if (el.hasAttribute('data-le-editable')) return;
      if (TEXT_TAGS.indexOf(el.tagName) === -1) return;
      if (!hasDirectText(el)) return;
      if (insideSkipped(el)) return;
      // Không đánh dấu nếu tổ tiên đã là vùng sửa (tránh lồng nhau)
      if (el.parentElement && el.parentElement.closest('[data-le-editable]')) return;
      el.setAttribute('data-le-editable', '');
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
    editing = true;
    bar.classList.add('le-on');
    btnToggle.innerHTML = '⏸️ Tắt chỉnh sửa';
    hint.textContent = 'Click vào bất kỳ dòng chữ nào để sửa. Xong thì bấm “Lưu”.';
  }

  function disableEditing() {
    document.querySelectorAll('[data-le-editable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-le-editable');
      el.removeAttribute('spellcheck');
    });
    editing = false;
    bar.classList.remove('le-on');
    btnToggle.innerHTML = '✏️ Bật chỉnh sửa';
    hint.textContent = 'Bấm “Bật chỉnh sửa”, rồi click vào chữ để sửa.';
  }

  btnToggle.addEventListener('click', function () {
    if (editing) disableEditing(); else enableEditing();
  });

  /* Trong lúc sửa: chặn click chuyển trang / gửi form / mở link */
  document.addEventListener('click', function (e) {
    if (!editing) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) { e.preventDefault(); }
  }, true);
  document.addEventListener('submit', function (e) {
    if (editing) e.preventDefault();
  }, true);

  /* Đánh dấu đã thay đổi + tự lưu nháp */
  document.addEventListener('input', function (e) {
    if (!editing) return;
    if (e.target.closest && e.target.closest('[data-le-ui]')) return;
    dirty = true;
    if (CONFIG.autosave) scheduleDraftSave();
  });

  /* --------------------------- BẢN NHÁP -------------------------------- */
  function getContentHTML() {
    var clone = document.body.cloneNode(true);
    clone.querySelectorAll('[data-le-ui]').forEach(function (n) { n.remove(); });
    clone.querySelectorAll('[data-le-editable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-le-editable');
      el.removeAttribute('spellcheck');
    });
    return clone.innerHTML;
  }

  var _draftTimer = null;
  function scheduleDraftSave() {
    clearTimeout(_draftTimer);
    _draftTimer = setTimeout(function () {
      try { localStorage.setItem(draftKey, getContentHTML()); } catch (err) {}
    }, 800);
  }

  function offerDraftRestore() {
    if (!CONFIG.autosave) return;
    var draft;
    try { draft = localStorage.getItem(draftKey); } catch (err) { return; }
    if (!draft) return;
    if (draft === getContentHTML()) { return; } // giống hệt, bỏ qua
    if (window.confirm('Phát hiện một BẢN NHÁP chưa lưu của trang này.\n\n' +
        'Bấm OK để KHÔI PHỤC nội dung đang sửa dở, hoặc Cancel để bỏ qua.')) {
      // Chèn lại nội dung nháp (giữ nguyên thanh công cụ)
      var uiNodes = [];
      document.querySelectorAll('[data-le-ui]').forEach(function (n) { uiNodes.push(n); });
      document.body.innerHTML = draft;
      uiNodes.forEach(function (n) { document.body.appendChild(n); });
      dirty = true;
      toast('Đã khôi phục bản nháp. Bạn có thể tiếp tục sửa.');
    }
  }

  /* --------------------------- LƯU & TẢI XUỐNG ------------------------- */
  function currentFileName() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (!/\.html?$/i.test(name)) name = 'index.html';
    return name;
  }

  function saveAndDownload() {
    var wasEditing = editing;
    if (editing) disableEditing();          // gỡ mọi thuộc tính chỉnh sửa

    // Nhân bản toàn bộ trang rồi dọn sạch phần công cụ
    var docClone = document.documentElement.cloneNode(true);
    docClone.querySelectorAll('[data-le-ui]').forEach(function (n) { n.remove(); });
    docClone.querySelectorAll('[data-le-editable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-le-editable');
      el.removeAttribute('spellcheck');
    });

    var doctype = '<!DOCTYPE html>\n';
    var html = doctype + docClone.outerHTML;

    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = currentFileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);

    dirty = false;
    try { localStorage.removeItem(draftKey); } catch (err) {}
    toast('✅ Đã tải xuống “' + currentFileName() + '”. Gửi file này cho bộ phận kỹ thuật để cập nhật.');

    if (wasEditing) enableEditing();         // cho sửa tiếp nếu muốn
  }
  btnSave.addEventListener('click', saveAndDownload);

  /* ---------------------------- HOÀN TÁC ------------------------------- */
  var _snapshot = null;                        // ảnh chụp nội dung gốc ban đầu
  function takeSnapshot() { _snapshot = getContentHTML(); }

  btnUndo.addEventListener('click', function () {
    if (_snapshot == null) return;
    if (!window.confirm('Hoàn tác TẤT CẢ thay đổi và quay về nội dung gốc?')) return;
    var wasEditing = editing;
    if (editing) disableEditing();
    var uiNodes = [];
    document.querySelectorAll('[data-le-ui]').forEach(function (n) { uiNodes.push(n); });
    document.body.innerHTML = _snapshot;
    uiNodes.forEach(function (n) { document.body.appendChild(n); });
    dirty = false;
    try { localStorage.removeItem(draftKey); } catch (err) {}
    toast('Đã hoàn tác về nội dung gốc.');
    if (wasEditing) enableEditing();
  });

  /* ------------------- CẢNH BÁO KHI THOÁT CHƯA LƯU -------------------- */
  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ------------------------------ KHỞI ĐỘNG --------------------------- */
  takeSnapshot();
  offerDraftRestore();
  console.log('%c Live Edit đã sẵn sàng ', 'background:#2563eb;color:#fff;padding:2px 6px;border-radius:4px');
})();
