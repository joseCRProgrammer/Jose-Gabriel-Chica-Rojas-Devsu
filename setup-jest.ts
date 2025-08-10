// setup-jest.ts
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Inicializa el entorno de Zone.js para pruebas Angular (nuevo API)
setupZoneTestEnv();

// Mocks útiles del navegador
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock tipado correctamente para crypto.getRandomValues
(globalThis as any).crypto = {
  getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
    if (!array) return array;
    const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return array;
  },
} as Crypto;
