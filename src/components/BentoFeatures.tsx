'use client';

import { motion } from 'framer-motion';
import { Code2, GraduationCap, Briefcase, TrendingUp, Rocket, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Code2,
    title: 'Technology Tracking',
    description: 'Monitor trending technologies and frameworks in real-time across multiple sources.',
    gradient: 'from-blue-500/10 via-cyan-500/10 to-transparent',
  },
  {
    icon: TrendingUp,
    title: 'Skill Velocity',
    description: 'Track which technologies are rising or declining with visual trend analytics.',
    gradient: 'from-purple-500/10 via-pink-500/10 to-transparent',
  },
  {
    icon: GraduationCap,
    title: 'Learning Roadmap',
    description: 'Get personalized recommendations on skills to learn based on market demand.',
    gradient: 'from-green-500/10 via-emerald-500/10 to-transparent',
  },
  {
    icon: Briefcase,
    title: 'Job Market Insights',
    description: 'Understand employer demands and align your skills with market opportunities.',
    gradient: 'from-orange-500/10 via-amber-500/10 to-transparent',
  },
  {
    icon: Rocket,
    title: 'Career Intelligence',
    description: 'Make data-driven career decisions powered by thousands of tech discussions.',
    gradient: 'from-violet-500/10 via-indigo-500/10 to-transparent',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Stay current with continuously refreshed data from top developer communities.',
    gradient: 'from-yellow-500/10 via-red-500/10 to-transparent',
  },
];

export default function BentoFeatures() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1.5" />
              Powerful Features
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            Your developer career,{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              supercharged
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Everything you need to make smarter learning decisions and stay ahead in tech.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={index === 0 || index === 4 ? "md:col-span-2 lg:col-span-1" : ""}
                >
                  <Card className="group h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden relative">
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <CardHeader className="relative">
                      <div className="mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors ring-1 ring-primary/20 inline-flex">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>

                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative">
                      <CardDescription className="text-base leading-relaxed mb-4">
                        {feature.description}
                      </CardDescription>

                      <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                        Learn more
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
