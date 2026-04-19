export const getPrice = (selections) => {
  const items = Object.entries(selections || {});
  const totalQuantity = items.reduce((total, [sticker, qty]) => total + qty, 0);
  if (totalQuantity <= 2) {
    return totalQuantity * 2;
  } else if (totalQuantity <= 5) {
    return totalQuantity * 1.8;
  } else if (totalQuantity <= 8) {
    return totalQuantity * 1.6;
  } else {
    return totalQuantity * 1.5;
  }
}

export const addOrderSummary = (selections, text) => {
  const items = Object.entries(selections || {});
  const totalPrice = getPrice(selections);
  if (items.length === 0) return text;
  const orderSummary = items
    .map(([sticker, qty]) => `- ${sticker}: ${qty} stickers`)
    .join("\n");

  return `Order Summary:\n${orderSummary}\n\nTotal Price: $${totalPrice.toFixed(2)}\n\n${text}`;
};

export const formatGrid = (gridRow, gridCol, options, packKey) => {
  const grid = [];
  for (let i = 0; i < gridRow; i++) {
    const row = [];
    for (let j = 0; j < gridCol; j++) {
      const option = options[i * gridCol + j];
      if (option) {
        row.push({
          text: option.name,
          callback_data: `select_${option.id}|${packKey}`,
        });
      }
    }
    grid.push(row);
  }
  return grid;
};