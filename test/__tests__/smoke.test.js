import { describe, it, expect } from 'vitest';

describe('Test Infrastructure Smoke Test', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div.textContent).toBe('Hello');
  });

  it('should have access to window', () => {
    expect(window).toBeDefined();
  });

  it('should track RAF', () => {
    const id = requestAnimationFrame(() => {});
    expect(global.rafIds.has(id)).toBe(true);
    cancelAnimationFrame(id);
    expect(global.rafIds.has(id)).toBe(false);
  });

  it('should support async operations', async () => {
    const promise = new Promise(resolve => setTimeout(() => resolve('done'), 10));
    const result = await promise;
    expect(result).toBe('done');
  });

  it('should have canvas mock', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeDefined();
    expect(ctx.fillRect).toBeDefined();
  });

  it('should have webgl mock', () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    expect(gl).toBeDefined();
    expect(gl.createTexture).toBeDefined();
  });
});
