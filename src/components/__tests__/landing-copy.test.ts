import fs from 'node:fs';
import path from 'node:path';

describe('landing page trust copy', () => {
  it('does not expose beta messaging in landing copy', () => {
    const headerPath = path.join(process.cwd(), 'src/components/landing/HeaderNew.tsx');
    const heroPath = path.join(process.cwd(), 'src/components/landing/HeroNew.tsx');
    const faqPath = path.join(process.cwd(), 'src/components/landing/LandingFAQ.tsx');

    const headerSource = fs.readFileSync(headerPath, 'utf8');
    const heroSource = fs.readFileSync(heroPath, 'utf8');
    const faqSource = fs.readFileSync(faqPath, 'utf8');

    expect(headerSource).not.toContain('OPEN BETA');
    expect(heroSource).not.toContain('OPEN BETA');
    expect(faqSource).not.toContain('open beta');
  });
});
