import React from 'react'
import { MessageSquare, ExternalLink } from 'lucide-react'
import type { BuzzItem } from '@/lib/api/github-trending'

interface CommunityBuzzSectionProps {
  buzz: BuzzItem[]
}

export function CommunityBuzzSection({ buzz }: CommunityBuzzSectionProps) {
  if (buzz.length === 0) return null

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base font-semibold text-foreground">Community Buzz</span>
        <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-500">
          Live on HN
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {buzz.slice(0, 8).map((item) => (
          <BuzzCard key={item.full_name} item={item} />
        ))}
      </div>
    </div>
  )
}

function BuzzCard({ item }: { item: BuzzItem }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
      {/* HN story title */}
      <a
        href={item.hn_url}
        target="_blank"
        rel="noopener noreferrer"
        className="line-clamp-2 text-xs font-medium text-foreground hover:text-orange-500 transition-colors"
      >
        {item.hn_title}
      </a>

      {/* Points + comments */}
      <div className="flex items-center gap-2 text-[11px] text-orange-500 font-medium">
        <span>▲ {item.hn_points}</span>
        <span className="flex items-center gap-0.5 text-muted-foreground">
          <MessageSquare size={10} />
          {item.hn_comments}
        </span>
        {item.hn_age_hours < 48 && (
          <span className="text-muted-foreground/60">{item.hn_age_hours}h ago</span>
        )}
      </div>

      {/* Repo link */}
      <a
        href={item.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <img
          src={item.owner_avatar_url}
          alt=""
          className="h-3.5 w-3.5 rounded-full"
        />
        <span className="truncate">{item.full_name}</span>
        <ExternalLink size={9} className="shrink-0" />
      </a>

      {/* Language + stars */}
      {(item.language || item.stars_total > 0) && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {item.language && <span>{item.language}</span>}
          {item.stars_total > 0 && <span>★ {item.stars_total.toLocaleString()}</span>}
        </div>
      )}
    </div>
  )
}
