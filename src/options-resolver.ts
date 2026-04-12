import type { ContextAnalyzerOptions } from './types';
import { getSmartDefaults } from './defaults';

/**
 * Resolves options, handling "auto" values by using smart defaults.
 */
export async function resolveOptions(options: ContextAnalyzerOptions): Promise<
  Omit<ContextAnalyzerOptions, 'maxContextBudget'> & {
    maxContextBudget: number;
  }
> {
  const budget = options.maxContextBudget;
  if (budget === 'auto') {
    const smartDefaults = await getSmartDefaults(
      options.rootDir || '.',
      options as ContextAnalyzerOptions
    );
    return {
      ...options,
      maxContextBudget: smartDefaults.maxContextBudget,
      maxDepth: smartDefaults.maxDepth,
      minCohesion: smartDefaults.minCohesion,
      maxFragmentation: smartDefaults.maxFragmentation,
    } as Omit<ContextAnalyzerOptions, 'maxContextBudget'> & {
      maxContextBudget: number;
    };
  }
  return {
    ...options,
    maxContextBudget: typeof budget === 'number' ? budget : 25000,
  } as Omit<ContextAnalyzerOptions, 'maxContextBudget'> & {
    maxContextBudget: number;
  };
}
