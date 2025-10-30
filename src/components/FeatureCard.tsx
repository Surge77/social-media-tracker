'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
  metric?: ReactNode;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
  metric
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="group relative"
    >
      {/* Subtle gradient border effect */}
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300`} />
      
      {/* Card content */}
      <div className="relative h-full p-8 rounded-2xl bg-card border border-border/50 transition-all duration-200 hover:border-border">
        {/* Icon - simple and clean */}
        <div className={`w-12 h-12 rounded-xl ${gradient} p-2.5 mb-6`}>
          <Icon className="w-full h-full text-white" strokeWidth={1.5} />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
        
        {/* Optional metric */}
        {metric && (
          <div className="mt-4 pt-4 border-t border-border/50">
            {metric}
          </div>
        )}
      </div>
    </motion.div>
  );
}
