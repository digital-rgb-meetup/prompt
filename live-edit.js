/* =========================================================================
   LIVE EDIT — Trình chỉnh sửa trực quan cho trang HTML tĩnh
   -------------------------------------------------------------------------
   Chèn 1 dòng này vào ngay trước </body> của mỗi trang:
       <script src="live-edit.js"></script>

   3 chế độ trên thanh công cụ:
     👀 Xem       — xem như khách (không sửa).
     ✍️ Sửa chữ   — click thẳng vào chữ để sửa nội dung.
     🧩 Bố cục    — chọn 1 khối rồi KÉO GÓC để đổi kích thước, hoặc dùng các
                    nút Trên / Dưới / Trong / Rộng để chỉnh khoảng cách.
                    Các khối khác TỰ DỒN theo (vẫn nằm trong luồng bố cục).

   Bấm “Lưu & Tải xuống” để nhận về file HTML mới đã áp mọi thay đổi.
   Không cần cài đặt, không cần internet.
   ========================================================================= */
(function () {
  'use strict';

  /* ----------------------------- CẤU HÌNH ------------------------------ */
  var CONFIG = {
    // 'query'  -> chỉ hiện khi địa chỉ có ?edit  (AN TOÀN để publish, ĐANG DÙNG)
    //             Khách vào trang bình thường KHÔNG sửa được; chỉ ai mở kèm
    //             ?edit (vd: homepage.html?edit) mới thấy thanh công cụ.
    // 'always' -> luôn hiện (chỉ dùng bản nội bộ, KHÔNG đưa lên web công khai)
    activation: 'query',
    queryFlag: 'edit',
    autosave: true,
    stepSpace: 8,     // bước chỉnh khoảng cách (px) cho Trên/Dưới/Trong
    stepWidth: 24     // bước chỉnh chiều rộng (px)
  };

  function isActivated() {
    if (CONFIG.activation === 'always') return true;
    var q = (window.location.search || '') + (window.location.hash || '');
    return new RegExp('[?&#]' + CONFIG.queryFlag + '(=|&|$)').test(q);
  }
  if (!isActivated()) return;

  var TEXT_TAGS = [
    'P','H1','H2','H3','H4','H5','H6','LI','A','SPAN','STRONG','EM','B','I',
    'U','SMALL','BLOCKQUOTE','FIGCAPTION','BUTTON','LABEL','SUMMARY','DT','DD',
    'TD','TH','CAPTION','CITE','Q','MARK','TIME','ABBR','DIV'
  ];
  var SKIP_INSIDE = ['SCRIPT','STYLE','SVG','NOSCRIPT','HEAD','CODE','PRE'];

  var mode = 'view';        // 'view' | 'text' | 'layout'
  var dirty = false;
  var selected = null;      // khối đang chọn ở chế độ Bố cục
  var dragging = false;
  var draftKey = 'live-edit-draft::' + window.location.pathname;

  /* ------------------------------ STYLE -------------------------------- */
  var style = document.createElement('style');
  style.setAttribute('data-le-ui', '');
  style.textContent = [
    '#le-bar{position:fixed;left:16px;bottom:16px;z-index:2147483647;',
    'display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;',
    'background:#0f172a;color:#fff;border-radius:14px;max-width:calc(100vw - 32px);',
    'box-shadow:0 12px 30px rgba(0,0,0,.35);font:600 14px/1.3 system-ui,Segoe UI,Arial,sans-serif;}',
    '#le-bar .le-title{display:flex;align-items:center;gap:7px;padding-right:10px;',
    'border-right:1px solid rgba(255,255,255,.18);font-weight:700;}',
    '#le-bar .le-dot{width:9px;height:9px;border-radius:50%;background:#64748b;}',
    '#le-bar.le-on .le-dot{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.25);}',
    '#le-bar button{cursor:pointer;border:0;border-radius:10px;padding:9px 13px;',
    'font:inherit;color:#fff;background:#334155;transition:.15s;white-space:nowrap;}',
    '#le-bar button:hover{filter:brightness(1.14);}',
    /* segmented control chọn chế độ */
    '#le-bar .le-seg{display:flex;gap:3px;background:#1e293b;padding:3px;border-radius:12px;}',
    '#le-bar .le-seg button{background:transparent;padding:7px 11px;border-radius:9px;font-size:13px;}',
    '#le-bar .le-seg button.on{background:#2563eb;}',
    '#le-bar .le-seg button.on[data-mode="layout"]{background:#d59a30;color:#231a06;}',
    /* nhóm hành động Lưu / Hoàn tác — tách riêng bằng vạch ngăn, đẩy sang phải */
    '#le-bar .le-actions{display:flex;gap:8px;align-items:center;margin-left:auto;',
    'padding-left:12px;border-left:2px solid rgba(255,255,255,.22);}',
    '#le-bar .le-save{background:#16a34a;font-weight:800;padding:11px 16px;',
    'box-shadow:0 0 0 3px rgba(22,163,74,.25);}',
    '#le-bar .le-save:hover{background:#15803d;}',
    '#le-bar .le-download{background:#2563eb;font-weight:800;padding:11px 16px;}',
    '#le-bar .le-download:hover{background:#1d4ed8;}',
    '#le-bar .le-undo{background:#475569;}',
    '#le-bar .le-hint{font-weight:500;opacity:.85;font-size:12px;max-width:220px;}',
    /* bảng chỉnh bố cục */
    '#le-bar .le-lay{display:none;gap:6px;align-items:center;padding-left:8px;',
    'border-left:1px solid rgba(255,255,255,.18);}',
    '#le-bar.le-layout .le-lay{display:flex;flex-wrap:wrap;}',
    '#le-bar .le-grp{display:flex;align-items:center;gap:2px;background:#1e293b;border-radius:9px;padding:2px;}',
    '#le-bar .le-grp span{font-size:11px;opacity:.8;padding:0 4px;}',
    '#le-bar .le-grp button{padding:5px 9px;background:#334155;font-size:14px;line-height:1;border-radius:7px;}',
    '#le-bar .le-lay .le-reset{background:#7c2d12;}',
    '#le-bar .le-lay .le-parent{background:#3730a3;}',
    /* Vùng chữ có thể sửa */
    '[data-le-editable]{outline:1.5px dashed rgba(37,99,235,.55);outline-offset:2px;',
    'border-radius:3px;transition:background .12s,outline-color .12s;cursor:text;}',
    '[data-le-editable]:hover{outline-color:#2563eb;background:rgba(37,99,235,.06);}',
    '[data-le-editable]:focus{outline:2px solid #16a34a;background:rgba(22,163,74,.08);}',
    /* chế độ Bố cục: hover và khối đang chọn */
    'body.le-layout-on *:hover:not([data-le-ui]):not(body):not(html){',
    'outline:1px dashed rgba(213,154,48,.5);outline-offset:1px;}',
    '[data-le-selected]{outline:2.5px solid #d59a30 !important;outline-offset:2px;',
    'box-shadow:0 0 0 4px rgba(213,154,48,.18);border-radius:4px;}',
    /* tay kéo resize */
    '#le-handle{position:fixed;z-index:2147483647;width:20px;height:20px;',
    'background:#d59a30;border:2px solid #fff;border-radius:5px;cursor:nwse-resize;',
    'box-shadow:0 2px 8px rgba(0,0,0,.4);display:none;touch-action:none;}',
    '#le-handle::after{content:"⤡";position:absolute;inset:0;display:flex;align-items:center;',
    'justify-content:center;color:#231a06;font-size:12px;font-weight:900;}',
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
    '<div class="le-seg">' +
      '<button type="button" data-mode="view" class="on">👀 Xem</button>' +
      '<button type="button" data-mode="text">✍️ Sửa chữ</button>' +
      '<button type="button" data-mode="layout">🧩 Bố cục</button>' +
    '</div>' +
    '<span class="le-lay">' +
      '<span class="le-grp"><span>Trên</span><button data-adj="mt" data-d="-1">−</button><button data-adj="mt" data-d="1">＋</button></span>' +
      '<span class="le-grp"><span>Dưới</span><button data-adj="mb" data-d="-1">−</button><button data-adj="mb" data-d="1">＋</button></span>' +
      '<span class="le-grp"><span>Trong</span><button data-adj="pad" data-d="-1">−</button><button data-adj="pad" data-d="1">＋</button></span>' +
      '<span class="le-grp"><span>Rộng</span><button data-adj="w" data-d="-1">−</button><button data-adj="w" data-d="1">＋</button></span>' +
      '<button type="button" class="le-parent">⬆️ Khối cha</button>' +
      '<button type="button" class="le-reset">↺ Đặt lại khối</button>' +
    '</span>' +
    '<span class="le-hint"></span>' +
    '<span class="le-actions">' +
      '<button type="button" class="le-save" title="Lưu ngay tại trang — mở lại vẫn còn">💾 Lưu</button>' +
      '<button type="button" class="le-download" title="Tải file HTML về máy">⤓ Tải xuống</button>' +
      '<button type="button" class="le-undo">↩️ Hoàn tác</button>' +
    '</span>';
  document.body.appendChild(bar);

  var segBtns  = bar.querySelectorAll('.le-seg button');
  var btnSave  = bar.querySelector('.le-save');
  var btnDown  = bar.querySelector('.le-download');
  var btnUndo  = bar.querySelector('.le-undo');
  var hint     = bar.querySelector('.le-hint');
  var savedKey = 'live-edit-saved::' + window.location.pathname;

  var handle = document.createElement('div');
  handle.id = 'le-handle';
  handle.setAttribute('data-le-ui', '');
  document.body.appendChild(handle);

  /* --------------------------- HÀM TIỆN ÍCH ---------------------------- */
  function toast(msg) {
    var t = document.getElementById('le-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'le-toast'; t.setAttribute('data-le-ui', '');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('le-show');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('le-show'); }, 2400);
  }
  function markDirty() { dirty = true; if (CONFIG.autosave) scheduleDraftSave(); }

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
  function isUI(el) { return el && el.closest && el.closest('[data-le-ui]'); }

  /* Dọn tàn dư của các bộ editor cũ để không lẫn vào bản tải xuống. */
  function cleanForeignEditors(root) {
    root = root || document;
    root.querySelectorAll('.resize-handle,.resize-hint,#editbar,.editbar').forEach(function (n) { n.remove(); });
    root.querySelectorAll('.block-editable,.is-resizing').forEach(function (el) {
      el.classList.remove('block-editable', 'is-resizing');
    });
    root.querySelectorAll('[data-store-key][contenteditable]').forEach(function (el) { el.removeAttribute('contenteditable'); });
    root.querySelectorAll('.edit-mode').forEach(function (el) { el.classList.remove('edit-mode'); });
    if (root.classList) root.classList.remove('edit-mode');
  }

  /* ------------------------ CHẾ ĐỘ SỬA CHỮ ---------------------------- */
  function enterText() {
    document.body.querySelectorAll(TEXT_TAGS.join(',')).forEach(function (el) {
      if (el.hasAttribute('data-le-editable')) return;
      if (el.hasAttribute('contenteditable')) return;
      if (TEXT_TAGS.indexOf(el.tagName) === -1) return;
      if (!hasDirectText(el)) return;
      if (insideSkipped(el)) return;
      if (el.parentElement && el.parentElement.closest('[data-le-editable]')) return;
      el.setAttribute('data-le-editable', '');
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
  }
  function exitText() {
    document.querySelectorAll('[data-le-editable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-le-editable');
      el.removeAttribute('spellcheck');
    });
  }

  /* ------------------------- CHẾ ĐỘ BỐ CỤC ---------------------------- */
  function positionHandle() {
    if (mode !== 'layout' || !selected) { handle.style.display = 'none'; return; }
    var r = selected.getBoundingClientRect();
    handle.style.display = 'block';
    handle.style.left = (r.right - 10) + 'px';
    handle.style.top  = (r.bottom - 10) + 'px';
  }
  function clearSelection() {
    if (selected) selected.removeAttribute('data-le-selected');
    selected = null;
    handle.style.display = 'none';
  }
  function selectBlock(el) {
    if (!el || el === document.body || el === document.documentElement || isUI(el)) return;
    clearSelection();
    selected = el;
    el.setAttribute('data-le-selected', '');
    positionHandle();
    hint.textContent = 'Kéo góc ⤡ để đổi kích thước, hoặc dùng các nút. Khối khác tự dồn theo.';
  }
  function bump(kind, dir) {
    if (!selected) { toast('Hãy click chọn một khối trước.'); return; }
    var s = selected.style, cs = getComputedStyle(selected);
    function cur(p) { return parseFloat(cs[p]) || 0; }
    if (kind === 'mt') s.marginTop = Math.max(0, cur('marginTop') + dir * CONFIG.stepSpace) + 'px';
    else if (kind === 'mb') s.marginBottom = Math.max(0, cur('marginBottom') + dir * CONFIG.stepSpace) + 'px';
    else if (kind === 'pad') {
      var v = Math.max(0, cur('paddingTop') + dir * CONFIG.stepSpace) + 'px';
      s.paddingTop = s.paddingBottom = s.paddingLeft = s.paddingRight = v;
    } else if (kind === 'w') {
      var w = Math.max(60, (selected.getBoundingClientRect().width) + dir * CONFIG.stepWidth);
      s.width = Math.round(w) + 'px'; s.flex = 'none'; s.maxWidth = '100%';
    }
    positionHandle(); markDirty();
  }
  function resetBlock() {
    if (!selected) { toast('Chưa chọn khối nào.'); return; }
    ['marginTop','marginBottom','marginLeft','marginRight','paddingTop','paddingRight',
     'paddingBottom','paddingLeft','width','maxWidth','minHeight','height','flex']
      .forEach(function (p) { selected.style[p] = ''; });
    positionHandle(); markDirty();
    toast('Đã đặt lại khối về mặc định.');
  }
  function selectParent() {
    if (!selected) { toast('Chưa chọn khối nào.'); return; }
    var p = selected.parentElement;
    while (p && (isUI(p) || p === document.body)) p = p.parentElement;
    if (p && p !== document.documentElement) selectBlock(p);
  }

  // Kéo góc để resize
  handle.addEventListener('pointerdown', function (e) {
    if (!selected) return;
    e.preventDefault(); e.stopPropagation();
    dragging = true;
    var r = selected.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY, sw = r.width, sh = r.height;
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    function move(ev) {
      if (!dragging) return;
      var w = Math.max(60, sw + (ev.clientX - sx));
      var h = Math.max(24, sh + (ev.clientY - sy));
      selected.style.width = Math.round(w) + 'px';
      selected.style.maxWidth = '100%';
      selected.style.flex = 'none';
      selected.style.minHeight = Math.round(h) + 'px';
      positionHandle();
    }
    function up() {
      dragging = false;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      markDirty();
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  bar.querySelectorAll('.le-lay [data-adj]').forEach(function (b) {
    b.addEventListener('click', function () { bump(b.getAttribute('data-adj'), parseInt(b.getAttribute('data-d'), 10)); });
  });
  bar.querySelector('.le-reset').addEventListener('click', resetBlock);
  bar.querySelector('.le-parent').addEventListener('click', selectParent);

  /* ----------------------- CHUYỂN CHẾ ĐỘ ------------------------------ */
  function setMode(next) {
    if (next === mode) return;
    // rời chế độ hiện tại
    if (mode === 'text') exitText();
    if (mode === 'layout') { clearSelection(); }
    mode = next;
    bar.classList.toggle('le-on', mode !== 'view');
    bar.classList.toggle('le-layout', mode === 'layout');
    document.body.classList.toggle('le-layout-on', mode === 'layout');
    segBtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === mode); });
    if (mode === 'text') { enterText(); hint.textContent = 'Click vào chữ để sửa. Xong bấm “Lưu”.'; }
    else if (mode === 'layout') { hint.textContent = 'Click 1 khối để chọn, rồi kéo góc ⤡ hoặc dùng nút Trên/Dưới/Trong/Rộng.'; }
    else { hint.textContent = 'Chọn “Sửa chữ” để sửa nội dung, hoặc “Bố cục” để chỉnh khoảng cách/kích thước.'; }
  }
  segBtns.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });

  /* ------------------------ SỰ KIỆN TRANG ----------------------------- */
  // click ở chế độ Bố cục = chọn khối; ở chế độ sửa = chặn link
  document.addEventListener('click', function (e) {
    if (mode === 'view') return;
    if (isUI(e.target)) return;
    if (mode === 'layout') {
      e.preventDefault(); e.stopPropagation();
      selectBlock(e.target);
      return;
    }
    // text mode: chặn chuyển trang khi bấm vào link
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) e.preventDefault();
  }, true);

  document.addEventListener('submit', function (e) { if (mode !== 'view') e.preventDefault(); }, true);
  document.addEventListener('input', function (e) {
    if (mode !== 'text' || isUI(e.target)) return;
    markDirty();
  });
  window.addEventListener('scroll', positionHandle, true);
  window.addEventListener('resize', positionHandle);

  /* --------------------------- SERIALIZE ------------------------------ */
  function stripEditAttrs(root) {
    root.querySelectorAll('[data-le-editable]').forEach(function (el) {
      el.removeAttribute('contenteditable'); el.removeAttribute('data-le-editable'); el.removeAttribute('spellcheck');
    });
    root.querySelectorAll('[data-le-selected]').forEach(function (el) { el.removeAttribute('data-le-selected'); });
  }
  function getContentHTML() {
    var clone = document.body.cloneNode(true);
    cleanForeignEditors(clone);
    clone.querySelectorAll('[data-le-ui]').forEach(function (n) { n.remove(); });
    stripEditAttrs(clone);
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
    if (!draft || draft === getContentHTML()) return;
    if (window.confirm('Phát hiện một BẢN NHÁP chưa lưu của trang này.\n\nBấm OK để KHÔI PHỤC, hoặc Cancel để bỏ qua.')) {
      restoreBodyHTML(draft);
      dirty = true;
      toast('Đã khôi phục bản nháp. Có thể tiếp tục sửa.');
    }
  }
  function restoreBodyHTML(html) {
    var wasMode = mode; setMode('view');
    var uiNodes = [];
    document.querySelectorAll('[data-le-ui]').forEach(function (n) { uiNodes.push(n); });
    document.body.innerHTML = html;
    uiNodes.forEach(function (n) { document.body.appendChild(n); });
    selected = null;
    if (wasMode !== 'view') setMode(wasMode);
  }

  /* --------------------------- LƯU & TẢI XUỐNG ------------------------- */
  function currentFileName() {
    var name = window.location.pathname.split('/').pop() || 'index.html';
    if (!/\.html?$/i.test(name)) name = 'index.html';
    return name;
  }
  // 💾 LƯU tại trang: ghi vào bộ nhớ trình duyệt, mở lại trang sẽ tự hiện lại.
  function saveLocal() {
    try {
      localStorage.setItem(savedKey, getContentHTML());
      localStorage.removeItem(draftKey);
      dirty = false;
      toast('✅ Đã lưu vào trang. Lần sau mở lại sẽ tự hiện bản này.');
    } catch (err) {
      toast('⚠️ Không lưu được (trình duyệt chặn bộ nhớ). Hãy dùng “Tải xuống”.');
    }
  }
  btnSave.addEventListener('click', saveLocal);

  // ⤓ TẢI XUỐNG: xuất file HTML để giao kỹ thuật / thay lên hosting.
  function downloadFile() {
    var prev = mode; setMode('view');       // dọn về trạng thái sạch để serialize
    var docClone = document.documentElement.cloneNode(true);
    cleanForeignEditors(docClone);
    docClone.querySelectorAll('[data-le-ui]').forEach(function (n) { n.remove(); });
    stripEditAttrs(docClone);

    var html = '<!DOCTYPE html>\n' + docClone.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = currentFileName();
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);

    toast('⤓ Đã tải xuống “' + currentFileName() + '”. Thay file cũ bằng file này để cập nhật web.');
    if (prev !== 'view') setMode(prev);
  }
  btnDown.addEventListener('click', downloadFile);

  /* ---------------------------- HOÀN TÁC ------------------------------- */
  var _snapshot = null;
  btnUndo.addEventListener('click', function () {
    if (_snapshot == null) return;
    if (!window.confirm('Hoàn tác TẤT CẢ thay đổi (chữ + bố cục) và quay về bản gốc?\n' +
        '(Xoá luôn bản đã lưu tại trang này.)')) return;
    restoreBodyHTML(_snapshot);
    dirty = false;
    try { localStorage.removeItem(draftKey); localStorage.removeItem(savedKey); } catch (err) {}
    toast('Đã hoàn tác về bản gốc.');
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ------------------------------ KHỞI ĐỘNG --------------------------- */
  cleanForeignEditors(document);
  _snapshot = getContentHTML();              // bản GỐC của file (để Hoàn tác)
  setMode('view');
  var _saved = null;
  try { _saved = localStorage.getItem(savedKey); } catch (err) {}
  if (_saved && _saved !== _snapshot) {
    restoreBodyHTML(_saved);                 // tự hiện bản đã Lưu lần trước
    toast('Đã mở bản bạn đã lưu. Bấm ↩️ Hoàn tác để về bản gốc.');
  } else {
    offerDraftRestore();                     // nếu chưa Lưu nhưng có nháp crash
  }
  console.log('%c Live Edit đã sẵn sàng (Xem · Sửa chữ · Bố cục) ', 'background:#2563eb;color:#fff;padding:2px 6px;border-radius:4px');
})();
