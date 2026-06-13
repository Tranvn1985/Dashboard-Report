/**
 * ONE ON ONE GROUP — Payroll Dashboard | Code.gs [v10]
 * FIX v10: Loading overlay stuck → wrapped init in window.onload + try/catch,
 *          loading hidden via style.display directly (not class),
 *          padStart replaced with manual zero-pad for GAS compat,
 *          chart legend always shown for trend/compare charts.
 */
const SHEET_ID = '1pcxWQKQcq_4t2ABcOhR5F_dggJLbo6hplpB7Q2x626c';

function doGet() {
  return HtmlService
    .createHtmlOutput(buildHtml())
    .setTitle('OON Payroll Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPayrollData() {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    return { success: true, data: extractAllData(ss) };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function extractAllData(ss) {
  var tabs = {
    group:  findSheet(ss, 'Group'),
    vietco: findSheet(ss, 'VietCo'),
    singco: findSheet(ss, 'SingCo')
  };
  var result = {};
  for (var entity in tabs) {
    result[entity] = tabs[entity] ? parseEntitySheet(tabs[entity]) : null;
  }
  return result;
}

/**
 * Column layout (0-based):
 * col 4 = dept name
 * col 7 = YTD_2026, col 8-19 = Jan-Dec 2026
 * col 21 = YTD_2025, col 22-33 = Jan-Dec 2025
 */
function parseEntitySheet(sheet) {
  var rows = sheet.getDataRange().getValues();
  var out = { sal: { y26: {}, y25: {} }, hc: { y26: {}, y25: {} } };
  var HC_LABELS = [
    'LAB-IE','LAB-R&DE','LAB-Product',
    'Curriculum CT','Curriculum PD','Teacher-SG',
    'FA','POPs','Other/Misc',
    'LEGAL','SALES','MKT',
    'AM','Help Desk/Support/CX'
  ];
  var inHc = false, inSal = false;

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var c4 = String(row[4] || '').trim();
    var combined = (c4 + ' ' + String(row[3] || '')).toLowerCase();

    if (combined.indexOf('headcount') >= 0 && combined.indexOf('subtotal') >= 0) {
      inHc = true; inSal = false; continue;
    }
    if (combined.indexOf('salary') >= 0 && combined.indexOf('subtotal') >= 0) {
      inSal = true; inHc = false;
      out.sal.y26 = { ytd:n(row[7]), jan:n(row[8]),  feb:n(row[9]),  mar:n(row[10]), apr:n(row[11]),
                      may:n(row[12]),jun:n(row[13]),  jul:n(row[14]), aug:n(row[15]), sep:n(row[16]),
                      oct:n(row[17]),nov:n(row[18]),  dec:n(row[19]) };
      out.sal.y25 = { ytd:n(row[21]),jan:n(row[22]),  feb:n(row[23]), mar:n(row[24]), apr:n(row[25]),
                      may:n(row[26]),jun:n(row[27]),  jul:n(row[28]), aug:n(row[29]), sep:n(row[30]),
                      oct:n(row[31]),nov:n(row[32]),  dec:n(row[33]) };
      continue;
    }
    if (inHc && HC_LABELS.indexOf(c4) >= 0) {
      out.hc.y26[c4] = [n(row[8]),n(row[9]),n(row[10]),n(row[11]),n(row[12]),n(row[13]),
                         n(row[14]),n(row[15]),n(row[16]),n(row[17]),n(row[18]),n(row[19])];
      out.hc.y25[c4] = [n(row[22]),n(row[23]),n(row[24]),n(row[25]),n(row[26]),n(row[27]),
                         n(row[28]),n(row[29]),n(row[30]),n(row[31]),n(row[32]),n(row[33])];
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
  if (v === null || v === undefined || v === '' || v === '-') return 0;
  var x = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(x) ? 0 : Math.round(x);
}

function getStaticData() {
  return {
    group: {
      sal: {
        y26: { ytd:361708, jan:68095, feb:68243, mar:58510, apr:50749, may:65362,
                jun:0, jul:0, aug:0, sep:0, oct:0, nov:0, dec:0 },
        y25: { ytd:970708, jan:103844, feb:99407, mar:81643, apr:102258, may:80269,
                jun:80913, jul:72477, aug:71503, sep:51850, oct:86720, nov:71960, dec:67864 }
      },
      hc: {
        y26: {
          'LAB-IE':               [4,4,4,4,4,0,4,0,0,0,0,0],
          'LAB-R&DE':             [5,5,4,3,3,0,3,0,0,0,0,0],
          'LAB-Product':          [1,1,1,1,1,0,1,0,0,0,0,0],
          'Curriculum CT':        [1,0,0,0,0,0,0,0,0,0,0,0],
          'Curriculum PD':        [12,11,12,10,10,0,10,0,0,0,0,0],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [3,3,3,3,3,0,3,0,0,0,0,0],
          'POPs':                 [4,4,4,3,3,0,3,0,0,0,0,0],
          'Other/Misc':           [2,2,2,2,2,0,2,0,0,0,0,0],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [5,4,4,5,4,0,5,0,0,0,0,0],
          'MKT':                  [3,3,2,1,1,0,1,0,0,0,0,0],
          'AM':                   [3,1,3,3,2,0,3,0,0,0,0,0],
          'Help Desk/Support/CX': [3,3,3,3,3,0,3,0,0,0,0,0]
        },
        y25: {
          'LAB-IE':               [7,7,6,6,4,4,3,3,3,3,3,4],
          'LAB-R&DE':             [6,7,7,7,5,5,2,2,2,2,2,4],
          'LAB-Product':          [3,3,3,3,3,2,3,2,1,0,0,1],
          'Curriculum CT':        [2,2,1,1,1,1,1,1,1,1,1,1],
          'Curriculum PD':        [15,18,18,18,16,16,14,13,13,13,12,12],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [3,3,3,3,3,3,3,3,3,3,3,3],
          'POPs':                 [4,5,4,5,4,4,4,4,4,4,4,4],
          'Other/Misc':           [2,2,2,2,2,2,2,2,2,2,2,2],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [3,3,3,2,2,2,1,1,1,1,1,2],
          'MKT':                  [3,3,3,3,3,3,2,2,2,2,2,2],
          'AM':                   [2,2,2,2,2,2,2,1,1,2,1,1],
          'Help Desk/Support/CX': [3,3,3,3,4,3,4,4,4,3,3,3]
        }
      }
    },
    vietco: {
      sal: {
        y26: { ytd:208592, jan:37039, feb:35365, mar:35457, apr:34312, may:32107,
                jun:0, jul:0, aug:0, sep:0, oct:0, nov:0, dec:0 },
        y25: { ytd:591316, jan:65396, feb:64512, mar:53054, apr:64146, may:49477,
                jun:46537, jul:40804, aug:41654, sep:40953, oct:40146, nov:36550, dec:48087 }
      },
      hc: {
        y26: {
          'LAB-IE':               [3,3,3,3,3,0,3,0,0,0,0,0],
          'LAB-R&DE':             [2,2,2,2,2,0,2,0,0,0,0,0],
          'LAB-Product':          [0,0,0,0,0,0,0,0,0,0,0,0],
          'Curriculum CT':        [1,0,0,0,0,0,0,0,0,0,0,0],
          'Curriculum PD':        [12,11,11,10,6,0,6,0,0,0,0,0],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [3,3,3,3,3,0,3,0,0,0,0,0],
          'POPs':                 [3,3,3,3,3,0,3,0,0,0,0,0],
          'Other/Misc':           [2,2,2,2,2,0,2,0,0,0,0,0],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [2,2,2,2,1,0,1,0,0,0,0,0],
          'MKT':                  [2,2,1,1,1,0,1,0,0,0,0,0],
          'AM':                   [1,1,1,1,1,0,1,0,0,0,0,0],
          'Help Desk/Support/CX': [3,3,3,3,3,0,3,0,0,0,0,0]
        },
        y25: {
          'LAB-IE':               [7,7,6,6,4,4,3,3,3,3,3,4],
          'LAB-R&DE':             [6,7,7,7,5,5,2,2,2,2,2,4],
          'LAB-Product':          [3,3,3,3,3,2,3,2,1,0,0,1],
          'Curriculum CT':        [2,2,1,1,1,1,1,1,1,1,1,1],
          'Curriculum PD':        [15,18,18,18,16,16,14,13,13,13,12,12],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [3,3,3,3,3,3,3,3,3,3,3,3],
          'POPs':                 [4,5,4,5,4,4,4,4,4,4,4,4],
          'Other/Misc':           [2,2,2,2,2,2,2,2,2,2,2,2],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [3,3,3,2,2,2,1,1,1,1,1,2],
          'MKT':                  [3,3,3,3,3,3,2,2,2,2,2,2],
          'AM':                   [2,2,2,2,2,2,2,1,1,2,1,1],
          'Help Desk/Support/CX': [3,3,3,3,4,3,4,4,4,3,3,3]
        }
      }
    },
    singco: {
      sal: {
        y26: { ytd:136677, jan:31055, feb:32877, mar:23053, apr:16437, may:33255,
                jun:0, jul:0, aug:0, sep:0, oct:0, nov:0, dec:0 },
        y25: { ytd:379402, jan:38449, feb:34895, mar:28590, apr:38112, may:30792,
                jun:34377, jul:31676, aug:29851, sep:10898, oct:46574, nov:35411, dec:19777 }
      },
      hc: {
        y26: {
          'LAB-IE':               [1,1,1,1,1,0,0,0,0,0,0,0],
          'LAB-R&DE':             [3,3,2,1,1,0,0,0,0,0,0,0],
          'LAB-Product':          [1,1,1,1,1,0,0,0,0,0,0,0],
          'Curriculum CT':        [0,0,0,0,0,0,0,0,0,0,0,0],
          'Curriculum PD':        [0,0,1,0,4,0,0,0,0,0,0,0],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [0,0,0,0,0,0,0,0,0,0,0,0],
          'POPs':                 [1,1,1,0,0,0,0,0,0,0,0,0],
          'Other/Misc':           [1,0,1,1,1,0,0,0,0,0,0,0],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [3,2,2,3,3,0,0,0,0,0,0,0],
          'MKT':                  [1,1,1,0,0,0,0,0,0,0,0,0],
          'AM':                   [2,2,2,2,1,0,0,0,0,0,0,0],
          'Help Desk/Support/CX': [0,0,0,0,0,0,0,0,0,0,0,0]
        },
        y25: {
          'LAB-IE':               [1,1,1,1,1,1,1,1,1,1,1,0],
          'LAB-R&DE':             [2,2,2,2,4,5,4,4,4,4,4,1],
          'LAB-Product':          [1,1,1,1,1,1,1,0,1,1,1,1],
          'Curriculum CT':        [0,0,0,0,0,0,0,0,0,0,0,0],
          'Curriculum PD':        [1,1,2,3,1,1,1,0,1,0,0,0],
          'Teacher-SG':           [0,0,0,0,0,0,0,0,0,0,0,0],
          'FA':                   [0,0,0,0,0,0,0,0,0,0,0,0],
          'POPs':                 [0,0,0,0,0,0,0,0,0,0,0,0],
          'Other/Misc':           [1,1,1,1,1,1,1,1,1,1,1,1],
          'LEGAL':                [0,0,0,0,0,0,0,0,0,0,0,0],
          'SALES':                [2,2,2,2,4,4,5,3,3,4,4,4],
          'MKT':                  [0,0,0,0,0,0,0,0,1,0,0,0],
          'AM':                   [1,1,0,1,1,1,1,1,1,1,1,2],
          'Help Desk/Support/CX': [0,0,0,0,0,0,0,0,0,0,0,0]
        }
      }
    }
  };
}

/* ═══════════════════════════════════════════════════════════
   HTML
   ═══════════════════════════════════════════════════════════ */
function buildHtml() {
  var sd = JSON.stringify(getStaticData());
  var h = '';

  h += '<!DOCTYPE html><html lang="en"><head>';
  h += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  h += '<title>OON Payroll Dashboard</title>';
  h += '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">';
  h += '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"><\/script>';

  h += '<style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += ':root{--ink:#111827;--ink2:#374151;--ink3:#6B7280;--ink4:#9CA3AF;';
  h += '--line:#E5E7EB;--line2:#F3F4F6;--bg:#F9FAFB;--white:#FFFFFF;';
  h += '--c1:#1E3A5F;--c2:#0F7173;--c3:#64748B;--c4:#E07A5F;';
  h += '--c1l:#EEF2F7;--c2l:#E6F4F4;--c3l:#F1F4F8;--c4l:#FCF0ED;';
  h += '--mono:"JetBrains Mono",monospace;--sb:220px;--tb:52px;--fb:48px;}';
  h += 'body{font-family:"Inter",sans-serif;background:var(--bg);color:var(--ink);font-size:13px;line-height:1.5;display:flex;height:100vh;overflow:hidden}';

  /* loading overlay */
  h += '#ld{position:fixed;inset:0;background:var(--c1);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:14px}';
  h += '.spin{width:32px;height:32px;border:2.5px solid rgba(255,255,255,.15);border-top-color:#0F7173;border-radius:50%;animation:sp .75s linear infinite}';
  h += '@keyframes sp{to{transform:rotate(360deg)}}';
  h += '#ld p{color:rgba(255,255,255,.45);font-size:11px;font-weight:600;letter-spacing:.3px}';

  /* sidebar */
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

  /* main */
  h += '.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}';
  h += '.tb{height:var(--tb);background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;flex-shrink:0}';
  h += '.tb-breadcrumb{display:flex;align-items:center;gap:8px;font-size:12px}';
  h += '.tb-root{font-weight:700;color:var(--ink);font-size:13px}';
  h += '.tb-sep{color:var(--line);font-size:18px;margin:0 2px}';
  h += '.tb-page{color:var(--ink3)}';
  h += '.tb-right{margin-left:auto;display:flex;align-items:center;gap:8px}';
  h += '.tb-badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--c2l);color:var(--c2)}';
  h += '.btn-ref{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:1.5px solid var(--line);border-radius:6px;background:#fff;color:var(--ink2);font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;outline:none}';
  h += '.btn-ref:hover{border-color:var(--c2);color:var(--c2);background:var(--c2l)}';
  h += '.btn-ref:disabled{opacity:.5;cursor:not-allowed}';
  h += '.ri{display:inline-block}.btn-ref.loading .ri{animation:rspin .7s linear infinite}';
  h += '@keyframes rspin{to{transform:rotate(360deg)}}';
  h += '.sep2{width:1px;height:18px;background:var(--line);margin:0 4px}';
  h += '.tb-ts{font-size:10px;color:var(--ink4);font-family:var(--mono)}';
  h += '#toast{position:fixed;bottom:20px;right:20px;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;color:#fff;z-index:99999;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none;min-width:200px;box-shadow:0 4px 16px rgba(0,0,0,.15)}';
  h += '#toast.show{opacity:1;transform:none}';

  /* filter bar */
  h += '.fb{height:var(--fb);background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:14px;flex-shrink:0}';
  h += '.fb-g{display:flex;align-items:center;gap:7px}';
  h += '.fb-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px}';
  h += '.fb-sel{height:28px;padding:0 8px;border:1px solid var(--line);border-radius:6px;font-size:12px;font-family:inherit;color:var(--ink);background:#fff;cursor:pointer;outline:none}';
  h += '.fb-div{width:1px;height:22px;background:var(--line)}';
  h += '.fb-tags{display:flex;gap:5px;margin-left:4px}';
  h += '.ftag{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:var(--c1l);color:var(--c1)}';

  /* content */
  h += '.content{flex:1;overflow-y:auto;padding:20px 24px}';
  h += '.sec-t{font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 8px}';

  /* kpi */
  h += '.krow{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:10px}';
  h += '.kc{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:16px 18px}';
  h += '.kc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}';
  h += '.kc-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px}';
  h += '.kc-ico{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px}';
  h += '.kc-val{font-size:20px;font-weight:700;color:var(--ink);font-family:var(--mono);letter-spacing:-1px;line-height:1}';
  h += '.kc-meta{margin-top:6px;display:flex;align-items:center;justify-content:space-between}';
  h += '.kc-sub{font-size:11px;color:var(--ink3)}';
  h += '.chg{display:inline-flex;align-items:center;gap:2px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px}';
  h += '.chg.up{background:#ECFDF5;color:#059669}.chg.dn{background:#FEF2F2;color:#DC2626}.chg.nc{background:var(--line2);color:var(--ink3)}';

  /* company cards */
  h += '.crow{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:10px}';
  h += '.coc{background:var(--white);border:1px solid var(--line);border-radius:10px;overflow:hidden}';
  h += '.coc-h{padding:12px 16px;display:flex;align-items:center;gap:12px}';
  h += '.coc-av{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0}';
  h += '.coc-n{font-size:13px;font-weight:700;color:var(--ink)}';
  h += '.coc-s{font-size:10px;color:var(--ink4)}';
  h += '.coc-stats{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;border-top:1px solid var(--line)}';
  h += '.cs{padding:10px 14px;border-right:1px solid var(--line)}';
  h += '.cs:last-child{border-right:none}';
  h += '.cs-l{font-size:9px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}';
  h += '.cs-v{font-size:12px;font-weight:700;font-family:var(--mono);color:var(--ink)}';
  h += '.cs-v.a{color:var(--c2)}';

  /* grids & panels */
  h += '.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px}';
  h += '.g31{display:grid;grid-template-columns:3fr 1fr;gap:12px;margin-bottom:10px}';
  h += '.panel{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:12px}';
  h += '.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}';
  h += '.pt{font-size:12px;font-weight:700;color:var(--ink)}';
  h += '.pn{font-size:10px;color:var(--ink4)}';
  h += '.cw{position:relative}.cw.h220{height:220px}.cw.h240{height:240px}.cw.h280{height:280px}';

  /* table */
  h += 'table{width:100%;border-collapse:collapse}';
  h += 'th{padding:8px 12px;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}';
  h += 'td{padding:8px 12px;border-bottom:1px solid var(--line2);font-size:12px;color:var(--ink);vertical-align:middle}';
  h += 'tr:last-child td{border-bottom:none}';
  h += 'tr:hover td{background:var(--bg)}';
  h += '.tr{text-align:right;font-family:var(--mono);font-size:11px}';
  h += '.bold{font-weight:700}.dim{color:var(--ink4)}';

  /* dept pills */
  h += '.dp{display:inline-flex;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}';
  h += '.dp-lab{background:var(--c1l);color:var(--c1)}.dp-edu{background:var(--c2l);color:var(--c2)}';
  h += '.dp-ofc{background:var(--c3l);color:var(--c3)}.dp-gro{background:var(--c2l);color:var(--c2)}.dp-cx{background:var(--c4l);color:var(--c4)}';

  /* mini bar */
  h += '.mbar{display:flex;align-items:center;gap:6px}';
  h += '.mtrack{flex:1;height:4px;background:var(--line2);border-radius:2px}';
  h += '.mfill{height:100%;border-radius:2px;background:var(--c2)}';

  /* pages */
  h += '.page{display:none}.page.on{display:block}';
  h += '</style></head><body>';

  /* loading */
  h += '<div id="ld"><div class="spin"></div><p>Loading payroll data\u2026</p></div>';

  /* sidebar */
  h += '<div class="sb">';
  h += '<div class="sb-top"><div class="sb-badge">OON GROUP</div>';
  h += '<div class="sb-title">Payroll Dashboard</div><div class="sb-sub">Y2026 Reporting \u00b7 USD</div></div>';
  h += '<div class="sb-sect">Analytics</div>';
  h += '<div class="nav on" id="nav-ov" onclick="goPage(\'ov\')"><div class="nav-dot"></div>Overview</div>';
  h += '<div class="nav" id="nav-dp" onclick="goPage(\'dp\')"><div class="nav-dot"></div>Department Detail</div>';
  h += '<div class="nav" id="nav-mo" onclick="goPage(\'mo\')"><div class="nav-dot"></div>Monthly Trend</div>';
  h += '<div class="nav" id="nav-cc" onclick="goPage(\'cc\')"><div class="nav-dot"></div>Company Compare</div>';
  h += '<div class="sb-foot">';
  h += '<div>Period <b id="sb-period">\u2014</b></div><div>Currency <b>USD</b></div>';
  h += '<div>Prepared by <b>Tran Le</b></div><div>Verified by <b>Cedric LQ</b></div></div></div>';

  /* main */
  h += '<div class="main">';
  h += '<div class="tb">';
  h += '<div class="tb-breadcrumb"><span class="tb-root">OON Payroll</span><span class="tb-sep">/</span><span class="tb-page" id="tb-page">Overview</span></div>';
  h += '<div class="tb-right">';
  h += '<span class="tb-ts" id="tb-ts"></span>';
  h += '<div class="sep2"></div>';
  h += '<button class="btn-ref" id="btn-ref" onclick="doRefresh()"><span class="ri">&#8635;</span> Refresh</button>';
  h += '<div class="sep2"></div>';
  h += '<span class="tb-badge" id="tb-live">Static data</span>';
  h += '</div></div>';
  h += '<div id="toast"></div>';

  /* filter bar */
  h += '<div class="fb">';
  h += '<div class="fb-g"><span class="fb-lbl">Company</span>';
  h += '<select class="fb-sel" id="f-co" onchange="render()">';
  h += '<option value="group">Group (Consolidated)</option>';
  h += '<option value="vietco">VietCo</option><option value="singco">SingCo</option></select></div>';
  h += '<div class="fb-div"></div>';
  h += '<div class="fb-g"><span class="fb-lbl">Year</span>';
  h += '<select class="fb-sel" id="f-yr" onchange="render()"><option value="26">2026</option><option value="25">2025</option><option value="both">Both</option></select></div>';
  h += '<div class="fb-div"></div>';
  h += '<div class="fb-g"><span class="fb-lbl">Month</span>';
  h += '<select class="fb-sel" id="f-mo" onchange="render()">';
  h += '<option value="0">All (YTD)</option>';
  h += '<option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>';
  h += '<option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>';
  h += '<option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>';
  h += '<option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option></select></div>';
  h += '<div class="fb-tags" id="f-tags"></div></div>';

  /* content */
  h += '<div class="content">';

  /* page: overview */
  h += '<div class="page on" id="page-ov">';
  h += '<div class="krow" id="kpi-cards"></div>';
  h += '<div class="sec-t">Company Snapshot</div>';
  h += '<div class="crow" id="co-cards"></div>';
  h += '<div class="sec-t">Trends</div>';
  h += '<div class="g2">';
  h += '<div class="panel"><div class="ph"><span class="pt">Monthly Salary Trend (USD)</span><span class="pn" id="trend-note"></span></div><div class="cw h240"><canvas id="ch-trend"></canvas></div></div>';
  h += '<div class="panel"><div class="ph"><span class="pt">Division Cost Distribution</span><span class="pn">by HC share</span></div><div class="cw h240"><canvas id="ch-div"></canvas></div></div>';
  h += '</div></div>';

  /* page: dept */
  h += '<div class="page" id="page-dp"><div class="g31">';
  h += '<div class="panel"><div class="ph"><span class="pt">Department Detail</span><span class="pn" id="dp-note"></span></div>';
  h += '<table id="tbl-dept"></table></div>';
  h += '<div class="panel"><div class="ph"><span class="pt">HC by Dept</span></div><div class="cw h280"><canvas id="ch-hc-dept"></canvas></div></div>';
  h += '</div></div>';

  /* page: monthly */
  h += '<div class="page" id="page-mo">';
  h += '<div class="panel"><div class="ph"><span class="pt">Monthly Salary \u2014 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-mo-full"></canvas></div></div>';
  h += '<div class="panel"><div class="ph"><span class="pt">HC &amp; Cost per Head \u2014 2026</span></div>';
  h += '<table><tr><th>Month</th><th class="tr">HC</th><th class="tr">Salary</th><th class="tr">Cost/Head</th><th class="tr">MoM</th><th>Trend</th></tr>';
  h += '<tbody id="mo-tbl"></tbody></table></div></div>';

  /* page: compare */
  h += '<div class="page" id="page-cc">';
  h += '<div class="krow" id="cc-kpis"></div>';
  h += '<div class="g2">';
  h += '<div class="panel"><div class="ph"><span class="pt">YTD Salary \u2014 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-cc-ytd"></canvas></div></div>';
  h += '<div class="panel"><div class="ph"><span class="pt">Headcount Mix</span></div><div class="cw h240"><canvas id="ch-cc-hc"></canvas></div></div>';
  h += '</div>';
  h += '<div class="panel"><div class="ph"><span class="pt">Monthly Salary \u2014 All Companies 2026</span></div><div class="cw h220"><canvas id="ch-cc-mo"></canvas></div></div>';
  h += '</div>';

  h += '</div></div>'; /* close content + main */

  /* ─── JAVASCRIPT ─────────────────────────────────────────────── */
  h += '<script>';
  h += 'var D=' + sd + ';';
  h += 'var MK=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];';
  h += 'var ML=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];';
  h += 'var DEPTS=[["LAB-IE","LAB","lab"],["LAB-R&DE","LAB","lab"],["LAB-Product","LAB","lab"],';
  h += '["Curriculum CT","Edu","edu"],["Curriculum PD","Edu","edu"],["Teacher-SG","Edu","edu"],';
  h += '["FA","Office","ofc"],["POPs","Office","ofc"],["Other/Misc","Office","ofc"],';
  h += '["LEGAL","Growth","gro"],["SALES","Growth","gro"],["MKT","Growth","gro"],';
  h += '["AM","CX","cx"],["Help Desk/Support/CX","CX","cx"]];';
  h += 'var DIV_C={lab:"#1E3A5F",edu:"#0F7173",ofc:"#64748B",gro:"#94A3B8",cx:"#E07A5F"};';
  h += 'var CO_C={group:"#1E3A5F",vietco:"#0F7173",singco:"#E07A5F"};';
  h += 'var CO_N={group:"Group",vietco:"VietCo",singco:"SingCo"};';
  h += 'var CO_LOC={group:"Consolidated",vietco:"Vietnam",singco:"Singapore"};';
  h += 'var CHS={};var curPage="ov";';

  /* helpers */
  h += 'function zp(n){return n<10?"0"+n:""+n;}';
  h += 'function fU(v){if(v>=1000000)return "$"+(v/1000000).toFixed(2)+"M";if(v>=1000)return "$"+(v/1000).toFixed(1)+"K";return "$"+Math.round(v).toLocaleString();}';
  h += 'function fUM(v){return "$"+(v/1000).toFixed(1)+"K";}';
  h += 'function toK(v){return+(v/1000).toFixed(2);}';
  h += 'function pct(a,b){if(!b)return null;return(a-b)/b*100;}';
  h += 'function chg(a,b){var p=pct(a,b);if(p===null)return \'<span class="chg nc">\u2014</span>\';';
  h += 'var c=p>=0?"up":"dn",s=p>=0?"\u25b2":"\u25bc";';
  h += 'return \'<span class="chg \'+c+\'">\'+s+" "+Math.abs(p).toFixed(1)+\'%</span>\';}';

  h += 'function getSal(co,yr,mo){';
  h += 'if(yr==="both")return getSal(co,"26",mo)+getSal(co,"25",mo);';
  h += 'var s=D[co]&&D[co].sal["y"+yr];if(!s)return 0;';
  h += 'if(!mo)return s.ytd||0;return s[MK[mo-1]]||0;}';

  h += 'function lastIdx(co,yr){';
  h += 'var h=D[co]&&D[co].hc["y"+yr];if(!h)return 4;';
  h += 'for(var i=11;i>=0;i--){var t=DEPTS.reduce(function(s,d){var a=h[d[0]];return s+(a?a[i]||0:0);},0);if(t>0)return i;}';
  h += 'return 0;}';

  h += 'function getHC(co,yr,mo){';
  h += 'var _y=yr==="both"?"26":yr;';
  h += 'var h=D[co]&&D[co].hc["y"+_y];if(!h)return 0;';
  h += 'var idx=mo?mo-1:lastIdx(co,_y);';
  h += 'return DEPTS.reduce(function(t,d){var a=h[d[0]];return t+(a?a[idx]||0:0);},0);}';

  h += 'function getDHC(co,yr,mo,dept){';
  h += 'var _y=yr==="both"?"26":yr;';
  h += 'var h=D[co]&&D[co].hc["y"+_y];if(!h||!h[dept])return 0;';
  h += 'var idx=mo?mo-1:lastIdx(co,_y);';
  h += 'return h[dept][idx]||0;}';

  h += 'function mkCh(id,type,data,opts){';
  h += 'if(CHS[id])CHS[id].destroy();';
  h += 'var el=document.getElementById(id);if(!el)return;';
  h += 'var leg={display:true,position:"bottom",labels:{font:{size:10,family:"Inter"},boxWidth:10,padding:8}};';
  h += 'if(type==="bar"&&!opts)opts={};';
  h += 'var cfg={type:type,data:data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:leg}}};';
  h += 'if(opts)for(var k in opts)cfg.options[k]=opts[k];';
  h += 'CHS[id]=new Chart(el,cfg);}';

  /* axis preset */
  h += 'var AX={scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:"#F3F4F6"},ticks:{callback:function(v){return "$"+v+"K";},font:{family:"JetBrains Mono",size:10}}}}};';

  h += 'function goPage(p){';
  h += 'curPage=p;';
  h += 'document.querySelectorAll(".page").forEach(function(e){e.classList.remove("on");});';
  h += 'document.querySelectorAll(".nav").forEach(function(e){e.classList.remove("on");});';
  h += 'document.getElementById("page-"+p).classList.add("on");';
  h += 'document.getElementById("nav-"+p).classList.add("on");';
  h += 'var T={ov:"Overview",dp:"Department Detail",mo:"Monthly Trend",cc:"Company Compare"};';
  h += 'document.getElementById("tb-page").textContent=T[p];render();}';

  h += 'function render(){';
  h += 'var co=document.getElementById("f-co").value;';
  h += 'var yr=document.getElementById("f-yr").value;';
  h += 'var mo=parseInt(document.getElementById("f-mo").value,10)||0;';
  h += 'var moL=mo?ML[mo-1]:"YTD";';
  h += 'var yrL=yr==="26"?"2026":yr==="25"?"2025":"2026&2025";';
  h += 'document.getElementById("sb-period").textContent=yrL+" "+moL;';
  h += 'document.getElementById("f-tags").innerHTML=\'<span class="ftag">\'+CO_N[co]+"</span>";';
  h += 'try{';
  h += 'if(curPage==="ov")renderOv(co,yr,mo,moL);';
  h += 'if(curPage==="dp")renderDp(co,yr,mo);';
  h += 'if(curPage==="mo")renderMo(co,yr);';
  h += 'if(curPage==="cc")renderCc(yr,mo);';
  h += '}catch(e){console.error("render error",e);}}';

  /* ── OVERVIEW ─────────────────────────────────────────────────── */
  h += 'function renderOv(co,yr,mo,moL){';
  h += 'var sal=getSal(co,yr,mo);';
  h += 'var salP=mo?getSal(co,yr,mo>1?mo-1:0):getSal(co,yr==="26"?"25":"26",0);';
  h += 'var hc=getHC(co,yr,mo),hcP=mo?getHC(co,yr,mo>1?mo-1:0):0;';
  h += 'var cph=hc?Math.round(sal/hc):0;';
  h += 'var ytd=getSal(co,yr,0),ytdP=getSal(co,yr==="26"?"25":"26",0);';
  /* kpi */
  h += 'document.getElementById("kpi-cards").innerHTML=';
  h += '\'<div class="kc"><div class="kc-top"><span class="kc-lbl">Salary (\'+moL+\')</span><div class="kc-ico" style="background:var(--c1l)">\uD83D\uDCB0</div></div><div class="kc-val">\'+fU(sal)+\'</div><div class="kc-meta"><span class="kc-sub">\'+fU(sal)+\'</span>\'+chg(sal,salP)+\'</div></div>\'';
  h += '+\'<div class="kc"><div class="kc-top"><span class="kc-lbl">Headcount</span><div class="kc-ico" style="background:var(--c2l)">\uD83D\uDC65</div></div><div class="kc-val">\'+hc+\'</div><div class="kc-meta"><span class="kc-sub">people</span>\'+chg(hc,hcP)+\'</div></div>\'';
  h += '+\'<div class="kc"><div class="kc-top"><span class="kc-lbl">Cost/Head</span><div class="kc-ico" style="background:var(--c3l)">\uD83D\uDCCA</div></div><div class="kc-val">\'+fU(cph)+\'</div><div class="kc-meta"><span class="kc-sub">\'+fUM(cph)+\'/head</span></div></div>\'';
  h += '+\'<div class="kc"><div class="kc-top"><span class="kc-lbl">YTD Total</span><div class="kc-ico" style="background:var(--c4l)">\uD83D\uDCC5</div></div><div class="kc-val">\'+fU(ytd)+\'</div><div class="kc-meta"><span class="kc-sub">prior: \'+fU(ytdP)+\'</span>\'+chg(ytd,ytdP)+\'</div></div>\';';
  /* co cards */
  h += 'var cos=["group","vietco","singco"],ch="";';
  h += 'for(var i=0;i<cos.length;i++){';
  h += 'var c=cos[i],cs=getSal(c,yr,mo),chc=getHC(c,yr,mo),cph2=chc?Math.round(cs/chc):0;';
  h += 'var rat=sal?(cs/sal*100).toFixed(0)+"%":"\u2014";';
  h += 'ch+=\'<div class="coc"><div class="coc-h"><div class="coc-av" style="background:\'+CO_C[c]+\'">\'+CO_N[c].substring(0,3).toUpperCase()+\'</div>\';';
  h += 'ch+=\'<div><div class="coc-n">\'+CO_N[c]+\'</div><div class="coc-s">\'+CO_LOC[c]+\'</div></div></div>\';';
  h += 'ch+=\'<div class="coc-stats">\';';
  h += 'ch+=\'<div class="cs"><div class="cs-l">HC</div><div class="cs-v a">\'+chc+\'</div></div>\';';
  h += 'ch+=\'<div class="cs"><div class="cs-l">Salary</div><div class="cs-v">\'+fU(cs)+\'</div></div>\';';
  h += 'ch+=\'<div class="cs"><div class="cs-l">Cost/Head</div><div class="cs-v">\'+fU(cph2)+\'</div></div>\';';
  h += 'ch+=\'<div class="cs"><div class="cs-l">Ratio</div><div class="cs-v">\'+rat+\'</div></div></div></div>\';';
  h += '}';
  h += 'document.getElementById("co-cards").innerHTML=ch;';
  /* trend chart */
  h += 'var _y=yr==="both"?"26":yr,_yp=_y==="26"?"25":"25";';
  h += 'var s1=MK.map(function(k){var s=D[co].sal["y"+_y];return s?toK(s[k]||0):0;});';
  h += 'var s2=MK.map(function(k){var s=D[co].sal["y"+_yp];return s?toK(s[k]||0):0;});';
  h += 'document.getElementById("trend-note").textContent=(_y==="26"?"2026 vs 2025":"2025 vs 2024");';
  h += 'mkCh("ch-trend","bar",{labels:ML,datasets:[';
  h += '{label:(_y==="26"?"2026":"2025"),data:s1,backgroundColor:"#1E3A5F",borderRadius:3,barPercentage:.55},';
  h += '{label:"2025",data:s2,backgroundColor:"#CBD5E1",borderRadius:3,barPercentage:.55}';
  h += ']},AX);';
  /* donut */
  h += 'var dg={lab:["LAB-IE","LAB-R&DE","LAB-Product"],edu:["Curriculum CT","Curriculum PD","Teacher-SG"],';
  h += 'ofc:["FA","POPs","Other/Misc"],gro:["LEGAL","SALES","MKT"],cx:["AM","Help Desk/Support/CX"]};';
  h += 'var _hy=yr==="both"?"26":yr,ha=D[co].hc["y"+_hy],htot=getHC(co,yr,mo);';
  h += 'var lidx=lastIdx(co,_hy);';
  h += 'var dlbls=[],dvals=[],dcols=[],dnames=["LAB","Eduservice","Office","Growth","CX"],dkeys=["lab","edu","ofc","gro","cx"],dclr=["#1E3A5F","#0F7173","#64748B","#94A3B8","#E07A5F"];';
  h += 'for(var di=0;di<dkeys.length;di++){';
  h += 'var dhc=ha?dg[dkeys[di]].reduce(function(s,k){var a=ha[k];return s+(a?a[lidx]||0:0);},0):0;';
  h += 'var dsal=htot?sal*(dhc/htot):0;';
  h += 'if(dsal>0){dlbls.push(dnames[di]);dvals.push(toK(dsal));dcols.push(dclr[di]);}}';
  h += 'if(!dvals.length){dvals=[1];dlbls=["No data"];dcols=["#E5E7EB"];}';
  h += 'mkCh("ch-div","doughnut",{labels:dlbls,datasets:[{data:dvals,backgroundColor:dcols,borderWidth:2,borderColor:"#fff"}]});}';

  /* ── DEPT ─────────────────────────────────────────────────────── */
  h += 'function renderDp(co,yr,mo){';
  h += 'var pm=mo?mo-1:0,sc=getSal(co,yr,mo),sp=pm?getSal(co,yr,pm):0;';
  h += 'var ht=getHC(co,yr,mo),hpt=getHC(co,yr,pm);';
  h += 'var cl=mo?ML[mo-1]:"YTD",pl=pm?ML[pm-1]:"-";';
  h += 'document.getElementById("dp-note").textContent=cl+", "+CO_N[co];';
  h += 'var rows="",bL=[],bH=[],bC=[],maxH=0,lastD="",tH=0,tE=0,tEP=0;';
  h += 'for(var j=0;j<DEPTS.length;j++){var hj=getDHC(co,yr,mo,DEPTS[j][0]);if(hj>maxH)maxH=hj;}';
  h += 'for(var i=0;i<DEPTS.length;i++){';
  h += 'var dp=DEPTS[i][0],dv=DEPTS[i][1],dc=DEPTS[i][2];';
  h += 'var hc=getDHC(co,yr,mo,dp);if(!hc)continue;';
  h += 'var hcp=getDHC(co,yr,pm,dp);';
  h += 'var es=ht?sc*(hc/ht):0,esp=hpt?sp*(hcp/hpt):0;';
  h += 'var ps=sc?(es/sc*100).toFixed(1):"0",bw=maxH?(hc/maxH*100).toFixed(0):0;';
  h += 'var dvH=dv!==lastD?"<span class=\'dp dp-"+dc+"\'>"+dv+"</span>":"";lastD=dv;';
  h += 'rows+="<tr><td>"+dvH+"</td><td class=\'bold\'>"+dp+"</td>";';
  h += 'rows+="<td class=\'tr bold\' style=\'color:var(--c2)\'>"+hc+"</td>";';
  h += 'rows+="<td class=\'tr dim\'>"+fU(esp)+"</td>";';
  h += 'rows+="<td class=\'tr bold\'>"+fU(es)+"</td>";';
  h += 'rows+="<td class=\'tr\'>"+chg(es,esp)+"</td>";';
  h += 'rows+="<td class=\'tr dim\'>"+ps+"%</td>";';
  h += 'rows+="<td><div class=\'mbar\'><div class=\'mtrack\'><div class=\'mfill\' style=\'width:"+bw+"%\'></div></div></div></td></tr>";';
  h += 'bL.push(dp);bH.push(hc);bC.push(DIV_C[dc]);tH+=hc;tE+=es;tEP+=esp;}';
  h += 'var tr="<tr style=\'border-top:2px solid var(--line);background:var(--line2)\'><td></td><td class=\'bold\'>TOTAL</td>";';
  h += 'tr+="<td class=\'tr bold\' style=\'color:var(--c1)\'>"+tH+"</td>";';
  h += 'tr+="<td class=\'tr dim\'>"+fU(tEP)+"</td><td class=\'tr bold\' style=\'color:var(--c1)\'>"+fU(tE)+"</td>";';
  h += 'tr+="<td class=\'tr\'>"+chg(tE,tEP)+"</td><td class=\'tr bold dim\'>100%</td>";';
  h += 'tr+="<td><div class=\'mbar\'><div class=\'mtrack\'><div class=\'mfill\' style=\'width:100%;background:var(--c1)\'></div></div></div></td></tr>";';
  h += 'var hdr="<tr><th>Div</th><th>Dept</th><th class=\'tr\'>HC</th><th class=\'tr\'>"+pl+"</th><th class=\'tr\'>"+cl+"</th><th class=\'tr\'>Chg</th><th class=\'tr\'>%</th><th>Bar</th></tr>";';
  h += 'document.getElementById("tbl-dept").innerHTML=hdr+rows+tr;';
  h += 'mkCh("ch-hc-dept","bar",{labels:bL,datasets:[{data:bH,backgroundColor:bC,borderRadius:4,barPercentage:.6}]},{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{grid:{color:"#F3F4F6"},ticks:{font:{size:10}}},y:{grid:{display:false},ticks:{font:{size:10}}}}});}';

  /* ── MONTHLY ──────────────────────────────────────────────────── */
  h += 'function renderMo(co,yr){';
  h += 'var _y=yr==="both"?"26":yr;';
  h += 'var s26=MK.map(function(k){var s=D[co].sal["y"+_y];return s?toK(s[k]||0):0;});';
  h += 'var s25=MK.map(function(k){var s=D[co].sal.y25;return s?toK(s[k]||0):0;});';
  h += 'mkCh("ch-mo-full","bar",{labels:ML,datasets:[';
  h += '{label:(_y==="26"?"2026":"2025"),data:s26,backgroundColor:"#1E3A5F",borderRadius:3,barPercentage:.5},';
  h += '{label:"2025",data:s25,backgroundColor:"#CBD5E1",borderRadius:3,barPercentage:.5}';
  h += ']},AX);';
  h += 'var tbl="";';
  h += 'for(var i=0;i<12;i++){';
  h += 'var sv=D[co].sal["y"+_y]?D[co].sal["y"+_y][MK[i]]||0:0;if(!sv)continue;';
  h += 'var hc=getHC(co,yr,i+1),cph=hc?Math.round(sv/hc):0,prev=i?D[co].sal["y"+_y][MK[i-1]]||0:0;';
  h += 'var bw=s26[0]?(s26[i]/s26[0]*100).toFixed(0):0;';
  h += 'tbl+="<tr><td class=\'bold\'>"+ML[i]+"</td>";';
  h += 'tbl+="<td class=\'tr bold\' style=\'color:var(--c2)\'>"+hc+"</td>";';
  h += 'tbl+="<td class=\'tr\'>"+fU(sv)+"</td>";';
  h += 'tbl+="<td class=\'tr\'>"+fUM(cph)+"</td>";';
  h += 'tbl+="<td class=\'tr\'>"+chg(sv,prev)+"</td>";';
  h += 'tbl+="<td><div class=\'mbar\'><div class=\'mtrack\'><div class=\'mfill\' style=\'width:"+bw+"%\'></div></div></div></td></tr>";}';
  h += 'document.getElementById("mo-tbl").innerHTML=tbl;}';

  /* ── COMPARE ──────────────────────────────────────────────────── */
  h += 'function renderCc(yr,mo){';
  h += 'var cos=["group","vietco","singco"];';
  h += 'var ytds=cos.map(function(c){return getSal(c,yr,0);});';
  h += 'var ytdsP=cos.map(function(c){return getSal(c,yr==="26"?"25":"26",0);});';
  h += 'var hcs=cos.map(function(c){return getHC(c,yr,mo);});';
  h += 'var sals=cos.map(function(c){return getSal(c,yr,mo);});';
  h += 'var kh="";';
  h += 'for(var i=0;i<cos.length;i++){';
  h += 'var cph=hcs[i]?Math.round(sals[i]/hcs[i]):0;';
  h += 'kh+=\'<div class="kc"><div class="kc-top"><span class="kc-lbl">\'+CO_N[cos[i]]+\'</span><div class="kc-ico" style="background:\'+CO_C[cos[i]]+\'22">\uD83C\uDFE2</div></div>\';';
  h += 'kh+=\'<div class="kc-val">\'+fU(ytds[i])+\'</div>\';';
  h += 'kh+=\'<div class="kc-meta"><span class="kc-sub">HC:\'+hcs[i]+" "+fUM(cph)+"/h</span>"+chg(ytds[i],ytdsP[i])+"</div></div>";}';
  h += 'document.getElementById("cc-kpis").innerHTML=kh;';
  h += 'mkCh("ch-cc-ytd","bar",{labels:cos.map(function(c){return CO_N[c];}),datasets:[';
  h += '{label:"YTD 2026",data:ytds.map(toK),backgroundColor:["#1E3A5F","#0F7173","#E07A5F"],borderRadius:5,barPercentage:.5},';
  h += '{label:"YTD 2025",data:ytdsP.map(toK),backgroundColor:["#1E3A5F33","#0F717333","#E07A5F33"],borderRadius:5,barPercentage:.5}]},AX);';
  h += 'mkCh("ch-cc-hc","doughnut",{labels:cos.map(function(c){return CO_N[c]+" ("+getHC(c,yr,mo)+")";}),datasets:[{data:hcs,backgroundColor:["#1E3A5F","#0F7173","#E07A5F"],borderWidth:2,borderColor:"#fff"}]});';
  h += 'var _y=yr==="both"?"26":yr;';
  h += 'var ds=cos.map(function(c){return{label:CO_N[c],data:MK.map(function(k){var s=D[c].sal["y"+_y];return s?toK(s[k]||0):0;}),borderColor:CO_C[c],backgroundColor:"transparent",borderWidth:2,pointRadius:3,tension:.3};});';
  h += 'mkCh("ch-cc-mo","line",{labels:ML,datasets:ds},AX);}';

  /* ── TOAST ────────────────────────────────────────────────────── */
  h += 'function showToast(msg,ok){';
  h += 'var t=document.getElementById("toast");';
  h += 't.textContent=(ok?"\u2713 ":"\u26a0 ")+msg;';
  h += 't.style.background=ok?"#059669":"#DC2626";';
  h += 't.classList.add("show");';
  h += 'setTimeout(function(){t.classList.remove("show");},3500);}';

  /* ── REFRESH ──────────────────────────────────────────────────── */
  h += 'function doRefresh(){';
  h += 'if(typeof google==="undefined"||!google.script){showToast("Not inside Apps Script",false);return;}';
  h += 'var btn=document.getElementById("btn-ref"),badge=document.getElementById("tb-live");';
  h += 'btn.disabled=true;btn.classList.add("loading");badge.textContent="Refreshing\u2026";';
  h += 'google.script.run';
  h += '.withSuccessHandler(function(res){';
  h += 'btn.disabled=false;btn.classList.remove("loading");';
  h += 'if(res&&res.data){var cos=["group","vietco","singco"];';
  h += 'for(var i=0;i<cos.length;i++){if(res.data[cos[i]])D[cos[i]]=res.data[cos[i]];}';
  h += 'render();var n=new Date();';
  h += 'document.getElementById("tb-ts").textContent="Updated "+zp(n.getHours())+":"+zp(n.getMinutes());';
  h += 'badge.textContent="Live data";badge.style.background="var(--c2l)";badge.style.color="var(--c2)";';
  h += 'showToast("Refreshed successfully",true);';
  h += '}else{badge.textContent="No data";showToast("No data returned",false);}})';
  h += '.withFailureHandler(function(e){btn.disabled=false;btn.classList.remove("loading");showToast("Error: "+(e.message||e),false);})';
  h += '.getPayrollData();}';

  /* ── INIT — wrapped in window.onload + try/catch ─────────────── */
  h += 'window.onload=function(){';
  h += 'try{';
  h += '  document.getElementById("ld").style.display="none";';  /* hide loading */
  h += '  render();';
  h += '}catch(e){console.error("init error",e);}';
  /* auto live load */
  h += 'if(typeof google!=="undefined"&&google.script){';
  h += '  google.script.run';
  h += '  .withSuccessHandler(function(res){';
  h += '    try{if(res&&res.data){';
  h += '      var cos=["group","vietco","singco"];';
  h += '      for(var i=0;i<cos.length;i++){if(res.data[cos[i]])D[cos[i]]=res.data[cos[i]];}';
  h += '      render();var n=new Date();';
  h += '      document.getElementById("tb-ts").textContent="Updated "+zp(n.getHours())+":"+zp(n.getMinutes());';
  h += '      var b=document.getElementById("tb-live");';
  h += '      b.textContent="Live data";b.style.background="var(--c2l)";b.style.color="var(--c2)";';
  h += '    }}catch(e){console.error("live load error",e);}})';
  h += '  .withFailureHandler(function(){})';
  h += '  .getPayrollData();';
  h += '}};';

  h += '<\/script></body></html>';
  return h;
}
