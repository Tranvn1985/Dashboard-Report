<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OON Payroll Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  /* Palette — bright, professional */
  --navy:  #0F2744;   /* sidebar background */
  --sky:   #0EA5E9;   /* primary accent — sky blue */
  --sky2:  #38BDF8;   /* lighter sky */
  --skyl:  #E0F2FE;   /* sky tint */
  --teal:  #0D9488;   /* secondary accent */
  --teal2: #14B8A6;
  --teall: #CCFBF1;
  --coral: #F97316;   /* warm accent for negative / highlights */
  --corall:#FFF7ED;
  --slate: #64748B;
  --ink:   #0F172A;
  --ink2:  #1E293B;
  --ink3:  #475569;
  --ink4:  #94A3B8;
  --line:  #E2E8F0;
  --line2: #F1F5F9;
  --bg:    #F8FAFC;
  --white: #FFFFFF;
  --mono:  "JetBrains Mono", monospace;
  --sans:  "Plus Jakarta Sans", sans-serif;
  --sb: 230px;
}
body{font-family:var(--sans);background:var(--bg);color:var(--ink);font-size:13px;line-height:1.5;display:flex;height:100vh;overflow:hidden}

/* ── LOADING ── */
#ld{position:fixed;inset:0;background:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:16px;transition:opacity .5s}
#ld.hide{opacity:0;pointer-events:none}
.spin{width:36px;height:36px;border:3px solid rgba(14,165,233,.2);border-top-color:var(--sky);border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
#ld p{color:rgba(255,255,255,.4);font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase}

/* ── SIDEBAR ── */
.sb{width:var(--sb);background:var(--navy);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;position:relative}
.sb::after{content:'';position:absolute;top:0;right:0;width:1px;height:100%;background:linear-gradient(to bottom,rgba(14,165,233,.3),transparent 60%)}
.sb-top{padding:22px 20px 18px}
.sb-logo{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.sb-logo-mark{width:32px;height:32px;background:linear-gradient(135deg,var(--sky),var(--teal2));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;letter-spacing:-.5px;flex-shrink:0}
.sb-logo-text{line-height:1.2}
.sb-name{font-size:12px;font-weight:700;color:#fff}
.sb-tagline{font-size:10px;color:rgba(255,255,255,.35);font-weight:500}
.sb-divider{height:1px;background:rgba(255,255,255,.07);margin:0 0 16px}
.sb-sect{font-size:9px;font-weight:700;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:1.2px;padding:0 20px 8px}
.nav{display:flex;align-items:center;gap:10px;padding:9px 12px 9px 20px;margin:1px 10px;border-radius:8px;font-size:12px;font-weight:500;color:rgba(255,255,255,.45);cursor:pointer;transition:all .15s;position:relative}
.nav:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8)}
.nav.on{background:rgba(14,165,233,.15);color:#fff;font-weight:600}
.nav.on::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:18px;background:var(--sky);border-radius:0 2px 2px 0}
.nav-ic{font-size:14px;width:20px;text-align:center;flex-shrink:0}
.sb-foot{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(255,255,255,.07)}
.sb-foot-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.sb-foot-lbl{font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px}
.sb-foot-val{font-size:10px;color:rgba(255,255,255,.55);font-weight:600}
.sb-period{font-size:11px;font-weight:700;color:rgba(255,255,255,.7);margin-bottom:10px}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── TOPBAR ── */
.tb{height:54px;background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;flex-shrink:0;gap:0}
.tb-bc{display:flex;align-items:center;gap:6px;font-size:12px}
.tb-root{font-weight:700;color:var(--ink);font-size:13px}
.tb-sep{color:var(--line);font-size:16px;margin:0 2px}
.tb-page{color:var(--ink4);font-weight:500}
.tb-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.pill{font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.2px}
.pill-live{background:var(--teall);color:var(--teal)}
.pill-static{background:var(--line2);color:var(--ink4)}
.pill-warn{background:var(--corall);color:var(--coral)}
.btn-ref{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 14px;border:1.5px solid var(--line);border-radius:8px;background:#fff;color:var(--ink3);font-size:11px;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s;outline:none}
.btn-ref:hover{border-color:var(--sky);color:var(--sky);background:var(--skyl)}
.btn-ref:disabled{opacity:.4;cursor:not-allowed}
.ri{display:inline-block;font-style:normal}
.btn-ref.loading .ri{animation:rspin .7s linear infinite}
@keyframes rspin{to{transform:rotate(360deg)}}
.sep2{width:1px;height:20px;background:var(--line);margin:0 2px}
.tb-ts{font-size:10px;color:var(--ink4);font-family:var(--mono);letter-spacing:-.3px}

/* ── TOAST ── */
#toast{position:fixed;bottom:24px;right:24px;padding:11px 16px;border-radius:10px;font-size:12px;font-weight:600;color:#fff;z-index:99999;opacity:0;transform:translateY(10px);transition:opacity .25s,transform .25s;pointer-events:none;min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,.15)}
#toast.show{opacity:1;transform:none}

/* ── FILTER BAR ── */
.fb{height:50px;background:var(--white);border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.fb-g{display:flex;align-items:center;gap:6px}
.fb-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.6px}
.fb-sel{height:30px;padding:0 10px;border:1.5px solid var(--line);border-radius:8px;font-size:12px;font-family:inherit;color:var(--ink);background:#fff;cursor:pointer;outline:none;font-weight:500;transition:border .15s}
.fb-sel:focus{border-color:var(--sky);box-shadow:0 0 0 3px rgba(14,165,233,.1)}
.fb-div{width:1px;height:20px;background:var(--line)}
.fb-tags{display:flex;gap:5px;margin-left:6px}
.ftag{padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;background:linear-gradient(135deg,var(--sky),var(--teal2));color:#fff;letter-spacing:.2px}

/* ── CONTENT ── */
.content{flex:1;overflow-y:auto;padding:20px 24px;scroll-behavior:smooth}
.sec-t{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.8px;margin:18px 0 10px;display:flex;align-items:center;gap:8px}
.sec-t::after{content:'';flex:1;height:1px;background:var(--line)}

/* ── KPI CARDS ── */
.krow{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:4px}
.kc{background:var(--white);border:1px solid var(--line);border-radius:12px;padding:0;overflow:hidden;position:relative;transition:box-shadow .2s,transform .2s}
.kc:hover{box-shadow:0 4px 20px rgba(15,39,68,.08);transform:translateY(-1px)}
.kc-accent{height:3px;background:linear-gradient(90deg,var(--sky),var(--teal2));border-radius:0}
.kc-body{padding:16px 18px}
.kc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.kc-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px;line-height:1.3}
.kc-ico{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.kc-val{font-size:22px;font-weight:800;color:var(--ink);font-family:var(--mono);letter-spacing:-1.5px;line-height:1}
.kc-meta{margin-top:8px;display:flex;align-items:center;justify-content:space-between}
.kc-sub{font-size:11px;color:var(--ink4);font-weight:500}
.chg{display:inline-flex;align-items:center;gap:2px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px}
.chg.up{background:#DCFCE7;color:#16A34A}
.chg.dn{background:#FEE2E2;color:#DC2626}
.chg.nc{background:var(--line2);color:var(--ink4)}

/* ── COMPANY CARDS ── */
.crow{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:4px}
.coc{background:var(--white);border:1px solid var(--line);border-radius:12px;overflow:hidden;transition:box-shadow .2s}
.coc:hover{box-shadow:0 4px 20px rgba(15,39,68,.08)}
.coc-h{padding:14px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--line2)}
.coc-av{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;letter-spacing:.5px}
.coc-n{font-size:14px;font-weight:700;color:var(--ink);line-height:1.2}
.coc-s{font-size:10px;color:var(--ink4);font-weight:500;margin-top:1px}
.coc-stats{display:grid;grid-template-columns:1fr 1fr 1fr 1fr}
.cs{padding:12px 14px;border-right:1px solid var(--line2)}
.cs:last-child{border-right:none}
.cs-l{font-size:9px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.cs-v{font-size:13px;font-weight:700;font-family:var(--mono);color:var(--ink);letter-spacing:-.3px}
.cs-v.a{color:var(--sky)}

/* ── GRID & PANELS ── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px}
.g31{display:grid;grid-template-columns:3fr 1fr;gap:14px;margin-bottom:4px}
.panel{background:var(--white);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-bottom:14px}
.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.pt{font-size:12px;font-weight:700;color:var(--ink)}
.pn{font-size:10px;color:var(--ink4);font-weight:500}
.cw{position:relative}
.cw.h220{height:220px}.cw.h240{height:240px}.cw.h280{height:280px}

/* ── TABLE ── */
table{width:100%;border-collapse:collapse}
th{padding:9px 12px;font-size:9px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.5px;border-bottom:1.5px solid var(--line);text-align:left;white-space:nowrap}
td{padding:9px 12px;border-bottom:1px solid var(--line2);font-size:12px;color:var(--ink);vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr:hover td{background:var(--skyl)}
.tr{text-align:right;font-family:var(--mono);font-size:11px;letter-spacing:-.2px}
.bold{font-weight:700}.dim{color:var(--ink4)}

/* ── DEPT PILLS ── */
.dp{display:inline-flex;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
.dp-lab{background:#EFF6FF;color:#1D4ED8}
.dp-edu{background:var(--teall);color:var(--teal)}
.dp-ofc{background:var(--line2);color:var(--slate)}
.dp-gro{background:#F0FDF4;color:#15803D}
.dp-cx{background:var(--corall);color:var(--coral)}

/* ── MINI BAR ── */
.mbar{display:flex;align-items:center;gap:6px}
.mtrack{flex:1;height:5px;background:var(--line2);border-radius:3px;overflow:hidden}
.mfill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--sky),var(--teal2))}

/* ── PAGES ── */
.page{display:none}.page.on{display:block}
</style>
</head>
<body>

<div id="ld"><div class="spin"></div><p>Loading payroll data</p></div>
<div id="toast"></div>

<!-- SIDEBAR -->
<div class="sb">
  <div class="sb-top">
    <div class="sb-logo">
      <div class="sb-logo-mark">OO</div>
      <div class="sb-logo-text">
        <div class="sb-name">One On One</div>
        <div class="sb-tagline">Group Finance</div>
      </div>
    </div>
    <div class="sb-divider"></div>
    <div class="sb-sect">Analytics</div>
    <div class="nav on" id="nav-ov" onclick="goPage('ov')"><span class="nav-ic">◻</span>Overview</div>
    <div class="nav" id="nav-dp" onclick="goPage('dp')"><span class="nav-ic">◫</span>Department Detail</div>
    <div class="nav" id="nav-mo" onclick="goPage('mo')"><span class="nav-ic">↗</span>Monthly Trend</div>
    <div class="nav" id="nav-cc" onclick="goPage('cc')"><span class="nav-ic">⊞</span>Company Compare</div>
  </div>
  <div class="sb-foot">
    <div class="sb-period" id="sb-period">—</div>
    <div class="sb-foot-row"><span class="sb-foot-lbl">Currency</span><span class="sb-foot-val">USD</span></div>
    <div class="sb-foot-row"><span class="sb-foot-lbl">Prepared</span><span class="sb-foot-val">Tran Le</span></div>
    <div class="sb-foot-row"><span class="sb-foot-lbl">Verified</span><span class="sb-foot-val">Cedric LQ</span></div>
  </div>
</div>

<!-- MAIN -->
<div class="main">
  <div class="tb">
    <div class="tb-bc">
      <span class="tb-root">OON Payroll</span>
      <span class="tb-sep">/</span>
      <span class="tb-page" id="tb-page">Overview</span>
    </div>
    <div class="tb-right">
      <span class="tb-ts" id="tb-ts"></span>
      <div class="sep2"></div>
      <button class="btn-ref" id="btn-ref" onclick="doRefresh()"><span class="ri">⟳</span> Refresh</button>
      <div class="sep2"></div>
      <span class="pill pill-static" id="tb-live">Static data</span>
    </div>
  </div>

  <!-- FILTER BAR -->
  <div class="fb">
    <div class="fb-g"><span class="fb-lbl">Company</span>
      <select class="fb-sel" id="f-co" onchange="render()">
        <option value="group">Group (Consolidated)</option>
        <option value="vietco">VietCo</option>
        <option value="singco">SingCo</option>
      </select>
    </div>
    <div class="fb-div"></div>
    <div class="fb-g"><span class="fb-lbl">Year</span>
      <select class="fb-sel" id="f-yr" onchange="render()">
        <option value="26">2026</option>
        <option value="25">2025</option>
        <option value="both">Both</option>
      </select>
    </div>
    <div class="fb-div"></div>
    <div class="fb-g"><span class="fb-lbl">Month</span>
      <select class="fb-sel" id="f-mo" onchange="render()">
        <option value="0">All (YTD)</option>
        <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>
        <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>
        <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>
        <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
      </select>
    </div>
    <div class="fb-tags" id="f-tags"></div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- OVERVIEW -->
    <div class="page on" id="page-ov">
      <div class="krow" id="kpi-cards"></div>
      <div class="sec-t">Company Snapshot</div>
      <div class="crow" id="co-cards"></div>
      <div class="sec-t">Trends</div>
      <div class="g2">
        <div class="panel"><div class="ph"><span class="pt">Monthly Salary Trend (USD)</span><span class="pn" id="trend-note"></span></div><div class="cw h240"><canvas id="ch-trend"></canvas></div></div>
        <div class="panel"><div class="ph"><span class="pt">Division Cost Distribution</span><span class="pn">by HC share</span></div><div class="cw h240"><canvas id="ch-div"></canvas></div></div>
      </div>
    </div>

    <!-- DEPT -->
    <div class="page" id="page-dp">
      <div class="g31">
        <div class="panel"><div class="ph"><span class="pt">Department Detail</span><span class="pn" id="dp-note"></span></div><table id="tbl-dept"></table></div>
        <div class="panel"><div class="ph"><span class="pt">HC by Department</span></div><div class="cw h280"><canvas id="ch-hc-dept"></canvas></div></div>
      </div>
    </div>

    <!-- MONTHLY -->
    <div class="page" id="page-mo">
      <div class="panel"><div class="ph"><span class="pt">Monthly Salary — 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-mo-full"></canvas></div></div>
      <div class="panel"><div class="ph"><span class="pt">HC & Cost per Head — 2026</span></div>
        <table><tr><th>Month</th><th class="tr">HC</th><th class="tr">Salary</th><th class="tr">Cost/Head</th><th class="tr">MoM</th><th>Trend</th></tr><tbody id="mo-tbl"></tbody></table>
      </div>
    </div>

    <!-- COMPARE -->
    <div class="page" id="page-cc">
      <div class="krow" id="cc-kpis"></div>
      <div class="g2">
        <div class="panel"><div class="ph"><span class="pt">YTD Salary — 2026 vs 2025</span></div><div class="cw h240"><canvas id="ch-cc-ytd"></canvas></div></div>
        <div class="panel"><div class="ph"><span class="pt">Headcount Mix</span></div><div class="cw h240"><canvas id="ch-cc-hc"></canvas></div></div>
      </div>
      <div class="panel"><div class="ph"><span class="pt">Monthly Salary — All Companies 2026</span></div><div class="cw h220"><canvas id="ch-cc-mo"></canvas></div></div>
    </div>

  </div>
</div>

<script>
/* ═══ DATA ═══════════════════════════════════════════════════════ */
var D = {
  group:{sal:{y26:{ytd:361708,jan:68095,feb:68243,mar:58510,apr:50749,may:65362,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},y25:{ytd:970708,jan:103844,feb:99407,mar:81643,apr:102258,may:80269,jun:80913,jul:72477,aug:71503,sep:51850,oct:86720,nov:71960,dec:67864}},hc:{y26:{'LAB-IE':[4,4,4,4,4,0,4,0,0,0,0,0],'LAB-R&DE':[5,5,4,3,3,0,3,0,0,0,0,0],'LAB-Product':[1,1,1,1,1,0,1,0,0,0,0,0],'Curriculum CT':[1,0,0,0,0,0,0,0,0,0,0,0],'Curriculum PD':[12,11,12,10,10,0,10,0,0,0,0,0],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[3,3,3,3,3,0,3,0,0,0,0,0],'POPs':[4,4,4,3,3,0,3,0,0,0,0,0],'Other/Misc':[2,2,2,2,2,0,2,0,0,0,0,0],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[5,4,4,5,4,0,5,0,0,0,0,0],'MKT':[3,3,2,1,1,0,1,0,0,0,0,0],'AM':[3,1,3,3,2,0,3,0,0,0,0,0],'Help Desk/Support/CX':[3,3,3,3,3,0,3,0,0,0,0,0]},y25:{'LAB-IE':[7,7,6,6,4,4,3,3,3,3,3,4],'LAB-R&DE':[6,7,7,7,5,5,2,2,2,2,2,4],'LAB-Product':[3,3,3,3,3,2,3,2,1,0,0,1],'Curriculum CT':[2,2,1,1,1,1,1,1,1,1,1,1],'Curriculum PD':[15,18,18,18,16,16,14,13,13,13,12,12],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[3,3,3,3,3,3,3,3,3,3,3,3],'POPs':[4,5,4,5,4,4,4,4,4,4,4,4],'Other/Misc':[2,2,2,2,2,2,2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[3,3,3,2,2,2,1,1,1,1,1,2],'MKT':[3,3,3,3,3,3,2,2,2,2,2,2],'AM':[2,2,2,2,2,2,2,1,1,2,1,1],'Help Desk/Support/CX':[3,3,3,3,4,3,4,4,4,3,3,3]}}},
  vietco:{sal:{y26:{ytd:208592,jan:37039,feb:35365,mar:35457,apr:34312,may:32107,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},y25:{ytd:591316,jan:65396,feb:64512,mar:53054,apr:64146,may:49477,jun:46537,jul:40804,aug:41654,sep:40953,oct:40146,nov:36550,dec:48087}},hc:{y26:{'LAB-IE':[3,3,3,3,3,0,3,0,0,0,0,0],'LAB-R&DE':[2,2,2,2,2,0,2,0,0,0,0,0],'LAB-Product':[0,0,0,0,0,0,0,0,0,0,0,0],'Curriculum CT':[1,0,0,0,0,0,0,0,0,0,0,0],'Curriculum PD':[12,11,11,10,6,0,6,0,0,0,0,0],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[3,3,3,3,3,0,3,0,0,0,0,0],'POPs':[3,3,3,3,3,0,3,0,0,0,0,0],'Other/Misc':[2,2,2,2,2,0,2,0,0,0,0,0],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[2,2,2,2,1,0,1,0,0,0,0,0],'MKT':[2,2,1,1,1,0,1,0,0,0,0,0],'AM':[1,1,1,1,1,0,1,0,0,0,0,0],'Help Desk/Support/CX':[3,3,3,3,3,0,3,0,0,0,0,0]},y25:{'LAB-IE':[7,7,6,6,4,4,3,3,3,3,3,4],'LAB-R&DE':[6,7,7,7,5,5,2,2,2,2,2,4],'LAB-Product':[3,3,3,3,3,2,3,2,1,0,0,1],'Curriculum CT':[2,2,1,1,1,1,1,1,1,1,1,1],'Curriculum PD':[15,18,18,18,16,16,14,13,13,13,12,12],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[3,3,3,3,3,3,3,3,3,3,3,3],'POPs':[4,5,4,5,4,4,4,4,4,4,4,4],'Other/Misc':[2,2,2,2,2,2,2,2,2,2,2,2],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[3,3,3,2,2,2,1,1,1,1,1,2],'MKT':[3,3,3,3,3,3,2,2,2,2,2,2],'AM':[2,2,2,2,2,2,2,1,1,2,1,1],'Help Desk/Support/CX':[3,3,3,3,4,3,4,4,4,3,3,3]}}},
  singco:{sal:{y26:{ytd:136677,jan:31055,feb:32877,mar:23053,apr:16437,may:33255,jun:0,jul:0,aug:0,sep:0,oct:0,nov:0,dec:0},y25:{ytd:379402,jan:38449,feb:34895,mar:28590,apr:38112,may:30792,jun:34377,jul:31676,aug:29851,sep:10898,oct:46574,nov:35411,dec:19777}},hc:{y26:{'LAB-IE':[1,1,1,1,1,0,0,0,0,0,0,0],'LAB-R&DE':[3,3,2,1,1,0,0,0,0,0,0,0],'LAB-Product':[1,1,1,1,1,0,0,0,0,0,0,0],'Curriculum CT':[0,0,0,0,0,0,0,0,0,0,0,0],'Curriculum PD':[0,0,1,0,4,0,0,0,0,0,0,0],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[0,0,0,0,0,0,0,0,0,0,0,0],'POPs':[1,1,1,0,0,0,0,0,0,0,0,0],'Other/Misc':[1,0,1,1,1,0,0,0,0,0,0,0],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[3,2,2,3,3,0,0,0,0,0,0,0],'MKT':[1,1,1,0,0,0,0,0,0,0,0,0],'AM':[2,2,2,2,1,0,0,0,0,0,0,0],'Help Desk/Support/CX':[0,0,0,0,0,0,0,0,0,0,0,0]},y25:{'LAB-IE':[1,1,1,1,1,1,1,1,1,1,1,0],'LAB-R&DE':[2,2,2,2,4,5,4,4,4,4,4,1],'LAB-Product':[1,1,1,1,1,1,1,0,1,1,1,1],'Curriculum CT':[0,0,0,0,0,0,0,0,0,0,0,0],'Curriculum PD':[1,1,2,3,1,1,1,0,1,0,0,0],'Teacher-SG':[0,0,0,0,0,0,0,0,0,0,0,0],'FA':[0,0,0,0,0,0,0,0,0,0,0,0],'POPs':[0,0,0,0,0,0,0,0,0,0,0,0],'Other/Misc':[1,1,1,1,1,1,1,1,1,1,1,1],'LEGAL':[0,0,0,0,0,0,0,0,0,0,0,0],'SALES':[2,2,2,2,4,4,5,3,3,4,4,4],'MKT':[0,0,0,0,0,0,0,0,1,0,0,0],'AM':[1,1,0,1,1,1,1,1,1,1,1,2],'Help Desk/Support/CX':[0,0,0,0,0,0,0,0,0,0,0,0]}}},
};

var MK=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var ML=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DEPTS=[['LAB-IE','LAB','lab'],['LAB-R&DE','LAB','lab'],['LAB-Product','LAB','lab'],['Curriculum CT','Edu','edu'],['Curriculum PD','Edu','edu'],['Teacher-SG','Edu','edu'],['FA','Office','ofc'],['POPs','Office','ofc'],['Other/Misc','Office','ofc'],['LEGAL','Growth','gro'],['SALES','Growth','gro'],['MKT','Growth','gro'],['AM','CX','cx'],['Help Desk/Support/CX','CX','cx']];
var DIV_C={lab:'#1D4ED8',edu:'#0D9488',ofc:'#64748B',gro:'#15803D',cx:'#F97316'};
var CO_C={group:'#0F2744',vietco:'#0D9488',singco:'#F97316'};
var CO_N={group:'Group',vietco:'VietCo',singco:'SingCo'};
var CO_LOC={group:'Consolidated',vietco:'Vietnam',singco:'Singapore'};
var CHS={};var curPage='ov';

/* ── helpers ── */
function zp(n){return n<10?'0'+n:''+n;}
function fU(v){if(v>=1e6)return '$'+(v/1e6).toFixed(2)+'M';if(v>=1000)return '$'+(v/1000).toFixed(1)+'K';return '$'+Math.round(v).toLocaleString();}
function fUM(v){return '$'+(v/1000).toFixed(1)+'K';}
function toK(v){return+(v/1000).toFixed(2);}
function pct(a,b){if(!b)return null;return(a-b)/b*100;}
function chgHtml(a,b){var p=pct(a,b);if(p===null)return '<span class="chg nc">—</span>';var c=p>=0?'up':'dn',s=p>=0?'▲':'▼';return '<span class="chg '+c+'">'+s+' '+Math.abs(p).toFixed(1)+'%</span>';}
function getSal(co,yr,mo){if(yr==='both')return getSal(co,'26',mo)+getSal(co,'25',mo);var s=D[co]&&D[co].sal['y'+yr];if(!s)return 0;if(!mo)return s.ytd||0;return s[MK[mo-1]]||0;}
function lastIdx(co,yr){var h=D[co]&&D[co].hc['y'+yr];if(!h)return 4;for(var i=11;i>=0;i--){var t=DEPTS.reduce(function(s,d){var a=h[d[0]];return s+(a?a[i]||0:0);},0);if(t>0)return i;}return 0;}
function getHC(co,yr,mo){var _y=yr==='both'?'26':yr;var h=D[co]&&D[co].hc['y'+_y];if(!h)return 0;var idx=mo?mo-1:lastIdx(co,_y);return DEPTS.reduce(function(t,d){var a=h[d[0]];return t+(a?a[idx]||0:0);},0);}
function getDHC(co,yr,mo,dept){var _y=yr==='both'?'26':yr;var h=D[co]&&D[co].hc['y'+_y];if(!h||!h[dept])return 0;var idx=mo?mo-1:lastIdx(co,_y);return h[dept][idx]||0;}

function mkCh(id,type,data,opts){
  if(CHS[id])CHS[id].destroy();
  var el=document.getElementById(id);if(!el)return;
  var leg={display:true,position:'bottom',labels:{font:{size:10,family:'Plus Jakarta Sans'},boxWidth:10,padding:10,color:'#64748B'}};
  var cfg={type:type,data:data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:leg}}};
  if(opts)for(var k in opts)cfg.options[k]=opts[k];
  CHS[id]=new Chart(el,cfg);
}
var AX={scales:{x:{grid:{display:false},ticks:{font:{size:10,family:'Plus Jakarta Sans'},color:'#94A3B8'}},y:{grid:{color:'#F1F5F9'},ticks:{callback:function(v){return '$'+v+'K';},font:{family:'JetBrains Mono',size:10},color:'#94A3B8'}}}};

function showToast(msg,ok){var t=document.getElementById('toast');t.textContent=(ok?'✓ ':'⚠ ')+msg;t.style.background=ok?'#059669':'#DC2626';t.classList.add('show');setTimeout(function(){t.classList.remove('show');},3500);}

function goPage(p){
  curPage=p;
  document.querySelectorAll('.page').forEach(function(e){e.classList.remove('on');});
  document.querySelectorAll('.nav').forEach(function(e){e.classList.remove('on');});
  document.getElementById('page-'+p).classList.add('on');
  document.getElementById('nav-'+p).classList.add('on');
  var T={ov:'Overview',dp:'Department Detail',mo:'Monthly Trend',cc:'Company Compare'};
  document.getElementById('tb-page').textContent=T[p];
  render();
}

function render(){
  var co=document.getElementById('f-co').value;
  var yr=document.getElementById('f-yr').value;
  var mo=parseInt(document.getElementById('f-mo').value,10)||0;
  var moL=mo?ML[mo-1]:'YTD';
  var yrL=yr==='26'?'2026':yr==='25'?'2025':'2026 & 2025';
  document.getElementById('sb-period').textContent=yrL+' · '+moL;
  document.getElementById('f-tags').innerHTML='<span class="ftag">'+CO_N[co]+'</span>';
  try{
    if(curPage==='ov')renderOv(co,yr,mo,moL);
    if(curPage==='dp')renderDp(co,yr,mo);
    if(curPage==='mo')renderMo(co,yr);
    if(curPage==='cc')renderCc(yr,mo);
  }catch(e){console.error('render',e);}
}

/* ── KPI card builder ── */
function kCard(lbl,val,sub,chgA,chgB,ico,grad){
  grad=grad||'linear-gradient(90deg,#0EA5E9,#14B8A6)';
  return '<div class="kc"><div class="kc-accent" style="background:'+grad+'"></div><div class="kc-body">'
    +'<div class="kc-top"><span class="kc-lbl">'+lbl+'</span><div class="kc-ico" style="background:'+ico.bg+'">'+ico.e+'</div></div>'
    +'<div class="kc-val">'+val+'</div>'
    +'<div class="kc-meta"><span class="kc-sub">'+sub+'</span>'+chgHtml(chgA,chgB)+'</div>'
    +'</div></div>';
}

/* ── OVERVIEW ── */
function renderOv(co,yr,mo,moL){
  var sal=getSal(co,yr,mo);
  var salP=mo?getSal(co,yr,mo>1?mo-1:0):getSal(co,yr==='26'?'25':'26',0);
  var hc=getHC(co,yr,mo),hcP=mo?getHC(co,yr,mo>1?mo-1:0):0;
  var cph=hc?Math.round(sal/hc):0;
  var ytd=getSal(co,yr,0),ytdP=getSal(co,yr==='26'?'25':'26',0);

  document.getElementById('kpi-cards').innerHTML=
    kCard('Salary ('+moL+')',fU(sal),fU(sal),sal,salP,{bg:'#EFF6FF',e:'💰'},'linear-gradient(90deg,#0EA5E9,#38BDF8)')
   +kCard('Headcount',hc,'people',hc,hcP,{bg:'#F0FDF4',e:'👥'},'linear-gradient(90deg,#0D9488,#14B8A6)')
   +kCard('Cost / Head',fU(cph),fUM(cph)+'/head',0,0,{bg:'#FFF7ED',e:'📊'},'linear-gradient(90deg,#F97316,#FB923C)')
   +kCard('YTD Total',fU(ytd),'prior: '+fU(ytdP),ytd,ytdP,{bg:'#EFF6FF',e:'📅'},'linear-gradient(90deg,#6366F1,#8B5CF6)');

  /* company cards */
  var cos=['group','vietco','singco'],ch='';
  for(var i=0;i<cos.length;i++){
    var c=cos[i],cs=getSal(c,yr,mo),chc=getHC(c,yr,mo),cph2=chc?Math.round(cs/chc):0;
    var rat=sal?(cs/sal*100).toFixed(0)+'%':'—';
    ch+='<div class="coc"><div class="coc-h"><div class="coc-av" style="background:'+CO_C[c]+'">'+CO_N[c].substring(0,3).toUpperCase()+'</div>';
    ch+='<div><div class="coc-n">'+CO_N[c]+'</div><div class="coc-s">'+CO_LOC[c]+'</div></div></div>';
    ch+='<div class="coc-stats">';
    ch+='<div class="cs"><div class="cs-l">HC</div><div class="cs-v a">'+chc+'</div></div>';
    ch+='<div class="cs"><div class="cs-l">Salary</div><div class="cs-v">'+fU(cs)+'</div></div>';
    ch+='<div class="cs"><div class="cs-l">Cost/Head</div><div class="cs-v">'+fU(cph2)+'</div></div>';
    ch+='<div class="cs"><div class="cs-l">Ratio</div><div class="cs-v">'+rat+'</div></div></div></div>';
  }
  document.getElementById('co-cards').innerHTML=ch;

  /* trend chart */
  var _y=yr==='both'?'26':yr,_yp='25';
  var s1=MK.map(function(k){var s=D[co].sal['y'+_y];return s?toK(s[k]||0):0;});
  var s2=MK.map(function(k){var s=D[co].sal['y'+_yp];return s?toK(s[k]||0):0;});
  document.getElementById('trend-note').textContent=(_y==='26'?'2026 vs 2025':'2025 vs 2024');
  mkCh('ch-trend','bar',{labels:ML,datasets:[
    {label:(_y==='26'?'2026':'2025'),data:s1,backgroundColor:'#0EA5E9',borderRadius:4,barPercentage:.55},
    {label:'2025',data:s2,backgroundColor:'#E2E8F0',borderRadius:4,barPercentage:.55}
  ]},AX);

  /* donut */
  var dg={lab:['LAB-IE','LAB-R&DE','LAB-Product'],edu:['Curriculum CT','Curriculum PD','Teacher-SG'],ofc:['FA','POPs','Other/Misc'],gro:['LEGAL','SALES','MKT'],cx:['AM','Help Desk/Support/CX']};
  var _hy=yr==='both'?'26':yr,ha=D[co].hc['y'+_hy],htot=getHC(co,yr,mo),lidx=lastIdx(co,_hy);
  var dlbls=[],dvals=[],dcols=[],dnames=['LAB','Eduservice','Office','Growth','CX'],dkeys=['lab','edu','ofc','gro','cx'],dclr=['#1D4ED8','#0D9488','#64748B','#15803D','#F97316'];
  for(var di=0;di<dkeys.length;di++){
    var dhc=ha?dg[dkeys[di]].reduce(function(s,k){var a=ha[k];return s+(a?a[lidx]||0:0);},0):0;
    var dsal=htot?sal*(dhc/htot):0;
    if(dsal>0){dlbls.push(dnames[di]);dvals.push(toK(dsal));dcols.push(dclr[di]);}
  }
  if(!dvals.length){dvals=[1];dlbls=['No data'];dcols=['#E2E8F0'];}
  mkCh('ch-div','doughnut',{labels:dlbls,datasets:[{data:dvals,backgroundColor:dcols,borderWidth:3,borderColor:'#fff',hoverBorderColor:'#fff'}]});
}

/* ── DEPT ── */
function renderDp(co,yr,mo){
  var pm=mo?mo-1:0,sc=getSal(co,yr,mo),sp=pm?getSal(co,yr,pm):0;
  var ht=getHC(co,yr,mo),hpt=getHC(co,yr,pm);
  var cl=mo?ML[mo-1]:'YTD',pl=pm?ML[pm-1]:'-';
  document.getElementById('dp-note').textContent=cl+' · '+CO_N[co];
  var rows='',bL=[],bH=[],bC=[],maxH=0,lastD='',tH=0,tE=0,tEP=0;
  for(var j=0;j<DEPTS.length;j++){var hj=getDHC(co,yr,mo,DEPTS[j][0]);if(hj>maxH)maxH=hj;}
  for(var i=0;i<DEPTS.length;i++){
    var dp=DEPTS[i][0],dv=DEPTS[i][1],dc=DEPTS[i][2];
    var hc=getDHC(co,yr,mo,dp);if(!hc)continue;
    var hcp=getDHC(co,yr,pm,dp);
    var es=ht?sc*(hc/ht):0,esp=hpt?sp*(hcp/hpt):0;
    var ps=sc?(es/sc*100).toFixed(1):'0',bw=maxH?(hc/maxH*100).toFixed(0):0;
    var dvH=dv!==lastD?'<span class="dp dp-'+dc+'">'+dv+'</span>':'';lastD=dv;
    rows+='<tr><td>'+dvH+'</td><td class="bold">'+dp+'</td>';
    rows+='<td class="tr bold" style="color:#0EA5E9">'+hc+'</td>';
    rows+='<td class="tr dim">'+fU(esp)+'</td><td class="tr bold">'+fU(es)+'</td>';
    rows+='<td class="tr">'+chgHtml(es,esp)+'</td>';
    rows+='<td class="tr dim">'+ps+'%</td>';
    rows+='<td><div class="mbar"><div class="mtrack"><div class="mfill" style="width:'+bw+'%"></div></div></div></td></tr>';
    bL.push(dp);bH.push(hc);bC.push(DIV_C[dc]);tH+=hc;tE+=es;tEP+=esp;
  }
  var tr='<tr style="border-top:2px solid #E2E8F0;background:#F8FAFC"><td></td><td class="bold">TOTAL</td>';
  tr+='<td class="tr bold" style="color:#0F2744">'+tH+'</td><td class="tr dim">'+fU(tEP)+'</td>';
  tr+='<td class="tr bold" style="color:#0F2744">'+fU(tE)+'</td>';
  tr+='<td class="tr">'+chgHtml(tE,tEP)+'</td><td class="tr bold dim">100%</td>';
  tr+='<td><div class="mbar"><div class="mtrack"><div class="mfill" style="width:100%;background:linear-gradient(90deg,#0EA5E9,#0D9488)"></div></div></div></td></tr>';
  document.getElementById('tbl-dept').innerHTML='<tr><th>Div</th><th>Dept</th><th class="tr">HC</th><th class="tr">'+pl+'</th><th class="tr">'+cl+'</th><th class="tr">Chg</th><th class="tr">%</th><th>Bar</th></tr>'+rows+tr;
  mkCh('ch-hc-dept','bar',{labels:bL,datasets:[{data:bH,backgroundColor:bC,borderRadius:5,barPercentage:.65}]},{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{grid:{color:'#F1F5F9'},ticks:{font:{size:10},color:'#94A3B8'}},y:{grid:{display:false},ticks:{font:{size:10},color:'#475569'}}}});
}

/* ── MONTHLY ── */
function renderMo(co,yr){
  var _y=yr==='both'?'26':yr;
  var s26=MK.map(function(k){var s=D[co].sal['y'+_y];return s?toK(s[k]||0):0;});
  var s25=MK.map(function(k){var s=D[co].sal.y25;return s?toK(s[k]||0):0;});
  mkCh('ch-mo-full','bar',{labels:ML,datasets:[
    {label:(_y==='26'?'2026':'2025'),data:s26,backgroundColor:'#0EA5E9',borderRadius:4,barPercentage:.5},
    {label:'2025',data:s25,backgroundColor:'#E2E8F0',borderRadius:4,barPercentage:.5}
  ]},AX);
  var tbl='';
  for(var i=0;i<12;i++){
    var sv=D[co].sal['y'+_y]?D[co].sal['y'+_y][MK[i]]||0:0;if(!sv)continue;
    var hc=getHC(co,yr,i+1),cph=hc?Math.round(sv/hc):0,prev=i?D[co].sal['y'+_y][MK[i-1]]||0:0;
    var bw=s26[0]?(s26[i]/s26[0]*100).toFixed(0):0;
    tbl+='<tr><td class="bold">'+ML[i]+'</td>';
    tbl+='<td class="tr bold" style="color:#0EA5E9">'+hc+'</td>';
    tbl+='<td class="tr">'+fU(sv)+'</td><td class="tr">'+fUM(cph)+'</td>';
    tbl+='<td class="tr">'+chgHtml(sv,prev)+'</td>';
    tbl+='<td><div class="mbar"><div class="mtrack"><div class="mfill" style="width:'+bw+'%"></div></div></div></td></tr>';
  }
  document.getElementById('mo-tbl').innerHTML=tbl;
}

/* ── COMPARE ── */
function renderCc(yr,mo){
  var cos=['group','vietco','singco'];
  var ytds=cos.map(function(c){return getSal(c,yr,0);});
  var ytdsP=cos.map(function(c){return getSal(c,yr==='26'?'25':'26',0);});
  var hcs=cos.map(function(c){return getHC(c,yr,mo);});
  var sals=cos.map(function(c){return getSal(c,yr,mo);});
  var grads=['linear-gradient(90deg,#0EA5E9,#38BDF8)','linear-gradient(90deg,#0D9488,#14B8A6)','linear-gradient(90deg,#F97316,#FB923C)'];
  var icos=[{bg:'#EFF6FF',e:'🏢'},{bg:'#F0FDF4',e:'🏢'},{bg:'#FFF7ED',e:'🏢'}];
  var kh='';
  for(var i=0;i<cos.length;i++){
    var cph=hcs[i]?Math.round(sals[i]/hcs[i]):0;
    kh+=kCard(CO_N[cos[i]],fU(ytds[i]),'HC:'+hcs[i]+' · '+fUM(cph)+'/head',ytds[i],ytdsP[i],icos[i],grads[i]);
  }
  document.getElementById('cc-kpis').innerHTML=kh;
  mkCh('ch-cc-ytd','bar',{labels:cos.map(function(c){return CO_N[c];}),datasets:[
    {label:'YTD 2026',data:ytds.map(toK),backgroundColor:['#0EA5E9','#0D9488','#F97316'],borderRadius:6,barPercentage:.5},
    {label:'YTD 2025',data:ytdsP.map(toK),backgroundColor:['#0EA5E930','#0D948830','#F9731630'],borderRadius:6,barPercentage:.5}
  ]},AX);
  mkCh('ch-cc-hc','doughnut',{labels:cos.map(function(c){return CO_N[c]+' ('+getHC(c,yr,mo)+')';}),datasets:[{data:hcs,backgroundColor:['#0EA5E9','#0D9488','#F97316'],borderWidth:3,borderColor:'#fff'}]});
  var _y=yr==='both'?'26':yr;
  var lclr=['#0EA5E9','#0D9488','#F97316'];
  var ds=cos.map(function(c,ci){return{label:CO_N[c],data:MK.map(function(k){var s=D[c].sal['y'+_y];return s?toK(s[k]||0):0;}),borderColor:lclr[ci],backgroundColor:lclr[ci]+'18',fill:true,borderWidth:2,pointRadius:3,pointBackgroundColor:lclr[ci],tension:.4};});
  mkCh('ch-cc-mo','line',{labels:ML,datasets:ds},AX);
}

/* ── REFRESH ── */
function doRefresh(){
  var btn=document.getElementById('btn-ref'),badge=document.getElementById('tb-live');
  btn.disabled=true;btn.classList.add('loading');
  badge.textContent='Refreshing…';badge.className='pill pill-warn';
  setTimeout(function(){
    btn.disabled=false;btn.classList.remove('loading');
    badge.textContent='Static data';badge.className='pill pill-static';
    showToast('Data được nhúng trong file. Cập nhật thủ công khi cần.',false);
  },1200);
}

/* ── INIT ── */
window.onload=function(){
  try{
    var n=new Date();
    document.getElementById('tb-ts').textContent=zp(n.getDate())+'/'+zp(n.getMonth()+1)+'/'+n.getFullYear();
    document.getElementById('ld').style.display='none';
    render();
  }catch(e){
    console.error(e);
    document.getElementById('ld').style.display='none';
  }
};
</script>
</body>
</html>
