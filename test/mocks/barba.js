import { vi } from 'vitest';

// Track registered transitions and views
const transitions = [];
const views = [];
let config = {};

// Mock Barba namespace
const barba = {
  init: vi.fn((options) => {
    config = options;
    if (options.transitions) {
      transitions.push(...options.transitions);
    }
    if (options.views) {
      views.push(...options.views);
    }
  }),

  go: vi.fn(async (url, trigger = 'barba') => {
    // Simulate navigation
    const currentNamespace = document.querySelector('[data-barba-namespace]')?.dataset.barbaNamespace;

    // Extract namespace from URL (simplified)
    const nextNamespace = url.split('/').pop().replace('.html', '') || 'home';

    // Trigger leave hooks
    for (const transition of transitions) {
      if (transition.leave) {
        await transition.leave({ current: { namespace: currentNamespace } });
      }
    }

    // Update DOM
    const container = document.querySelector('[data-barba-container]');
    if (container) {
      container.dataset.barbaNamespace = nextNamespace;
    }

    // Trigger enter hooks
    for (const transition of transitions) {
      if (transition.enter) {
        await transition.enter({ next: { namespace: nextNamespace } });
      }
    }

    // Trigger after hooks
    for (const transition of transitions) {
      if (transition.after) {
        await transition.after({ next: { namespace: nextNamespace } });
      }
    }
  }),

  destroy: vi.fn(() => {
    transitions.length = 0;
    views.length = 0;
    config = {};
  }),

  // Expose for testing
  _getTransitions: () => transitions,
  _getViews: () => views,
  _getConfig: () => config,
};

// Helper to trigger once hook manually
export async function triggerOnce(namespace = 'home') {
  const container = document.querySelector('[data-barba-container]');
  if (container) {
    container.dataset.barbaNamespace = namespace;
  }

  for (const transition of transitions) {
    if (transition.once) {
      await transition.once({ next: { namespace } });
    }
  }
}

// Helper to manually trigger transitions for testing
export async function triggerTransition(fromNamespace, toNamespace) {
  // Leave
  for (const transition of transitions) {
    if (transition.leave) {
      await transition.leave({ current: { namespace: fromNamespace } });
    }
  }

  // Update DOM
  const container = document.querySelector('[data-barba-container]');
  if (container) {
    container.dataset.barbaNamespace = toNamespace;
  }

  // Enter
  for (const transition of transitions) {
    if (transition.enter) {
      await transition.enter({ next: { namespace: toNamespace } });
    }
  }

  // After
  for (const transition of transitions) {
    if (transition.after) {
      await transition.after({ next: { namespace: toNamespace } });
    }
  }
}

export function resetBarbaTracking() {
  transitions.length = 0;
  views.length = 0;
  config = {};
  barba.init.mockClear();
  barba.go.mockClear();
  barba.destroy.mockClear();
}

export default barba;
