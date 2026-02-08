'use client';

import { Github, Rss, MessageSquare, Youtube, Twitter, Linkedin, Code2, Layers, Zap, TrendingUp, Globe, Share2 } from "lucide-react";

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top Left Area */}
      <div className="absolute top-20 left-[10%] animate-float">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Github className="h-8 w-8 text-foreground transition-colors" />
        </div>
      </div>
      
      <div className="absolute top-40 left-[5%] animate-float-delayed" style={{ animationDelay: '1s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Code2 className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-colors" />
        </div>
      </div>
      
      {/* Top Right Area */}
      <div className="absolute top-32 right-[15%] animate-float-delayed">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Rss className="h-8 w-8 text-primary transition-colors" />
        </div>
      </div>
      
      <div className="absolute top-16 right-[8%] animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Twitter className="h-6 w-6 text-sky-600 dark:text-sky-400 transition-colors" />
        </div>
      </div>

      <div className="absolute top-24 right-[35%] animate-float-delayed" style={{ animationDelay: '1.5s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Linkedin className="h-6 w-6 text-blue-700 dark:text-blue-500 transition-colors" />
        </div>
      </div>
      
      {/* Bottom Left Area */}
      <div className="absolute bottom-32 left-[20%] animate-float">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <MessageSquare className="h-8 w-8 text-secondary transition-colors" />
        </div>
      </div>
      
      <div className="absolute bottom-48 left-[8%] animate-float-delayed" style={{ animationDelay: '0.8s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400 transition-colors" />
        </div>
      </div>

      <div className="absolute bottom-16 left-[15%] animate-float" style={{ animationDelay: '1.2s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 transition-colors" />
        </div>
      </div>
      
      {/* Bottom Right Area */}
      <div className="absolute bottom-20 right-[10%] animate-float-delayed">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Youtube className="h-8 w-8 text-destructive transition-colors" />
        </div>
      </div>
      
      <div className="absolute bottom-40 right-[20%] animate-float" style={{ animationDelay: '0.3s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400 transition-colors" />
        </div>
      </div>

      <div className="absolute bottom-24 right-[5%] animate-float-delayed" style={{ animationDelay: '1.8s' }}>
        <div className="p-3 rounded-xl bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Globe className="h-6 w-6 text-cyan-600 dark:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Middle Area for more depth */}
      <div className="absolute top-1/2 left-[3%] -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400 transition-colors" />
        </div>
      </div>

      <div className="absolute top-1/2 right-[3%] -translate-y-1/2 animate-float-delayed" style={{ animationDelay: '2.5s' }}>
        <div className="p-2 rounded-lg bg-white/80 dark:bg-card/30 border border-border/50 backdrop-blur-md transition-colors shadow-sm">
          <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default FloatingIcons;
