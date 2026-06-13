/**
 * ONE ON ONE GROUP — Payroll Dashboard | Code.gs [v8 — USD]
 * SETUP: Extensions → Apps Script → paste → Save → Deploy → Web app
 */
const SHEET_ID = '1pcxWQKQcq_4t2ABcOhR5F_dggJLbo6hplpB7Q2x626c'; // payroll sheet
// NOTE: update SHEET_ID above if your target sheet ID differs

function doGet() {
  return HtmlService
    .createHtmlOutput(buildHtml())
    .setTitle('OON Payroll Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPayrollData() {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    return { success:true, data: extractAllData(ss) };
  } catch(e) {
    return { success:false, error:e.message };
  }
}

function extractAllData(ss) {
  var tabs = { group:findSheet(ss,'Group'), vietco:findSheet(ss,'VietCo'), singco:findSheet(ss,'SingCo') };
  var result = {};
  for (var entity in tabs) {
    result[entity] = tabs[entity] ? parseEntitySheet(tabs[entity]) : null;
  }
  return result;
}

function parseEntitySheet(sheet) {
  var rows = sheet.getDataRange().getValues();
  var out = { sal:{y26:{},y25:{}}, hc:{y26:{},y25:{}} };
  var HC_LABELS = ['LAB-IE','LAB-R&DE','LAB-Product','Curriculum CT','Curriculum PD','Teacher-SG','FA','POPs','Other/Misc','LEGAL','SALES','MKT','AM','Help Desk/Support/CX'];
  // Track whether we are in the HC section (A) or Salary section (B)
  // HC section: row values in cols 7-12 are small integers (< 1000)
  // Salary section: values are large VND numbers (> 100000)
  // Use section flag based on "Headcount" or "Salary" subtotal rows
  var inHcSection = false;
  var inSalSection = false;

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var c4 = String(row[4]||'').trim();
    var c3 = String(row[3]||'').trim();
    var combined = (c4 + ' ' + c3).toLowerCase();

    // Detect section headers
    if (combined.indexOf('headcount') >= 0 && combined.indexOf('subtotal') >= 0) {
      inHcSection = true; inSalSection = false;
    }
    if (combined.indexOf('salary') >= 0 && combined.indexOf('subtotal') >= 0) {
      inSalSection = true; inHcSection = false;
      // Read salary subtotal row
      out.sal.y26 = {ytd:n(row[7]),jan:n(row[8]),feb:n(row[9]),mar:n(row[10]),apr:n(row[11]),may:n(row[12]),jun:n(row[13]),jul:n(row[14]),aug:n(row[15]),sep:n(row[16]),oct:n(row[17]),nov:n(row[18]),dec:n(row[19])};
      out.sal.y25 = {ytd:n(row[21]),jan:n(row[22]),feb:n(row[23]),mar:n(row[24]),apr:n(row[25]),may:n(row[26]),jun:n(row[27]),jul:n(row[28]),aug:n(row[29]),sep:n(row[30]),oct:n(row[31]),nov:n(row[32]),dec:n(row[33])};
    }

    // Read HC rows ONLY when in HC section
    if (inHcSection && HC_LABELS.indexOf(c4) >= 0) {
      out.hc.y26[c4] = [n(row[7]),n(row[8]),n(row[9]),n(row[10]),n(row[11]),n(row[12])];
      out.hc.y25[c4] = [n(row[21]),n(row[22]),n(row[23]),n(row[24]),n(row[25]),n(row[26])];
    }
  }
  return out;
}

function findSheet(ss, kw) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++)
    if (sheets[i].getName().toLowerCase().indexOf(kw.toLowerCase()) >= 0) return sheets[i];
  return null;
}
function n(v) {
  if (v===null||v===undefined||v===''||v==='-') return 0;
  var x = Number(String(v).replace(/[^0-9.-]/g,''));
  return isNaN(x)?0:Math.round(x);
}

function getStaticData() {
  return {
    group:{
      sal:{
        y26:{ytd:310963,jan:68097,feb:68243,mar:58510,apr:50750,may:65363,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},
        y25:{ytd:1002205,jan:107212,feb:102632,mar:84291,apr:105576,may:82872,jun:83540,jul:74830,aug:73823,sep:53532,oct:89534,nov:74296,dec:70066}
      },
      hc:{
        y26:{'LAB-IE':[4,4,4,4,4,4],'LAB-R&DE':[5,5,5,4,3,3],'LAB-Product':[1,1,1,1,1,1],'Curriculum CT':[1,1,0,0,0,0],'Curriculum PD':[12,12,11,12,10,10],'Teacher-SG':[0,0,0,0,0,0],'FA':[3,3,3,3,3,3],'POPs':[4,4,4,4,3,3],'Other/Misc':[2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0],'SALES':[5,5,4,4,5,4],'MKT':[3,3,3,2,1,1],'AM':[3,3,1,3,3,2],'Help Desk/Support/CX':[3,3,3,3,3,3]},
        y25:{'LAB-IE':[7,7,7,6,6,4],'LAB-R&DE':[7,6,7,7,7,5],'LAB-Product':[3,3,3,3,3,3],'Curriculum CT':[2,2,2,1,1,1],'Curriculum PD':[18,15,18,18,18,16],'Teacher-SG':[0,0,0,0,0,0],'FA':[3,3,3,3,3,3],'POPs':[5,4,5,4,5,4],'Other/Misc':[2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0],'SALES':[3,3,3,3,2,2],'MKT':[3,3,3,3,3,3],'AM':[2,2,2,2,2,2],'Help Desk/Support/CX':[4,3,3,3,3,4]}
      }
    },
    vietco:{
      sal:{
        y26:{ytd:174284,jan:37041,feb:35366,mar:35457,apr:34313,may:32108,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},
        y25:{ytd:610500,jan:67517,feb:66606,mar:54774,apr:66228,may:51081,jun:48048,jul:42128,aug:43004,sep:42281,oct:41449,nov:37736,dec:49648}
      },
      hc:{
        y26:{'LAB-IE':[3,3,3,3,3,3],'LAB-R&DE':[2,2,2,2,2,2],'LAB-Product':[0,0,0,0,0,0],'Curriculum CT':[1,1,0,0,0,0],'Curriculum PD':[12,12,11,11,10,6],'Teacher-SG':[0,0,0,0,0,0],'FA':[3,3,3,3,3,3],'POPs':[3,3,3,3,3,3],'Other/Misc':[2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0],'SALES':[2,2,2,2,2,1],'MKT':[2,2,2,1,1,1],'AM':[1,1,1,1,1,1],'Help Desk/Support/CX':[3,3,3,3,3,3]},
        y25:{'LAB-IE':[7,7,7,6,6,4],'LAB-R&DE':[7,6,7,7,7,5],'LAB-Product':[3,3,3,3,3,2],'Curriculum CT':[2,2,2,1,1,1],'Curriculum PD':[18,15,18,18,18,16],'Teacher-SG':[0,0,0,0,0,0],'FA':[3,3,3,3,3,3],'POPs':[5,4,5,4,5,4],'Other/Misc':[2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0],'SALES':[3,3,3,3,2,2],'MKT':[3,3,3,3,3,3],'AM':[2,2,2,2,2,2],'Help Desk/Support/CX':[4,3,3,3,3,4]}
      }
    },
    singco:{
      sal:{
        y26:{ytd:136679,jan:31056,feb:32877,mar:23053,apr:16437,may:33255,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},
        y25:{ytd:391705,jan:39695,feb:36027,mar:29517,apr:39349,may:31791,jun:35492,jul:32702,aug:30819,sep:11251,oct:48085,nov:36559,dec:20418}
      },
      hc:{
        y26:{'LAB-IE':[1,1,1,1,1,1],'LAB-R&DE':[3,3,3,2,1,1],'LAB-Product':[1,0,1,1,1,1],'Curriculum CT':[0,0,0,0,0,0],'Curriculum PD':[4,0,0,1,0,4],'Teacher-SG':[0,0,0,0,0,0],'FA':[0,0,0,0,0,0],'POPs':[1,1,1,1,0,0],'Other/Misc':[1,1,0,1,1,1],'LEGAL':[0,0,0,0,0,0],'SALES':[3,3,2,2,3,3],'MKT':[1,1,1,1,0,0],'AM':[2,2,2,2,2,1],'Help Desk/Support/CX':[0,0,0,0,0,0]},
        y25:{'LAB-IE':[1,1,1,1,1,1],'LAB-R&DE':[5,2,2,2,2,4],'LAB-Product':[1,1,1,1,1,1],'Curriculum CT':[0,0,0,0,0,0],'Curriculum PD':[3,1,1,2,3,1],'Teacher-SG':[0,0,0,0,0,0],'FA':[0,0,0,0,0,0],'POPs':[0,0,0,0,0,0],'Other/Misc':[1,1,1,1,1,1],'LEGAL':[0,0,0,0,0,0],'SALES':[5,2,2,2,2,4],'MKT':[1,0,0,0,0,0],'AM':[2,1,1,0,1,1],'Help Desk/Support/CX':[0,0,0,0,0,0]}
      }
    }
  };
}

function buildHtml() {
  var sd = JSON.stringify(getStaticData());
  var h = '';
  // ── HEAD ──────────────────────────────────────────────────────────
  h += '<!DOCTYPE html><html lang="en"><head>';
  h += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  h += '<title>OON Payroll Dashboard</title>';
  h += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">';
  h += '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><' + '/script>';
  // ── CSS ───────────────────────────────────────────────────────────
  h += '<style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += ':root{';
  h += '  --ink:#111827;--ink2:#374151;--ink3:#6B7280;--ink4:#9CA3AF;';
  h += '  --line:#E5E7EB;--line2:#F3F4F6;--bg:#F9FAFB;--white:#FFFFFF;';
  // 4 colors only: Navy, Teal, Slate, Coral
  h += '  --c1:#1E3A5F;--c2:#0F7173;--c3:#64748B;--c4:#E07A5F;';
  h += '  --c1l:#EEF2F7;--c2l:#E6F4F4;--c3l:#F1F4F8;--c4l:#FCF0ED;';
  h += '  --mono:"JetBrains Mono",monospace;';
  h += '  --sb:220px;--tb:52px;--fb:48px;';
  h += '}';
  h += 'body{font-family:"Inter",sans-serif;background:var(--bg);color:var(--ink);font-size:13px;line-height:1.5;display:flex;height:100vh;overflow:hidden}';

  // SIDEBAR
  h += '.sb{width:var(--sb);background:var(--c1);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden}';
  h += '.sb-top{padding:20px 18px 16px;border-bottom:1px solid rgba(255,255,255,.08)}';
  h += '.sb-badge{display:inline-block;background:var(--c2);color:#fff;font-size:9px;font-weight:700;letter-spacing:.8px;padding:3px 7px;border-radius:4px;margin-bottom:10px;text-transform:uppercase}';
  h += '.sb-title{font-size:13px;font-weight:700;color:#fff;line-height:1.3}';
  h += '.sb-sub{font-size:10px;color:rgba(255,255,255,.4);margin-top:3px}';
  h += '.sb-sect{font-size:9px;font-weight:700;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:1px;padding:18px 18px 6px}';
  h += '.nav{display:flex;align-items:center;gap:10px;padding:9px 18px;margin:1px 10px;border-radius:8px;font-size:12px;font-weight:500;color:rgba(255,255,255,.5);cursor:pointer;transition:background .15s,color .15s}';
  h += '.nav:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}';
  h += '.nav.on{background:rgba(255,255,255,.12);color:#fff;font-weight:600}';
  h += '.nav-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.6;flex-shrink:0}';
  h += '.nav.on .nav-dot{background:var(--c2);opacity:1}';
  h += '.sb-foot{margin-top:auto;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;color:rgba(255,255,255,.3);line-height:2}';
  h += '.sb-foot b{color:rgba(255,255,255,.55);font-weight:500}';

  // MAIN
  h += '.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}';

  // TOPBAR
  h += '.tb{height:var(--tb);background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:0;flex-shrink:0}';
  h += '.tb-breadcrumb{display:flex;align-items:center;gap:8px;font-size:12px}';
  h += '.tb-root{font-weight:700;color:var(--ink);font-size:13px}';
  h += '.tb-sep{color:var(--line);font-size:18px;margin:0 2px}';
  h += '.tb-page{color:var(--ink3)}';
  h += '.tb-right{margin-left:auto;display:flex;align-items:center;gap:8px}';
  h += '.tb-badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--c2l);color:var(--c2)}';
  // ── REFRESH BUTTON & TOAST ──────────────────────────────────────────
  h += '.btn-refresh{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:1.5px solid var(--line);border-radius:6px;background:#fff;color:var(--ink2);font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;outline:none;user-select:none}';
  h += '.btn-refresh:hover{border-color:var(--c2);color:var(--c2);background:var(--c2l)}';
  h += '.btn-refresh:active{transform:scale(.97)}';
  h += '.btn-refresh:disabled{opacity:.5;cursor:not-allowed;transform:none}';
  h += '.btn-refresh .r-icon{display:inline-block;transition:transform .3s}';
  h += '.btn-refresh.loading .r-icon{animation:rspin .7s linear infinite}';
  h += '@keyframes rspin{to{transform:rotate(360deg)}}';
  h += '.tb-sep2{width:1px;height:18px;background:var(--line);margin:0 4px}';
  h += '.tb-ts{font-size:10px;color:var(--ink4);font-family:var(--mono)}';
  h += '#toast{position:fixed;bottom:20px;right:20px;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;color:#fff;z-index:9999;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none;display:flex;align-items:center;gap:7px;min-width:200px;box-shadow:0 4px 16px rgba(0,0,0,.15)}';
  h += '#toast.show{opacity:1;transform:none}';

  // FILTER BAR
  h += '.fb{height:var(--fb);background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:14px;flex-shrink:0}';
  h += '.fb-group{display:flex;align-items:center;gap:7px}';
  h += '.fb-label{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px}';
  h += '.fb-sel{height:28px;padding:0 8px;border:1px solid var(--line);border-radius:6px;font-size:12px;font-family:inherit;color:var(--ink);background:#fff;cursor:pointer;outline:none;transition:border .15s}';
  h += '.fb-sel:focus{border-color:var(--c2)}';
  h += '.fb-div{width:1px;height:22px;background:var(--line)}';
  h += '.fb-tags{display:flex;gap:5px;margin-left:4px}';
  h += '.ftag{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:var(--c1l);color:var(--c1)}';

  // CONTENT
  h += '.content{flex:1;overflow-y:auto;padding:20px 24px}';

  // SECTION TITLE
  h += '.sec-title{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;margin-top:18px}';
  h += '.sec-title:first-child{margin-top:0}';

  // KPI CARDS
  h += '.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:6px}';
  h += '.kcard{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:16px 18px}';
  h += '.kcard-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}';
  h += '.kcard-label{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px}';
  h += '.kcard-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px}';
  h += '.kcard-val{font-size:22px;font-weight:700;color:var(--ink);font-family:var(--mono);letter-spacing:-1px;line-height:1}';
  h += '.kcard-val.md{font-size:17px;letter-spacing:-.5px}';
  h += '.kcard-meta{margin-top:6px;display:flex;align-items:center;justify-content:space-between}';
  h += '.kcard-sub{font-size:11px;color:var(--ink3)}';
  h += '.chg{display:inline-flex;align-items:center;gap:2px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px}';
  h += '.chg.up{background:#ECFDF5;color:#059669}.chg.dn{background:#FEF2F2;color:#DC2626}.chg.nc{background:var(--line2);color:var(--ink3)}';

  // COMPANY ROW
  h += '.co-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:6px}';
  h += '.cocard{background:var(--white);border:1px solid var(--line);border-radius:10px;overflow:hidden}';
  h += '.cocard-head{padding:12px 16px;display:flex;align-items:center;gap:12px}';
  h += '.cocard-av{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;letter-spacing:.5px}';
  h += '.cocard-info{min-width:0}';
  h += '.cocard-name{font-size:13px;font-weight:700;color:var(--ink)}';
  h += '.cocard-sub{font-size:10px;color:var(--ink4)}';
  h += '.cocard-stats{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;border-top:1px solid var(--line)}';
  h += '.costat{padding:10px 14px;border-right:1px solid var(--line)}';
  h += '.costat:last-child{border-right:none}';
  h += '.costat-l{font-size:9px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}';
  h += '.costat-v{font-size:12px;font-weight:700;font-family:var(--mono);color:var(--ink)}';
  h += '.costat-v.accent{color:var(--c2)}';

  // GRID LAYOUTS
  h += '.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:6px}';
  h += '.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:6px}';
  h += '.g13{display:grid;grid-template-columns:1fr 3fr;gap:12px;margin-bottom:6px}';
  h += '.g31{display:grid;grid-template-columns:3fr 1fr;gap:12px;margin-bottom:6px}';

  // PANEL
  h += '.panel{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:12px}';
  h += '.panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}';
  h += '.panel-title{font-size:12px;font-weight:700;color:var(--ink)}';
  h += '.panel-note{font-size:10px;color:var(--ink4)}';

  // CHART WRAP
  h += '.cw{position:relative;height:200px}';
  h += '.cw.h240{height:240px}';
  h += '.cw.h280{height:280px}';

  // TABLE
  h += 'table{width:100%;border-collapse:collapse}';
  h += 'th{padding:8px 12px;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}';
  h += 'td{padding:8px 12px;border-bottom:1px solid var(--line2);font-size:12px;color:var(--ink);vertical-align:middle}';
  h += 'tr:last-child td{border-bottom:none}';
  h += 'tr:hover td{background:var(--bg)}';
  h += '.tr{text-align:right;font-family:var(--mono);font-size:11px}';
  h += '.bold{font-weight:700}';
  h += '.dim{color:var(--ink4)}';

  // DIVISION PILLS
  h += '.dp{display:inline-flex;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.2px}';
  h += '.dp-lab{background:var(--c1l);color:var(--c1)}';
  h += '.dp-edu{background:var(--c2l);color:var(--c2)}';
  h += '.dp-ofc{background:var(--c3l);color:var(--c3)}';
  h += '.dp-gro{background:var(--c2l);color:var(--c2)}';
  h += '.dp-cx{background:var(--c4l);color:var(--c4)}';

  // BAR MINI
  h += '.mini-bar{display:flex;align-items:center;gap:6px}';
  h += '.mini-track{flex:1;height:4px;background:var(--line2);border-radius:2px}';
  h += '.mini-fill{height:100%;border-radius:2px;background:var(--c2)}';

  // PAGES
  h += '.page{display:none}.page.on{display:block}';

  // LOADING
  h += '#ld{position:fixed;inset:0;background:var(--c1);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;gap:14px}';
  h += '#ld.hide{display:none}';
  h += '.spin{width:32px;height:32px;border:2.5px solid rgba(255,255,255,.1);border-top-color:var(--c2);border-radius:50%;animation:sp .75s linear infinite}';
  h += '@keyframes sp{to{transform:rotate(360deg)}}';
  h += '#ld p{color:rgba(255,255,255,.45);font-size:11px;font-weight:600;letter-spacing:.3px}';

  h += '</style></head><body>';

  // ── LOADING ───────────────────────────────────────────────────────
  h += '<div id="ld"><div class="spin"></div><p>Loading payroll data...</p></div>';

  // ── SIDEBAR ───────────────────────────────────────────────────────
  h += '<div class="sb">';
  h += '  <div class="sb-top">';
  h += '    <div class="sb-badge">OON GROUP</div>';
  h += '    <div class="sb-title">Payroll Dashboard</div>';
  h += '    <div class="sb-sub">Y2026 Reporting · USD</div>';
  h += '  </div>';
  h += '  <div class="sb-sect">Analytics</div>';
  h += '  <div class="nav on" id="nav-ov" onclick="goPage(\'ov\')"><div class="nav-dot"></div>Overview</div>';
  h += '  <div class="nav" id="nav-dp" onclick="goPage(\'dp\')"><div class="nav-dot"></div>Department Detail</div>';
  h += '  <div class="nav" id="nav-mo" onclick="goPage(\'mo\')"><div class="nav-dot"></div>Monthly Trend</div>';
  h += '  <div class="nav" id="nav-cc" onclick="goPage(\'cc\')"><div class="nav-dot"></div>Company Compare</div>';
  h += '  <div class="sb-foot">';
  h += '    <div>Period <b id="sb-period">—</b></div>';
  h += '    <div>Currency <b>USD</b></div>';
  h += '    <div>Data <b>USD Direct</b></div>';
  
  h += '    <div>Prepared by <b>Tran Le</b></div>';
  h += '    <div>Verified by <b>Cedric LQ</b></div>';
  h += '  </div>';
  h += '</div>';

  // ── MAIN ──────────────────────────────────────────────────────────
  h += '<div class="main">';

  // Topbar
  h += '<div class="tb">';
  h += '  <div class="tb-breadcrumb"><span class="tb-root">OON Payroll</span><span class="tb-sep">/</span><span class="tb-page" id="tb-page">Overview</span></div>';
  h += '  <div class="tb-right">';
  h += '    <span class="tb-ts" id="tb-ts">—</span>';
  h += '    <div class="tb-sep2"></div>';
  h += '    <button class="btn-refresh" id="btn-refresh" onclick="doRefresh()" title="Reload live data from Google Sheet">';
  h += '      <span class="r-icon">&#8635;</span> Refresh';
  h += '    </button>';
  h += '    <div class="tb-sep2"></div>';
  h += '    <span class="tb-badge" id="tb-live">Static data</span>';
  h += '  </div>';
  h += '</div>';
  h += '<div id="toast"></div>';

  // Filter bar
  h += '<div class="fb">';
  h += '  <div class="fb-group"><span class="fb-label">Company</span>';
  h += '    <select class="fb-sel" id="f-co" onchange="render()">';
  h += '      <option value="group">Group (Consolidated)</option>';
  h += '      <option value="vietco">VietCo</option>';
  h += '      <option value="singco">SingCo</option>';
  h += '    </select></div>';
  h += '  <div class="fb-div"></div>';
  h += '  <div class="fb-group"><span class="fb-label">Year</span>';
  h += '    <select class="fb-sel" id="f-yr" onchange="render()"><option value="26">2026</option><option value="25">2025</option><option value="both">Both Years</option></select></div>';
  h += '  <div class="fb-div"></div>';
  h += '  <div class="fb-group"><span class="fb-label">Month</span>';
  h += '    <select class="fb-sel" id="f-mo" onchange="render()">';
  h += '      <option value="0">All (YTD)</option>';
  h += '      <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>';
  h += '      <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>';
  h += '      <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>';
  h += '      <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>';
  h += '    </select></div>';
  h += '  <div class="fb-tags" id="f-tags"></div>';
  h += '</div>';

  // Content
  h += '<div class="content">';

  // ── PAGE: OVERVIEW ────────────────────────────────────────────────
  h += '<div class="page on" id="page-ov">';
  h += '  <div class="kpi-row" id="kpi-cards"></div>';
  h += '  <div class="sec-title">Company Snapshot</div>';
  h += '  <div class="co-row" id="co-cards"></div>';
  h += '  <div class="sec-title">Trends</div>';
  h += '  <div class="g2">';
  h += '    <div class="panel"><div class="panel-head"><span class="panel-title">Monthly Salary Trend (USD)</span><span class="panel-note" id="trend-note"></span></div><div class="cw h240"><canvas id="ch-trend"></canvas></div></div>';
  h += '    <div class="panel"><div class="panel-head"><span class="panel-title">Division Cost Distribution</span><span class="panel-note">Estimated by HC share</span></div><div class="cw h240"><canvas id="ch-div"></canvas></div></div>';
  h += '  </div>';
  h += '</div>';

  // ── PAGE: DEPARTMENT ─────────────────────────────────────────────
  h += '<div class="page" id="page-dp">';
  h += '  <div class="g31">';
  h += '    <div class="panel">';
  h += '      <div class="panel-head"><span class="panel-title">Department Detail — HC & Salary</span><span class="panel-note" id="dp-note"></span></div>';
  h += '      <table id="tbl-dept"><tr><th>Division</th><th>Department</th><th class="tr">HC</th><th class="tr">Est. Salary</th><th class="tr">vs Prior</th><th class="tr">% of Total</th><th>Share</th></tr></table>';
  h += '    </div>';
  h += '    <div class="panel"><div class="panel-head"><span class="panel-title">HC by Dept</span></div><div class="cw h280"><canvas id="ch-hc-dept"></canvas></div></div>';
  h += '  </div>';
  h += '</div>';

  // ── PAGE: MONTHLY TREND ──────────────────────────────────────────
  h += '<div class="page" id="page-mo">';
  h += '  <div class="panel"><div class="panel-head"><span class="panel-title">Monthly Salary — 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-mo-full"></canvas></div></div>';
  h += '  <div class="panel">';
  h += '    <div class="panel-head"><span class="panel-title">HC & Cost per Head — Monthly 2026</span></div>';
  h += '    <table><tr><th>Month</th><th class="tr">HC</th><th class="tr">Salary (USD)</th><th class="tr">Cost/Head (USD)</th><th class="tr">MoM Change</th><th>Trend</th></tr>';
  h += '    <tbody id="mo-tbl"></tbody></table>';
  h += '  </div>';
  h += '</div>';

  // ── PAGE: COMPANY COMPARE ────────────────────────────────────────
  h += '<div class="page" id="page-cc">';
  h += '  <div class="kpi-row" id="cc-kpis"></div>';
  h += '  <div class="g2">';
  h += '    <div class="panel"><div class="panel-head"><span class="panel-title">YTD Salary — 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-cc-ytd"></canvas></div></div>';
  h += '    <div class="panel"><div class="panel-head"><span class="panel-title">Headcount Mix</span></div><div class="cw h240"><canvas id="ch-cc-hc"></canvas></div></div>';
  h += '  </div>';
  h += '  <div class="panel"><div class="panel-head"><span class="panel-title">Monthly Salary — All Companies 2026</span></div><div class="cw h240"><canvas id="ch-cc-mo"></canvas></div></div>';
  h += '</div>';

  h += '</div></div>'; // close content + main

  // ── JAVASCRIPT ────────────────────────────────────────────────────
  h += '<script>';
  h += 'var D=' + sd + ';';
  h += 'var EXR={26:1,25:1};';
  h += 'var MK=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];';
  h += 'var ML=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];';
  h += 'var DEPTS=[';
  h += '  ["LAB-IE","LAB","lab"],["LAB-R&DE","LAB","lab"],["LAB-Product","LAB","lab"],';
  h += '  ["Curriculum CT","Edu","edu"],["Curriculum PD","Edu","edu"],["Teacher-SG","Edu","edu"],';
  h += '  ["FA","Office","ofc"],["POPs","Office","ofc"],["Other/Misc","Office","ofc"],';
  h += '  ["LEGAL","Growth","gro"],["SALES","Growth","gro"],["MKT","Growth","gro"],';
  h += '  ["AM","CX","cx"],["Help Desk/Support/CX","CX","cx"]';
  h += '];';
  // 4 colors: c1=Navy, c2=Teal, c3=Slate, c4=Coral
  h += 'var DIV_C={lab:"#1E3A5F",edu:"#0F7173",ofc:"#64748B",gro:"#0F7173",cx:"#E07A5F"};';
  h += 'var CO_C={group:"#1E3A5F",vietco:"#0F7173",singco:"#E07A5F"};';
  h += 'var CO_N={group:"Group",vietco:"VietCo",singco:"SingCo"};';
  h += 'var CO_LOC={group:"Consolidated",vietco:"Vietnam",singco:"Singapore"};';
  h += 'var charts={};';
  h += 'var curPage="ov";';

  h += 'function fU(v,e){var u=v/e;if(u>=1000000)return "$"+(u/1000000).toFixed(2)+"M";if(u>=1000)return "$"+(u/1000).toFixed(1)+"K";return "$"+Math.round(u).toLocaleString();}';
  h += 'function fUM(v,e){return "$"+(v/e/1000).toFixed(1)+"K";}'
  h += 'function toChartM(v,e){return v/e/1000;}';
  ;
  h += 'function fNum(v){return v.toLocaleString();}';
  h += 'function pct(a,b){if(!b)return null;return ((a-b)/b*100);}';
  h += 'function chgHtml(a,b){';
  h += '  var p=pct(a,b);';
  h += '  if(p===null)return \'<span class="chg nc">\u2014</span>\';';
  h += '  var cls=p>=0?"up":"dn",sym=p>=0?"\u25b2":"\u25bc";';
  h += '  return \'<span class="chg \'+cls+\'">\'+sym+" "+Math.abs(p).toFixed(1)+\'%</span>\';';
  h += '}';

  h += 'function getSal(co,yr,mo){';
  h += '  if(yr==="both"){return getSal(co,"26",mo)+getSal(co,"25",mo);}';
  h += '  var s=D[co]&&D[co].sal["y"+yr];';
  h += '  if(!s)return 0;';
  h += '  if(mo=="0"||mo===0)return s.ytd||0;';
  h += '  return s[MK[parseInt(mo)-1]]||0;';
  h += '}';

  h += 'function getHC(co,yr,idx){';
  h += '  if(yr==="both")return getHC(co,"26",idx);';
  h += '  var h=D[co]&&D[co].hc["y"+yr];';
  h += '  if(!h)return 0;';
  h += '  return DEPTS.reduce(function(t,d){var a=h[d[0]];return t+(a&&a[idx]?a[idx]:0);},0);';
  h += '}';

  h += 'function getDeptHC(co,yr,idx,dept){';
  h += '  if(yr==="both")return getDeptHC(co,"26",idx,dept);';
  h += '  var h=D[co]&&D[co].hc["y"+yr];';
  h += '  if(!h||!h[dept])return 0;';
  h += '  return h[dept][idx]||0;';
  h += '}';

  h += 'function mkChart(id,type,data,opts){';
  h += '  if(charts[id])charts[id].destroy();';
  h += '  var ctx=document.getElementById(id);if(!ctx)return;';
  h += '  var cfg={type:type,data:data,options:{responsive:true,maintainAspectRatio:false,';
  h += '    plugins:{legend:{display:(type==="doughnut"||type==="pie"),position:"bottom",';
  h += '      labels:{font:{size:10,family:"Inter"},boxWidth:10,padding:10}}}}};';
  h += '  if(opts)for(var k in opts)cfg.options[k]=opts[k];';
  h += '  charts[id]=new Chart(ctx,cfg);';
  h += '}';

  h += 'function goPage(p){';
  h += '  curPage=p;';
  h += '  document.querySelectorAll(".page").forEach(function(e){e.classList.remove("on");});';
  h += '  document.querySelectorAll(".nav").forEach(function(e){e.classList.remove("on");});';
  h += '  document.getElementById("page-"+p).classList.add("on");';
  h += '  document.getElementById("nav-"+p).classList.add("on");';
  h += '  var T={ov:"Overview",dp:"Department Detail",mo:"Monthly Trend",cc:"Company Compare"};';
  h += '  document.getElementById("tb-page").textContent=T[p];';
  h += '  render();';
  h += '}';

  h += 'function render(){';
  h += '  var co=document.getElementById("f-co").value;';
  h += '  var yr=document.getElementById("f-yr").value;';
  h += '  var mo=document.getElementById("f-mo").value;';
  h += '  var mi=parseInt(mo)-1;';
  h += '  var hcIdx=mi<0?5:mi+1;';  // idx into [ytd,jan,feb,mar,apr,may]
  h += '  var exr=1;';
  h += '  var moLbl=mo==="0"?"YTD":ML[parseInt(mo)-1];';
  h += '  var yrLabel=yr==="26"?"2026":yr==="25"?"2025":"2026 & 2025";document.getElementById("sb-period").textContent=yrLabel+" "+moLbl;';
  h += '  document.getElementById("f-tags").innerHTML=\'<span class="ftag">\'+CO_N[co]+"</span>";';
  h += '  if(curPage==="ov")renderOv(co,yr,mo,mi,hcIdx,exr,moLbl);';
  h += '  if(curPage==="dp")renderDp(co,yr,mo,mi,hcIdx,exr);';
  h += '  if(curPage==="mo")renderMo(co,yr,exr);';
  h += '  if(curPage==="cc")renderCc(yr,mo,mi,hcIdx,exr);';
  h += '}';

  // OVERVIEW
  h += 'function renderOv(co,yr,mo,mi,hcIdx,exr,moLbl){';
  h += '  var sal=getSal(co,yr,mo);';
  h += '  var salPrev=yr==="both"?0:(mo==="0"?getSal(co,yr==="26"?"25":"26",0):(parseInt(mo)>1?getSal(co,yr,String(parseInt(mo)-1)):0));';
  h += '  var hc=getHC(co,yr,hcIdx);';
  h += '  var hcPrev=getHC(co,yr,Math.max(0,hcIdx-1));';
  h += '  var cph=hc>0?Math.round(sal/hc):0;';
  h += '  var ytd=getSal(co,yr,0);';
  h += '  var ytdP=yr==="both"?0:getSal(co,yr==="26"?"25":"26",0);';

  h += '  document.getElementById("kpi-cards").innerHTML=';
  h += '    \'<div class="kcard"><div class="kcard-top"><span class="kcard-label">Salary (\'+moLbl+\')</span><div class="kcard-icon" style="background:var(--c1l)">&#x1F4B0;</div></div><div class="kcard-val md">\'+fU(sal,exr)+\'</div><div class="kcard-meta"><span class="kcard-sub">\'+fU(sal,exr)+"</span>"+chgHtml(sal,salPrev)+"</div></div>"';
  h += '   +\'<div class="kcard"><div class="kcard-top"><span class="kcard-label">Headcount</span><div class="kcard-icon" style="background:var(--c2l)">&#x1F465;</div></div><div class="kcard-val">\'+hc+\'</div><div class="kcard-meta"><span class="kcard-sub">people</span>\'+chgHtml(hc,hcPrev)+"</div></div>"';
  h += '   +\'<div class="kcard"><div class="kcard-top"><span class="kcard-label">Cost / Head</span><div class="kcard-icon" style="background:var(--c3l)">&#x1F4CA;</div></div><div class="kcard-val md">\'+fU(cph,exr)+\'</div><div class="kcard-meta"><span class="kcard-sub">\'+fUM(cph,exr)+\'/head</span></div></div>\'';
  h += '   +\'<div class="kcard"><div class="kcard-top"><span class="kcard-label">YTD Total</span><div class="kcard-icon" style="background:var(--c4l)">&#x1F4C5;</div></div><div class="kcard-val md">\'+fU(ytd,exr)+\'</div><div class="kcard-meta"><span class="kcard-sub">prior: \'+fU(ytdP,exr)+"</span>"+chgHtml(ytd,ytdP)+"</div></div>";';

  // Company cards
  h += '  var cos=["group","vietco","singco"];';
  h += '  var ch="";';
  h += '  for(var i=0;i<cos.length;i++){';
  h += '    var c=cos[i],cs=getSal(c,yr,mo),chc=getHC(c,yr,hcIdx);';
  h += '    var cph2=chc>0?Math.round(cs/chc):0;';
  h += '    var csh=sal>0?(cs/sal*100).toFixed(0)+"%" : "—";';
  h += '    ch+=\'<div class="cocard"><div class="cocard-head"><div class="cocard-av" style="background:\'+CO_C[c]+\'">\'+CO_N[c].substring(0,3).toUpperCase()+\'</div><div class="cocard-info"><div class="cocard-name">\'+CO_N[c]+\'</div><div class="cocard-sub">\'+CO_LOC[c]+\'</div></div></div>\';';
  h += '    ch+=\'<div class="cocard-stats">\';';
  h += '    var ytdCur=getSal(c,yr,0);var ytdPrior=getSal(c,yr==="26"?"25":"26",0);';
  h += '    ch+=\'<div class="costat"><div class="costat-l">HC</div><div class="costat-v accent">\'+chc+\'</div></div>\';';
  h += '    ch+=\'<div class="costat"><div class="costat-l">Salary</div><div class="costat-v">\'+fU(cs,exr)+\'</div></div>\';';
  h += '    ch+=\'<div class="costat"><div class="costat-l">Cost/Head</div><div class="costat-v">\'+fU(cph2,exr)+\'</div></div>\';';
  h += '    ch+=\'<div class="costat"><div class="costat-l">Ratio</div><div class="costat-v">\'+csh+\'</div></div>\';';
  h += '    ch+=\'</div></div>\';';
  h += '  }';
  h += '  document.getElementById("co-cards").innerHTML=ch;';

  // Trend chart
  h += '  document.getElementById("trend-note").textContent=(yr==="26"?"2026 vs 2025":"2025 vs 2024");';
  h += '  var _yr26=yr==="both"?"26":yr;var s26=MK.map(function(k){return D[co].sal["y"+_yr26]?D[co].sal["y"+_yr26][k]||0:0;});';
  h += '  var s25=MK.map(function(k){var s=D[co].sal[yr==="26"?"y25":"y25"];return s?s[k]||0:0;});';
  h += '  mkChart("ch-trend","bar",{labels:ML,datasets:[';
  h += '    {label:"2026",data:s26.map(function(v){return toChartM(v,exr);}),backgroundColor:"#1E3A5F",borderRadius:3,barPercentage:.55},';
  h += '    {label:"2025",data:s25.map(function(v){return toChartM(v,exr);}),backgroundColor:"#CBD5E1",borderRadius:3,barPercentage:.55}';
  h += '  ]},{scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:"#F3F4F6"},ticks:{callback:function(v){return "$"+v.toFixed(0)+"K";},font:{family:"JetBrains Mono",size:10}}}}});';

  // Division donut
  h += '  var divKeys={lab:["LAB-IE","LAB-R&DE","LAB-Product"],edu:["Curriculum CT","Curriculum PD","Teacher-SG"],ofc:["FA","POPs","Other/Misc"],gro:["LEGAL","SALES","MKT"],cx:["AM","Help Desk/Support/CX"]};';
  h += '  var _hyr=yr==="both"?"26":yr;var hcArr=D[co].hc["y"+_hyr];';
  h += '  var hcTot=getHC(co,yr,hcIdx);';
  h += '  var divN=["LAB","Eduservice","Office","Growth","CX"];';
  h += '  var divSal=["lab","edu","ofc","gro","cx"].map(function(dv){';
  h += '    var keys=divKeys[dv];';
  h += '    var dhc=hcArr?keys.reduce(function(s,k){return s+(hcArr[k]&&hcArr[k][hcIdx]?hcArr[k][hcIdx]:0);},0):0;';
  h += '    return hcTot>0?sal*(dhc/hcTot):0;';
  h += '  });';
  h += '  mkChart("ch-div","doughnut",{labels:divN,datasets:[{data:divSal.map(function(v){return toChartM(v,exr);}),backgroundColor:["#1E3A5F","#0F7173","#64748B","#94A3B8","#E07A5F"],borderWidth:2,borderColor:"#fff"}]},{plugins:{legend:{display:true,position:"bottom"}}});';
  h += '}';

  // DEPARTMENT
  h += 'function renderDp(co,yr,mo,mi,hcIdx,exr){';
  // sal = current selection salary; salCurMo = current month salary; salPrevMo = prior month salary
  h += '  var sal=getSal(co,yr,mo);';
  h += '  var _hyr=yr==="both"?"26":yr;var hcArr=D[co].hc["y"+_hyr];';
  h += '  var hcTot=getHC(co,yr,hcIdx);';
  // Prior month: same year, one month back (for mo=0 YTD use last available mo)
  h += '  var prevMoStr=mo==="0"?"0":(parseInt(mo)>1?String(parseInt(mo)-1):"0");';
  h += '  var salCurMo=mo==="0"?sal:getSal(co,yr,mo);';
  h += '  var salPrevMo=mo==="0"?0:getSal(co,yr,prevMoStr);';
  h += '  var hcPrevIdx=mo==="0"?hcIdx:Math.max(0,hcIdx-1);';
  h += '  var curMoLbl=mo==="0"?"YTD":(ML[parseInt(mo)-1]||"");';
  h += '  var prevMoLbl=mo==="0"?"-":(prevMoStr==="0"?"YTD":(ML[parseInt(prevMoStr)-1]||""));';
  h += '  document.getElementById("dp-note").textContent=curMoLbl+", "+CO_N[co];';
  h += '  var rows="";';
  h += '  var lastDiv="";';
  h += '  var barLabels=[],barHC=[],barColors=[];';
  h += '  var maxHC=0;';
  h += '  for(var j=0;j<DEPTS.length;j++){var hj=getDeptHC(co,yr,hcIdx,DEPTS[j][0]);if(hj>maxHC)maxHC=hj;}';
  h += '  for(var i=0;i<DEPTS.length;i++){';
  h += '    var dept=DEPTS[i][0],div=DEPTS[i][1],cls=DEPTS[i][2];';
  h += '    var hc=getDeptHC(co,yr,hcIdx,dept);';
  h += '    if(!hc)continue;';
  h += '    var hcP=getDeptHC(co,yr,hcPrevIdx,dept);';
  // Salary proportional by HC share
  h += '    var es=hcTot>0?salCurMo*(hc/hcTot):0;';
  h += '    var esP=hcTot>0?salPrevMo*(hcP/(getHC(co,yr,hcPrevIdx)||1)):0;';
  h += '    var ps=salCurMo>0?(es/salCurMo*100).toFixed(1):"0";';
  h += '    var pct=maxHC>0?(hc/maxHC*100).toFixed(0):0;';
  h += '    var dc=div!==lastDiv?"<span class=\'dp dp-"+cls+"\'>" +div+"</span>":"";';
  h += '    lastDiv=div;';
  h += '    rows+="<tr><td>"+dc+"</td><td class=\'bold\'>" +dept+"</td>";';
  h += '    rows+="<td class=\'tr bold\' style=\'color:var(--c2)\'>" +hc+"</td>";';
  // Prior Month column
  h += '    rows+="<td class=\'tr\' style=\'color:var(--ink3)\'>"+fU(esP,exr)+"</td>";';
  // Current Month column
  h += '    rows+="<td class=\'tr bold\' style=\'color:var(--ink)\'>"+fU(es,exr)+"</td>";';
  // Change column
  h += '    rows+="<td class=\'tr\'>"+chgHtml(es,esP)+"</td>";';
  h += '    rows+="<td class=\'tr dim\'>" +ps+"%</td>";';
  h += '    rows+="<td style=\'width:80px\'><div class=\'mini-bar\'><div class=\'mini-track\'><div class=\'mini-fill\' style=\'width:"+pct+"%\'></div></div></div></td>";';
  h += '    rows+="</tr>";';
  h += '    barLabels.push(dept);barHC.push(hc);';
  h += '    barColors.push(DIV_C[cls]);';
  h += '  }';
  // TOTAL ROW
  h += '  var totalHC=0,totalES=0,totalESP=0;';
  h += '  for(var t=0;t<DEPTS.length;t++){';
  h += '    var th=getDeptHC(co,yr,hcIdx,DEPTS[t][0]);';
  h += '    var thP=getDeptHC(co,yr,hcPrevIdx,DEPTS[t][0]);';
  h += '    if(!th)continue;';
  h += '    totalHC+=th;';
  h += '    totalES+=hcTot>0?salCurMo*(th/hcTot):0;';
  h += '    totalESP+=hcTot>0?salPrevMo*(thP/(getHC(co,yr,hcPrevIdx)||1)):0;';
  h += '  }';
  h += '  var totalRow="<tr style=\'border-top:2px solid var(--line);background:var(--line2)\'>";';
  h += '  totalRow+="<td></td>";';
  h += '  totalRow+="<td class=\'bold\' style=\'font-size:12px;color:var(--ink)\'>TOTAL</td>";';
  h += '  totalRow+="<td class=\'tr bold\' style=\'color:var(--c1);font-size:13px\'>"+totalHC+"</td>";';
  h += '  totalRow+="<td class=\'tr\' style=\'color:var(--ink3)\'>"+fU(totalESP,exr)+"</td>";';
  h += '  totalRow+="<td class=\'tr bold\' style=\'color:var(--c1)\'>"+fU(totalES,exr)+"</td>";';
  h += '  totalRow+="<td class=\'tr\'>"+chgHtml(totalES,totalESP)+"</td>";';
  h += '  totalRow+="<td class=\'tr bold\' style=\'color:var(--ink3)\'>100%</td>";';
  h += '  totalRow+="<td><div class=\'mini-bar\'><div class=\'mini-track\'><div class=\'mini-fill\' style=\'width:100%;background:var(--c1)\'></div></div></div></td>";';
  h += '  totalRow+="</tr>";';
  // Dynamic headers with month labels
  h += '  var hdr="<tr><th>Division</th><th>Department</th><th class=\'tr\'>HC</th><th class=\'tr\'>"+prevMoLbl+"</th><th class=\'tr\'>"+curMoLbl+"</th><th class=\'tr\'>Change</th><th class=\'tr\'>% Share</th><th>Bar</th></tr>";';
  h += '  document.getElementById("tbl-dept").innerHTML=hdr+rows+totalRow;';
  h += '  mkChart("ch-hc-dept","bar",{labels:barLabels,datasets:[{data:barHC,backgroundColor:barColors,borderRadius:4,barPercentage:.6}]},{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{grid:{color:"#F3F4F6"},ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}});';
  h += '}';

  // MONTHLY TREND
  h += 'function renderMo(co,yr,exr){';
  h += '  var _yr26=yr==="both"?"26":yr;var s26=MK.map(function(k){return D[co].sal["y"+_yr26]?D[co].sal["y"+_yr26][k]||0:0;});';
  h += '  var s25=MK.map(function(k){var s=D[co].sal[yr==="26"?"y25":"y25"];return s?s[k]||0:0;});';
  h += '  mkChart("ch-mo-full","bar",{labels:ML,datasets:[';
  h += '    {label:(yr==="26"?"2026":"2025"),data:s26.map(function(v){return toChartM(v,exr);}),backgroundColor:"#1E3A5F",borderRadius:3,barPercentage:.5},';
  h += '    {label:(yr==="26"?"2025":"2024"),data:s25.map(function(v){return toChartM(v,exr);}),backgroundColor:"#CBD5E1",borderRadius:3,barPercentage:.5}';
  h += '  ]},{scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:"#F3F4F6"},ticks:{callback:function(v){return "$"+v.toFixed(0)+"K";},font:{family:"JetBrains Mono",size:10}}}}});';

  // Monthly table with HC
  h += '  var tbl="";';
  h += '  for(var i=0;i<MK.length;i++){';
  h += '    if(!s26[i])continue;';
  h += '    var hc=getHC(co,yr,i+1);';
  h += '    var cph=hc>0?Math.round(s26[i]/hc):0;';
  h += '    var prev=i>0?s26[i-1]:0;';
  h += '    tbl+="<tr><td class=\'bold\'>"+ML[i]+"</td>";';
  h += '    tbl+="<td class=\'tr bold\' style=\'color:var(--c2)\'>"+hc+"</td>";';
  h += '    tbl+="<td class=\'tr\'>"+fU(s26[i],exr)+"</td>";';
  h += '    tbl+="<td class=\'tr\'>"+fUM(cph,exr)+"</td>";';
  h += '    tbl+="<td class=\'tr\'>"+chgHtml(s26[i],prev)+"</td>";';
  h += '    var pct2=s26[0]>0?(s26[i]/s26[0]*100).toFixed(0):0;';
  h += '    tbl+="<td style=\'width:80px\'><div class=\'mini-bar\'><div class=\'mini-track\'><div class=\'mini-fill\' style=\'width:"+pct2+"%\'></div></div></div></td>";';
  h += '    tbl+="</tr>";';
  h += '  }';
  h += '  document.getElementById("mo-tbl").innerHTML=tbl;';
  h += '}';

  // COMPANY COMPARE
  h += 'function renderCc(yr,mo,mi,hcIdx,exr){';
  h += '  var cos=["group","vietco","singco"];';
  h += '  var sals=cos.map(function(c){return getSal(c,yr,mo);});';
  h += '  var ytds=cos.map(function(c){return getSal(c,yr,0);});';
  h += '  var ytdsP=cos.map(function(c){return yr==="both"?0:getSal(c,yr==="26"?"25":"26",0);});';
  h += '  var hcs=cos.map(function(c){return getHC(c,yr,hcIdx);});';
  h += '  var kh="";';
  h += '  for(var i=0;i<cos.length;i++){';
  h += '    var cph=hcs[i]>0?Math.round(sals[i]/hcs[i]):0;';
  h += '    kh+=\'<div class="kcard"><div class="kcard-top"><span class="kcard-label">\'+CO_N[cos[i]]+\'</span><div class="kcard-icon" style="background:\'+CO_C[cos[i]]+\'20">&#x1F3E2;</div></div>\';';
  h += '    kh+=\'<div class="kcard-val md">\'+fU(ytds[i],exr)+\'</div>\';';
  h += '    kh+=\'<div class="kcard-meta"><span class="kcard-sub">HC: \'+hcs[i]+" | "+fUM(cph,exr)+"/head</span>"+chgHtml(ytds[i],ytdsP[i])+"</div></div>";';
  h += '  }';
  h += '  document.getElementById("cc-kpis").innerHTML=kh;';

  h += '  mkChart("ch-cc-ytd","bar",{labels:cos.map(function(c){return CO_N[c];}),datasets:[';
  h += '    {label:"YTD "+yr,data:ytds.map(function(v){return toChartM(v,exr);}),backgroundColor:["#1E3A5F","#0F7173","#E07A5F"],borderRadius:5,barPercentage:.5},';
  h += '    {label:"YTD Prior",data:ytdsP.map(function(v){return toChartM(v,exr);}),backgroundColor:["#1E3A5F40","#0F717340","#E07A5F40"],borderRadius:5,barPercentage:.5}';
  h += '  ]},{scales:{x:{grid:{display:false}},y:{grid:{color:"#F3F4F6"},ticks:{callback:function(v){return "$"+v.toFixed(0)+"K";},font:{family:"JetBrains Mono",size:10}}}}});';

  h += '  mkChart("ch-cc-hc","doughnut",{labels:cos.map(function(c){return CO_N[c]+" ("+getHC(c,yr,hcIdx)+")";})';
  h += '    ,datasets:[{data:hcs,backgroundColor:["#1E3A5F","#0F7173","#E07A5F"],borderWidth:2,borderColor:"#fff"}]},{plugins:{legend:{display:true,position:"bottom"}}});';

  h += '  var ds=cos.map(function(c){';
  h += '    var _cyr=yr==="both"?"26":yr;return {label:CO_N[c],data:MK.map(function(k){return D[c].sal["y"+_cyr]?D[c].sal["y"+_cyr][k]||0:0;}).map(function(v){return toChartM(v,exr);}),';
  h += '      borderColor:CO_C[c],backgroundColor:"transparent",borderWidth:2,pointRadius:3,tension:.3};';
  h += '  });';
  h += '  mkChart("ch-cc-mo","line",{labels:ML,datasets:ds},{scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:"#F3F4F6"},ticks:{callback:function(v){return "$"+v.toFixed(0)+"K";},font:{family:"JetBrains Mono",size:10}}}}});';
  h += '}';

  // INIT

  // ── REFRESH ────────────────────────────────────────────────────────
  h += 'function showToast(msg,ok){';
  h += '  var t=document.getElementById("toast");';
  h += '  t.innerHTML=(ok?"✓ ":"⚠ ")+msg;';
  h += '  t.style.background=ok?"#059669":"#DC2626";';
  h += '  t.classList.add("show");';
  h += '  setTimeout(function(){t.classList.remove("show");},3000);';
  h += '}';
  h += 'function doRefresh(){';
  h += '  if(typeof google==="undefined"||!google.script){showToast("Not running inside Apps Script",false);return;}';
  h += '  var btn=document.getElementById("btn-refresh");';
  h += '  var badge=document.getElementById("tb-live");';
  h += '  var ts=document.getElementById("tb-ts");';
  h += '  btn.disabled=true;btn.classList.add("loading");';
  h += '  badge.textContent="Refreshing…";badge.style.background="var(--c1l)";badge.style.color="var(--c1)";';
  h += '  google.script.run';
  h += '    .withSuccessHandler(function(res){';
  h += '      btn.disabled=false;btn.classList.remove("loading");';
  h += '      if(res&&res.data){';
  h += '        var cos=["group","vietco","singco"];';
  h += '        for(var i=0;i<cos.length;i++){if(res.data[cos[i]])D[cos[i]]=res.data[cos[i]];}';
  h += '        render();';
  h += '        var now=new Date();';
  h += '        var hh=String(now.getHours()).padStart(2,"0");';
  h += '        var mm=String(now.getMinutes()).padStart(2,"0");';
  h += '        ts.textContent="Updated "+hh+":"+mm;';
  h += '        badge.textContent="Live data";badge.style.background="var(--c2l)";badge.style.color="var(--c2)";';
  h += '        showToast("Data refreshed successfully",true);';
  h += '      } else {';
  h += '        badge.textContent="Refresh failed";badge.style.background="var(--c4l)";badge.style.color="var(--c4)";';
  h += '        showToast("No data returned from sheet",false);';
  h += '      }';
  h += '    })';
  h += '    .withFailureHandler(function(err){';
  h += '      btn.disabled=false;btn.classList.remove("loading");';
  h += '      badge.textContent="Error";badge.style.background="var(--c4l)";badge.style.color="var(--c4)";';
  h += '      showToast("Error: "+(err.message||err),false);';
  h += '    })';
  h += '    .getPayrollData();';
  h += '}';

  h += 'document.getElementById("ld").classList.add("hide");';
  h += 'render();';
  h += 'if(typeof google!=="undefined"&&google.script){';
  h += '  google.script.run';
  h += '    .withSuccessHandler(function(res){';
  h += '      if(res&&res.data){';
  h += '        var cos=["group","vietco","singco"];';
  h += '        for(var i=0;i<cos.length;i++){if(res.data[cos[i]])D[cos[i]]=res.data[cos[i]];}';
    h += '        var ts2=document.getElementById("tb-ts");';
  h += '        if(ts2){var n2=new Date();ts2.textContent="Updated "+String(n2.getHours()).padStart(2,"0")+":"+String(n2.getMinutes()).padStart(2,"0");}';  
  h += '        render();';
  h += '        document.getElementById("tb-live").textContent="Live data";';
  h += '        document.getElementById("tb-live").style.background="var(--c2l)";';
  h += '        document.getElementById("tb-live").style.color="var(--c2)";';
  h += '      }';
  h += '    })';
  h += '    .withFailureHandler(function(){})';
  h += '    .getPayrollData();';
  h += '}';

  h += '</' + 'script></body></html>';
  return h;
}
