'use client';

import { AlertTriangle, Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import type { CompatibilityReport } from '@/lib/api';
import { cn } from '@/lib/utils';

function severityIcon(severity: string, passed: boolean) {
  if (passed) return <Check className="h-3.5 w-3.5 text-positive" />;
  if (severity === 'warning') return <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
  return <X className="h-3.5 w-3.5 text-danger" />;
}

export function CompatibilityResults({
  report,
  compact = false,
}: {
  report: CompatibilityReport;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(!compact);
  const flagged = report.results.filter((result) => !result.passed);

  const summary = report.ok
    ? report.warningCount > 0
      ? `Compatible, ${report.warningCount} thing${report.warningCount > 1 ? 's' : ''} to check`
      : 'Compatible'
    : `${report.errorCount} compatibility issue${report.errorCount > 1 ? 's' : ''}`;

  return (
    <div
      className={cn(
        'rounded-tile border',
        report.ok
          ? report.warningCount > 0
            ? 'border-warning/30 bg-warning/10'
            : 'border-positive/30 bg-positive/10'
          : 'border-danger/30 bg-danger/10',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          {report.ok ? (
            <Check className="h-4 w-4 text-positive" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-danger" />
          )}
          {summary}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="border-t border-hairline/60 px-4 py-3">
          {flagged.length > 0 && (
            <ul className="space-y-2">
              {flagged.map((result, index) => (
                <li key={index} className="flex gap-2.5 text-sm">
                  {severityIcon(result.severity, result.passed)}
                  <div>
                    <p>{result.message}</p>
                    <p className="mt-0.5 text-micro text-muted">
                      {result.sourceProduct.name} ({result.sourceValue}) · {result.targetProduct.name} (
                      {result.targetValue})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <ul className={cn('space-y-1.5', flagged.length > 0 && 'mt-4 border-t border-hairline/60 pt-3')}>
            {report.checklist.map((entry) => (
              <li key={entry.productId} className="flex items-center gap-2 text-sm">
                {entry.ok ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-positive" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                )}
                <span className="text-muted">{entry.categoryName}</span>
                <span className="truncate">{entry.productName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
