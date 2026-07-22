/**
 * DASHBOARD LEAD ADS — Google Apps Script Web App (backend)
 * Đọc 2 sheet trong file CRM: "L2a Fix" (lead) + "data_ads" (chi phí ads).
 * Trả DỮ LIỆU THÔ gọn nhẹ cho client tự lọc theo ngày rồi vẽ Chart.js.
 *
 * TRIỂN KHAI: file .gs này (đặt tên "BE ads data") + file HTML tên "FE ads data".
 * Deploy > New deployment > Web app > Execute as: Me > Deploy. Mở URL web app.
 */

const CFG = {
  FILE_ID:    "1TzD170SiXCV5FUvmqrvlbxJa9DgtLRuvZdzVJ3xY85Y",
  LEAD_SHEET: "L2a Fix",
  ADS_SHEET:  "data_ads",

  // Cột trong L2a Fix: A=1 created_at, B=2 full_name, C=3 SĐT/WhatsApp (lọc trùng = tên+SĐT),
  //   N=14 country, W=23 Yes/No/Not Sure, Y=25 nguồn, Z=26 Priority (L3P1 khi =1), AB=28 level crm
  // ⚠️ Nếu SĐT KHÔNG ở cột C thì đổi phone bên dưới cho đúng.
  LEAD_COL: { createdAt: 1, name: 2, phone: 3, country: 14, yesNo: 23, source: 25, priority: 26, stage: 28 },
  STAGE_LABELS: ["L2A", "L3", "L6"],

  // Cột trong data_ads (bản ad-level): C=3 date, D=4 campaign name, J=10 "Amount Spent", M=13 "Cost/Result" (Meta, không dùng)
  ADS_COL: { campaign: 4, spend: 10, date: 3 },
  ADS_CURRENCY: "USD",   // tài khoản ads luôn USD -> cố định

  // MÚI GIỜ: lead (L2a Fix) theo giờ Việt Nam; ads (data_ads) theo giờ US.
  // Chỉ ảnh hưởng khi ô date là kiểu Date thật; nếu là text "yyyy-mm-dd"/"dd/mm/yyyy"
  // thì lấy nguyên ngày hiển thị (không dịch múi giờ).
  TZ: { lead: "Asia/Ho_Chi_Minh", ads: "America/Los_Angeles" },

  // country -> thị trường (test) · campaign ads -> thị trường (camp, khớp cả tên có hậu tố)
  MARKET_RULES: [
    { market: "Lead US",  test: /united states|usa/i,
      camp: /lead\s*us|united\s*states|\busa?\b/i },
    { market: "Lead Uc",  test: /australia/i,
      camp: /lead\s*[uú]c|australia|\baus?\b/i },
    { market: "Lead GCC", test: /oman|united arab|uae|saudi|qatar|kuwait|bahrain/i,
      camp: /lead\s*gcc|\bgcc\b|gulf/i }
  ]
};

// ================== WEB APP ==================
function doGet() {
  return HtmlService.createTemplateFromFile('FE ads data')
    .evaluate()
    .setTitle('Lead Ads Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ================== DỮ LIỆU THÔ CHO CLIENT ==================
// leads: [ [dateStr, marketIdx(-1), stageIdx(-1), source, country, dedupKey, levelFull, yesNo, priority], ... ]
// spend: [ [dateStr, marketIdx(-1), amount], ... ]
function getDashboardData() {
  const ss   = SpreadsheetApp.openById(CFG.FILE_ID);
  const lead = readSheet(ss, CFG.LEAD_SHEET);
  const ads  = readSheet(ss, CFG.ADS_SHEET);
  const stages = CFG.STAGE_LABELS;

  // KHÔNG dedup ở đây nữa. Gắn "khoá trùng" (tên+SĐT) cho từng lead để CLIENT tự lọc trùng
  // TRONG khoảng ngày đang xem (đếm đúng theo kỳ).
  const leads = lead.map(r => {
    const country = (cell(r, CFG.LEAD_COL.country) || "").toString().trim();
    return [
      toDateStr(cell(r, CFG.LEAD_COL.createdAt), CFG.TZ.lead),   // 0: ngày theo giờ VN
      marketIdx(country),                                        // 1
      stages.indexOf(normStage(cell(r, CFG.LEAD_COL.stage))),    // 2
      (cell(r, CFG.LEAD_COL.source) || "").toString().trim() || "(trống)", // 3
      country || "(trống)",                                      // 4: tên quốc gia
      dedupKey(cell(r, CFG.LEAD_COL.name), cell(r, CFG.LEAD_COL.phone)),   // 5: khoá lọc trùng
      normLevelFull(cell(r, CFG.LEAD_COL.stage)),                // 6: level đầy đủ L2a/L3/L4/L5/L6/Khác
      normYesNo(cell(r, CFG.LEAD_COL.yesNo)),                    // 7: 'yes'/'no'/'notsure'/'' — cột W, áp cho MỌI lead (level trên cũng từng là L2A)
      (cell(r, CFG.LEAD_COL.priority) || "").toString().trim()   // 8: Priority (L3P1 khi === '1')
    ];
  });

  const spend = [];
  ads.forEach(r => {
    const amt = parseFloat(cell(r, CFG.ADS_COL.spend)) || 0;
    const mk  = campMarketIdx((cell(r, CFG.ADS_COL.campaign) || "").toString());
    if (amt === 0 && mk < 0) return;
    spend.push([ toDateStr(cell(r, CFG.ADS_COL.date), CFG.TZ.ads), mk, amt ]);  // ngày theo giờ US
  });

  return {
    leads: leads,
    spend: spend,
    markets: CFG.MARKET_RULES.map(r => r.market),
    stages: stages,
    currency: CFG.ADS_CURRENCY,   // cố định USD
    currencies: [CFG.ADS_CURRENCY],
    mixedCurrency: false,
    generatedAt: Date.now(),
    totalLeads: leads.length
  };
}

// ================== HELPERS ==================
function readSheet(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error("Không thấy sheet: " + name);
  return sh.getDataRange().getValues().slice(1); // bỏ header
}
function cell(row, c) { return row[c - 1]; }

// Khoá lọc trùng = tên (chuẩn hoá) + SĐT (chỉ giữ chữ số). Rỗng cả hai -> "" (không dedup).
function dedupKey(name, phone) {
  const n = (name  || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  const p = (phone || "").toString().replace(/\D+/g, "");   // bỏ +, khoảng trắng, gạch...
  return (n || p) ? (n + "|" + p) : "";
}

// Nếu ô là Date thật -> format theo múi giờ tz truyền vào (lead: VN, ads: US).
// Nếu ô là text -> lấy nguyên ngày hiển thị, không dịch múi giờ.
function toDateStr(v, tz) {
  tz = tz || "GMT+7";
  if (v instanceof Date) return Utilities.formatDate(v, tz, "yyyy-MM-dd");
  if (!v) return "";
  const s = v.toString().trim();
  let m = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);  // yyyy-mm-dd hoặc yyyy/mm/dd
  if (m) return `${m[1]}-${('0'+m[2]).slice(-2)}-${('0'+m[3]).slice(-2)}`;
  m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);      // dd/mm/yyyy hoặc dd-mm-yyyy
  if (m) return `${m[3]}-${('0'+m[2]).slice(-2)}-${('0'+m[1]).slice(-2)}`;
  return s.split(" ")[0];
}
function normStage(v) {
  const s = (v || "").toString().trim();
  const code = s.split(" - ")[0].trim().toUpperCase();     // "L2A - New customer" -> "L2A"
  for (const st of CFG.STAGE_LABELS) if (code === st.toUpperCase()) return st;
  return "";
}
// Level đầy đủ theo logic code báo cáo hàng ngày: dùng includes trên chuỗi đã bỏ khoảng trắng + hoa.
// "L2A - New customer" -> "L2a"; "L3P1"/"L3 - ..." -> "L3"; ...
function normLevelFull(v) {
  const s = (v || "").toString().toUpperCase().replace(/\s+/g, "");
  if (s.indexOf("L2A") >= 0) return "L2a";
  if (s.indexOf("L3")  >= 0) return "L3";
  if (s.indexOf("L4")  >= 0) return "L4";
  if (s.indexOf("L5")  >= 0) return "L5";
  if (s.indexOf("L6")  >= 0) return "L6";
  return "Khác";
}
// Trạng thái Yes/No/Not Sure (cột W) theo logic report: lower + bỏ mọi khoảng trắng/gạch dưới.
function normYesNo(v) {
  const s = (v || "").toString().toLowerCase().replace(/[\s_]+/g, "");
  if (s === "yes")     return "yes";
  if (s === "no")      return "no";
  if (s === "notsure") return "notsure";
  return "";
}
function marketIdx(country) {
  const c = (country || "").toString();
  for (let i = 0; i < CFG.MARKET_RULES.length; i++)
    if (CFG.MARKET_RULES[i].test.test(c)) return i;
  return -1;
}
function campMarketIdx(camp) {
  const c = (camp || "").toString();
  for (let i = 0; i < CFG.MARKET_RULES.length; i++)
    if (CFG.MARKET_RULES[i].camp.test(c)) return i;
  return -1;
}
