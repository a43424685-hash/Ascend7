'use client'

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import { Extension } from '@tiptap/core'

// fontSize를 textStyle 마크의 전역 속성으로 추가
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
})

const ALIGNMENTS = [
  { align: 'left' as const, label: '좌', title: '왼쪽 정렬' },
  { align: 'center' as const, label: '중', title: '가운데 정렬' },
  { align: 'right' as const, label: '우', title: '오른쪽 정렬' },
]

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function RichTextEditor({ value, onChange, minHeight = 160 }: RichTextEditorProps) {
  const colorRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'outline-none px-3 py-3 text-sm text-gray-800 leading-relaxed',
        style: `min-height: ${minHeight}px; cursor: text`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    immediatelyRender: false,
  })

  if (!editor) return <div className="border border-gray-300 rounded" style={{ minHeight }} />

  const color = editor.getAttributes('textStyle').color ?? '#000000'
  const fontSize = editor.getAttributes('textStyle').fontSize ?? ''

  return (
    <div className="border border-gray-300 rounded overflow-hidden focus-within:border-black transition-colors">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* 굵기 */}
        <RteBtn
          active={editor.isActive('bold')}
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          title="굵게 (Ctrl+B)"
        >
          <strong className="text-xs">B</strong>
        </RteBtn>

        <RteSep />

        {/* 글씨 크기 */}
        <select
          value={fontSize}
          onChange={(e) => {
            editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()
          }}
          className="text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-black"
        >
          <option value="11px">작게</option>
          <option value="">보통</option>
          <option value="20px">크게</option>
          <option value="28px">매우 크게</option>
        </select>

        <RteSep />

        {/* 글씨 색상 */}
        <button
          type="button"
          title="글자 색상"
          onMouseDown={(e) => {
            e.preventDefault()
            colorRef.current?.click()
          }}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
        >
          <span className="text-xs font-bold leading-none" style={{ color }}>
            A
          </span>
          <span className="block w-3.5 h-1 rounded-sm" style={{ backgroundColor: color }} />
        </button>
        <input
          ref={colorRef}
          type="color"
          value={color}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="sr-only"
        />

        <RteSep />

        {/* 정렬 */}
        {ALIGNMENTS.map(({ align, label, title }) => (
          <RteBtn
            key={align}
            active={editor.isActive({ textAlign: align })}
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().setTextAlign(align).run()
            }}
            title={title}
          >
            <span className="text-xs">{label}</span>
          </RteBtn>
        ))}
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} />
    </div>
  )
}

function RteBtn({
  active,
  onMouseDown,
  title,
  children,
}: {
  active: boolean
  onMouseDown: (e: React.MouseEvent) => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      className={`px-2 py-0.5 rounded transition-colors ${
        active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function RteSep() {
  return <span className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />
}
