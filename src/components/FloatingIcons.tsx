'use client';

import { Github, Rss, MessageSquare, Youtube } from "lucide-react";

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-[10%] animate-float">
        <div className="glass-card p-4 rounded-2xl">
          <Github className="h-8 w-8 text-foreground" />
        </div>
      </div>
      
      <div className="absolute top-32 right-[15%] animate-float-delayed">
        <div className="glass-card p-4 rounded-2xl">
          <Rss className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-[20%] animate-float">
        <div className="glass-card p-4 rounded-2xl">
          <MessageSquare className="h-8 w-8 text-secondary" />
        </div>
      </div>
      
      <div className="absolute bottom-20 right-[10%] animate-float-delayed">
        <div className="glass-card p-4 rounded-2xl">
          <Youtube className="h-8 w-8 text-destructive" />
        </div>
      </div>
    </div>
  );
};

export default FloatingIcons;
