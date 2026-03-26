'use client';

import { Github, Rss, MessageSquare, Youtube, Twitter, Linkedin, Code2, Layers, Zap, TrendingUp, Globe, Share2 } from "lucide-react";

const iconCardClassName =
  'border border-border/60 bg-card/85 backdrop-blur-xl shadow-[0_12px_34px_rgba(0,0,0,0.12)] ring-1 ring-white/30 transition-colors dark:ring-white/10'

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {/* Top Left Area */}
      <div className="absolute top-20 left-[10%] animate-float">
        <div className={`rounded-2xl p-4 ${iconCardClassName}`}>
          <Github className="h-8 w-8 text-foreground transition-colors" />
        </div>
      </div>
      
      <div className="absolute top-40 left-[5%] animate-float-delayed" style={{ animationDelay: '1s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Code2 className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-colors" />
        </div>
      </div>
      
      {/* Top Right Area */}
      <div className="absolute top-32 right-[15%] animate-float-delayed">
        <div className={`rounded-2xl p-4 ${iconCardClassName}`}>
          <Rss className="h-8 w-8 text-primary transition-colors" />
        </div>
      </div>
      
      <div className="absolute top-16 right-[8%] animate-float" style={{ animationDelay: '0.5s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Twitter className="h-6 w-6 text-sky-600 dark:text-sky-400 transition-colors" />
        </div>
      </div>

      <div className="absolute top-24 right-[35%] animate-float-delayed" style={{ animationDelay: '1.5s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Linkedin className="h-6 w-6 text-blue-700 dark:text-blue-500 transition-colors" />
        </div>
      </div>
      
      {/* Bottom Left Area */}
      <div className="absolute left-[20%] top-[23rem] animate-float">
        <div className={`rounded-2xl p-4 ${iconCardClassName}`}>
          <MessageSquare className="h-8 w-8 text-secondary transition-colors" />
        </div>
      </div>
      
      <div className="absolute left-[8%] top-[20rem] animate-float-delayed" style={{ animationDelay: '0.8s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-colors" />
        </div>
      </div>

      <div className="absolute left-[15%] top-[27rem] animate-float" style={{ animationDelay: '1.2s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 transition-colors" />
        </div>
      </div>
      
      {/* Bottom Right Area */}
      <div className="absolute right-[10%] top-[24rem] animate-float-delayed">
        <div className={`rounded-2xl p-4 ${iconCardClassName}`}>
          <Youtube className="h-8 w-8 text-destructive transition-colors" />
        </div>
      </div>
      
      <div className="absolute right-[20%] top-[20.5rem] animate-float" style={{ animationDelay: '0.3s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-colors" />
        </div>
      </div>

      <div className="absolute right-[5%] top-[28rem] animate-float-delayed" style={{ animationDelay: '1.8s' }}>
        <div className={`rounded-xl p-3 ${iconCardClassName}`}>
          <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Middle Area for more depth */}
      <div className="absolute left-[3%] top-[22rem] animate-float" style={{ animationDelay: '2s' }}>
        <div className={`rounded-lg p-2 ${iconCardClassName}`}>
          <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-colors" />
        </div>
      </div>

      <div className="absolute right-[3%] top-[22.5rem] animate-float-delayed" style={{ animationDelay: '2.5s' }}>
        <div className={`rounded-lg p-2 ${iconCardClassName}`}>
          <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default FloatingIcons;

