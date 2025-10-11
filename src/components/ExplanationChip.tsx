'use client';

interface ExplanationChipProps {
  text: string;
  type: string;
}

const ExplanationChip = ({ text, type }: ExplanationChipProps) => {
  const getChipStyles = () => {
    switch (type) {
      case "velocity":
        return "bg-primary/20 text-primary border-primary/30";
      case "freshness":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "engagement":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "breakout":
        return "bg-destructive/20 text-destructive border-destructive/30 animate-pulse-glow";
      case "multi-source":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "velocity":
        return "🔥";
      case "freshness":
        return "⚡";
      case "engagement":
        return "💬";
      case "breakout":
        return "🚀";
      case "multi-source":
        return "🔗";
      default:
        return "✨";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getChipStyles()}`}
    >
      <span>{getIcon()}</span>
      {text}
    </span>
  );
};

export default ExplanationChip;
