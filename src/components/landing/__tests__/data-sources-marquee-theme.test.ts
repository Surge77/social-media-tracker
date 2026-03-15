import fs from 'node:fs';
import path from 'node:path';

describe('DataSourcesMarquee theme styling', () => {
  it('uses explicit dark theme background treatment for the strip', () => {
    const componentPath = path.join(
      process.cwd(),
      'src/components/landing/DataSourcesMarquee.tsx'
    );

    const source = fs.readFileSync(componentPath, 'utf8');

    expect(source).toContain('dark:bg-');
    expect(source).toContain('dark:text-');
    expect(source).toContain('dark:from-');
  });
});
