'use client'

import { useState, useCallback } from 'react'

// ====================================================
// 소재 목록 (36가지)
// ====================================================
export const MATERIAL_OPTIONS = [
  '면', '폴리에스테르', '나일론', '스판덱스',
  '울', '실크', '린넨', '레이온',
  '모달', '텐셀', '아크릴', '캐시미어',
  '앙고라', '알파카', '메리노울', '리사이클 폴리에스테르',
  '재생 나일론', '대나무', '구리 혼방', '쿨맥스',
  '엘라스테인', '라이크라', '라이오셀', '큐프라',
  '아세테이트', '피마면', '이집트면', '폴리아미드',
  '비스코스', '기모', '보아', '플리스',
  '메쉬', '본딩', '자카드', '트위드',
]

// ====================================================
// 세탁 안내 옵션 (12가지)
// ====================================================
export const CARE_OPTIONS: { id: string; label: string }[] = [
  { id: '손세탁', label: '손세탁' },
  { id: '물세탁 가능', label: '물세탁 가능' },
  { id: '울세탁', label: '울세탁' },
  { id: '드라이클리닝', label: '드라이클리닝' },
  { id: '단독세탁', label: '단독세탁' },
  { id: '세탁기 금지', label: '세탁기 금지' },
  { id: '표백제 금지', label: '표백제 금지' },
  { id: '건조기 금지', label: '건조기 금지' },
  { id: '다림질 금지', label: '다림질 금지' },
  { id: '비틀어 짜기 금지', label: '비틀어 짜기 금지' },
  { id: '그늘 건조', label: '그늘 건조' },
  { id: '뒤집어 세탁', label: '뒤집어 세탁' },
]

// ====================================================
// 세탁 안내 아이콘 SVG
// ====================================================
export function CareIconSvg({ id, className = 'w-6 h-6' }: { id: string; className?: string }) {
  switch (id) {
    // 손세탁: 대야 + 손 모양
    case '손세탁':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 13 L6 26 Q6 27 7 27 L25 27 Q26 27 26 26 L28 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M11 13 L11 9 Q11 8 12 8 Q13 8 13 9 L13 7 Q13 6 14 6 Q15 6 15 7 L15 8 Q15 7 16 7 Q17 7 17 8 L17 9 Q17 8 18 8 Q19 8 19 9 L19 13" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 13 Q11 17 14 17 Q17 17 19 13" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      )
    // 물세탁 가능: 대야 + 물결
    case '물세탁 가능':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 13 L6 26 Q6 27 7 27 L25 27 Q26 27 26 26 L28 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M8 20 Q10 17.5 12 20 Q14 22.5 16 20 Q18 17.5 20 20 Q22 22.5 24 20" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      )
    // 울세탁: 대야 + 작은 물결 (섬세)
    case '울세탁':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 13 L6 26 Q6 27 7 27 L25 27 Q26 27 26 26 L28 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M11 20 Q12.5 18 14 20 Q15.5 22 17 20 Q18.5 18 20 20" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M14 14 Q15 12.5 16 14 Q17 15.5 18 14" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      )
    // 드라이클리닝: 원
    case '드라이클리닝':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" />
          <text x="16" y="21" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">D</text>
        </svg>
      )
    // 단독세탁: 대야 + 1 표시
    case '단독세탁':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 13 L6 26 Q6 27 7 27 L25 27 Q26 27 26 26 L28 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M16 8 L16 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13 10.5 L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    // 세탁기 금지: 대야 + X
    case '세탁기 금지':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 13 L6 26 Q6 27 7 27 L25 27 Q26 27 26 26 L28 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M7 9 L25 28 M25 9 L7 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    // 표백제 금지: 삼각형 + X
    case '표백제 금지':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M16 5 L2 28 L30 28 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M9 22 L23 15 M9 15 L23 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    // 건조기 금지: 정사각형 안에 원 + X
    case '건조기 금지':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M8 8 L24 24 M24 8 L8 24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    // 다림질 금지: 다리미 + X
    case '다림질 금지':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M4 22 L4 19 Q4 17 6 17 L20 17 Q24 17 26 15 L28 13 Q28 17 26 19 L26 22 Q26 23 25 23 L5 23 Q4 23 4 22 Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          <path d="M8 11 L24 27 M24 11 L8 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    // 비틀어 짜기 금지: 꼰 모양 + X
    case '비틀어 짜기 금지':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <path d="M6 10 Q10 14 16 10 Q22 6 26 10 L26 18 Q22 22 16 18 Q10 14 6 18 Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          <path d="M10 8 L22 26 M22 8 L10 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    // 그늘 건조: 사각형 + 사선 (그늘 표시)
    case '그늘 건조':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="4" y="6" width="24" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          {/* 사선 (그늘) */}
          <path d="M16 6 L16 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="16" y="6" width="12" height="20" fill="currentColor" opacity="0.12" />
          {/* 가로줄 (건조대) */}
          <path d="M10 14 L10 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 14 L22 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    // 뒤집어 세탁: 뒤집기 화살표
    case '뒤집어 세탁':
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* 옷 외형 */}
          <path d="M12 6 L8 10 L4 8 L4 14 L8 14 L8 26 L24 26 L24 14 L28 14 L28 8 L24 10 L20 6 Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
          {/* 뒤집기 화살표 */}
          <path d="M14 16 Q16 13 18 16" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M17 14.5 L18 16 L16 16.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
  }
}

// ====================================================
// 소재 파싱 / 포맷 유틸
// ====================================================
type MaterialEntry = { name: string; pct: number }

function parseMaterial(str: string | null): MaterialEntry[] {
  if (!str) return []
  return str.split('/').flatMap((part) => {
    const m = part.trim().match(/^(.+?)\s+(\d+)%$/)
    return m ? [{ name: m[1].trim(), pct: parseInt(m[2]) }] : []
  })
}

function formatMaterial(entries: MaterialEntry[]): string | null {
  const valid = entries.filter((e) => e.name && e.pct > 0)
  return valid.length > 0 ? valid.map((e) => `${e.name} ${e.pct}%`).join(' / ') : null
}

// ====================================================
// MaterialCareEditor 컴포넌트
// ====================================================
interface MaterialCareEditorProps {
  material: string | null
  careInstructions: string[] | null
  onMaterialChange: (val: string | null) => void
  onCareChange: (val: string[] | null) => void
}

export function MaterialCareEditor({
  material,
  careInstructions,
  onMaterialChange,
  onCareChange,
}: MaterialCareEditorProps) {
  const [entries, setEntries] = useState<MaterialEntry[]>(() => parseMaterial(material))
  const [selectedCare, setSelectedCare] = useState<Set<string>>(
    () => new Set(careInstructions || [])
  )

  const totalPct = entries.reduce((sum, e) => sum + (e.pct || 0), 0)

  const updateEntries = useCallback(
    (next: MaterialEntry[]) => {
      setEntries(next)
      onMaterialChange(formatMaterial(next))
    },
    [onMaterialChange]
  )

  const toggleMaterial = (name: string) => {
    const exists = entries.some((e) => e.name === name)
    if (exists) {
      updateEntries(entries.filter((e) => e.name !== name))
    } else {
      updateEntries([...entries, { name, pct: 0 }])
    }
  }

  const updatePct = (name: string, pct: number) => {
    updateEntries(entries.map((e) => (e.name === name ? { ...e, pct } : e)))
  }

  const toggleCare = (id: string) => {
    const next = new Set(selectedCare)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedCare(next)
    const arr = [...next]
    onCareChange(arr.length > 0 ? arr : null)
  }

  const previewText = formatMaterial(entries)

  return (
    <div className="space-y-6">
      {/* ── 소재 선택 ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">소재 선택</p>
          {entries.length > 0 && (
            <span
              className={`text-xs font-medium ${
                totalPct === 100 ? 'text-green-600' : 'text-orange-500'
              }`}
            >
              합계: {totalPct}%{totalPct !== 100 && ' ← 100%여야 합니다'}
            </span>
          )}
        </div>

        {/* 소재 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {MATERIAL_OPTIONS.map((name) => {
            const isSelected = entries.some((e) => e.name === name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleMaterial(name)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>

        {/* 비율 입력 */}
        {entries.length > 0 && (
          <div className="space-y-2 bg-gray-50 rounded p-3 border border-gray-100">
            {entries.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 w-32 shrink-0">{entry.name}</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={entry.pct || ''}
                  onChange={(e) => updatePct(entry.name, parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:border-black outline-none text-center"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            ))}
            <div className="pt-2 mt-1 border-t border-gray-200">
              <p className="text-[11px] text-gray-500">
                미리보기: <span className="font-medium text-gray-800">{previewText || '—'}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 세탁 안내 ── */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-2">세탁 안내</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {CARE_OPTIONS.map((opt) => {
            const isSelected = selectedCare.has(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleCare(opt.id)}
                title={opt.label}
                className={`flex flex-col items-center gap-1.5 px-2 py-2.5 border rounded transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-500'
                }`}
              >
                <CareIconSvg id={opt.id} className="w-7 h-7" />
                <span className="text-[9px] leading-tight text-center break-keep">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
