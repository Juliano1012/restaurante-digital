// Navigation between sections
const showSection = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  };
  document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  
  // Cart state
  const cart = [];
  
  // Format price BRL
  const brl = (value) => `R$ ${value.toFixed(0)}`;
  
  // Add item
  const addItem = (name, price) => {
    const idx = cart.findIndex(i => i.name === name);
    if (idx >= 0) cart[idx].qty += 1;
    else cart.push({ name, price: Number(price), qty: 1 });
    renderCart();
  };
  
  // Render cart
  const renderCart = () => {
    const list = document.getElementById('cart-list');
    list.innerHTML = '';
    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>${brl(item.price)}</p>
        </div>
        <div class="cart-controls">
          <button class="cart-btn" data-action="dec" data-index="${i}">-</button>
          <span>${item.qty}</span>
          <button class="cart-btn" data-action="inc" data-index="${i}">+</button>
          <button class="cart-btn" data-action="del" data-index="${i}">x</button>
        </div>
      `;
      list.appendChild(row);
    });
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById('cart-total').textContent = brl(total);
  };
  
  // Cart controls
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
  
  // Add buttons (cards)
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addItem(btn.dataset.item, Number(btn.dataset.price)));
  });
  
  // View detail buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  
  // Banana detail quantity and add
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
    for (let k = 0; k < bananaQty; k++) addItem('Banana', 19);
    showSection('cart');
  });
  
  // Initialize cart view
  renderCart();
  