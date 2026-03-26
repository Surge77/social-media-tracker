import { DATA_SOURCE_LOGOS } from '@/components/landing/data-source-logos';

describe('DATA_SOURCE_LOGOS', () => {
  it('uses verified brand assets for every landing data source', () => {
    expect(DATA_SOURCE_LOGOS).toHaveLength(9);
    expect(DATA_SOURCE_LOGOS.every((source) => source.verified)).toBe(true);

    const byName = Object.fromEntries(
      DATA_SOURCE_LOGOS.map((source) => [source.name, source] as const)
    );

    expect(byName.GitHub.src).toBe('/images/github-custom.png');
    expect(byName['Stack Overflow'].src).toBe('https://stackoverflow.com/Content/Sites/stackoverflow/Img/logo.png?v=0a124c963f5f');
    expect(byName['Google Trends'].src).toBe('/images/google-trends-transparent.png');
    expect(byName.HasData.src).toBe('/images/hasdata.png');
    expect(byName.Reddit.src).toBe('https://redditinc.com/hubfs/Reddit%20Inc/Content/Brand%20Page/Reddit_Lockup_Logo.svg');
    expect(byName['Dev.to'].src).toBe('https://media2.dev.to/dynamic/image/quality=100/https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png');
    expect(byName.npm.src).toBe('/images/npm.png');
    expect(byName['Libraries.io'].src).toBe('https://libraries.io/assets/logo-af5ba93db6b301878669fc49b0e125a507bc38f0f57c18ebbe67861109fcc194.svg');
    expect(byName.Adzuna.src).toBe('https://zunastatic-abf.kxcdn.com/images/global/adzuna_logo.svg');
    expect(byName['Stack Overflow'].displayClassName).toBe('h-[42px] w-auto');
    expect(byName['Google Trends'].displayClassName).toBe('h-[100px] w-auto bg-transparent');
    expect(byName.HasData.displayClassName).toBe('h-[68px] w-auto bg-transparent');
    expect(byName['Libraries.io'].displayClassName).toBe('h-[34px] w-auto invert dark:invert-0');

    expect(byName.Google).toBeUndefined();
    expect(byName.Microsoft).toBeUndefined();
    expect(byName.OpenAI).toBeUndefined();
    expect(byName.Vercel).toBeUndefined();
  });
});
