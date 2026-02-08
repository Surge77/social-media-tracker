# DevTrends - MCP Servers Setup Plan

## Why MCP Servers Matter

MCP (Model Context Protocol) servers extend Claude Code's capabilities. Without them, Claude codes blind — can't see the UI, uses outdated docs, builds components from scratch. With them, Claude can generate premium components, verify the UI visually, and always use up-to-date library APIs.

---

## MUST-INSTALL — Premium UI Generation

### 1. Magic UI MCP
- **What:** Exposes a library of premium animated React + Tailwind components via MCP
- **Components:** Marquees, blur-fade text, animated backgrounds, device mockups, sparkle effects, shimmer cards, animated grids
- **Why for DevTrends:** Instantly generate polished marketing sections, animated hero elements, premium dashboard cards without hand-coding complex CSS/Framer Motion
- **Setup:** https://magicui.design / Search for "magic-ui-mcp" on npm or GitHub

### 2. 21st.dev Magic MCP
- **What:** Beautiful shadcn-compatible premium components
- **Components:** Hero sections, bento grids, feature cards, testimonials, pricing tables, animated stat cards
- **Why for DevTrends:** Since we're on shadcn/ui, these drop right in with zero config. Makes the app look like a $200/year SaaS product
- **Setup:** https://21st.dev / Search for "21st-dev-mcp" on GitHub

### 3. v0 MCP
- **What:** Connects to Vercel's v0.dev — describe UI in words or drop a screenshot → get working React + Tailwind code
- **Components:** Any UI you can describe or show an image of
- **Why for DevTrends:** See a dashboard you like? Drop a screenshot and get replicated code. Fastest way to match a specific visual style
- **Setup:** Search for "v0-mcp" on GitHub

### 4. Figma MCP (Official by Figma)
- **What:** Reads live Figma design layers — hierarchy, auto-layout, variants, text styles, token references
- **Components:** Converts any Figma design into accurate code
- **Why for DevTrends:** If you create designs in Figma (free tier) or find a Figma template you like, Claude can generate pixel-accurate code from it
- **When:** Optional — install when/if you use Figma
- **Setup:** https://github.com/nicholasgriffintn/figma-mcp-server or search "figma-mcp"

---

## MUST-INSTALL — Build Quality & Verification

### 5. Playwright MCP
- **What:** Browser automation — opens localhost, interacts with pages, takes screenshots, validates UI
- **Why for DevTrends:** Without this, Claude codes blind. With it, Claude can:
  - Open http://localhost:3000 and see the rendered page
  - Click through navigation, verify layouts
  - Take screenshots to verify visual changes
  - Catch visual bugs before you even look
- **Setup:** https://github.com/nicholasgriffintn/playwright-mcp-server or `npm install @anthropic/mcp-playwright`

### 6. Context7 MCP
- **What:** Real-time, version-specific documentation for any library — delivered directly to Claude
- **Libraries it covers:** shadcn/ui, Tailwind CSS, Next.js, Recharts, Nivo, Supabase, Framer Motion, React Query, Zod, and thousands more
- **Why for DevTrends:** You're using 25+ packages. Without this, Claude sometimes uses outdated API patterns. With it, every code snippet references the latest docs
- **Setup:** https://github.com/nicholasgriffintn/context7-mcp-server or search "context7-mcp" — made by Upstash (open source)

### 7. Sequential Thinking MCP
- **What:** Structured step-by-step problem solving — mirrors human cognitive patterns
- **Why for DevTrends:** Complex tasks like designing the trend algorithm, data pipeline architecture, or multi-source aggregation logic benefit from methodical thinking instead of jumping to solutions
- **Setup:** Built into some Claude Code configurations, or search "sequential-thinking-mcp"

---

## NICE-TO-HAVE — Install Later

### 8. Next.js Optimizer MCP
- **What:** Optimizes Next.js apps using Cache Components, Partial Prerendering (PPR), and modern caching directives
- **Why for DevTrends:** When the app is built and you want to optimize performance — faster page loads, smarter caching
- **When:** After core features are done

### 9. Supabase MCP
- **What:** Manage Supabase directly — create tables, write migrations, manage auth rules, query data
- **Why for DevTrends:** Instead of copy-pasting SQL into the dashboard, Claude can directly create and modify your database schema
- **Setup:** https://github.com/supabase/mcp-server-supabase

### 10. GitHub MCP
- **What:** Create issues, manage PRs, read repo data directly
- **Why for DevTrends:** Useful when managing the repo — creating issues for tasks, reviewing PRs
- **When:** When you start using GitHub Issues for task tracking
- **Setup:** https://github.com/github/github-mcp-server

---

## INSTALL PRIORITY ORDER

```
Priority 1 (Install Before Building):
  1. Context7 MCP        → Correct, up-to-date code in every session
  2. Playwright MCP      → Claude can see and verify the UI it builds
  3. Supabase MCP        → Claude can manage DB directly

Priority 2 (Install For Premium UI):
  4. Magic UI MCP        → Premium animated components
  5. 21st.dev Magic MCP  → Beautiful shadcn-style components
  6. v0 MCP              → Generate UI from descriptions/screenshots

Priority 3 (Install When Needed):
  7. Sequential Thinking → Complex architecture decisions
  8. Figma MCP           → If you start using Figma designs
  9. Next.js Optimizer   → Performance tuning after features are done
  10. GitHub MCP         → Repo management
```

---

## HOW TO INSTALL MCP SERVERS

MCP servers are configured in Claude Code's settings file. The typical setup:

### Step 1: Find your Claude Code config
- Windows: `%APPDATA%\claude\config.json` or `~/.claude/config.json`
- Mac/Linux: `~/.claude/config.json`

### Step 2: Add server configuration
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    },
    "magic-ui": {
      "command": "npx",
      "args": ["-y", "magic-ui-mcp"]
    }
  }
}
```

### Step 3: Restart Claude Code
After editing the config, restart Claude Code for the MCP servers to connect.

**Note:** Exact package names and args may vary — check each server's GitHub repo for the latest install instructions.

---

## WHAT EACH MCP SERVER UNLOCKS

| Without MCP | With MCP |
|------------|----------|
| Claude writes UI code blind, can't verify | Playwright lets Claude see the rendered page |
| Claude may use outdated API patterns | Context7 gives latest docs for every library |
| You build components from scratch | Magic UI / 21st.dev gives premium pre-built components |
| You describe UI in words, hope Claude understands | v0 MCP lets you drop screenshots → get code |
| You copy-paste SQL into Supabase dashboard | Supabase MCP lets Claude manage DB directly |
| Complex problems get rushed solutions | Sequential Thinking forces step-by-step reasoning |

---

## SOURCES

- https://www.builder.io/blog/best-mcp-servers-2026
- https://apidog.com/blog/top-10-mcp-servers-for-claude-code/
- https://mcpcat.io/guides/best-mcp-servers-for-claude-code/
- https://desktopcommander.app/blog/2025/11/25/best-mcp-servers/
- https://github.com/punkpeye/awesome-mcp-servers
