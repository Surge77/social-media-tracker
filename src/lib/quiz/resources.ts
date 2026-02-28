/**
 * Curated learning resources for top technologies.
 * Single source of truth — no live API calls needed.
 */

export interface TechResources {
  youtube?: {
    videoId: string
    title: string
    channel: string
    durationMinutes: number
  }
  docsUrl?: string
  cliCommand?: string
  cliLabel?: string
  companions: Array<{
    slug: string
    coOccurrencePercent: number
  }>
  primaryLearnResource?: string
}

export const TECH_RESOURCES: Record<string, TechResources> = {
  react: {
    youtube: { videoId: 'SqcY0GlETPk', title: 'React in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://react.dev/learn',
    cliCommand: 'npx create-react-app@latest my-app',
    cliLabel: 'Bootstrap a React app',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 89 },
      { slug: 'tailwind-css', coOccurrencePercent: 72 },
      { slug: 'nextjs', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'react.dev/learn',
  },
  typescript: {
    youtube: { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    cliCommand: 'npm install -D typescript && npx tsc --init',
    cliLabel: 'Initialize TypeScript project',
    companions: [
      { slug: 'react', coOccurrencePercent: 85 },
      { slug: 'nodejs', coOccurrencePercent: 78 },
      { slug: 'prisma', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'TypeScript Handbook',
  },
  nextjs: {
    youtube: { videoId: '__mSgDEOyv8', title: 'Next.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://nextjs.org/docs/getting-started/installation',
    cliCommand: 'npx create-next-app@latest my-app',
    cliLabel: 'Bootstrap a Next.js app',
    companions: [
      { slug: 'react', coOccurrencePercent: 98 },
      { slug: 'typescript', coOccurrencePercent: 87 },
      { slug: 'tailwind-css', coOccurrencePercent: 76 },
    ],
    primaryLearnResource: 'nextjs.org/docs',
  },
  vue: {
    youtube: { videoId: 'nhBVL41-_Cw', title: 'Vue in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://vuejs.org/guide/quick-start.html',
    cliCommand: 'npm create vue@latest',
    cliLabel: 'Create a Vue project',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'vite', coOccurrencePercent: 88 },
      { slug: 'nuxt', coOccurrencePercent: 55 },
    ],
    primaryLearnResource: 'vuejs.org/guide',
  },
  angular: {
    youtube: { videoId: 'Ata9cSC2WpM', title: 'Angular in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://angular.dev/tutorials/learn-angular',
    cliCommand: 'npm install -g @angular/cli && ng new my-app',
    cliLabel: 'Scaffold an Angular app',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 99 },
      { slug: 'rxjs', coOccurrencePercent: 82 },
      { slug: 'nodejs', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'angular.dev/tutorials',
  },
  svelte: {
    youtube: { videoId: 'rv3Yq-B8qp4', title: 'Svelte in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://learn.svelte.dev',
    cliCommand: 'npm create svelte@latest my-app',
    cliLabel: 'Create a Svelte project',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 68 },
      { slug: 'vite', coOccurrencePercent: 79 },
      { slug: 'tailwind-css', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'learn.svelte.dev',
  },
  nodejs: {
    youtube: { videoId: 'ENrzD9HAZK4', title: 'Node.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    cliCommand: 'npm init -y && touch index.js',
    cliLabel: 'Initialize a Node.js project',
    companions: [
      { slug: 'express', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 69 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'nodejs.org/en/learn',
  },
  express: {
    youtube: { videoId: 'SccSCuHhOw0', title: 'Express.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://expressjs.com/en/starter/hello-world.html',
    cliCommand: 'npm install express && touch server.js',
    cliLabel: 'Install Express.js',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 97 },
      { slug: 'mongodb', coOccurrencePercent: 62 },
      { slug: 'typescript', coOccurrencePercent: 57 },
    ],
    primaryLearnResource: 'expressjs.com/starter',
  },
  fastapi: {
    youtube: { videoId: 'iWS9ogMPOI0', title: 'FastAPI in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://fastapi.tiangolo.com/tutorial/',
    cliCommand: 'pip install fastapi uvicorn && touch main.py',
    cliLabel: 'Install FastAPI',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 64 },
      { slug: 'docker', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'fastapi.tiangolo.com/tutorial',
  },
  django: {
    youtube: { videoId: 'rHux0gMZ3Eg', title: 'Django in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
    cliCommand: 'pip install django && django-admin startproject mysite',
    cliLabel: 'Create a Django project',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 76 },
      { slug: 'docker', coOccurrencePercent: 63 },
    ],
    primaryLearnResource: 'Django official tutorial',
  },
  postgresql: {
    youtube: { videoId: 'n2Fluyr3lbc', title: 'SQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://www.postgresql.org/docs/current/tutorial-start.html',
    cliCommand: 'psql -U postgres -c "CREATE DATABASE mydb;"',
    cliLabel: 'Create a PostgreSQL database',
    companions: [
      { slug: 'prisma', coOccurrencePercent: 68 },
      { slug: 'docker', coOccurrencePercent: 72 },
      { slug: 'nodejs', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'PostgreSQL tutorial',
  },
  mongodb: {
    youtube: { videoId: '-bt_y4Loofg', title: 'MongoDB in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://www.mongodb.com/docs/manual/tutorial/getting-started/',
    cliCommand: 'npm install mongoose && touch db.js',
    cliLabel: 'Install Mongoose ODM',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 79 },
      { slug: 'express', coOccurrencePercent: 71 },
      { slug: 'typescript', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'MongoDB Getting Started',
  },
  redis: {
    youtube: { videoId: 'G1rOthIU-uo', title: 'Redis in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://redis.io/learn/howtos/quick-start',
    cliCommand: 'npm install ioredis && touch cache.ts',
    cliLabel: 'Install Redis client',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 73 },
      { slug: 'postgresql', coOccurrencePercent: 62 },
      { slug: 'docker', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'Redis Quick Start',
  },
  docker: {
    youtube: { videoId: 'Gjnup-PuquQ', title: 'Docker in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.docker.com/get-started/',
    cliCommand: 'docker init && docker compose up',
    cliLabel: 'Initialize and run with Docker',
    companions: [
      { slug: 'kubernetes', coOccurrencePercent: 68 },
      { slug: 'postgresql', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 74 },
    ],
    primaryLearnResource: 'Docker Get Started guide',
  },
  kubernetes: {
    youtube: { videoId: 'PziYflu8cB8', title: 'Kubernetes in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    cliCommand: 'kubectl create deployment hello --image=nginx',
    cliLabel: 'Deploy first workload',
    companions: [
      { slug: 'docker', coOccurrencePercent: 96 },
      { slug: 'terraform', coOccurrencePercent: 64 },
      { slug: 'aws', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'Kubernetes Basics tutorial',
  },
  rust: {
    youtube: { videoId: '5C_HPTJg1lc', title: 'Rust in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://doc.rust-lang.org/book/',
    cliCommand: 'curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    cliLabel: 'Install Rust toolchain',
    companions: [
      { slug: 'wasm', coOccurrencePercent: 58 },
      { slug: 'linux', coOccurrencePercent: 67 },
      { slug: 'typescript', coOccurrencePercent: 41 },
    ],
    primaryLearnResource: 'The Rust Book',
  },
  go: {
    youtube: { videoId: '446E-r0A76I', title: 'Golang in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://go.dev/doc/tutorial/getting-started',
    cliCommand: 'go mod init my-app && touch main.go',
    cliLabel: 'Initialize a Go module',
    companions: [
      { slug: 'docker', coOccurrencePercent: 79 },
      { slug: 'kubernetes', coOccurrencePercent: 65 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'go.dev/doc/tutorial',
  },
  python: {
    youtube: { videoId: 'x7X9w_GIm1s', title: 'Python in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.python.org/3/tutorial/',
    cliCommand: 'python3 -m venv venv && source venv/bin/activate',
    cliLabel: 'Create a Python venv',
    companions: [
      { slug: 'fastapi', coOccurrencePercent: 67 },
      { slug: 'pytorch', coOccurrencePercent: 54 },
      { slug: 'django', coOccurrencePercent: 49 },
    ],
    primaryLearnResource: 'Python official tutorial',
  },
  java: {
    youtube: { videoId: 'l9AzO1FMgM8', title: 'Java in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://dev.java/learn/',
    cliCommand: 'mvn archetype:generate -DgroupId=com.example -DartifactId=my-app',
    cliLabel: 'Scaffold a Maven project',
    companions: [
      { slug: 'spring', coOccurrencePercent: 78 },
      { slug: 'postgresql', coOccurrencePercent: 64 },
      { slug: 'docker', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'dev.java/learn',
  },
  'tailwind-css': {
    youtube: { videoId: 'mr15Xzb1Ook', title: 'Tailwind in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://tailwindcss.com/docs/installation',
    cliCommand: 'npm install -D tailwindcss && npx tailwindcss init',
    cliLabel: 'Install Tailwind CSS',
    companions: [
      { slug: 'react', coOccurrencePercent: 81 },
      { slug: 'nextjs', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'tailwindcss.com/docs',
  },
  prisma: {
    youtube: { videoId: 'rLRIB6AF2Dg', title: 'Prisma in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://www.prisma.io/docs/getting-started/quickstart',
    cliCommand: 'npm install prisma @prisma/client && npx prisma init',
    cliLabel: 'Initialize Prisma ORM',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 91 },
      { slug: 'postgresql', coOccurrencePercent: 78 },
      { slug: 'nextjs', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Prisma Quickstart',
  },
  graphql: {
    youtube: { videoId: 'eIQh02xuVw4', title: 'GraphQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://graphql.org/learn/',
    cliCommand: 'npm install @apollo/server graphql && touch schema.ts',
    cliLabel: 'Install Apollo Server',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'nodejs', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'graphql.org/learn',
  },
  solidity: {
    youtube: { videoId: 'kdvVwGrV7ec', title: 'Solidity in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html',
    cliCommand: 'npm install -D hardhat && npx hardhat init',
    cliLabel: 'Initialize a Hardhat project',
    companions: [
      { slug: 'hardhat', coOccurrencePercent: 83 },
      { slug: 'ethers-js', coOccurrencePercent: 71 },
      { slug: 'typescript', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Solidity Docs intro',
  },
  hardhat: {
    youtube: { videoId: 'gyMwXuJrbJQ', title: 'Hardhat Tutorial', channel: 'Patrick Collins', durationMinutes: 6 },
    docsUrl: 'https://hardhat.org/tutorial',
    cliCommand: 'npm install -D hardhat && npx hardhat init',
    cliLabel: 'Initialize Hardhat',
    companions: [
      { slug: 'solidity', coOccurrencePercent: 94 },
      { slug: 'typescript', coOccurrencePercent: 72 },
      { slug: 'ethers-js', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'hardhat.org/tutorial',
  },
  'react-native': {
    youtube: { videoId: '6oFuwhIibo4', title: 'React Native in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://reactnative.dev/docs/getting-started',
    cliCommand: 'npx create-expo-app@latest my-app',
    cliLabel: 'Create an Expo app',
    companions: [
      { slug: 'react', coOccurrencePercent: 97 },
      { slug: 'typescript', coOccurrencePercent: 76 },
      { slug: 'expo', coOccurrencePercent: 83 },
    ],
    primaryLearnResource: 'reactnative.dev/docs',
  },
  flutter: {
    youtube: { videoId: 'lHhRav3nkiw', title: 'Flutter in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.flutter.dev/get-started/codelab',
    cliCommand: 'flutter create my_app && cd my_app && flutter run',
    cliLabel: 'Create and run a Flutter app',
    companions: [
      { slug: 'dart', coOccurrencePercent: 99 },
      { slug: 'firebase', coOccurrencePercent: 64 },
      { slug: 'supabase', coOccurrencePercent: 41 },
    ],
    primaryLearnResource: 'Flutter first codelab',
  },
  aws: {
    youtube: { videoId: 'a9__D53WsUs', title: 'AWS in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://aws.amazon.com/getting-started/hands-on/',
    cliCommand: 'aws configure && aws s3 ls',
    cliLabel: 'Configure AWS CLI',
    companions: [
      { slug: 'docker', coOccurrencePercent: 74 },
      { slug: 'terraform', coOccurrencePercent: 68 },
      { slug: 'kubernetes', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'AWS Hands-on Tutorials',
  },
  gcp: {
    youtube: { videoId: '4D3X6Xl5c_Y', title: 'Google Cloud in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://cloud.google.com/docs/get-started',
    cliCommand: 'gcloud init && gcloud app create',
    cliLabel: 'Initialize Google Cloud project',
    companions: [
      { slug: 'docker', coOccurrencePercent: 71 },
      { slug: 'kubernetes', coOccurrencePercent: 76 },
      { slug: 'terraform', coOccurrencePercent: 62 },
    ],
    primaryLearnResource: 'Google Cloud Get Started',
  },
  supabase: {
    youtube: { videoId: 'zBZgdTb-dns', title: 'Supabase in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://supabase.com/docs/guides/getting-started/quickstarts/nextjs',
    cliCommand: 'npm install @supabase/supabase-js',
    cliLabel: 'Install Supabase client',
    companions: [
      { slug: 'nextjs', coOccurrencePercent: 72 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'typescript', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'Supabase Next.js Quickstart',
  },
  firebase: {
    youtube: { videoId: 'vAoB4VbhRzM', title: 'Firebase in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://firebase.google.com/docs/web/setup',
    cliCommand: 'npm install firebase && npx firebase init',
    cliLabel: 'Initialize Firebase project',
    companions: [
      { slug: 'react', coOccurrencePercent: 71 },
      { slug: 'flutter', coOccurrencePercent: 64 },
      { slug: 'typescript', coOccurrencePercent: 66 },
    ],
    primaryLearnResource: 'Firebase Web Setup',
  },
  git: {
    youtube: { videoId: 'hwP7WQkmECE', title: 'Git in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
    cliCommand: 'git init && git add . && git commit -m "init"',
    cliLabel: 'Initialize a Git repository',
    companions: [
      { slug: 'github', coOccurrencePercent: 93 },
      { slug: 'linux', coOccurrencePercent: 71 },
      { slug: 'docker', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'Git Book (free)',
  },
  linux: {
    youtube: { videoId: 'rrB13utjYV4', title: 'Linux in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://linuxcommand.org/lc3_learning_the_shell.php',
    cliCommand: 'ls -la && pwd && echo $SHELL',
    cliLabel: 'Basic shell orientation',
    companions: [
      { slug: 'docker', coOccurrencePercent: 79 },
      { slug: 'git', coOccurrencePercent: 74 },
      { slug: 'bash', coOccurrencePercent: 82 },
    ],
    primaryLearnResource: 'Linux Command (free)',
  },
  terraform: {
    youtube: { videoId: 'tomUWcQ0P3k', title: 'Terraform in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started',
    cliCommand: 'terraform init && terraform plan',
    cliLabel: 'Initialize Terraform',
    companions: [
      { slug: 'aws', coOccurrencePercent: 72 },
      { slug: 'kubernetes', coOccurrencePercent: 68 },
      { slug: 'ansible', coOccurrencePercent: 57 },
    ],
    primaryLearnResource: 'Terraform AWS Tutorial',
  },
  ansible: {
    youtube: { videoId: '1id6ERvfozo', title: 'Ansible in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.ansible.com/ansible/latest/getting_started/',
    cliCommand: 'pip install ansible && ansible --version',
    cliLabel: 'Install Ansible',
    companions: [
      { slug: 'terraform', coOccurrencePercent: 64 },
      { slug: 'linux', coOccurrencePercent: 81 },
      { slug: 'docker', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Ansible Getting Started',
  },
  pytorch: {
    youtube: { videoId: 'ORMx45xqWkA', title: 'PyTorch in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://pytorch.org/tutorials/beginner/basics/intro.html',
    cliCommand: 'pip install torch torchvision && python -c "import torch; print(torch.__version__)"',
    cliLabel: 'Install PyTorch',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'numpy', coOccurrencePercent: 91 },
      { slug: 'jupyter', coOccurrencePercent: 78 },
    ],
    primaryLearnResource: 'PyTorch Learn the Basics',
  },
  tensorflow: {
    youtube: { videoId: 'i8NETqtGHms', title: 'TensorFlow in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://www.tensorflow.org/tutorials/quickstart/beginner',
    cliCommand: 'pip install tensorflow && python -c "import tensorflow as tf"',
    cliLabel: 'Install TensorFlow',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'keras', coOccurrencePercent: 84 },
      { slug: 'numpy', coOccurrencePercent: 89 },
    ],
    primaryLearnResource: 'TensorFlow Beginner Quickstart',
  },
  langchain: {
    youtube: { videoId: 'aywZrzNaKjs', title: 'LangChain in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://python.langchain.com/docs/get_started/quickstart',
    cliCommand: 'pip install langchain openai && touch chain.py',
    cliLabel: 'Install LangChain',
    companions: [
      { slug: 'python', coOccurrencePercent: 88 },
      { slug: 'openai-api', coOccurrencePercent: 79 },
      { slug: 'fastapi', coOccurrencePercent: 56 },
    ],
    primaryLearnResource: 'LangChain Quickstart',
  },
  'openai-api': {
    youtube: { videoId: 'uRQH2CFvedY', title: 'OpenAI API in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://platform.openai.com/docs/quickstart',
    cliCommand: 'npm install openai && touch client.ts',
    cliLabel: 'Install OpenAI SDK',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'langchain', coOccurrencePercent: 64 },
      { slug: 'nodejs', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'OpenAI API Quickstart',
  },
  vite: {
    youtube: { videoId: 'KCrXgy8qtjM', title: 'Vite in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://vitejs.dev/guide/',
    cliCommand: 'npm create vite@latest my-app -- --template react-ts',
    cliLabel: 'Create a Vite project',
    companions: [
      { slug: 'react', coOccurrencePercent: 79 },
      { slug: 'typescript', coOccurrencePercent: 82 },
      { slug: 'tailwind-css', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'vitejs.dev/guide',
  },
  webpack: {
    youtube: { videoId: 'MpGLUVbqoYQ', title: 'Webpack in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://webpack.js.org/guides/getting-started/',
    cliCommand: 'npm install -D webpack webpack-cli && npx webpack',
    cliLabel: 'Initialize Webpack',
    companions: [
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 62 },
    ],
    primaryLearnResource: 'Webpack Getting Started',
  },
  jest: {
    youtube: { videoId: 'ajiAl5UNzBU', title: 'Jest in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://jestjs.io/docs/getting-started',
    cliCommand: 'npm install -D jest @types/jest ts-jest && npx jest --init',
    cliLabel: 'Initialize Jest testing',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'nodejs', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'Jest Getting Started',
  },
  vitest: {
    youtube: { videoId: 'snCLQmINqCU', title: 'Vitest Crash Course', channel: 'Matt Pocock', durationMinutes: 12 },
    docsUrl: 'https://vitest.dev/guide/',
    cliCommand: 'npm install -D vitest && npx vitest',
    cliLabel: 'Install and run Vitest',
    companions: [
      { slug: 'vite', coOccurrencePercent: 88 },
      { slug: 'typescript', coOccurrencePercent: 79 },
      { slug: 'react', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'vitest.dev/guide',
  },
  astro: {
    youtube: { videoId: 'dsTXcSeAZq8', title: 'Astro in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.astro.build/en/tutorial/0-introduction/',
    cliCommand: 'npm create astro@latest',
    cliLabel: 'Create an Astro project',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 69 },
      { slug: 'tailwind-css', coOccurrencePercent: 72 },
      { slug: 'react', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Astro Build Tutorial',
  },
  remix: {
    youtube: { videoId: 'bfmI-kaKzNA', title: 'Remix in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://remix.run/docs/en/main/start/tutorial',
    cliCommand: 'npx create-remix@latest',
    cliLabel: 'Create a Remix app',
    companions: [
      { slug: 'react', coOccurrencePercent: 96 },
      { slug: 'typescript', coOccurrencePercent: 78 },
      { slug: 'tailwind-css', coOccurrencePercent: 63 },
    ],
    primaryLearnResource: 'Remix Tutorial',
  },
  nuxt: {
    youtube: { videoId: 'dCxSsr5xuL8', title: 'Nuxt in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://nuxt.com/docs/getting-started/introduction',
    cliCommand: 'npx nuxi@latest init my-app',
    cliLabel: 'Create a Nuxt project',
    companions: [
      { slug: 'vue', coOccurrencePercent: 98 },
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'tailwind-css', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'nuxt.com/docs',
  },
  wagmi: {
    youtube: { videoId: 'v7eFSeTq4mI', title: 'wagmi Tutorial', channel: 'EatTheBlocks', durationMinutes: 10 },
    docsUrl: 'https://wagmi.sh/react/getting-started',
    cliCommand: 'npm install wagmi viem @tanstack/react-query',
    cliLabel: 'Install wagmi',
    companions: [
      { slug: 'react', coOccurrencePercent: 91 },
      { slug: 'typescript', coOccurrencePercent: 83 },
      { slug: 'ethers-js', coOccurrencePercent: 69 },
    ],
    primaryLearnResource: 'wagmi.sh/react/getting-started',
  },
  chainlink: {
    youtube: { videoId: 'tIUHQ7sDoaU', title: 'Chainlink in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    docsUrl: 'https://docs.chain.link/getting-started/conceptual-overview',
    cliCommand: 'npm install @chainlink/contracts',
    cliLabel: 'Install Chainlink contracts',
    companions: [
      { slug: 'solidity', coOccurrencePercent: 88 },
      { slug: 'hardhat', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'Chainlink conceptual overview',
  },
}

export function getTechResources(slug: string): TechResources | null {
  return TECH_RESOURCES[slug] ?? null
}
