
// ===================== Navegação =====================
const showSection = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
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
  s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
    // Re-render do QR para ajustar cores do tema
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
document.getElementById('banana-add').addEventListener('click', () => {
  const note = (document.getElementById('banana-note')?.value || '').trim();
  addItem('Banana', 19, note, bananaQty);
  showSection('cart');
});
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

// ===================== QR Bonitinho (Não Funcional) =====================
function renderPrettyFakeQR() {
  const svg = document.getElementById('qr-svg');
  if (!svg) return;

  // Limpa anterior
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  // Tamanho e grid
  const size = 260;                // px visuais
  const modules = 29;              // grade 29x29 (parecido com QR real, só que falso)
  const quiet = 4;                 // margem (quiet zone)
  const moduleSize = (size - quiet * 2) / modules;

  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Cores do tema
  const root = getComputedStyle(document.documentElement);
  const bg = root.getPropertyValue('--card').trim() || '#fff';
  const fg = root.getPropertyValue('--text').trim() || '#111';
  const accent = root.getPropertyValue('--primary').trim() || '#b86b45';

  // Fundo arredondado com moldura em gradiente
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'qrGrad');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '1');
  grad.setAttribute('y2', '1');
  const stop1 = document.createElementNS(grad.namespaceURI, 'stop');
  stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', accent);
  const stop2 = document.createElementNS(grad.namespaceURI, 'stop');
  stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', fg);
  grad.appendChild(stop1); grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const frame = document.createElementNS(svg.namespaceURI, 'rect');
  frame.setAttribute('x', '0'); frame.setAttribute('y', '0');
  frame.setAttribute('width', size); frame.setAttribute('height', size);
  frame.setAttribute('rx', '18'); frame.setAttribute('ry', '18');
  frame.setAttribute('fill', bg);
  frame.setAttribute('stroke', 'url(#qrGrad)');
  frame.setAttribute('stroke-width', '6');
  svg.appendChild(frame);

  // Grupo para o mosaico
  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('transform', `translate(${quiet}, ${quiet})`);
  svg.appendChild(g);

  // Áreas reservadas dos "finder patterns" (cantos)
  const isInFinder = (r, c) => {
    const inTL = r < 7 && c < 7;
    const inTR = r < 7 && c >= modules - 7;
    const inBL = r >= modules - 7 && c < 7;
    return inTL || inTR || inBL;
  };

  // Desenha mosaico pseudo-aleatório (não legível)
  // Dica: centralizamos um "logo" depois, garantindo não leitura
  const seed = Math.floor(Math.random() * 99999);
  const rng = (n) => {
    // LCG simples
    let x = (n + seed) % 2147483647;
    x = (x * 48271) % 2147483647;
    return x / 2147483647;
  };

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (isInFinder(r, c)) continue; // pulamos cantos

      // Deixamos uma zona central "logo" vazia (9x9)
      const inCenter = (r >= 10 && r <= 18 && c >= 10 && c <= 18);
      if (inCenter) continue;

      // Padrão pseudo-randômico, mas com blocos mais densos nas bordas
      const proximityEdge = Math.min(r, c, modules-1-r, modules-1-c);
      const bias = proximityEdge < 5 ? 0.75 : 0.45; // mais preenchido perto da borda
      const value = rng(r * modules + c);
      const on = value < bias ? 1 : 0;

      if (on) {
        const rect = document.createElementNS(svg.namespaceURI, 'rect');
        rect.setAttribute('x', c * moduleSize);
        rect.setAttribute('y', r * moduleSize);
        rect.setAttribute('width', moduleSize);
        rect.setAttribute('height', moduleSize);
        rect.setAttribute('rx', moduleSize * 0.2);
        rect.setAttribute('ry', moduleSize * 0.2);
        rect.setAttribute('fill', fg);
        g.appendChild(rect);
      }
    }
  }

  // Desenha "finder patterns" estilizados
  const drawFinder = (x, y) => {
    const group = document.createElementNS(svg.namespaceURI, 'g');
    group.setAttribute('transform', `translate(${x * moduleSize}, ${y * moduleSize})`);
    const layers = [
      { s: 7, color: fg, radius: 4 },
      { s: 5, color: bg, radius: 4 },
      { s: 3, color: fg, radius: 3 },
    ];
    layers.forEach(l => {
      const rect = document.createElementNS(svg.namespaceURI, 'rect');
      rect.setAttribute('x', 0);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', l.s * moduleSize);
      rect.setAttribute('height', l.s * moduleSize);
      rect.setAttribute('rx', l.radius);
      rect.setAttribute('ry', l.radius);
      rect.setAttribute('fill', l.color);
      group.appendChild(rect);
    });
    g.appendChild(group);
  };
  drawFinder(0, 0);               // topo-esquerda
  drawFinder(modules - 7, 0);      // topo-direita
  drawFinder(0, modules - 7);      // baixo-esquerda

  // Pequenos "alignment dots" decorativos
  const dots = [
    { r: 8, c: modules - 9 },
    { r: modules - 9, c: modules - 9 },
    { r: modules - 9, c: 8 },
  ];
  dots.forEach(d => {
    const cx = (d.c + 0.5) * moduleSize;
    const cy = (d.r + 0.5) * moduleSize;
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', moduleSize * 0.9);
    circle.setAttribute('fill', accent);
    g.appendChild(circle);
  });

  // Logo central (o elemento HTML .qr-logo por cima também cobre)
  const center = document.createElementNS(svg.namespaceURI, 'rect');
  center.setAttribute('x', (10 * moduleSize));
  center.setAttribute('y', (10 * moduleSize));
  center.setAttribute('width', 9 * moduleSize);
  center.setAttribute('height', 9 * moduleSize);
  center.setAttribute('rx', 12);
  center.setAttribute('ry', 12);
  center.setAttribute('fill', bg);
  center.setAttribute('stroke', accent);
  center.setAttribute('stroke-width', '2');
  g.appendChild(center);
}

// Chama ao carregar
document.addEventListener('DOMContentLoaded', () => {
  renderPrettyFakeQR();
});

// ===================== Inicialização comum =====================
renderCart();
renderPedidos();
renderKitchen();
updateTableUI();
updateETAs();
