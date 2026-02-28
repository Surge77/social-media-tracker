/**
 * Project ideas generator.
 * Generates a weekend-sized project idea for a given technology + goal + level.
 * Pattern follows tech-insight.ts exactly.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'

export interface ProjectIdea {
  name: string
  description: string
  starterSnippet: string
  starterSnippetLanguage: string
  successCondition: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
}

export async function generateProjectIdea(
  slug: string,
  techName: string,
  goal: string,
  level: string,
  provider: AIProvider
): Promise<ProjectIdea> {
  const prompt = buildProjectPrompt(slug, techName, goal, level)

  const options: GenerateOptions = {
    temperature: 0.7,
    maxTokens: 1024,
  }

  return provider.generateJSON<ProjectIdea>(prompt, undefined, options)
}

function buildProjectPrompt(slug: string, techName: string, goal: string, level: string): string {
  return `Generate a weekend project idea for learning ${techName} (${slug}).

Learner goal: ${goal}
Experience level: ${level}

Return a JSON object with these exact fields:
- name: string — short project name (2-4 words, e.g. "Habit Tracker API")
- description: string — one sentence describing the project
- starterSnippet: string — 10-20 lines of real, runnable ${techName} code to get started
- starterSnippetLanguage: string — programming language name (e.g. "typescript", "python", "solidity")
- successCondition: string — "You're done when…" sentence describing a concrete success metric
- difficulty: "beginner" | "intermediate" | "advanced"
- estimatedHours: number — realistic hours for a weekend session (1–8)

Make the project concrete, achievable, and directly relevant to the goal. The starter snippet should be real code that actually works with ${techName}.`
}

/** Fallback templates when AI is unavailable */
export function getFallbackProjectIdea(slug: string, level: string): ProjectIdea {
  const templates: Record<string, ProjectIdea> = {
    react: {
      name: 'Task Manager UI',
      description: 'A React app to add, complete, and delete daily tasks with local storage persistence.',
      starterSnippet: `import { useState } from 'react'

export default function TaskManager() {
  const [tasks, setTasks] = useState<string[]>([])
  const [input, setInput] = useState('')

  const addTask = () => {
    if (!input.trim()) return
    setTasks(prev => [...prev, input])
    setInput('')
  }

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  )
}`,
      starterSnippetLanguage: 'typescript',
      successCondition: "You're done when you can add tasks, check them off, and they persist after a page refresh.",
      difficulty: level === 'beginner' ? 'beginner' : 'intermediate',
      estimatedHours: 4,
    },
    typescript: {
      name: 'Type-Safe CLI Tool',
      description: 'A command-line tool with full TypeScript types that processes JSON files.',
      starterSnippet: `import { readFileSync, writeFileSync } from 'fs'

interface Config {
  input: string
  transform: 'uppercase' | 'lowercase'
}

function processFile(config: Config): void {
  const content = readFileSync(config.input, 'utf-8')
  const result = config.transform === 'uppercase'
    ? content.toUpperCase()
    : content.toLowerCase()
  writeFileSync('output.txt', result)
  console.log('Done!')
}

processFile({ input: 'input.txt', transform: 'uppercase' })`,
      starterSnippetLanguage: 'typescript',
      successCondition: "You're done when the CLI tool compiles with no errors and correctly transforms a sample file.",
      difficulty: 'beginner',
      estimatedHours: 3,
    },
    nodejs: {
      name: 'REST Notes API',
      description: 'A Node.js REST API for creating and reading notes with in-memory storage.',
      starterSnippet: `import express from 'express'
const app = express()
app.use(express.json())

const notes: { id: number; text: string }[] = []
let nextId = 1

app.get('/notes', (_, res) => res.json(notes))
app.post('/notes', (req, res) => {
  const note = { id: nextId++, text: req.body.text }
  notes.push(note)
  res.status(201).json(note)
})

app.listen(3000, () => console.log('API running on :3000'))`,
      starterSnippetLanguage: 'typescript',
      successCondition: "You're done when POST /notes creates a note and GET /notes returns the full list.",
      difficulty: 'beginner',
      estimatedHours: 3,
    },
    postgresql: {
      name: 'Inventory Tracker',
      description: 'A simple inventory database with products and stock levels, queried via SQL.',
      starterSnippet: `-- Create the schema
CREATE TABLE products (
  id     SERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  sku    TEXT UNIQUE NOT NULL,
  stock  INTEGER NOT NULL DEFAULT 0,
  price  NUMERIC(10,2)
);

-- Seed some data
INSERT INTO products (name, sku, stock, price) VALUES
  ('Keyboard', 'KB-001', 50, 79.99),
  ('Mouse',    'MS-001', 80, 29.99);

-- Query low stock
SELECT name, stock FROM products WHERE stock < 20;`,
      starterSnippetLanguage: 'sql',
      successCondition: "You're done when you can add products, update stock levels, and query low-stock items.",
      difficulty: 'beginner',
      estimatedHours: 2,
    },
    docker: {
      name: 'Containerized API',
      description: 'Dockerize an existing web API with a Dockerfile and docker-compose setup.',
      starterSnippet: `# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]`,
      starterSnippetLanguage: 'dockerfile',
      successCondition: "You're done when docker compose up starts your API and it responds to requests on localhost:3000.",
      difficulty: level === 'beginner' ? 'beginner' : 'intermediate',
      estimatedHours: 3,
    },
    solidity: {
      name: 'Simple Token Contract',
      description: 'An ERC-20 style token contract with mint, transfer, and balance functions.',
      starterSnippet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "MyToken";
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 amount);

    function mint(address to, uint256 amount) external {
        balances[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }
}`,
      starterSnippetLanguage: 'solidity',
      successCondition: "You're done when you can mint tokens, transfer them between addresses, and verify balances in Hardhat tests.",
      difficulty: 'intermediate',
      estimatedHours: 4,
    },
  }

  return templates[slug] ?? {
    name: 'Hello World App',
    description: `A minimal app demonstrating core ${slug} concepts.`,
    starterSnippet: `// Start here — replace with your first ${slug} code`,
    starterSnippetLanguage: 'typescript',
    successCondition: "You're done when the app runs without errors and displays output.",
    difficulty: level as 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: 3,
  }
}
