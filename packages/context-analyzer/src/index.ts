import { ToolRegistry } from '@aiready/core';
import { CONTEXT_ANALYZER_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(CONTEXT_ANALYZER_PROVIDER);

export * from './types';
export { analyzeContext, calculateCohesion } from './orchestrator';
export { calculateContextScore, mapScoreToRating } from './scoring';
export {
  calculateEnhancedCohesion,
  calculatePathEntropy,
  calculateStructuralCohesionFromCoUsage,
  calculateFragmentation,
  calculateDirectoryDistance,
} from './metrics';
export { detectModuleClusters } from './cluster-detector';
export {
  buildDependencyGraph,
  detectCircularDependencies,
  calculateContextBudget,
  calculateImportDepth,
  getTransitiveDependencies,
} from './graph-builder';
export {
  classifyFile,
  adjustCohesionForClassification,
  adjustFragmentationForClassification,
} from './classifier';
export {
  getClassificationRecommendations,
  getGeneralRecommendations,
} from './remediation';
export { generateSummary } from './summary';
export { CONTEXT_ANALYZER_PROVIDER };
