import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/local-development',
        'getting-started/environment-and-integrations',
        'getting-started/database-and-migrations',
      ],
    },
    {
      type: 'category',
      label: 'Product Overview',
      items: [
        'product/what-devtrends-does',
        'product/feature-surfaces',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/system-overview',
        'architecture/frontend-and-routing',
        'architecture/api-surface',
        'architecture/data-ingestion-and-scoring',
        'architecture/ai-layer-and-guardrails',
      ],
    },
    {
      type: 'category',
      label: 'Subsystems',
      items: [
        'subsystems/technologies-and-compare',
        'subsystems/jobs-and-quiz',
        'subsystems/blockchain-languages-repos-and-digest',
      ],
    },
    {
      type: 'category',
      label: 'Contributor Guide',
      items: [
        'contributor/testing-and-quality',
        'contributor/cron-and-operations',
        'contributor/docs-workflow',
      ],
    },
  ],
};

export default sidebars;
