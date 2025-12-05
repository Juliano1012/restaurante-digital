function showSection(id) {
    document.querySelectorAll('.screen').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  
  const cart = [];
  
  function addItem(name, price) {
    const item = cart.find(i => i.name === name);
    if (item) {
      item.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    renderCart();
  }
  
  function renderCart() {
    const list = document.getElementById('cart-list');
    list.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.textContent = `${item.name} - R$ ${item.price} x ${item.qty}`;
      list.appendChild(div);
    });
    document.getElementById('cart-total').textContent = `R$ ${total}`;
  }
  