import type {
  DependencyNode,
  DependencyGraph,
  ModuleCluster,
  ContextAnalysisResult,
  FileClassification,
} from './types';
import {
  calculateImportDepth,
  getTransitiveDependencies,
  calculateContextBudget,
} from './graph-builder';
import { calculateEnhancedCohesion } from './metrics';
import {
  classifyFile,
  adjustCohesionForClassification,
  adjustFragmentationForClassification,
} from './classifier';
import { analyzeIssues } from './issue-analyzer';
import { getClassificationRecommendations } from './remediation';

export interface MappingOptions {
  maxDepth: number;
  maxContextBudget: number;
  minCohesion: number;
  maxFragmentation: number;
}

/**
 * Maps a single dependency node to a comprehensive ContextAnalysisResult.
 */
export function mapNodeToResult(
  node: DependencyNode,
  graph: DependencyGraph,
  clusters: ModuleCluster[],
  allCircularDeps: string[][],
  options: MappingOptions
): ContextAnalysisResult {
  const file = node.file;
  const tokenCost = node.tokenCost;
  const importDepth = calculateImportDepth(file, graph);
  const transitiveDeps = getTransitiveDependencies(file, graph);
  const contextBudget = calculateContextBudget(file, graph);
  const circularDeps = allCircularDeps.filter((cycle) => cycle.includes(file));

  // Find cluster for this file
  const cluster = clusters.find((c) => c.files.includes(file));
  const rawFragmentationScore = cluster ? cluster.fragmentationScore : 0;

  // Cohesion
  const rawCohesionScore = calculateEnhancedCohesion(
    node.exports,
    file,
    options as unknown as Record<string, unknown>
  );

  // Initial classification
  const fileClassification = classifyFile(node, rawCohesionScore);

  // Adjust scores based on classification
  const cohesionScore = adjustCohesionForClassification(
    rawCohesionScore,
    fileClassification
  );
  const fragmentationScore = adjustFragmentationForClassification(
    rawFragmentationScore,
    fileClassification
  );

  const { severity, issues, recommendations, potentialSavings } = analyzeIssues(
    {
      file,
      importDepth,
      tokenCost,
      contextBudget,
      cohesionScore,
      fragmentationScore,
      maxDepth: options.maxDepth,
      maxContextBudget: options.maxContextBudget,
      minCohesion: options.minCohesion,
      maxFragmentation: options.maxFragmentation,
      circularDeps,
    }
  );

  // Add classification-specific recommendations
  const classRecs = getClassificationRecommendations(
    fileClassification,
    file,
    issues
  );
  const allRecommendations = Array.from(
    new Set([...recommendations, ...classRecs])
  );

  return {
    file,
    tokenCost,
    linesOfCode: node.linesOfCode,
    importDepth,
    dependencyCount: transitiveDeps.size,
    dependencyList: Array.from(transitiveDeps.keys()),
    circularDeps,
    cohesionScore,
    domains: Array.from(
      new Set(
        node.exports.flatMap(
          (e: any) => e.domains?.map((d: any) => d.domain) || []
        )
      )
    ),
    exportCount: node.exports.length,
    contextBudget,
    fragmentationScore,
    relatedFiles: cluster ? cluster.files : [],
    fileClassification,
    severity,
    issues,
    recommendations: allRecommendations,
    potentialSavings,
  };
}
