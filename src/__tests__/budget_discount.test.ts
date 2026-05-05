import { describe, it, expect } from 'vitest';
import { buildDependencyGraph, calculateContextBudget } from '../index';

describe('calculateContextBudget with Discounts', () => {
  it('should apply higher discount for transitive dependencies', async () => {
    // a -> b -> c
    const content = 'export const x = 1;'.repeat(250); // ~1000 tokens
    const files = [
      { file: 'a.ts', content: content },
      { file: 'b.ts', content: 'import { x } from "./a";' + content },
      { file: 'c.ts', content: 'import { x } from "./b";' + content },
    ];

    const graph = await buildDependencyGraph(files);

    // c.ts budget should be significantly lower than before
    const budgetC = calculateContextBudget('c.ts', graph);
    // Old logic: ~3000 tokens
    // New logic: ~1800-2000 tokens
    expect(budgetC).toBeLessThan(2500);
    expect(budgetC).toBeGreaterThan(1500);
  });

  it('should apply extra discount for base modules', async () => {
    // my-class.ts -> base-class.base.ts -> many-deps.ts
    const contentLarge = 'export const x = 1;'.repeat(2500); // ~10000 tokens
    const contentSmall = 'export const x = 1;'.repeat(25); // ~100 tokens

    const files = [
      { file: 'many-deps.ts', content: contentLarge },
      {
        file: 'base-class.base.ts',
        content: 'import { x } from "./many-deps";' + contentSmall,
      },
      {
        file: 'my-class.ts',
        content: 'import { x } from "./base-class.base";' + contentSmall,
      },
    ];

    const graph = await buildDependencyGraph(files);

    const budget = calculateContextBudget('my-class.ts', graph);
    // With new logic, it should be significantly reduced
    expect(budget).toBeLessThan(5000);
  });

  it('should apply extra discount for type definitions', async () => {
    const contentLarge = 'export const x = 1;'.repeat(2500); // ~10000 tokens
    const contentSmall = 'export const x = 1;'.repeat(25); // ~100 tokens

    const files = [
      { file: 'heavy-logic.ts', content: contentLarge },
      {
        file: 'types/index.ts',
        content: 'import { x } from "../heavy-logic"; export type T = number;',
      },
      {
        file: 'app.ts',
        content: 'import { T } from "./types";' + contentSmall,
      },
    ];

    const graph = await buildDependencyGraph(files);

    const budget = calculateContextBudget('app.ts', graph);
    expect(budget).toBeLessThan(5000);
  });
});
