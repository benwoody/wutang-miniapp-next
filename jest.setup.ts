import '@testing-library/jest-dom';

// Mock canvas context for tests
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillStyle: '',
    fillRect: () => {},
    drawImage: () => {},
    font: '',
    textAlign: '',
    fillText: () => {},
    getImageData: () => ({ data: [] }),
    toDataURL: () => 'data:image/png;base64,mocked',
  }),
});