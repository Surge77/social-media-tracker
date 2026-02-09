# DevTrends: Complete Algorithm & Intelligence Stack

## 1. ENTITY RESOLUTION & TAXONOMY MATCHING

### The Problem
"React", "ReactJS", "React.js", "react", "reactjs", "facebook/react" — these are all the same thing across different platforms. HN uses free-text titles, GitHub uses repo names, SO uses tags, job postings use whatever the recruiter typed. You need to resolve all of these to a single canonical entity.

### Techniques

**A. Fuzzy String Matching (Baseline)**
```
Algorithm: Levenshtein Distance + Jaro-Winkler Similarity

- Levenshtein: minimum edits (insert, delete, substitute) to transform
  string A into string B
- Jaro-Winkler: weighted similarity favoring matching prefixes
  (good for "React" vs "ReactJS" where prefix matches)

Example:
  levenshtein("reactjs", "react.js") = 1
  jaro_winkler("reactjs", "react") = 0.94 (high prefix match)

Use case: Catch obvious aliases you missed in your manual taxonomy
```

**B. TF-IDF + Cosine Similarity for Context Matching**
```
When fuzzy matching alone is ambiguous (is "Spring" the Java framework
or the season?), use surrounding context:

1. For each mention, extract surrounding text (title, description, tags)
2. Convert to TF-IDF vectors
3. Compare cosine similarity against known technology profiles

Example:
  "Spring Boot REST API microservices" → TF-IDF vector →
  cosine_sim(known_spring_framework_profile) = 0.89 → It's Spring Framework

  "Spring 2026 fashion trends" → TF-IDF vector →
  cosine_sim(known_spring_framework_profile) = 0.03 → Not a tech mention
```

**C. Alias Dictionary + Regex Patterns (Most Practical)**
```
For a curated product, a hand-maintained alias dictionary outperforms
ML for the first 300 technologies:

{
  "react": {
    "canonical": "React",
    "aliases": ["reactjs", "react.js", "react js"],
    "github": ["facebook/react"],
    "npm": ["react", "react-dom"],
    "so_tags": ["reactjs", "react-hooks", "react-router"],
    "regex": "\\breact(?:\\.?js)?\\b",
    "disambiguation": {
      "requires_context": false,
    }
  },
  "spring": {
    "canonical": "Spring Framework",
    "aliases": ["spring boot", "spring framework", "spring mvc"],
    "disambiguation": {
      "requires_context": true,
      "positive_signals": ["java", "boot", "mvc", "microservice", "bean", "hibernate"],
      "negative_signals": ["season", "weather", "fashion"]
    }
  }
}
```

**D. For ambiguous cases — Naive Bayes Classifier**
```
Train a simple classifier on labeled examples:

Features: words in title/description, source platform, tags present
Labels: is_tech_mention (true/false), which_technology (if true)

Naive Bayes works well here because:
- Fast to train and predict
- Works with small training sets (500 manually labeled examples)
- Handles high-dimensional sparse text features naturally

P(technology=React | words) = P(words | React) * P(React) / P(words)
```

**Practical recommendation:** Start with technique C (alias dictionary). It handles 95% of cases. Add B and D only when you encounter ambiguity at scale.

---

## 2. SENTIMENT ANALYSIS

### The Problem
A HN post titled "Why I'm mass-abandoning React" and "React 19 is incredible" are both mentions of React, but carry opposite signals. You need to classify mentions as positive, negative, or neutral to weight them correctly in your scoring.

### Techniques

**A. Lexicon-Based Sentiment (Simple, No ML)**
```
How it works:
1. Maintain a sentiment lexicon (word → score):
   "amazing": +0.8, "terrible": -0.9, "decent": +0.2, "broken": -0.7

2. For tech-specific context, add domain words:
   "deprecated": -0.6, "stable": +0.3, "bloated": -0.5,
   "performant": +0.7, "legacy": -0.4, "innovative": +0.8

3. Handle negation:
   "not good" → flip polarity of "good"
   "isn't terrible" → flip polarity of "terrible"

4. Score = sum(word_sentiments) / word_count

Pros: Fast, interpretable, no training data needed
Cons: Misses sarcasm, complex sentences, context-dependent meanings
Accuracy: ~65-70% on tech discussions (good enough for aggregation)
```

**B. VADER (Valence Aware Dictionary and sEntiment Reasoner)**
```
Pre-built rule-based sentiment tool, specifically tuned for social media:

- Handles: capitalization ("AMAZING" > "amazing"), punctuation ("great!!!" > "great"),
  negation, degree modifiers ("very good" > "good"), conjunctions ("good but not great")
- Returns: compound score (-1 to +1), positive/negative/neutral ratios

Best for: HN comments, Reddit posts, Dev.to article titles
Accuracy: ~72-75% on social media text

This is your best starting point. No ML needed, works out of the box.
```

**C. Fine-tuned Transformer (When You Need More Accuracy)**
```
Take a pre-trained model like distilbert-base-uncased and fine-tune it
on tech-specific sentiment:

1. Collect 2000-5000 HN/Reddit comments about technologies
2. Label them: positive, negative, neutral
3. Fine-tune for 3-5 epochs

Why distilbert:
- 6x faster than BERT, 97% of its accuracy
- Small enough to run on a CPU in a serverless function
- ~66MB model size

Architecture:
  Input text → DistilBERT encoder → [CLS] token embedding →
  Linear layer → Softmax → {positive, negative, neutral}

Accuracy: ~82-88% after fine-tuning on tech domain
```

**D. LLM-Based Sentiment (Highest Quality, Higher Cost)**
```
Use an LLM API (Claude, GPT) for batch sentiment analysis:

Prompt: "Classify the sentiment toward {technology} in this text.
Return: positive, negative, neutral, and a confidence score 0-1.
Text: {text}"

When to use:
- For high-value content (top HN posts, viral Reddit threads)
- For ambiguous cases flagged by VADER
- For generating training data for technique C

Cost management:
- Don't run on every mention (too expensive)
- Use for top 100 mentions per day per technology
- Use VADER for everything else
- Batch API calls for cost efficiency
```

**Practical recommendation:** Start with VADER for everything. When you have enough labeled data (from manual review or LLM-assisted labeling), train a DistilBERT classifier. Use LLM only for ambiguous edge cases.

---

## 3. TIME SERIES ANALYSIS & FORECASTING

### The Problem
You're collecting data points over time (GitHub stars per day, HN mentions per week, job postings per month). You need to detect trends, seasonality, and predict future directions.

### Techniques

**A. Moving Averages (Foundation)**
```
Simple Moving Average (SMA):
  SMA(t, window=7) = mean(values[t-6 : t+1])
  Use: Smooth out daily noise to see weekly trends

Exponential Moving Average (EMA):
  EMA(t) = alpha * value(t) + (1 - alpha) * EMA(t-1)
  alpha = 2 / (window + 1)
  Use: More responsive to recent changes than SMA

Weighted Moving Average (WMA):
  Recent values get higher weights
  WMA(t) = sum(weight_i * value_i) / sum(weights)
  Use: Custom decay for your scoring algorithm
```

**B. Rate of Change (ROC) — Momentum Detection**
```
ROC = (current_value - value_n_periods_ago) / value_n_periods_ago * 100

Example:
  React job postings this month: 1,200
  React job postings 3 months ago: 900
  ROC = (1200 - 900) / 900 * 100 = +33.3%

Refinement — Acceleration:
  acceleration = ROC(current) - ROC(previous_period)

  If ROC is positive but acceleration is negative → growth is slowing
  If ROC is positive and acceleration is positive → growth is accelerating
```

**C. Seasonal Decomposition (STL)**
```
Tech trends have seasonality:
- January: "New Year, new framework" effect
- September: Back-to-school, new bootcamp cohorts
- Conference seasons: Specific techs spike around their conferences

STL (Seasonal and Trend decomposition using Loess):
  observed_data = trend + seasonal + residual

1. Extract the trend (long-term direction)
2. Extract seasonality (repeating patterns)
3. Residual = what's left (actual signal vs noise)

Why this matters: Without decomposition, you might think "Vue is
trending!" when actually it's just the annual VueConf buzz.
```

**D. Exponential Smoothing (Holt-Winters)**
```
Extends EMA to handle both trend and seasonality:

Three components:
  Level (l): current baseline value
  Trend (b): current growth rate
  Seasonal (s): seasonal adjustment factor

Forecast: F(t+h) = (l(t) + h*b(t)) * s(t+h-m)

Parameters (alpha, beta, gamma) control how quickly the model
adapts to new data vs. relying on historical patterns.
```

**E. Change Point Detection (PELT / BOCPD)**
```
Detect when a technology's trajectory fundamentally changes:

PELT (Pruned Exact Linear Time):
- Finds points where the statistical properties of the time series change
- "React's growth rate was 5% monthly, then suddenly shifted to 15%"

BOCPD (Bayesian Online Change Point Detection):
- Real-time version — detects changes as data streams in

Output: timestamps where significant changes occurred + confidence scores

Powers insights like: "Svelte's momentum shifted significantly
on March 15 — coinciding with the SvelteKit 2.0 announcement"
```

**F. Prophet (Facebook's Forecasting Library)**
```
Built specifically for business time series with:
- Multiple seasonality (weekly, monthly, yearly)
- Holiday/event effects (conference dates, major releases)
- Trend changepoints (automatic detection)
- Missing data handling

Why Prophet over ARIMA:
- Handles missing data (ARIMA can't)
- Human-interpretable parameters
- Built-in uncertainty intervals
- Works well with daily/weekly tech data

Use case: "Based on current trajectory, Bun.js is projected to
overtake Deno in GitHub stars by Q3 2026 (70% confidence)"
```

**Practical recommendation:** Start with Moving Averages + ROC. Add STL decomposition when you have 6+ months of data. Add Prophet for forecasting when you want prediction features.

---

## 4. THE COMPOSITE SCORING ENGINE

### The Problem
You have signals from 6+ sources measured in completely different units. How do you combine them into a single meaningful score?

### Techniques

**A. Min-Max Normalization (Per Source)**
```
normalized = (value - min) / (max - min)

Use ROLLING min/max (last 90 days), not all-time:
- All-time: JavaScript will always be #1. Boring and useless.
- Rolling: Shows relative momentum.

Per-category normalization:
- Don't compare "React" to "Zig" on absolute numbers
- Normalize within categories: React vs Vue vs Angular vs Svelte
```

**B. Z-Score Normalization (Better for Outlier Handling)**
```
z_score = (value - mean) / standard_deviation

Interpretation:
  z = 0: average for this metric
  z = +2: 2 standard deviations above average
  z = -1: slightly below average

Why better than min-max:
- Not skewed by extreme outliers
- Statistically meaningful: z > 2 is genuinely exceptional
```

**C. Weighted Multi-Signal Aggregation**
```
CompositeScore = Σ(weight_i * source_score_i) / Σ(weight_i)

Default weights:
  GitHub Activity:    0.25  (stars, forks, contributors, issues)
  Job Market:         0.25  (posting count, salary, growth rate)
  Community Buzz:     0.20  (HN + Reddit + Dev.to combined)
  Stack Overflow:     0.15  (questions, answer rate, view counts)
  Ecosystem Health:   0.15  (npm downloads, package dependents)

Adaptive weights:
  For "trending" score: increase community weight (early signal)
  For "career value" score: increase job market weight
  For "maturity" score: increase SO + ecosystem weight
```

**D. Bayesian Rating (Handle Sparse Data)**
```
Problem: New technologies have few data points. Raw averages are unreliable.

bayesian_score = (C * m + S * n) / (C + n)

Where:
  n = number of observations for this technology
  S = raw average score
  C = minimum observations threshold (e.g., 50 mentions)
  m = global average across all technologies

Effect: Technologies with few data points get pulled toward the
global average. Technologies with many data points reflect their true score.
```

**E. Rank Aggregation (Combining Rankings from Multiple Sources)**
```
Each source produces a ranking of technologies:
  GitHub ranking:  1.Rust  2.Python  3.TypeScript
  Jobs ranking:    1.Python 2.React   3.Java
  HN ranking:      1.Rust  2.Go      3.Zig

Borda Count:
  Score = Σ(N - rank_in_source) for each source

Kemeny-Young:
  Find the ranking that minimizes total disagreement with all source rankings

Why rank aggregation:
- Handles different scales automatically
- Robust to outliers
- Mathematically principled (social choice theory)
```

**Practical recommendation:** Use Z-score normalization + Weighted aggregation + Bayesian smoothing. Add rank aggregation as a validation check.

---

## 5. ANOMALY DETECTION

### The Problem
Detect unusual events: sudden spikes, sudden drops, or unusual patterns (bot manipulation).

### Techniques

**A. Statistical Threshold (Simple)**
```
Flag as anomaly if: |z_score| > 3

Example:
  Average daily HN mentions for Deno: 5, Std dev: 2
  Today's mentions: 45
  z_score = (45 - 5) / 2 = 20 → ANOMALY
```

**B. IQR (Interquartile Range) Method**
```
Q1 = 25th percentile, Q3 = 75th percentile
IQR = Q3 - Q1
Lower bound = Q1 - 1.5 * IQR
Upper bound = Q3 + 1.5 * IQR

More robust than z-score for non-normal distributions.
```

**C. Isolation Forest (For Multivariate Anomalies)**
```
Detects anomalies across MULTIPLE metrics simultaneously.

Example: Normal GitHub activity + zero community mentions
= possible star-buying/bot activity

How it works:
1. Randomly select a feature
2. Randomly select a split value
3. Build a tree — anomalies are isolated in fewer splits
4. Build 100+ trees, average the isolation depth

Score: 0 to 1 (closer to 1 = more anomalous)
```

**D. CUSUM (Cumulative Sum Control Chart)**
```
Detects small, persistent shifts that z-score might miss:

S(t) = max(0, S(t-1) + (x(t) - target - allowance))

When S(t) exceeds threshold → shift detected

Perfect for detecting slow-building trends before they become obvious.
```

---

## 6. NATURAL LANGUAGE PROCESSING (Beyond Sentiment)

### A. Named Entity Recognition (NER) for Technology Extraction
```
Extract technology mentions from unstructured text.

Approach 1: Regex + Dictionary (start here)
Approach 2: SpaCy with custom NER model (train on 1000 labeled tech articles)
Approach 3: LLM-based extraction (highest accuracy, higher cost)
```

### B. Topic Modeling (LDA / BERTopic)
```
Discover WHAT people are discussing about each technology:

Input: 5,000 HN comments mentioning React
Output: Topic clusters:
  Topic 1 (30%): "server components, RSC, streaming, SSR"
  Topic 2 (25%): "state management, Redux, Zustand, signals"
  Topic 3 (20%): "performance, virtual DOM, reconciliation"

BERTopic (recommended over LDA):
  1. Generate embeddings (sentence-transformers)
  2. Reduce dimensions (UMAP)
  3. Cluster (HDBSCAN)
  4. Extract topic representations (c-TF-IDF)
```

### C. Keyword Extraction (RAKE / YAKE / KeyBERT)
```
KeyBERT approach:
  1. Generate document embedding
  2. Generate embeddings for all n-grams (1-3 words)
  3. Find n-grams most similar to document embedding
```

### D. Summarization (For Digests)
```
Extractive: TextRank algorithm (like PageRank for sentences)
Abstractive: LLM-based ("Summarize this week's key developments for React")
```

---

## 7. RECOMMENDATION & SIMILARITY

### A. Technology Co-occurrence Analysis
```
From job postings and GitHub repos, build a co-occurrence matrix.

Pointwise Mutual Information (PMI):
  PMI(x,y) = log2(P(x,y) / (P(x) * P(y)))

High PMI = technologies appear together more than random chance.
```

### B. Collaborative Filtering (Stack-Based)
```
"Developers who use [React, TypeScript, Tailwind] also tend to
use [Next.js, Prisma, Vercel]"

similarity(tech_A, tech_B) = cosine_similarity(
  users_who_use_A_vector,
  users_who_use_B_vector
)
```

### C. Knowledge Graph Embeddings
```
Represent technology taxonomy as a graph.
Use Node2Vec or TransE for vector representations.
Similar technologies = similar vectors.
```

### D. Career Path Mining (Sequential Pattern Mining)
```
From profile histories, find common career paths:

  jQuery → React → Next.js → Full-stack
  Python → Django → FastAPI → Microservices

Algorithm: PrefixSpan or GSP
Input: sequences of technologies adopted over time
Output: frequent subsequences with support counts
```

---

## 8. DATA QUALITY & NOISE REDUCTION

### A. Deduplication
```
MinHash for near-duplicate detection:
  1. Convert document to shingles (n-grams)
  2. Apply multiple hash functions
  3. Keep minimum hash value per function
  4. Similar signatures = near-duplicates

Threshold: Jaccard similarity > 0.8 → treat as duplicate
```

### B. Bot/Spam Filtering
```
Signals of manipulation:
  - Sudden star spikes with no community discussion
  - Stars from accounts with no other activity
  - Identical comments across platforms
  - Engagement patterns that don't match organic growth

Heuristic filters + Isolation Forest for multivariate detection
```

### C. Source Reliability Weighting
```
                  Adoption  Sentiment  Job Market  Innovation
GitHub              0.9       0.3        0.1         0.8
HN                  0.4       0.7        0.1         0.9
SO                  0.8       0.4        0.2         0.3
Job Boards          0.3       0.1        0.9         0.2
Reddit              0.3       0.6        0.1         0.7
```

---

## 9. GRAPH ALGORITHMS (Technology Ecosystem Mapping)

### A. PageRank for Technology Importance
```
Build dependency graph from package managers (npm, pip, cargo).
Apply PageRank — technologies depended on by many important
packages score higher.
```

### B. Community Detection (Louvain Algorithm)
```
Find natural clusters:
  Cluster 1: React, Next.js, Tailwind, TypeScript, Vercel
  Cluster 2: Python, FastAPI, SQLAlchemy, Celery
  Cluster 3: Rust, Tokio, Actix, Wasm

Algorithm: Louvain method — maximizes modularity
```

### C. Centrality Measures
```
Betweenness: Technologies that bridge different ecosystems
Degree: Technologies with most connections
Closeness: Technologies close to everything else
```

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Week 1-2)
```
1. Alias Dictionary (Entity Resolution - 1C)
2. Min-Max / Z-Score Normalization (Scoring - 4A/4B)
3. Weighted Aggregation (Scoring - 4C)
4. Simple Moving Average + ROC (Time Series - 3A/3B)
5. Z-Score Anomaly Detection (Anomaly - 5A)
```

### Phase 2: Intelligence (Week 3-4)
```
6. VADER Sentiment Analysis (Sentiment - 2B)
7. Bayesian Rating (Scoring - 4D)
8. Technology Co-occurrence (Recommendation - 7A)
9. Deduplication with MinHash (Data Quality - 8A)
10. STL Seasonal Decomposition (Time Series - 3C)
```

### Phase 3: Advanced (Month 2-3)
```
11. BERTopic for discussion themes (NLP - 6B)
12. Change Point Detection (Time Series - 3E)
13. PageRank for ecosystem importance (Graph - 9A)
14. Prophet for forecasting (Time Series - 3F)
15. Isolation Forest for manipulation detection (Anomaly - 5C)
```

### Phase 4: Polish (Month 3+)
```
16. Fine-tuned DistilBERT sentiment (Sentiment - 2C)
17. Community Detection (Graph - 9B)
18. Career Path Mining (Recommendation - 7D)
19. KeyBERT extraction (NLP - 6C)
20. LLM-powered summaries (NLP - 6D)
```

---

## 11. WHAT RUNS WHERE

```
Serverless Functions (Vercel/Supabase Edge):
  - API endpoints serving computed scores
  - Simple computations (normalization, aggregation, ROC)
  - VADER sentiment (lightweight, JS-native)

Supabase Database (PostgreSQL):
  - All raw collected data
  - Computed scores and aggregations
  - Technology taxonomy
  - Time-series data
  - Full-text search for technology matching

Scheduled Jobs (Vercel Cron / Supabase pg_cron):
  - Daily: fetch GitHub, SO, job board data
  - Hourly: fetch HN, Reddit, Dev.to
  - Daily: run scoring pipeline, update composites
  - Weekly: run topic modeling, update recommendations

External Microservice (if needed, small Python service):
  - BERTopic, SpaCy NER, Prophet forecasting
  - Only needed for Phase 3+ techniques
  - Can run on Railway/Fly.io cheaply
```
