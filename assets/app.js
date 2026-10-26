/* =========================================================================
   运营数据看板 · app.js
   纯原生 JS：数组 → 模板字符串 → innerHTML 渲染，无框架、无依赖
   ========================================================================= */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     0. 工具
     ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);

  const nf = new Intl.NumberFormat('zh-CN');
  const fmtInt = (n) => nf.format(Math.round(n));
  const fmtMoney = (n) => '¥' + nf.format(Math.round(n));
  const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(Math.round(n)));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const jitter = (v, amp = 0.06) => v * (1 + (Math.random() * 2 - 1) * amp);
  const deepCopy = (o) => JSON.parse(JSON.stringify(o));

  /* ------------------------------------------------------------------
     1. 图标（内联 SVG + currentColor，尺寸由属性明确给定）
     ------------------------------------------------------------------ */
  const ICON_PATHS = {
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.86"/><path d="M16.5 3.2a4 4 0 0 1 0 7.6"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8.5v5.5"/><path d="M22 11.2h-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    wallet: '<path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2.5"/><path d="M3 8v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5.5a2 2 0 0 0-2-2H5"/><circle cx="17" cy="14.2" r="1.2"/>',
    search: '<circle cx="11" cy="11" r="6.6"/><path d="m19.6 19.6-3.4-3.4"/>',
    social: '<circle cx="18" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="18.5" r="2.8"/><path d="m8.6 10.7 6.8-3.7M8.6 13.3l6.8 3.7"/>',
    apps: '<rect x="4" y="4" width="6.4" height="6.4" rx="1.6"/><rect x="13.6" y="4" width="6.4" height="6.4" rx="1.6"/><rect x="4" y="13.6" width="6.4" height="6.4" rx="1.6"/><rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.6"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.6 7.4 8.4 5.4 8.4-5.4"/>',
    link: '<path d="M10.5 13.5a4.6 4.6 0 0 0 6.5 0l2.6-2.6a4.6 4.6 0 0 0-6.5-6.5l-1 1"/><path d="M13.5 10.5a4.6 4.6 0 0 0-6.5 0l-2.6 2.6a4.6 4.6 0 0 0 6.5 6.5l1-1"/>',
    globe: '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2"/><path d="M12 3.2c2.4 2.6 2.4 15 0 17.6"/><path d="M12 3.2c-2.4 2.6-2.4 15 0 17.6"/>',
    up: '<path d="M3 8.5 8 3.5l4 4 6-6"/><path d="M14 1.5h4v4"/>',
    down: '<path d="M3 3.5l5 5 4-4 6 6"/><path d="M14 10.5h4v-4"/>',
  };

  /** 生成内联 SVG 图标（固定 width/height，颜色取 currentColor） */
  function icon(name, size = 18) {
    const path = ICON_PATHS[name] || '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  /* ------------------------------------------------------------------
     2. 数据源（唯一的真相：所有卡片、图表都由这些数组渲染）
     ------------------------------------------------------------------ */
  const SEED = {
    kpis: [
      { id: 'active', label: '今日活跃用户', value: 18420, format: 'int', unit: '', delta: 6.4, icon: 'users', spark: [42, 47, 44, 53, 58, 55, 63, 71] },
      { id: 'signup', label: '新增注册', value: 1286, format: 'int', unit: '', delta: 2.1, icon: 'user-plus', spark: [26, 24, 30, 27, 33, 31, 36, 38] },
      { id: 'cr', label: '支付转化率', value: 4.72, format: 'percent', unit: '%', delta: -0.8, icon: 'target', spark: [52, 50, 54, 49, 47, 50, 46, 45] },
      { id: 'gmv', label: '今日营收', value: 126840, format: 'money', unit: '', delta: 9.3, icon: 'wallet', spark: [30, 34, 33, 43, 41, 52, 57, 66] },
    ],
    days: [
      { label: '周日', value: 11240 },
      { label: '周一', value: 12980 },
      { label: '周二', value: 12460 },
      { label: '周三', value: 14720 },
      { label: '周四', value: 13950 },
      { label: '周五', value: 16830 },
      { label: '今天', value: 18420 },
    ],
    channels: [
      { name: '自然搜索', note: 'SEO / 品牌词', icon: 'search', visits: 48210, conv: 2310, trend: [40, 44, 42, 48, 52, 51, 58] },
      { name: '社交推荐', note: '微信 / 微博 / 小红书', icon: 'social', visits: 36140, conv: 1688, trend: [52, 49, 55, 58, 54, 61, 66] },
      { name: '应用商店', note: 'iOS / Android', icon: 'apps', visits: 24860, conv: 1042, trend: [30, 33, 31, 36, 34, 39, 41] },
      { name: '邮件营销', note: 'EDM 投放', icon: 'mail', visits: 14280, conv: 512, trend: [22, 26, 24, 21, 25, 23, 27] },
      { name: '联盟推广', note: 'CPS 合作方', icon: 'link', visits: 9630, conv: 386, trend: [18, 20, 17, 22, 19, 24, 21] },
      { name: '直接访问', note: '收藏 / 直接输入', icon: 'globe', visits: 7150, conv: 268, trend: [14, 15, 17, 16, 18, 17, 19] },
    ],
  };

  let state = deepCopy(SEED);

  /* ------------------------------------------------------------------
     3. 渲染：迷你折线（KPI / 渠道行共用）
     ------------------------------------------------------------------ */
  function sparkline(values, { w = 160, h = 44, pad = 5, cls = 'kpi__spark' } = {}) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;

    const pts = values.map((v, i) => [
      pad + i * step,
      h - pad - ((v - min) / span) * (h - pad * 2),
    ]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const area = `${line} L${(w - pad).toFixed(1)} ${h} L${pad} ${h} Z`;
    const last = pts[pts.length - 1];

    return `<svg class="${cls}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"
      aria-hidden="true" focusable="false">
      <path d="${area}" fill="currentColor" opacity=".12"/>
      <path d="${line}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.6" fill="currentColor"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------
     4. 渲染：核心指标卡
     ------------------------------------------------------------------ */
  function kpiValue(item) {
    if (item.format === 'percent') return item.value.toFixed(2);
    if (item.format === 'money') return fmtMoney(item.value);
    return fmtInt(item.value);
  }

  function renderKpis() {
    const html = state.kpis.map((k) => {
      const up = k.delta >= 0;
      return `<article class="card kpi">
        <div class="kpi__top">
          <span class="kpi__icon" aria-hidden="true">${icon(k.icon, 18)}</span>
          <span class="delta ${up ? 'delta--up' : 'delta--down'}" title="环比上一周期">
            ${icon(up ? 'up' : 'down', 10)}${up ? '+' : ''}${k.delta.toFixed(1)}%
          </span>
        </div>
        <p class="kpi__label">${k.label}</p>
        <p class="kpi__value num">${kpiValue(k)}${k.unit ? `<span class="kpi__unit">${k.unit}</span>` : ''}</p>
        ${sparkline(k.spark)}
      </article>`;
    }).join('');

    $('#kpiGrid').innerHTML = html;
  }

  /* ------------------------------------------------------------------
     5. 渲染：7 日柱状图
     ------------------------------------------------------------------ */
  function renderTrend() {
    const values = state.days.map((d) => d.value);
    const max = Math.max(...values);
    const base = Math.min(...values) * 0.82;   // 压低基线，让差异更可读

    const bars = state.days.map((d) => {
      const ratio = (d.value - base) / (max - base || 1);
      const height = clamp(ratio * 100, 6, 100).toFixed(1);
      const isPeak = d.value === max;
      return `<div class="bar-col${isPeak ? ' bar-col--peak' : ''}" title="${d.label}：${fmtInt(d.value)} 人">
        <span class="bar-col__fill" style="--h:${height}%" data-val="${compact(d.value)}"></span>
      </div>`;
    }).join('');

    const labels = state.days.map((d) => `<span>${d.label}</span>`).join('');

    const chart = $('#trendChart');
    chart.innerHTML = `<div class="chart__plot">${bars}</div><div class="chart__labels">${labels}</div>`;
    chart.setAttribute(
      'aria-label',
      `近 7 日活跃用户：${state.days.map((d) => `${d.label} ${fmtInt(d.value)} 人`).join('，')}`
    );
  }

  /* ------------------------------------------------------------------
     6. 渲染：渠道占比环形图 + 图例
     ------------------------------------------------------------------ */
  function renderShare() {
    const total = state.channels.reduce((sum, c) => sum + c.visits, 0);
    let acc = 0;

    const stops = state.channels.map((c, i) => {
      const from = acc;
      acc += (c.visits / total) * 100;
      return `var(--c${(i % 6) + 1}) ${from.toFixed(2)}% ${acc.toFixed(2)}%`;
    });

    $('#donut').style.background = `conic-gradient(${stops.join(',')})`;
    $('#donutTotal').textContent = compact(total);

    $('#legend').innerHTML = state.channels.map((c, i) => {
      const pct = ((c.visits / total) * 100).toFixed(1);
      return `<li>
        <span class="legend__dot" style="background: var(--c${(i % 6) + 1})" aria-hidden="true"></span>
        <span class="legend__name">${c.name}</span>
        <span class="legend__val num">${pct}%</span>
      </li>`;
    }).join('');
  }

  /* ------------------------------------------------------------------
     7. 渲染：渠道明细（6 条数据 → 6 行，无重复 HTML）
     ------------------------------------------------------------------ */
  function renderChannels() {
    const maxRate = Math.max(...state.channels.map((c) => (c.conv / c.visits) * 100));

    $('#channelList').innerHTML = state.channels.map((c) => {
      const rate = (c.conv / c.visits) * 100;
      const barWidth = clamp((rate / maxRate) * 100, 4, 100).toFixed(1);

      return `<li class="channel">
        <div class="channel__id">
          <span class="channel__icon" aria-hidden="true">${icon(c.icon, 17)}</span>
          <span class="channel__name">
            <strong>${c.name}</strong>
            <small>${c.note}</small>
          </span>
        </div>
        <div class="channel__meta">
          <span class="stat"><i>访问</i><b class="num">${fmtInt(c.visits)}</b></span>
          <span class="stat"><i>转化</i><b class="num">${fmtInt(c.conv)}</b></span>
        </div>
        <div class="channel__rate">
          <b class="num">${rate.toFixed(2)}%</b>
          <span class="rate-bar" aria-hidden="true"><i style="--v:${barWidth}%"></i></span>
        </div>
        ${sparkline(c.trend, { w: 104, h: 30, pad: 4, cls: 'channel__spark' })}
      </li>`;
    }).join('');

    $('#channelCount').textContent = `共 ${state.channels.length} 个渠道`;
  }

  /* ------------------------------------------------------------------
     8. 主题切换（CSS 变量 + localStorage 记忆）
     ------------------------------------------------------------------ */
  const THEME_KEY = 'dashboard.theme';
  const themeBtn = $('#themeBtn');
  const themeBtnText = $('#themeBtnText');
  const root = document.documentElement;

  function setTheme(theme, persist = true) {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    themeBtn.setAttribute('aria-pressed', String(isDark));
    themeBtnText.textContent = isDark ? '切换浅色模式' : '切换深色模式';
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 隐私模式忽略 */ }
    }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* noop */ }

    // 支持 ?theme=dark 直接指定（便于截图 / 分享固定主题）
    const forced = new URLSearchParams(location.search).get('theme');
    if (forced === 'dark' || forced === 'light') { setTheme(forced, false); return; }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'), false);
  }

  /* ------------------------------------------------------------------
     9. 更新时间 & 刷新
     ------------------------------------------------------------------ */
  const timeFmt = new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  });

  function stampTime() {
    const now = new Date();
    const el = $('#updatedAt');
    el.textContent = timeFmt.format(now);
    el.dateTime = now.toISOString();
  }

  function renderAll() {
    renderKpis();
    renderTrend();
    renderShare();
    renderChannels();
    stampTime();
  }

  /** 模拟一次数据刷新，用来验证「等宽数字不抖动」 */
  function refreshData() {
    state.kpis = state.kpis.map((k) => {
      const next = jitter(k.value, 0.05);
      return {
        ...k,
        value: k.format === 'percent' ? Math.round(next * 100) / 100 : Math.round(next),
        delta: (Math.random() * 10 - 2.5),
        spark: k.spark.map((v) => jitter(v, 0.08)),
      };
    });

    state.days = state.days.map((d) => ({ ...d, value: Math.round(jitter(d.value, 0.05)) }));

    state.channels = state.channels.map((c) => {
      const visits = Math.round(jitter(c.visits, 0.05));
      return {
        ...c,
        visits,
        conv: Math.round(visits * (c.conv / c.visits) * (0.94 + Math.random() * 0.12)),
        trend: c.trend.map((v) => jitter(v, 0.1)),
      };
    });

    renderAll();
  }

  /* ------------------------------------------------------------------
     10. 交互绑定
     ------------------------------------------------------------------ */
  themeBtn.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  $('#refreshBtn').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.classList.add('is-busy');
    btn.disabled = true;
    refreshData();
    window.setTimeout(() => {
      btn.classList.remove('is-busy');
      btn.disabled = false;
    }, 600);
  });

  // 移动/平板模块切换
  const chips = Array.from(document.querySelectorAll('.chip'));
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
    });
  });

  /* ------------------------------------------------------------------
     11. 启动
     ------------------------------------------------------------------ */
  initTheme();
  renderAll();
})();
