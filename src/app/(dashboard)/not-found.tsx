import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-4xl font-bold text-foreground">404</h2>
          <p className="mb-6 text-muted-foreground">Page not found</p>
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
