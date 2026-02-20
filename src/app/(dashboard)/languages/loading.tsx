import { Loading } from '@/components/ui/loading'

export default function LanguagesLoading() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Loading size="lg" text="Loading language rankings..." />
    </div>
  )
}
