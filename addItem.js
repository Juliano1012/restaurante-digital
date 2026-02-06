// ===================== Carrinho =====================
const addItem = (name, basePrice, note = '', qty = 1, extras = []) => {
  const unitPrice = Number(basePrice) + (extras?.reduce((s, x) => s + (x.price || 0), 0) || 0);
  const extrasKey = (extras || []).map(e => `${e.name}:${e.price}`).sort().join('|');

  const idx = cart.findIndex(i => i.name === name &&
    (i.note));
};
