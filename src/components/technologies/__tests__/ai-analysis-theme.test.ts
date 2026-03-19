import fs from 'node:fs';
import path from 'node:path';

describe('technology detail AI analysis theme styling', () => {
  it('uses readable inline analysis cards instead of a dark terminal strip', () => {
    const aiInsightCardPath = path.join(
      process.cwd(),
      'src/components/ai/AIInsightCard.tsx'
    );
    const decisionAnalysisPath = path.join(
      process.cwd(),
      'src/components/technologies/TechDecisionAnalysisCard.tsx'
    );

    const aiInsightCardSource = fs.readFileSync(aiInsightCardPath, 'utf8');
    const decisionAnalysisSource = fs.readFileSync(decisionAnalysisPath, 'utf8');

    expect(aiInsightCardSource).toContain('bg-background/70');
    expect(aiInsightCardSource).toContain('text-foreground/80');
    expect(aiInsightCardSource).not.toContain('text-zinc-400');
    expect(aiInsightCardSource).not.toContain('TerminalCard');

    expect(decisionAnalysisSource).toContain('text-emerald-700');
    expect(decisionAnalysisSource).toContain('text-rose-700');
    expect(decisionAnalysisSource).toContain('text-amber-700');
  });

  it('shows a visible loading placeholder while the AI analysis is generating', () => {
    const aiInsightCardPath = path.join(
      process.cwd(),
      'src/components/ai/AIInsightCard.tsx'
    );

    const aiInsightCardSource = fs.readFileSync(aiInsightCardPath, 'utf8');

    expect(aiInsightCardSource).toContain('AI analysis is loading');
    expect(aiInsightCardSource).toContain('min-h-[220px]');
    expect(aiInsightCardSource).toContain('Generating a grounded read on momentum, jobs, community, and ecosystem signals.');
  });
});
