'use client';

import { Button } from "@/components/ui/button";
import { MessageSquare, TrendingUp, ExternalLink, Eye, Link2, Clock } from "lucide-react";
import ExplanationChip from "./ExplanationChip";

interface FeedItemProps {
  title: string;
  summary: string;
  score: number;
  comments: number;
  velocity: number;
  source: string;
  timeAgo: string;
  views: number;
  chips: string[];
  chipTypes: string[];
}

const FeedItem = ({
  title,
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
    <article className="glass-card rounded-2xl p-6 hover-lift">
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((chip, index) => (
          <ExplanationChip key={index} text={chip} type={chipTypes[index]} />
        ))}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {summary}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{score}</span> points
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-secondary" />
          <span className="font-medium text-foreground">{comments}</span> comments
        </span>
        <span className="flex items-center gap-1.5 text-success">
          <span className="text-lg">🔼</span>
          <span className="font-medium">+{velocity}</span> (1h)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          {source}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {views.toLocaleString()} views
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="gap-2">
          <span>🔍</span> Explain
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <ExternalLink className="h-3.5 w-3.5" /> Visit
        </Button>
        <Button size="sm" variant="ghost" className="gap-2">
          📋 Copy
        </Button>
        <Button size="sm" variant="ghost" className="gap-2">
          ⚙️ More
        </Button>
      </div>
    </article>
  );
};

export default FeedItem;
