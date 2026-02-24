'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MagicCard } from '@/components/ui/magic-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    question: 'How are scores calculated?',
    answer:
      'Each technology score blends multiple signals like GitHub activity, job demand, developer discussion velocity, and ecosystem momentum. Scores are normalized so you can compare technologies side by side.',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Core rankings are refreshed every day using the latest available signal data. This keeps trend direction current while smoothing out short-lived noise spikes.',
  },
  {
    question: 'Is DevTrends really free?',
    answer:
      'Yes. The product is currently in open beta and free to use. No account or credit card is required to explore rankings, comparisons, and trend views.',
  },
  {
    question: 'Can this replace my own research?',
    answer:
      'Use it as a high-signal starting point, not a blind replacement. DevTrends helps you spot momentum and compare options faster, then you can validate with your role goals and project context.',
  },
  {
    question: 'Who is this best for?',
    answer:
      'Developers choosing what to learn next, teams evaluating stack direction, and career switchers trying to prioritize skills based on real market and community movement.',
  },
];

export default function LandingFAQ() {
  const [openItem, setOpenItem] = useState<string>('item-0');
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_65%)]" />
      <div className="absolute left-1/4 top-8 h-56 w-56 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-8 h-56 w-56 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />

      <div className="container relative mx-auto px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 14 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mb-10 text-center"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs">
              <HelpCircle className="mr-1.5 h-3 w-3" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Questions, answered clearly</h2>
            <p className="text-muted-foreground">
              Everything people ask before trusting a data-driven learning roadmap.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const itemId = `item-${index}`;
              const isOpen = openItem === itemId;

              return (
                <motion.div
                  key={item.question}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-2xl"
                >
                  <MagicCard
                    gradientColor={isOpen ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.10)'}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border bg-card/55 backdrop-blur-md transition-all',
                      isOpen ? 'border-orange-500/50 shadow-[0_10px_40px_rgba(249,115,22,0.15)]' : 'border-border/50'
                    )}
                  >
                    {isOpen && <BorderBeam size={220} duration={9} colorFrom="#f97316" colorTo="#f59e0b" />}
                    <Collapsible open={isOpen} onOpenChange={(nextOpen) => setOpenItem(nextOpen ? itemId : '')}>
                      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                        <span
                          className={cn(
                            'text-sm md:text-base font-semibold transition-colors',
                            isOpen ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {item.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                            isOpen && 'rotate-180 text-primary'
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </CollapsibleContent>
                    </Collapsible>
                  </MagicCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
