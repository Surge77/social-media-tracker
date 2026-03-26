type ImageLogo = {
  name: string;
  kind: 'image';
  src: string;
  alt: string;
  width: number;
  height: number;
  displayClassName: string;
  verified: true;
};

type TextLogo = {
  name: string;
  kind: 'text';
  label: string;
  displayClassName: string;
  verified: true;
};

export type DataSourceLogo = ImageLogo | TextLogo;

export const DATA_SOURCE_LOGOS: DataSourceLogo[] = [
  {
    name: 'GitHub',
    kind: 'image',
    src: '/images/github-custom.png',
    alt: 'GitHub logo',
    width: 3840,
    height: 2160,
    displayClassName: 'h-[56px] w-auto',
    verified: true,
  },
  {
    name: 'Stack Overflow',
    kind: 'image',
    src: 'https://stackoverflow.com/Content/Sites/stackoverflow/Img/logo.png?v=0a124c963f5f',
    alt: 'Stack Overflow logo',
    width: 198,
    height: 42,
    displayClassName: 'h-[42px] w-auto',
    verified: true,
  },
  {
    name: 'Google Trends',
    kind: 'image',
    src: '/images/google-trends-transparent.png',
    alt: 'Google Trends logo',
    width: 600,
    height: 450,
    displayClassName: 'h-[100px] w-auto bg-transparent',
    verified: true,
  },
  {
    name: 'HasData',
    kind: 'image',
    src: '/images/hasdata.png',
    alt: 'HasData logo',
    width: 230,
    height: 230,
    displayClassName: 'h-[68px] w-auto bg-transparent',
    verified: true,
  },
  {
    name: 'Reddit',
    kind: 'image',
    src: 'https://redditinc.com/hubfs/Reddit%20Inc/Content/Brand%20Page/Reddit_Lockup_Logo.svg',
    alt: 'Reddit logo',
    width: 300,
    height: 84,
    displayClassName: 'h-[30px] w-auto',
    verified: true,
  },
  {
    name: 'Dev.to',
    kind: 'image',
    src: 'https://media2.dev.to/dynamic/image/quality=100/https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png',
    alt: 'DEV Community logo',
    width: 100,
    height: 80,
    displayClassName: 'h-[34px] w-auto',
    verified: true,
  },
  {
    name: 'npm',
    kind: 'image',
    src: '/images/npm.png',
    alt: 'npm logo',
    width: 540,
    height: 210,
    displayClassName: 'h-[34px] w-auto',
    verified: true,
  },
  {
    name: 'Libraries.io',
    kind: 'image',
    src: 'https://libraries.io/assets/logo-af5ba93db6b301878669fc49b0e125a507bc38f0f57c18ebbe67861109fcc194.svg',
    alt: 'Libraries.io logo',
    width: 1000,
    height: 200,
    displayClassName: 'h-[34px] w-auto invert dark:invert-0',
    verified: true,
  },
  {
    name: 'Adzuna',
    kind: 'image',
    src: 'https://zunastatic-abf.kxcdn.com/images/global/adzuna_logo.svg',
    alt: 'Adzuna logo',
    width: 170,
    height: 45,
    displayClassName: 'h-[22px] w-auto',
    verified: true,
  },
];
