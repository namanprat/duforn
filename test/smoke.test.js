import { describe, it, expect } from 'vitest';
import { archiveItems } from '../data/archive-items.js';
import { workItems } from '../data/work-items.js';

describe('content data', () => {
  it('has archive items with jpg assets', () => {
    expect(archiveItems.length).toBeGreaterThan(0);
    archiveItems.forEach((item) => {
      expect(item.image.endsWith('.jpg')).toBe(true);
    });
  });

  it('has work items with required fields', () => {
    expect(workItems.length).toBeGreaterThan(0);
    workItems.forEach((item) => {
      expect(item.title).toBeTruthy();
      expect(item.image).toBeTruthy();
      expect(item.href).toBeTruthy();
    });
  });
});
