export function JobsEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 px-6 py-14 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
