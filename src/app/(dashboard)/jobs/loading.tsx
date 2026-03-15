import { Loading } from '@/components/ui/loading'

export default function JobsLoading() {
  return (
    <div className="app-page py-8">
      <div className="flex min-h-[620px] items-center justify-center">
        <Loading size="lg" text="Loading jobs intelligence..." />
      </div>
    </div>
  )
}
