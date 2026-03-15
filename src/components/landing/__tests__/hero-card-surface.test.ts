import fs from 'node:fs';
import path from 'node:path';

describe('Hero leaderboard card surface', () => {
  it('uses an explicit elevated surface treatment that separates from the hero background', () => {
    const heroPath = path.join(process.cwd(), 'src/components/landing/HeroNew.tsx');
    const source = fs.readFileSync(heroPath, 'utf8');

    expect(source).toContain('bg-card/95');
    expect(source).toContain('ring-1');
    expect(source).toContain('from-background/95');
  });
});
