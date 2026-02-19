import { getAllEvents } from '@/entities/event/api/manage-events'
import { EventManager } from '@/widgets/admin/event-manager'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const items = await getAllEvents()
  const activeCount = items.filter(i => i.is_active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">이벤트 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          전체 {items.length}개 · 활성 {activeCount}개
        </p>
      </div>

      <EventManager items={items} />
    </div>
  )
}
