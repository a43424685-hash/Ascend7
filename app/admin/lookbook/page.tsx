import { getAllLookbookItems } from '@/entities/lookbook/api/manage-lookbook'
import { LookbookManager } from '@/widgets/admin/lookbook-manager'

export const dynamic = 'force-dynamic'

export default async function AdminLookbookPage() {
  const items = await getAllLookbookItems()
  const activeCount = items.filter(i => i.is_active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">룩북 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          전체 {items.length}개 · 공개 {activeCount}개
        </p>
      </div>

      <LookbookManager items={items} />
    </div>
  )
}
