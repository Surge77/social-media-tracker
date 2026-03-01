/**
 * Technology icon mapping: our DB slugs → Simple Icons data.
 *
 * Covers all 117 technologies tracked by DevTrends.
 * Returns undefined for techs not in simple-icons — TechIcon falls back to a
 * colored circle with the tech's initial.
 */

import type { SimpleIcon } from 'simple-icons'
import {
  // Languages
  siC, siCplusplus, siDart, siElixir, siGo, siHaskell, siJavascript,
  siKotlin, siLua, siPhp, siPython, siR, siRuby, siRust,
  siScala, siSwift, siTypescript, siZig,
  // Frontend
  siAngular, siAstro, siBootstrap, siHtmx, siJquery, siLit,
  siNextdotjs, siNuxt, siQwik, siReact, siRemix, siSolid, siSvelte,
  siTailwindcss, siVuedotjs,
  // Backend
  siDjango, siDotnet, siExpress, siFastapi, siFastify, siFlask,
  siGin, siHono, siLaravel, siNestjs, siNodedotjs, siPhoenixframework,
  siRubyonrails, siSpring,
  // Database
  siApachecassandra, siClickhouse, siElasticsearch, siMongodb, siMysql,
  siNeo4j, siPlanetscale, siPostgresql, siRedis, siSqlite, siSupabase, siTurso,
  // DevOps
  siAnsible, siDocker, siGithubactions, siGrafana, siJenkins, siKubernetes,
  siNginx, siPrometheus, siPulumi, siTerraform,
  // Cloud
  siCloudflare, siDigitalocean, siFlydotio, siGooglecloud, siNetlify,
  siRailway, siRender, siVercel,
  // Mobile
  siCapacitor, siElectron, siExpo, siFlutter, siJetpackcompose, siTauri,
  // AI/ML
  siHuggingface, siLangchain, siOllama, siPytorch, siScikitlearn, siTensorflow,
  // Blockchain — direct icons
  siChainlink, siIpfs, siOpenzeppelin, siSolidity, siWagmi,
  // Blockchain — ecosystem proxy icons (best available match)
  siEthereum, siPolkadot, siSolana, siTon, siSui,
  // Blockchain networks
  siPolygon,
  // Tooling
  siGraphql, siVite, siPrisma,
} from 'simple-icons'

/** Map from our DB slug → Simple Icons icon data. Missing = use fallback. */
export const TECH_ICON_MAP: Partial<Record<string, SimpleIcon>> = {
  // ---- Languages ----
  c:            siC,
  cpp:          siCplusplus,
  // csharp → handled by CDN override in TechIcon (Devicons has the real C# logo)
  dart:         siDart,
  elixir:       siElixir,
  go:           siGo,
  haskell:      siHaskell,
  // java → handled by CDN override in TechIcon (Devicons has the real Java logo)
  javascript:   siJavascript,
  kotlin:       siKotlin,
  lua:          siLua,
  php:          siPhp,
  python:       siPython,
  r:            siR,
  ruby:         siRuby,
  rust:         siRust,
  scala:        siScala,
  swift:        siSwift,
  typescript:   siTypescript,
  zig:          siZig,

  // ---- Frontend ----
  angular:        siAngular,
  astro:          siAstro,
  bootstrap:      siBootstrap,
  htmx:           siHtmx,
  jquery:         siJquery,
  lit:            siLit,
  nextjs:         siNextdotjs,
  nuxt:           siNuxt,
  qwik:           siQwik,
  react:          siReact,
  remix:          siRemix,
  solidjs:        siSolid,
  svelte:         siSvelte,
  tailwindcss:    siTailwindcss,
  vue:            siVuedotjs,

  // ---- Backend ----
  django:         siDjango,
  dotnet:         siDotnet,
  express:        siExpress,
  fastapi:        siFastapi,
  fastify:        siFastify,
  fiber:          siGo,           // Go Fiber → Go icon
  flask:          siFlask,
  gin:            siGin,
  hono:           siHono,
  laravel:        siLaravel,
  nestjs:         siNestjs,
  nodejs:         siNodedotjs,
  phoenix:        siPhoenixframework,
  rails:          siRubyonrails,
  'spring-boot':  siSpring,

  // ---- Database ----
  cassandra:      siApachecassandra,
  clickhouse:     siClickhouse,
  dragonfly:      siRedis,        // Redis-compatible → Redis icon
  elasticsearch:  siElasticsearch,
  mongodb:        siMongodb,
  mysql:          siMysql,
  neo4j:          siNeo4j,
  neon:           siPostgresql,   // Neon is serverless Postgres
  planetscale:    siPlanetscale,
  postgresql:     siPostgresql,
  redis:          siRedis,
  sqlite:         siSqlite,
  supabase:       siSupabase,
  turso:          siTurso,
  // dynamodb → CDN override in TechIcon (Devicons dynamodb-original)

  // ---- DevOps ----
  ansible:          siAnsible,
  docker:           siDocker,
  'github-actions': siGithubactions,
  grafana:          siGrafana,
  jenkins:          siJenkins,
  kubernetes:       siKubernetes,
  nginx:            siNginx,
  prometheus:       siPrometheus,
  pulumi:           siPulumi,
  terraform:        siTerraform,

  // ---- Cloud ----
  // aws → CDN override in TechIcon (Devicons amazonwebservices-plain-wordmark)
  // azure → CDN override in TechIcon (Devicons azure-original)
  'cloudflare-workers': siCloudflare,
  digitalocean:     siDigitalocean,
  'fly-io':         siFlydotio,
  gcp:              siGooglecloud,
  netlify:          siNetlify,
  railway:          siRailway,
  render:           siRender,
  vercel:           siVercel,

  // ---- Mobile ----
  capacitor:        siCapacitor,
  electron:         siElectron,
  expo:             siExpo,
  flutter:          siFlutter,
  'jetpack-compose': siJetpackcompose,
  'react-native':   siReact,      // Use React icon
  swiftui:          siSwift,      // Use Swift icon
  tauri:            siTauri,

  // ---- AI/ML ----
  huggingface:      siHuggingface,
  langchain:        siLangchain,
  ollama:           siOllama,
  // openai-api → CDN override in TechIcon (/icons/openai.svg — teal fill, theme-safe)
  pytorch:          siPytorch,
  'scikit-learn':   siScikitlearn,
  tensorflow:       siTensorflow,

  // ---- Blockchain ----
  // bitcoin → CDN override in TechIcon (spothq btc.svg)
  // ethereum → CDN override in TechIcon (spothq eth.svg — SI hex is near-black)
  solana:             siSolana,
  polygon:            siPolygon,
  // aave → CDN override in TechIcon (spothq cryptocurrency-icons)
  'anchor-framework': siSolana,     // Anchor is Solana's smart contract framework
  'cairo-lang':       siEthereum,   // Cairo is StarkNet (Ethereum L2) language
  chainlink:          siChainlink,
  clarity:            siEthereum,   // Clarity is Stacks (Bitcoin L2) — Ethereum logo as closest match
  foundry:            siEthereum,   // Foundry is an Ethereum dev toolkit
  // hardhat → CDN override in TechIcon (Devicons)
  'ink-lang':         siPolkadot,   // Ink! is Polkadot/Substrate's smart contract language
  ipfs:               siIpfs,
  'move-lang':        siSui,        // Move language used by Sui (and Aptos)
  openzeppelin:       siOpenzeppelin,
  solidity:           siSolidity,
  tact:               siTon,        // Tact is the TON blockchain smart contract language
  // the-graph → CDN override in TechIcon (spothq/grt)
  // uniswap → CDN override in TechIcon (spothq/uni)
  // vyper → CDN override in TechIcon (Devicons)
  wagmi:              siWagmi,

  // ---- Tooling (in resources.ts but not DB) ----
  graphql:          siGraphql,
  prisma:           siPrisma,
  vite:             siVite,
}

/**
 * Get Simple Icon data for a technology slug.
 * Returns undefined if no icon found — caller should render a colored fallback.
 */
export function getTechIcon(slug: string): SimpleIcon | undefined {
  return TECH_ICON_MAP[slug]
}
