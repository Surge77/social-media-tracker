'use client';

import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, ExternalLink, Eye, Link2, Clock } from "lucide-react";
import ExplanationChip from "./ExplanationChip";

interface FeedItemProps {
  title: string;
  url: string;
  summary: string;
  score: number;
  comments: number;
  velocity?: number;
  source: string;
  timeAgo: string;
  views: number;
  chips: string[];
  chipTypes: string[];
}

const FeedItem = ({
  title,
  url,
  summary,
  score,
  comments,
  velocity,
  source,
  timeAgo,
  views,
  chips,
  chipTypes,
}: FeedItemProps) => {
  return (
    <article className="rounded-2xl p-6 hover-lift bg-card border border-border transition-all">
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((chip, index) => (
          <ExplanationChip key={index} text={chip} type={chipTypes[index]} />
        ))}
      </div>

      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xl font-bold text-card-foreground mb-3 hover:text-primary transition-colors cursor-pointer block"
      >
        {title}
      </a>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {summary}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 transition-colors">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary transition-colors" />
          <span className="font-medium text-card-foreground transition-colors">{score}</span> points
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-secondary transition-colors" />
          <span className="font-medium text-card-foreground transition-colors">{comments}</span> comments
        </span>
        <span className="flex items-center gap-1.5 text-success transition-colors">
          <span className="text-lg" role="img" aria-label="trending up">🔼</span>
          <span className="font-medium">+{velocity || 0}</span> (1h)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4 transition-colors">
        <span className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 transition-colors" />
          {source}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 transition-colors" />
          {timeAgo}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 transition-colors" />
          {views.toLocaleString()} views
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="gap-2 transition-colors">
          <span role="img" aria-label="search">🔍</span> Explain
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-2 transition-colors"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> Visit
          </a>
        </Button>
        <Button size="sm" variant="ghost" className="gap-2 transition-colors">
          <span role="img" aria-label="copy">📋</span> Copy
        </Button>
        <Button size="sm" variant="ghost" className="gap-2 transition-colors">
          <span role="img" aria-label="more options">⚙️</span> More
        </Button>
      </div>
    </article>
  );
};

export default FeedItem;
