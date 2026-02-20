import { Loading } from '@/components/ui/loading'

export default function ReposLoading() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Loading size="lg" text="Loading trending repos..." />
    </div>
  )
}
