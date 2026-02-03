# Test Suite Documentation

## Overview

Comprehensive test suite for the Duforn portfolio, focused on preventing memory leaks and ensuring proper lifecycle management across Barba.js page transitions.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- three.test.js
```

## Test Infrastructure

### Framework
- **Vitest**: Fast, Vite-native test runner with ESM support
- **Happy-DOM**: Lightweight DOM implementation (faster than jsdom)
- **@testing-library/dom**: DOM testing utilities
- **@vitest/coverage-v8**: Code coverage via V8

### Configuration
- `vite.config.js`: Test configuration
- `test/setup.js`: Global test setup (mocks, RAF tracking, canvas/WebGL mocks)

## Directory Structure

```
test/
├── setup.js                              # Global test setup
├── README.md                             # This file
├── mocks/                                # Mock implementations
│   ├── three.js                         # Three.js mocks with disposal tracking
│   ├── gsap.js                          # GSAP mocks with tween/ScrollTrigger tracking
│   ├── barba.js                         # Barba.js lifecycle mocks
│   ├── html2canvas.js                   # Page capture mock
│   ├── lenis.js                         # Smooth scroll mock
│   └── dom.js                           # DOM helper utilities
├── helpers/
│   └── memory-leak-detector.js          # RAF/listener leak detection utility
└── __tests__/
    ├── smoke.test.js                    # Infrastructure smoke test (✓ PASSING)
    ├── lifecycle/                       # Module lifecycle tests
    │   ├── three.test.js               # WebGL background lifecycle
    │   ├── text-reveal.test.js         # Text animation lifecycle
    │   └── work.test.js                # Work page lifecycle
    ├── integration/                     # Integration tests
    │   ├── barba-transitions.test.js   # Page transition flow
    │   └── namespace-routing.test.js   # Feature initialization routing
    ├── components/                      # Component tests
    │   └── menu.test.js                # Navigation menu
    └── utils/
        └── memory-leak-detection.test.js # Leak detector tests
```

## Mock Infrastructure

### Three.js Mock (`test/mocks/three.js`)

Comprehensive Three.js mocking with resource tracking:

```javascript
import { Scene, WebGLRenderer, ShaderMaterial } from '../../mocks/three.js';
import { getResourceLeaks, resetResourceTracking } from '../../mocks/three.js';

// In tests
const leaks = getResourceLeaks();
expect(leaks.geometries).toBe(0); // No geometry leaks
expect(leaks.materials).toBe(0);  // No material leaks
```

**Features:**
- Disposal tracking for geometries, materials, textures, renderers
- Mock implementations of Scene, Camera, Renderer, Mesh, etc.
- GLTFLoader with async loading
- Resource leak detection

### GSAP Mock (`test/mocks/gsap.js`)

GSAP mocking with animation tracking:

```javascript
import gsap, { ScrollTrigger } from '../../mocks/gsap.js';
import { getGsapLeaks, resetGsapTracking } from '../../mocks/gsap.js';

// In tests
const leaks = getGsapLeaks();
expect(leaks.tweens).toBe(0);          // No active tweens
expect(leaks.scrollTriggers).toBe(0);  // No active ScrollTriggers
```

**Features:**
- Tracks active tweens, timelines, ScrollTriggers, Draggable instances
- Mock implementations of gsap.to(), gsap.from(), gsap.fromTo(), gsap.timeline()
- ScrollTrigger.create() with kill() tracking
- Leak detection for animations

### Barba.js Mock (`test/mocks/barba.js`)

Page transition lifecycle mocking:

```javascript
import barba, { triggerTransition } from '../../mocks/barba.js';

// In tests
await triggerTransition('home', 'work');
```

**Features:**
- Full lifecycle simulation (once, leave, enter, after)
- Namespace management
- Manual transition triggering for tests
- Hook registration tracking

### Memory Leak Detector (`test/helpers/memory-leak-detector.js`)

Automated memory leak detection:

```javascript
import { createLeakDetector } from '../helpers/memory-leak-detector';

let detector;

beforeEach(() => {
  detector = createLeakDetector();
  detector.start();
});

afterEach(() => {
  detector.assertNoLeaks(); // Fails if leaks detected
  detector.stop();
});
```

**Features:**
- RAF ID tracking (ensures all requestAnimationFrame calls are cancelled)
- Event listener tracking (ensures all listeners are removed)
- Detailed leak reporting
- Automatic assertion helpers

## Test Patterns

### Lifecycle Test Pattern

Every module with init/destroy functions should follow this pattern:

```javascript
describe('Module Lifecycle', () => {
  let initModule, destroyModule;

  beforeEach(async () => {
    cleanupDOM();
    createRequiredElements();

    const module = await import('../../../scripts/module.js');
    initModule = module.initModule;
    destroyModule = module.destroyModule;
  });

  afterEach(() => {
    if (destroyModule) destroyModule();
    cleanupDOM();
    vi.clearAllMocks();
  });

  it('should initialize correctly', () => {
    initModule();
    // Assertions
  });

  it('should destroy completely', () => {
    initModule();
    destroyModule();
    // Verify cleanup
  });

  it('should handle multiple init/destroy cycles', () => {
    initModule();
    destroyModule();
    initModule();
    destroyModule();
  });

  it('should be idempotent (safe to call destroy twice)', () => {
    initModule();
    destroyModule();
    expect(() => destroyModule()).not.toThrow();
  });
});
```

### Integration Test Pattern

For testing page transitions:

```javascript
describe('Page Transition Integration', () => {
  beforeEach(async () => {
    cleanupDOM();
    createBarbaContainer('home');
    createBackground();

    // Import modules
    await import('../../../scripts/barba.js');
  });

  it('should transition from home to work', async () => {
    await triggerTransition('home', 'work');

    const container = document.querySelector('[data-barba-namespace]');
    expect(container.dataset.barbaNamespace).toBe('work');
  });
});
```

### Memory Leak Test Pattern

For verifying no leaks after cleanup:

```javascript
it('should not leak resources', () => {
  const detector = createLeakDetector();
  detector.start();

  initModule();
  destroyModule();

  expect(detector.hasRAFLeaks()).toBe(false);
  expect(detector.hasListenerLeaks()).toBe(false);

  detector.stop();
});
```

## Current Status

### ✅ Working (Passing Tests)
- Test infrastructure setup
- Global mocks (RAF, canvas, WebGL, IntersectionObserver)
- Memory leak detector
- Smoke tests
- DOM helper utilities
- All mock infrastructure

### ⚠️ Needs Minor Fixes
Some tests require additional mock exports or module adjustments:

1. **Three.js tests**: Need `Color` export in mock
2. **Text reveal tests**: Need DOM manipulation handling in mocks
3. **Integration tests**: Need SplitType mock refinement
4. **Menu tests**: Need `closeMenu` export from menu.js

### Test Coverage Goals
- **Lifecycle tests**: 80%+ coverage on init/destroy functions
- **Integration tests**: All page transition paths covered
- **Component tests**: All UI components tested
- **Memory leak tests**: Zero leaks detected

## Adding New Tests

### 1. Create Test File

```javascript
// test/__tests__/lifecycle/new-module.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('dependency', async () => import('../../mocks/dependency.js'));

describe('New Module Lifecycle', () => {
  // Test implementation
});
```

### 2. Add Required Mocks

If the module uses external libraries not yet mocked:
- Add to `test/mocks/` directory
- Follow existing mock patterns
- Track resources for disposal

### 3. Test Checklist

For lifecycle tests, verify:
- [ ] Initializes correctly
- [ ] Destroys completely
- [ ] Cancels all RAF calls
- [ ] Removes all event listeners
- [ ] Disposes all Three.js resources (if applicable)
- [ ] Kills all GSAP tweens/ScrollTriggers (if applicable)
- [ ] Clears all DOM references
- [ ] Is idempotent (safe to call destroy twice)
- [ ] Handles multiple init/destroy cycles

## Debugging Tests

### View Test UI

```bash
npm run test:ui
```

Opens browser interface at http://localhost:51204/__vitest__/

### Run Specific Test

```bash
npm test -- three.test
npm test -- --grep "should initialize"
```

### Check for RAF Leaks

After each test, check `global.rafIds.size`:

```javascript
afterEach(() => {
  console.log('Uncancelled RAF calls:', global.rafIds.size);
});
```

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

## Common Issues

### Issue: "Cannot read properties of undefined"
**Solution**: Check that mocks export all necessary classes/functions

### Issue: "await isn't allowed in non-async function"
**Solution**: Use `async () =>` in vi.mock factory functions:
```javascript
vi.mock('module', async () => {
  const mod = await import('../../mocks/module.js');
  return mod;
});
```

### Issue: RAF leak detected
**Solution**: Ensure module cancels all `requestAnimationFrame` calls in destroy

### Issue: Listener leaks detected
**Solution**: Ensure module stores event handlers as named functions and removes them

## Best Practices

1. **Always mock external dependencies** - Don't let tests depend on real Three.js, GSAP, etc.
2. **Clean up after every test** - Use afterEach to call destroy functions
3. **Use memory leak detector** - Catch leaks early
4. **Test both happy and error paths** - Don't just test success cases
5. **Use descriptive test names** - "should cancel RAF on destroy" not "test destroy"
6. **Keep tests isolated** - No test should depend on another
7. **Mock at the right level** - Mock external APIs, test your code

## CI/CD Integration

Ready for GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --run
      - run: npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Happy DOM](https://github.com/capricorn86/happy-dom)
- [Vite Test Config](https://vitest.dev/config/)

## Next Steps

To complete the test suite:

1. **Fix remaining mock exports** - Add missing Three.js Color, etc.
2. **Add more lifecycle tests** - Archive scene, middle carousel
3. **Add component tests** - Preloader, variable font, link/button hovers
4. **Add E2E tests** - Full page navigation flows
5. **Achieve 80%+ coverage** - Focus on critical init/destroy paths
6. **Add CI/CD** - Automate test runs on push
7. **Add performance tests** - Memory usage, animation frame rate

## Maintenance

### Updating Mocks

When the real modules change:
1. Update corresponding mock in `test/mocks/`
2. Add new methods/properties as needed
3. Maintain disposal/cleanup tracking
4. Run tests to verify no breakage

### Adding New Modules

When adding new modules to the codebase:
1. Create corresponding test file
2. Add any new mocks needed
3. Follow lifecycle test pattern
4. Verify no memory leaks

---

**Test suite built with ❤️ for memory safety and reliability**
