/**
 * Test Helper providing in-memory localStorage / sessionStorage mocks,
 * Window event mocking, and test assertion wrappers.
 */
import assert from 'node:assert/strict';

class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Polyfill global storage if needed
if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
  (globalThis as any).localStorage = new MockStorage();
}
if (!globalThis.sessionStorage || typeof globalThis.sessionStorage.getItem !== 'function') {
  (globalThis as any).sessionStorage = new MockStorage();
}

// Polyfill window and CustomEvent
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    location: {
      origin: 'http://localhost:5173',
      href: 'http://localhost:5173/'
    },
    dispatchEvent: (_event: any) => true,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
} else if (!(globalThis as any).window.location) {
  (globalThis as any).window.location = {
    origin: 'http://localhost:5173',
    href: 'http://localhost:5173/'
  };
}

if (typeof (globalThis as any).CustomEvent === 'undefined') {
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    detail: any;
    constructor(type: string, params?: { detail: any }) {
      this.type = type;
      this.detail = params?.detail;
    }
  };
}

export { assert, MockStorage };

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export type TestFn = () => void | Promise<void>;

export class TestRunner {
  private results: TestResult[] = [];
  private currentSuite = 'Default';

  suite(name: string) {
    this.currentSuite = name;
  }

  async test(name: string, fn: TestFn) {
    const start = performance.now();
    try {
      await fn();
      const duration = performance.now() - start;
      this.results.push({
        suiteName: this.currentSuite,
        testName: name,
        passed: true,
        durationMs: Number(duration.toFixed(2))
      });
      console.log(`  \x1b[32m✔\x1b[0m ${name} (${duration.toFixed(1)}ms)`);
    } catch (err: any) {
      const duration = performance.now() - start;
      this.results.push({
        suiteName: this.currentSuite,
        testName: name,
        passed: false,
        error: err,
        durationMs: Number(duration.toFixed(2))
      });
      console.error(`  \x1b[31m✖\x1b[0m ${name} (${duration.toFixed(1)}ms)`);
      console.error(`    \x1b[31m${err?.message || err}\x1b[0m`);
      if (err?.stack) {
        const stackFirstLine = err.stack.split('\n')[1] || '';
        console.error(`    \x1b[90m${stackFirstLine.trim()}\x1b[0m`);
      }
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('\n----------------------------------------');
    console.log(`\x1b[1mTest Execution Summary:\x1b[0m`);
    console.log(`Total:  ${total}`);
    console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
    console.log(`Failed: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
    console.log('----------------------------------------\n');

    return { total, passed, failed };
  }
}
