(() => {
  const rail = document.querySelector('.rail');
  if (!rail) return;
  if (!rail.querySelector('.rail-term')) {
    rail.innerHTML = '<div class="rail-term">'
      + '<div class="rw">'
      + '<div class="rw-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="rw-title">~ $ gpu</span></div>'
      + '<div class="rw-body"><canvas></canvas><iframe class="rw-frame" title="bricks 2D 刚体演示"></iframe></div>'
      + '</div>'
      + '<div class="cli">'
      + '<div class="cli-bar">rail shell</div>'
      + '<div class="cli-out"></div>'
      + '<div class="cli-in"><span class="ps1">$</span><input type="text" spellcheck="false" autocomplete="off" aria-label="命令输入"></div>'
      + '</div>'
      + '</div>';
    rail.removeAttribute('aria-hidden');
  }
  const root = rail.querySelector('.rail-term');
  if (!root) return;

  const body = root.querySelector('.rw-body');
  const canvas = body.querySelector('canvas');
  const frame = body.querySelector('.rw-frame');
  const ctx = canvas.getContext('2d');
  const out = root.querySelector('.cli-out');
  const input = root.querySelector('.cli-in input');
  const title = root.querySelector('.rw-title');

  const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  let raf = 0;
  let painter = null;
  let stillPainter = null;
  let stat = null;

  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  };

  const halt = () => {
    painter = null;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  };

  const unframe = () => body.classList.remove('framed');

  const loop = t => {
    if (!painter) { raf = 0; return; }
    painter(ctx, t / 1000, canvas.clientWidth, canvas.clientHeight);
    raf = requestAnimationFrame(loop);
  };

  const animate = fn => {
    unframe();
    painter = fn;
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const still = fn => {
    halt();
    unframe();
    stillPainter = fn;
    if (fit()) fn(ctx, 0, canvas.clientWidth, canvas.clientHeight);
  };

  const print = (text, cls) => {
    const el = document.createElement('div');
    el.className = 'cli-line' + (cls ? ' ' + cls : '');
    el.textContent = text;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
  };

  const normalize = m => {
    let max = 0;
    m.V.forEach(v => {
      const d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      if (d > max) max = d;
    });
    if (max > 0) m.V = m.V.map(v => [v[0] / max, v[1] / max, v[2] / max]);
    return m;
  };

  const boxE = (V, E, cx, cy, cz, sx, sy, sz) => {
    const o = V.length;
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    for (let i = 0; i < 8; i++) {
      V.push([cx + ((i & 1) ? hx : -hx), cy + ((i & 2) ? hy : -hy), cz + ((i & 4) ? hz : -hz)]);
    }
    [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
      .forEach(([a, b]) => E.push([o + a, o + b]));
  };

  const ringE = (V, E, cx, cy, cz, r, seg, thin) => {
    const o = V.length;
    const ir = r * (thin || 0.42);
    for (let i = 0; i < seg; i++) {
      const a = i / seg * Math.PI * 2;
      V.push([cx + r * Math.cos(a), cy + r * Math.sin(a), cz]);
      V.push([cx + ir * Math.cos(a), cy + ir * Math.sin(a), cz]);
    }
    for (let i = 0; i < seg; i++) {
      const n = (i + 1) % seg;
      E.push([o + i * 2, o + n * 2]);
      E.push([o + i * 2 + 1, o + n * 2 + 1]);
      E.push([o + i * 2, o + i * 2 + 1]);
    }
  };

  const gpuMesh = () => {
    const V = [], E = [];
    boxE(V, E, 0, 0, 0, 1.7, 0.79, 0.24);
    boxE(V, E, -0.93, 0.05, 0, 0.06, 1.0, 0.3);
    boxE(V, E, 0.26, -0.42, 0, 0.86, 0.06, 0.2);
    ringE(V, E, -0.44, 0.02, 0.125, 0.24, 12);
    ringE(V, E, 0.34, 0.02, 0.125, 0.24, 12);
    return { V, E };
  };

  const padMesh = () => {
    const V = [], E = [];
    boxE(V, E, 0, 0, 0, 3.24, 1.44, 0.56);
    boxE(V, E, -1.05, 0.04, 0.38, 0.78, 0.26, 0.14);
    boxE(V, E, -1.05, 0.04, 0.38, 0.26, 0.78, 0.14);
    ringE(V, E, 1.15, 0.14, 0.38, 0.19, 10, 0.5);
    ringE(V, E, 1.15, -0.3, 0.38, 0.19, 10, 0.5);
    boxE(V, E, -0.22, -0.52, 0.37, 0.34, 0.14, 0.12);
    boxE(V, E, 0.22, -0.52, 0.37, 0.34, 0.14, 0.12);
    return { V, E };
  };

  const MESHES = {
    gpu: { desc: '显卡 · PCB + 挡板 + 双风扇', mesh: normalize(gpuMesh()), tilt: 0.34, sx: 0.5 },
    pad: { desc: 'NES 手柄 · 十字键 + A/B + Select/Start', mesh: normalize(padMesh()), tilt: 0.34, sx: 0.44 }
  };

  const hex2rgb = s => {
    const v = (s || '#1e40af').trim().replace('#', '');
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };

  const renderMesh = spec => (c, t, w, h) => {
    c.clearRect(0, 0, w, h);
    if (!w || !h) return;
    const S = Math.min(w / 2, h / 2) / 1.45;
    const ax = t * spec.sx;
    const ay = spec.tilt;
    const ca = Math.cos(ax), sa = Math.sin(ax);
    const cb = Math.cos(ay), sb = Math.sin(ay);
    const pts = spec.mesh.V.map(([x, y, z]) => {
      const x1 = x * cb - z * sb;
      const z1 = x * sb + z * cb;
      const y1 = y * ca - z1 * sa;
      const z2 = y * sa + z1 * ca;
      const p = 1 / (1 + z2 * 0.18);
      return [w / 2 + x1 * S * p, h / 2 + y1 * S * p, z2];
    });
    const near = hex2rgb(cssVar('--scard'));
    const far = hex2rgb(cssVar('--h1'));
    const F = spec.mesh.F, EF = spec.mesh.EF;
    const front = F ? F.map(f => {
      const a = pts[f[0]], b = pts[f[1]], d = pts[f[2]];
      return (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
    }) : null;
    const order = spec.mesh.E.map((e, i) => i).sort((x, y) => {
      const ex = spec.mesh.E[x], ey = spec.mesh.E[y];
      return (pts[ey[0]][2] + pts[ey[1]][2]) - (pts[ex[0]][2] + pts[ex[1]][2]);
    });
    c.lineCap = 'round';
    order.forEach(i => {
      const a = spec.mesh.E[i][0], b = spec.mesh.E[i][1];
      if (front && EF) {
        const ef = EF[i];
        const v1 = ef[0] >= 0 && front[ef[0]] > 0;
        const v2 = ef[1] >= 0 && front[ef[1]] > 0;
        if (!v1 && !v2) return;
      }
      const dz = (pts[a][2] + pts[b][2]) / 2;
      const d = Math.max(0, Math.min(1, (dz + 1.2) / 2.4));
      const mix = k => Math.round(near[k] + (far[k] - near[k]) * d);
      c.strokeStyle = 'rgb(' + mix(0) + ',' + mix(1) + ',' + mix(2) + ')';
      c.lineWidth = 1.9 - d * 1.2;
      c.globalAlpha = 0.95 - d * 0.45;
      c.beginPath();
      c.moveTo(pts[a][0], pts[a][1]);
      c.lineTo(pts[b][0], pts[b][1]);
      c.stroke();
    });
    c.globalAlpha = 1;
  };

  const barColor = v => v >= 1000 ? '#1e40af' : v >= 500 ? '#4d6fc4' : v >= 200 ? '#8fabdd' : v > 0 ? '#c7d6f2' : '#e8edf7';

  const drawHeat = (c, t, w, h) => {
    c.clearRect(0, 0, w, h);
    if (!stat || !w || !h) return;
    const days = stat.weeks.flat().filter(Boolean).slice(-42);
    const max = Math.max(1, ...days.map(d => d.c));
    const bw = w / days.length;
    days.forEach((d, i) => {
      const bh = (d.c / max) * (h - 26);
      c.fillStyle = barColor(d.c);
      c.fillRect(i * bw + 1, h - 20 - bh, Math.max(bw - 2, 1), Math.max(bh, 1));
    });
    c.strokeStyle = cssVar('--line') || '#dbe3f0';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, h - 19.5); c.lineTo(w, h - 19.5); c.stroke();
    c.fillStyle = cssVar('--dim') || '#64748b';
    c.font = '10px monospace';
    c.fillText('近 42 天峰值 ' + max + ' 字/天', 4, 11);
  };

  const shape = name => {
    const spec = MESHES[name];
    title.textContent = '~ $ ' + name;
    animate(renderMesh(spec));
    return ['[ok] ' + name + ' loaded (' + spec.mesh.V.length + 'v / ' + spec.mesh.E.length + 'e)'];
  };

  const CMDS = {
    help:    { desc: '列出命令',            run: () => ['[info] available commands:'].concat(Object.keys(CMDS).map(k => '       ' + k.padEnd(9) + CMDS[k].desc)) },
    clear:   { desc: '清空输出',            run: () => { out.innerHTML = ''; return []; } },
    gpu:     { desc: '显卡 3D',             run: () => shape('gpu') },
    pad:     { desc: 'NES 手柄 3D',         run: () => shape('pad') },
    bricks:  { desc: '2D 刚体堆叠（手写）', run: () => {
      halt();
      unframe();
      frame.src = '/games/bricks/index.html?t=' + Date.now();
      body.classList.add('framed');
      title.textContent = '~ $ bricks';
      return ['[ok] bricks loaded (re-seeded, own 2D rigid body engine)'];
    } },
    heat:    { desc: '打字量柱状图',        run: async () => {
      if (!stat) {
        try { stat = await (await fetch('/typing.json')).json(); }
        catch (e) { return ['[err] typing data unavailable']; }
      }
      title.textContent = '~ $ heat';
      still(drawHeat);
      return ['[ok] typing data loaded (' + stat.total + ' chars @ ' + stat.generated + ')'];
    } },
    theme:   { desc: '切换主色 <hex>',      run: a => {
      const v = (a[0] || '').trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(v)) return ['[err] usage: theme #1e40af'];
      document.documentElement.style.setProperty('--scard', v);
      document.documentElement.style.setProperty('--link', v);
      return ['[ok] accent color set to ' + v];
    } },
    goto:    { desc: '跳到区块 <锚点>',     run: a => {
      const el = document.getElementById(a[0] || '');
      if (!el) return ['[err] no such section: ' + (a[0] || '(empty)')];
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return ['[ok] scrolled to #' + a[0]];
    } },
    whoami:  { desc: '我是谁',              run: () => ['[info] blureraser @ Southeast University', '[info] algorithms / modeling / graphics / games'] },
    date:    { desc: '当前时间',            run: () => ['[info] ' + new Date().toLocaleString('zh-CN')] },
    echo:    { desc: '回显文字',            run: a => [a.join(' ')] }
  };

  const exec = async line => {
    const text = String(line).trim();
    print('$ ' + text, 'hl');
    if (!text) return;
    const parts = text.split(/\s+/);
    const cmd = CMDS[parts[0]];
    if (!cmd) { print('[err] unknown command: ' + parts[0] + ' — try `help`', 'err'); return; }
    const lines = await cmd.run(parts.slice(1));
    (lines || []).forEach(l => print(l));
  };

  const cmdHistory = [];
  let hIdx = 0;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = input.value;
      input.value = '';
      if (v.trim()) cmdHistory.push(v.trim());
      hIdx = cmdHistory.length;
      exec(v);
    } else if (e.key === 'ArrowUp') {
      if (!cmdHistory.length) return;
      hIdx = Math.max(0, hIdx - 1);
      input.value = cmdHistory[hIdx] || '';
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (!cmdHistory.length) return;
      hIdx = Math.min(cmdHistory.length, hIdx + 1);
      input.value = cmdHistory[hIdx] || '';
      e.preventDefault();
    }
  });

  const DEFAULT_SHAPE = 'gpu';

  const boot = () => {
    if (!fit()) { requestAnimationFrame(boot); return; }
    const spec = MESHES[DEFAULT_SHAPE];
    stillPainter = renderMesh(spec);
    title.textContent = '~ $ ' + DEFAULT_SHAPE;
    animate(stillPainter);
  };

  requestAnimationFrame(boot);

  const redraw = () => {
    if (body.classList.contains('framed')) return;
    if (!fit()) return;
    if (painter) painter(ctx, performance.now() / 1000, canvas.clientWidth, canvas.clientHeight);
    else if (stillPainter) stillPainter(ctx, 0, canvas.clientWidth, canvas.clientHeight);
  };

  window.addEventListener('resize', redraw);

  // 局部导航：换页只替换 <main>，左栏与右栏终端保持不重载
  const partial = async (url, push) => {
    let doc;
    try {
      const res = await fetch(url.href);
      if (!res.ok) throw new Error(res.status);
      doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch { location.href = url.href; return; }
    const cur = document.querySelector('main');
    const next = doc.querySelector('main');
    if (!cur || !next) { location.href = url.href; return; }
    cur.replaceWith(next);
    document.title = doc.title;
    document.documentElement.classList.remove('intro', 'noscroll', 'exit', 'reveal', 'launch');
    if (push) history.pushState({}, '', url.href);
    const anchor = url.hash ? document.getElementById(url.hash.slice(1)) : null;
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('rail:partial'));
  };

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    partial(url, true);
  });

  window.addEventListener('popstate', () => partial(new URL(location.href), false));

  print('blureraser :: rail shell ready', 'dim');
  print('[info] type `help` for available commands', 'dim');

  if (new URLSearchParams(location.search).has('demo')) {
    const seq = ['help', 'gpu', 'pad', 'bricks', 'heat'];
    let i = 0;
    const next = () => {
      if (i >= seq.length) return;
      exec(seq[i++]).then(() => setTimeout(next, 2800));
    };
    setTimeout(next, 800);
  }
})();
