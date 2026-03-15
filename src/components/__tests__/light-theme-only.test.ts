import fs from 'node:fs';
import path from 'node:path';

describe('light-only theme configuration', () => {
  it('pins the app to light theme and removes theme switches from headers', () => {
    const providersPath = path.join(process.cwd(), 'src/app/providers.tsx');
    const headerPath = path.join(process.cwd(), 'src/components/Header.tsx');
    const dashboardHeaderPath = path.join(process.cwd(), 'src/components/DashboardHeader.tsx');
    const landingHeaderPath = path.join(process.cwd(), 'src/components/landing/HeaderNew.tsx');

    const providersSource = fs.readFileSync(providersPath, 'utf8');
    const headerSource = fs.readFileSync(headerPath, 'utf8');
    const dashboardHeaderSource = fs.readFileSync(dashboardHeaderPath, 'utf8');
    const landingHeaderSource = fs.readFileSync(landingHeaderPath, 'utf8');

    expect(providersSource).toContain('defaultTheme="light"');
    expect(providersSource).toContain("themes={['light']}");
    expect(headerSource).not.toContain('ThemePrismSwitch');
    expect(dashboardHeaderSource).not.toContain('ThemePrismSwitch');
    expect(landingHeaderSource).not.toContain('ThemePrismSwitch');
  });
});
