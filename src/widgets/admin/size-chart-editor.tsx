'use client'

import { useState } from 'react'

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
const ALL_COLUMNS = ['총장', '어깨', '가슴', '소매', '허리', '힙', '밑위', '허벅지']

const COLUMN_PRESETS: Record<string, string[]> = {
  '상의': ['총장', '어깨', '가슴', '소매'],
  '하의': ['총장', '허리', '힙', '밑위', '허벅지'],
}

export const QUALITY_OPTIONS: Record<string, string[]> = {
  '두께감': ['얇음', '보통', '두꺼움'],
  '비침': ['없음', '약간', '있음'],
  '촉감': ['부드러움', '보통', '거침'],
  '신축성': ['없음', '약간', '좋음'],
  '핏': ['슬림', '레귤러', '루즈'],
}

export type SizeChartData = {
  columns: string[]
  sizes: string[]
  data: Record<string, Record<string, string>>
  qualities: Record<string, string>
}

export function parseSizeChartJSON(raw: string | null): SizeChartData | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed.columns && parsed.sizes) return parsed as SizeChartData
    return null
  } catch {
    return null
  }
}

function getDefault(): SizeChartData {
  return {
    columns: ['총장', '어깨', '가슴', '소매'],
    sizes: ['S', 'M', 'L', 'XL'],
    data: {},
    qualities: {},
  }
}

interface SizeChartEditorProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function SizeChartEditor({ value, onChange }: SizeChartEditorProps) {
  const [chart, setChart] = useState<SizeChartData>(
    () => parseSizeChartJSON(value) ?? getDefault()
  )

  const emit = (updated: SizeChartData) => {
    onChange(JSON.stringify(updated))
    setChart(updated)
  }

  const toggleSize = (size: string) => {
    const sizes = ALL_SIZES.filter((s) => {
      if (s === size) return !chart.sizes.includes(s)
      return chart.sizes.includes(s)
    })
    emit({ ...chart, sizes })
  }

  const toggleColumn = (col: string) => {
    const columns = ALL_COLUMNS.filter((c) => {
      if (c === col) return !chart.columns.includes(c)
      return chart.columns.includes(c)
    })
    emit({ ...chart, columns })
  }

  const applyPreset = (preset: string) => {
    emit({ ...chart, columns: COLUMN_PRESETS[preset] })
  }

  const updateCell = (size: string, col: string, val: string) => {
    const updated: SizeChartData = {
      ...chart,
      data: {
        ...chart.data,
        [size]: { ...chart.data[size], [col]: val },
      },
    }
    onChange(JSON.stringify(updated))
    setChart(updated)
  }

  const setQuality = (metric: string, option: string) => {
    const qualities = {
      ...chart.qualities,
      [metric]: chart.qualities[metric] === option ? '' : option,
    }
    emit({ ...chart, qualities })
  }

  return (
    <div className="space-y-5">
      {/* 사이즈 토글 */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">사이즈 선택</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3 py-1 text-xs border rounded transition-colors ${
                chart.sizes.includes(size)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-400 border-gray-300 hover:border-gray-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 측정 항목 토글 */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-xs font-medium text-gray-600">측정 항목</p>
          <span className="text-gray-300 text-xs">|</span>
          {Object.keys(COLUMN_PRESETS).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              {preset} 기본값
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_COLUMNS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => toggleColumn(col)}
              className={`px-3 py-1 text-xs border rounded transition-colors ${
                chart.columns.includes(col)
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-400 border-gray-300 hover:border-gray-500'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* 사이즈 입력 테이블 */}
      {chart.sizes.length > 0 && chart.columns.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-2.5 px-3 text-center text-xs font-semibold text-gray-700 w-16">
                  사이즈
                </th>
                {chart.columns.map((col) => (
                  <th
                    key={col}
                    className="py-2.5 px-2 text-center text-xs font-semibold text-gray-700"
                  >
                    {col}
                    <span className="block font-normal text-gray-400">(cm)</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.sizes.map((size, i) => (
                <tr
                  key={size}
                  className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                >
                  <td className="py-2 px-3 text-center font-semibold text-sm text-gray-800">
                    {size}
                  </td>
                  {chart.columns.map((col) => (
                    <td key={col} className="py-1.5 px-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={chart.data[size]?.[col] || ''}
                        onChange={(e) => updateCell(size, col, e.target.value)}
                        placeholder="—"
                        className="w-full text-center text-sm border border-gray-200 rounded px-1 py-1.5 focus:outline-none focus:border-black placeholder:text-gray-300"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 원단 특성 */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-3">원단 특성</p>
        <div className="space-y-2.5">
          {Object.entries(QUALITY_OPTIONS).map(([metric, options]) => (
            <div key={metric} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-14 shrink-0">{metric}</span>
              <div className="flex gap-1.5 flex-wrap">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setQuality(metric, option)}
                    className={`px-3 py-1 text-xs border rounded-full transition-colors ${
                      chart.qualities[metric] === option
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
