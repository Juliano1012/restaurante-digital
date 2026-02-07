// ===================== Navegação =====================
const showSection = (id) => {
    const target = document.getElementById(id);
    if (!target) {
      console.warn('[showSection] seção não encontrada:', id);
      return; // evita apagar a tela atual quando o id está incorreto
    }
    document.querySelectorAll('.screen.active').forEach(s => s.classList.remove('active'));
    target.classList.add('active');
  };
  document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  
  // ===================== Estado =====================
  const cart = [];         // { name, price, qty, note }
  const orders = [];       // { numero, mesa, tempoMin, createdAt, eta, itens[] }
  let nextOrderNumber = 1026;
  let currentTable = Number(localStorage.getItem('currentTable')) || null;
  
  // ===================== Utils =====================
  const brl = (value) => `R$ ${value.toFixed(0)}`;
  const sanitize = (s = '') =>
    s.replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const two = (n) => String(n).padStart(2, '0');
  const formatClock = (date) => `${two(date.getHours())}:${two(date.getMinutes())}`;
  const formatRemaining = (ms) => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${two(s)}`;
  };
  
  // ===================== Tema (Claro/Escuro) =====================
  (function setupTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
  
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
  
    function applyTheme(mode) {
      root.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      if (btn) btn.textContent = mode === 'dark' ? '☀️' : '🌙';
      // Re-render do QR para ajustar cores/contraste no tema atual
      renderPrettyFakeQR();
    }
  
    applyTheme(initial);
    if (btn) btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  })();
  
  // Atualiza UI da mesa
  function updateTableUI() {
    const headerEl = document.getElementById('header-table');
    if (headerEl) headerEl.textContent = currentTable ?? '--';
    const inputEl = document.getElementById('table-input');
    if (inputEl && (inputEl !== document.activeElement)) {
      inputEl.value = currentTable ?? '';
    }
  }
  
  // ===================== Carrinho =====================
  const addItem = (name, price, note = '', qty = 1) => {
    const idx = cart.findIndex(i => i.name === name && (i.note || '') === (note || ''));
    if (idx >= 0) cart[idx].qty += Number(qty) || 1;
    else cart.push({ name, price: Number(price), qty: Number(qty) || 1, note: note || '' });
    renderCart();
  };
  
  const renderCart = () => {
    const list = document.getElementById('cart-list');
    list.innerHTML = '';
    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-info">
          <h4>${sanitize(item.name)}</h4>
          <p>${brl(item.price)}</p>
        </div>
        <div class="cart-controls">
          <button class="cart-btn" data-action="dec" data-index="${i}">-</button>
          <span>${item.qty}</span>
          <button class="cart-btn" data-action="inc" data-index="${i}">+</button>
          <button class="cart-btn" data-action="del" data-index="${i}">x</button>
        </div>
        <div class="cart-note">
          <textarea class="note-edit" data-index="${i}" placeholder="Observações (ex.: sem cebola, extra frio)">${item.note || ''}</textarea>
        </div>
      `;
      list.appendChild(row);
    });
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('cart-total').textContent = brl(total);
  };
  
  document.getElementById('cart-list').addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-btn');
    if (!btn) return;
    const i = Number(btn.dataset.index);
    const act = btn.dataset.action;
    if (act === 'inc') cart[i].qty += 1;
    if (act === 'dec') cart[i].qty = Math.max(1, cart[i].qty - 1);
    if (act === 'del') cart.splice(i, 1);
    renderCart();
  });
  document.getElementById('cart-list').addEventListener('input', (e) => {
    const ta = e.target.closest('.note-edit');
    if (!ta) return;
    const i = Number(ta.dataset.index);
    cart[i].note = ta.value;
  });
  
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addItem(btn.dataset.item, Number(btn.dataset.price)));
  });
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  
  // Detalhes
  let bananaQty = 1;
  const bananaQtyEl = document.getElementById('banana-qty');
  document.querySelectorAll('#banana-detail .qty-btn').forEach(b => {
    b.addEventListener('click', () => {
      const act = b.dataset.action;
      bananaQty = act === 'inc' ? bananaQty + 1 : Math.max(1, bananaQty - 1);
      bananaQtyEl.textContent = bananaQty;
    });
  });
  const bananaAddBtn = document.getElementById('banana-add');
  if (bananaAddBtn) {
    bananaAddBtn.addEventListener('click', () => {
      const note = (document.getElementById('banana-note')?.value || '').trim();
      addItem('Banana', 19, note, bananaQty);
      showSection('cart');
    });
  }
  function addMultiple(name, price, qtyId, noteId) {
    const qty = parseInt(document.getElementById(qtyId).textContent);
    const note = (noteId && document.getElementById(noteId))
      ? document.getElementById(noteId).value.trim()
      : '';
    addItem(name, price, note, qty);
    showSection('cart');
  }
  document.querySelectorAll('.qty-btn').forEach(btn => {
    if (!btn.dataset.target) return;
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const span = document.getElementById(target);
      let value = parseInt(span.textContent);
      value = btn.dataset.action === 'inc' ? value + 1 : Math.max(1, value - 1);
      span.textContent = value;
    });
  });
  
  // ===================== Mesa =====================
  const tableInput = document.getElementById('table-input');
  if (tableInput) {
    updateTableUI();
    tableInput.addEventListener('input', () => {
      const val = tableInput.value.trim();
      const num = Number(val);
      if (Number.isInteger(num) && num >= Number(tableInput.min || 1) && num <= Number(tableInput.max || 50)) {
        currentTable = num;
        localStorage.setItem('currentTable', String(currentTable));
        updateTableUI();
        tableInput.classList.remove('table-error');
      } else {
        tableInput.classList.add('table-error');
      }
    });
  }
  
  // ===================== Pedidos / Cozinha (ETA) =====================
  function registrarPedido() {
    if (cart.length === 0) return;
    const num = Number(tableInput?.value ?? currentTable);
    if (!Number.isInteger(num) || num < 1 || num > 50) {
      showSection('cart');
      if (tableInput) {
        tableInput.classList.add('table-error');
        tableInput.focus();
      }
      alert('Informe um número de mesa válido (1 a 50) antes de pagar.');
      return;
    }
    currentTable = num;
    localStorage.setItem('currentTable', String(currentTable));
    updateTableUI();
  
    const tempoMin = Math.floor(Math.random() * 15) + 5; // 5..20
    const numero = nextOrderNumber++;
    const createdAt = Date.now();
    const eta = createdAt + tempoMin * 60_000;
  
    const itens = cart.map(item => ({ name: item.name, qty: item.qty, note: (item.note || '').trim() }));
    orders.push({ numero, mesa: currentTable, tempoMin, createdAt, eta, itens });
  
    cart.length = 0;
    renderCart();
    renderPedidos();
    renderKitchen();
    updateETAs();
  }
  
  function renderPedidos() {
    const container = document.querySelector('#orders .orders');
    if (!container) return;
    container.innerHTML = '';
    const lista = [...orders].sort((a, b) => a.createdAt - b.createdAt);
    lista.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'order-card';
      const descricao = p.itens.map(it => `${it.qty}x ${it.name}${it.note ? ` — ${it.note}` : ''}`).join(', ');
      const prontoAs = formatClock(new Date(p.eta));
      card.innerHTML = `
        <h3>Pedido #${p.numero}</h3>
        <p><strong>Mesa:</strong> ${p.mesa}</p>
        <p>${sanitize(descricao)}</p>
        <div class="eta-line">
          <span class="eta-badge">Estimado: <strong>${p.tempoMin} min</strong></span>
          <span class="eta-remaining" data-created="${p.createdAt}" data-total="${p.tempoMin * 60_000}">--:--</span>
          <span class="eta-time" data-eta="${p.eta}">Pronto às ${prontoAs}</span>
        </div>
        <div class="eta-progress">
          <div class="bar" data-created="${p.createdAt}" data-total="${p.tempoMin * 60_000}" style="width:0%"></div>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  function renderKitchen() {
    const container = document.getElementById('kitchen-queue');
    if (!container) return;
    container.innerHTML = '';
    const fila = [...orders].sort((a, b) => a.createdAt - b.createdAt);
    fila.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'order-card';
      const hora = new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const itensLista = p.itens.map(it => {
        const obs = it.note ? ` <em>(Obs.: ${sanitize(it.note)})</em>` : '';
        return `<li>${sanitize(String(it.qty))}x ${sanitize(it.name)}${obs}</li>`;
      }).join('');
      const prontoAs = formatClock(new Date(p.eta));
      card.innerHTML = `
        <h3>Pedido #${p.numero}</h3>
        <p><strong>Mesa:</strong> ${p.mesa}</p>
        <p><strong>Chegada:</strong> ${hora}</p>
        <ul>${itensLista}</ul>
        <div class="eta-line">
          <span class="eta-badge">Estimado: <strong>${p.tempoMin} min</strong></span>
          <span class="eta-remaining" data-created="${p.createdAt}" data-total="${p.tempoMin * 60_000}">--:--</span>
          <span class="eta-time" data-eta="${p.eta}">Pronto às ${prontoAs}</span>
        </div>
        <div class="eta-progress">
          <div class="bar" data-created="${p.createdAt}" data-total="${p.tempoMin * 60_000}" style="width:0%"></div>
        </div>
      `;
      container.appendChild(card);
    });
    const countEl = document.getElementById('kitchen-count');
    if (countEl) countEl.textContent = fila.length;
    updateETAs();
  }
  
  function updateETAs() {
    const now = Date.now();
    document.querySelectorAll('.eta-remaining').forEach(el => {
      const created = Number(el.dataset.created);
      const total = Number(el.dataset.total);
      const remaining = Math.max(0, created + total - now);
      if (remaining > 0) {
        el.textContent = `Faltam ${formatRemaining(remaining)}`;
        el.classList.remove('eta-done', 'eta-late');
      } else {
        const late = now - (created + total);
        if (late > 0) {
          el.textContent = `Atrasado +${formatRemaining(late)}`;
          el.classList.add('eta-late');
          el.classList.remove('eta-done');
        } else {
          el.textContent = 'Pronto';
          el.classList.add('eta-done');
          el.classList.remove('eta-late');
        }
      }
    });
    document.querySelectorAll('.eta-time').forEach(el => {
      const eta = Number(el.dataset.eta);
      el.textContent = `Pronto às ${formatClock(new Date(eta))}`;
    });
    document.querySelectorAll('.eta-progress .bar').forEach(bar => {
      const created = Number(bar.dataset.created);
      const total = Number(bar.dataset.total);
      const elapsed = Math.max(0, now - created);
      const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
      bar.style.width = `${pct}%`;
    });
  }
  setInterval(updateETAs, 1000);
  
  // Pagamento
  const payBtn = document.querySelector('#cart .primary-btn[data-section="pix"]');
  if (payBtn) payBtn.addEventListener('click', registrarPedido);
  
  // ===================== QR Bonitinho (visual de QR real / NÃO FUNCIONAL) =====================
  function renderPrettyFakeQR() {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
  
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  
    // QR v3-like: 29x29 módulos
    const modules = 29;
    const modulePx = 8;               // módulo = 8px no SVG (nítido)
    const quietModules = 4;           // quiet zone de 4 módulos (padrão)
    const quiet = quietModules * modulePx;
    const inner = modules * modulePx;
    const size = inner + quiet * 2;
  
    // Cores
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--primary').trim() || '#b86b45';
    const paper = '#ffffff';
    const ink = '#111111';
  
    // ViewBox e preserveAspect
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
    // ---------- Defs: gradiente para a moldura externa ----------
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS(defs.namespaceURI, 'linearGradient');
    grad.setAttribute('id', 'qrGrad');
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
  
    const stop1 = document.createElementNS(defs.namespaceURI, 'stop');
    stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', accent);
    const stop2 = document.createElementNS(defs.namespaceURI, 'stop');
    stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', ink);
  
    grad.appendChild(stop1); grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);
  
    // ---------- Moldura externa arredondada ----------
    const frame = document.createElementNS(svg.namespaceURI, 'rect');
    frame.setAttribute('x', '0');
    frame.setAttribute('y', '0');
    frame.setAttribute('width', size);
    frame.setAttribute('height', size);
    frame.setAttribute('rx', '18');
    frame.setAttribute('ry', '18');
    frame.setAttribute('fill', paper);
    frame.setAttribute('stroke', 'url(#qrGrad)');
    frame.setAttribute('stroke-width', '6');
    svg.appendChild(frame);
  
    // Grupo interno (quiet zone)
    const g = document.createElementNS(svg.namespaceURI, 'g');
    g.setAttribute('transform', `translate(${quiet}, ${quiet})`);
    svg.appendChild(g);
  
    // Matriz de reserva (para não sobrescrever padrões fixos)
    const reserved = Array.from({ length: modules }, () => Array(modules).fill(false));
    const reserveRect = (r0, c0, h, w) => {
      for (let r = r0; r < r0 + h; r++) {
        for (let c = c0; c < c0 + w; c++) {
          if (r >= 0 && c >= 0 && r < modules && c < modules) reserved[r][c] = true;
        }
      }
    };
  
    // Helper para desenhar um módulo
    const drawModule = (r, c, color = ink) => {
      if (r < 0 || c < 0 || r >= modules || c >= modules) return;
      const rect = document.createElementNS(svg.namespaceURI, 'rect');
      rect.setAttribute('x', c * modulePx);
      rect.setAttribute('y', r * modulePx);
      rect.setAttribute('width', modulePx);
      rect.setAttribute('height', modulePx);
      rect.setAttribute('fill', color);
      g.appendChild(rect);
    };
  
    // ---------- Finder patterns reais (3 cantos) + separador branco ----------
    const drawFinder = (topR, leftC) => {
      // reserva 7x7 do finder + 1px separador ao redor
      reserveRect(topR - 1, leftC - 1, 9, 9);
  
      // 7x7 preto
      for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) drawModule(topR + r, leftC + c, ink);
      // 5x5 branco
      for (let r = 1; r < 6; r++) for (let c = 1; c < 6; c++) drawModule(topR + r, leftC + c, paper);
      // 3x3 preto
      for (let r = 2; r < 5; r++) for (let c = 2; c < 5; c++) drawModule(topR + r, leftC + c, ink);
  
      // separador (1 módulo branco) contornando
      for (let i = -1; i <= 7; i++) {
        drawModule(topR - 1, leftC + i, paper);
        drawModule(topR + 7, leftC + i, paper);
        drawModule(topR + i, leftC - 1, paper);
        drawModule(topR + i, leftC + 7, paper);
      }
    };
    drawFinder(0, 0);
    drawFinder(0, modules - 7);
    drawFinder(modules - 7, 0);
  
    // ---------- Timing pattern (linha 6 e coluna 6) ----------
    for (let i = 8; i <= modules - 9; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      drawModule(6, i, (i % 2 === 0) ? ink : paper);
      drawModule(i, 6, (i % 2 === 0) ? ink : paper);
    }
  
    // ---------- Alignment pattern (v3 geralmente em 22,22) ----------
    const drawAlignment = (cr, cc) => {
      reserveRect(cr - 2, cc - 2, 5, 5);
      for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) drawModule(cr + r, cc + c, ink);
      for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) drawModule(cr + r, cc + c, paper);
      drawModule(cr, cc, ink);
    };
    drawAlignment(22, 22);
  
    // ---------- Centro reservado para o logo (9x9) ----------
    const centerStart = 10, centerEnd = 18; // inclusive (9 módulos)
    reserveRect(centerStart, centerStart, centerEnd - centerStart + 1, centerEnd - centerStart + 1);
  
    // ---------- RNG determinístico (para não “piscar” a cada render) ----------
    const tableSeed = Number(localStorage.getItem('currentTable') || 1);
    const totalSeed = cart.reduce((s, x) => s + (x.price * x.qty), 0);
    let seed = (tableSeed * 1103515245 + totalSeed * 12345 + 987654) >>> 0;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  
    // ---------- Dados “fake” com cara de QR (densidade ~50% + máscaras leves) ----------
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (reserved[r][c]) continue;
  
        const maskAdj =
          ((r + c) % 2 === 0 ? 0.06 : -0.04) +
          (r % 2 === 0 ? 0.02 : -0.02) +
          (c % 3 === 0 ? 0.01 : 0);
  
        const prob = 0.48 + maskAdj; // ~0.43..0.57
        if (rand() < prob) drawModule(r, c, ink);
        else drawModule(r, c, paper);
      }
    }
  
    // ---------- Poucas “sabotagens” em accent (não bloqueiam visual) ----------
    const sabotages = [
      { r: 8, c: 13 }, { r: 13, c: 8 }, { r: 13, c: 20 }, { r: 20, c: 13 }
    ];
    sabotages.forEach(p => drawModule(p.r, p.c, accent));
  
    // ---------- Janela central (borda em accent) ----------
    const centerRect = document.createElementNS(svg.namespaceURI, 'rect');
    centerRect.setAttribute('x', centerStart * modulePx);
    centerRect.setAttribute('y', centerStart * modulePx);
    centerRect.setAttribute('width', (centerEnd - centerStart + 1) * modulePx);
    centerRect.setAttribute('height', (centerEnd - centerStart + 1) * modulePx);
    centerRect.setAttribute('rx', '12');
    centerRect.setAttribute('ry', '12');
    centerRect.setAttribute('fill', paper);
    centerRect.setAttribute('stroke', accent);
    centerRect.setAttribute('stroke-width', '2');
    g.appendChild(centerRect);
  
    // ---------- Borda interna fina (accent) contornando toda a matriz ----------
    const innerBorder = document.createElementNS(svg.namespaceURI, 'rect');
    innerBorder.setAttribute('x', -modulePx * 0.5);
    innerBorder.setAttribute('y', -modulePx * 0.5);
    innerBorder.setAttribute('width', inner + modulePx);
    innerBorder.setAttribute('height', inner + modulePx);
    innerBorder.setAttribute('rx', '10');
    innerBorder.setAttribute('ry', '10');
    innerBorder.setAttribute('fill', 'none');
    innerBorder.setAttribute('stroke', accent);
    innerBorder.setAttribute('stroke-width', '3');
    innerBorder.setAttribute('stroke-linejoin', 'round');
    g.insertBefore(innerBorder, g.firstChild);
  }
  
  // ===================== Inicialização =====================
  renderCart();
  renderPedidos();
  renderKitchen();
  updateTableUI();
  updateETAs();
  renderPrettyFakeQR();