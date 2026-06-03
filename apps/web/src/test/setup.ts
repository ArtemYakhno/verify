import "@testing-library/jest-dom";

Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
  value: () => false,
});

Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
  value: () => {},
});

Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
  value: () => {},
});
