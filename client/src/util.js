export function getClientXY(event) {
  let x = 0, y = 0;

  if (event.clientX) {
    x = event.clientX;
    y = event.clientY;
  }

  if (event.touches && event.touches.length === 1) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  }

  return [x, y];
}

export function isInRect(rect, x, y) {
  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}
