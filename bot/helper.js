export const getPrice = (selections) => {
  const items = Object.entries(selections || {});
  const totalQuantity = items.reduce((total, [sticker, qty]) => total + qty, 0);
  if (totalQuantity <= 2) {
    return totalQuantity * 2;
  } else if (totalQuantity <= 3) {
    return totalQuantity * 1.8;
  } else if (totalQuantity <= 5) {
    return totalQuantity * 1.6;
  } else {
    return totalQuantity * 1.5;
  }
}