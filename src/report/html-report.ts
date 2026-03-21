import { analyzeContext } from '../analyzer';
import { generateSummary } from '../summary';
import {
  generateReportHead,
  generateStatCards,
  generateTable,
  generateReportFooter,
} from '@aiready/core';

/**
 * Generate HTML report
 */
export function generateHTMLReport(
  summary: ReturnType<typeof generateSummary>,
  results: Awaited<ReturnType<typeof analyzeContext>>
): string {
  const totalIssues =
    summary.criticalIssues + summary.majorIssues + summary.minorIssues;

  // 'results' may be used in templates later; reference to avoid lint warnings
  void results;

  const head = generateReportHead('AIReady Context Analysis Report');

  const stats = generateStatCards([
    { value: summary.totalFiles, label: 'Files Analyzed' },
    { value: summary.totalTokens.toLocaleString(), label: 'Total Tokens' },
    { value: summary.avgContextBudget.toFixed(0), label: 'Avg Context Budget' },
    {
      value: totalIssues,
      label: 'Total Issues',
      color: totalIssues > 0 ? '#f39c12' : undefined,
    },
  ]);

  let body = `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
    <h1 style="border: none; color: white; margin: 0;">🔍 AIReady Context Analysis Report</h1>
    <p style="margin: 10px 0 0 0;">Generated on ${new Date().toLocaleString()}</p>
  </div>
${stats}`;

  if (totalIssues > 0) {
    body += `<div class="card" style="margin-bottom: 30px;">
    <h2>⚠️ Issues Summary</h2>
    <p>
      <span class="critical">🔴 Critical: ${summary.criticalIssues}</span> &nbsp;
      <span class="major">🟡 Major: ${summary.majorIssues}</span> &nbsp;
      <span class="minor">🔵 Minor: ${summary.minorIssues}</span>
    </p>
    <p><strong>Potential Savings:</strong> ${summary.totalPotentialSavings.toLocaleString()} tokens</p>
  </div>`;
  }

  if (summary.fragmentedModules.length > 0) {
    const fragmentedRows = summary.fragmentedModules.map((m) => [
      m.domain,
      String(m.files.length),
      `${(m.fragmentationScore * 100).toFixed(0)}%`,
      m.totalTokens.toLocaleString(),
    ]);
    body += `<div class="card" style="margin-bottom: 30px;">
    <h2>🧩 Fragmented Modules</h2>
    ${generateTable({ headers: ['Domain', 'Files', 'Fragmentation', 'Token Cost'], rows: fragmentedRows })}
  </div>`;
  }

  if (summary.topExpensiveFiles.length > 0) {
    const expensiveRows = summary.topExpensiveFiles.map((f) => [
      f.file,
      `${f.contextBudget.toLocaleString()} tokens`,
      `<span class="issue-${f.severity}">${f.severity.toUpperCase()}</span>`,
    ]);
    body += `<div class="card" style="margin-bottom: 30px;">
    <h2>💸 Most Expensive Files</h2>
    ${generateTable({ headers: ['File', 'Context Budget', 'Severity'], rows: expensiveRows })}
  </div>`;
  }

  const footer = generateReportFooter({
    title: 'Context Analysis Report',
    packageName: 'context-analyzer',
    packageUrl: 'https://github.com/caopengau/aiready-context-analyzer',
    bugUrl: 'https://github.com/caopengau/aiready-context-analyzer/issues',
  });

  return `${head}
<body>
  ${body}
  ${footer}
</body>
</html>`;
}
