import fs from 'node:fs';
import path from 'node:path';

describe('DataSourcesMarquee static strip', () => {
  it('renders a static logo row instead of using the marquee animation component', () => {
    const componentPath = path.join(
      process.cwd(),
      'src/components/landing/DataSourcesMarquee.tsx'
    );

    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).not.toContain("from '@/components/ui/marquee'");
    expect(source).not.toContain('<Marquee');
    expect(source).toContain('flex-wrap');
    expect(source).toContain('justify-center');
  });
});
