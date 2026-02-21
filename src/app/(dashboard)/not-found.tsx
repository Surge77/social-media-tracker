import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-4xl font-bold text-foreground">404</h2>
          <p className="mb-1 text-lg font-medium text-foreground">This page doesn&apos;t exist</p>
          <p className="mb-6 text-sm text-muted-foreground">The URL may be wrong, or this page was moved.</p>
          <Link
            href="/technologies"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Technologies
          </Link>
        </div>
      </div>
    </div>
  )
}
