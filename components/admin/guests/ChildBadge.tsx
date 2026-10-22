import type { ChildAgeGroup } from '@/src/entities/models/guest'
import { CHILD_AGE_GROUP_LABEL } from '@/src/lib/guests'

export function ChildBadge({ group }: { group: ChildAgeGroup }) {
  return (
    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
      Criança · {CHILD_AGE_GROUP_LABEL[group]}
    </span>
  )
}
