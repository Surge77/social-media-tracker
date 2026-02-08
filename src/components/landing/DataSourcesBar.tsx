'use client';

import { motion } from 'framer-motion';
import { Github, MessageSquare, Code2, Rss, Newspaper } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const sources = [
  { name: 'GitHub', icon: Github },
  { name: 'Hacker News', icon: MessageSquare },
  { name: 'Stack Overflow', icon: Code2 },
  { name: 'Dev.to', icon: Rss },
  { name: 'NewsAPI', icon: Newspaper },
];

export default function DataSourcesBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-12 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-6">
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-8 font-medium"
        >
          Data sources ingested from across the web
        </motion.p>

        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <motion.div
                key={source.name}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-center gap-2.5 text-muted-foreground/60 hover:text-foreground transition-colors group"
              >
                <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">{source.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
