'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { useClient } from '@/lib/client-context'
import { clients, learningNotes as mockNotes, NOTE_TYPES } from '@/lib/data'
import type { LearningNote, NoteType, NoteStatus, CapabilityTag } from '@/lib/data'

/* ── Note type badge style ── */
const NOTE_TYPE_STYLE: Record<NoteType, string> = {
  'LIVE CAMPAIGN': 'bg-cyan-tint-12 text-l-cyan',
  'A/B TEST RESULT': 'bg-grey-12 text-grey-01',
  'OPTIMIZATION': 'bg-orange-tint-10 text-orange',
}

/* ════════════════════════════════════════════════════ */
function LearningNotesPageContent() {
  const { client, setClient } = useClient()
  const searchParams = useSearchParams()

  // Auto-select client from URL ?client= param on mount
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (initialized) return
    const paramClient = searchParams.get('client')
    if (paramClient) {
      const cl = clients.find((c) => c.id === paramClient)
      if (cl) {
        setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
      }
    }
    setInitialized(true)
  }, [searchParams, initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedClientId = client?.id || ''

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cl = clients.find((c) => c.id === e.target.value)
    if (cl) {
      setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
    } else {
      setClient(null)
    }
    setStatusTab('all')
  }
  const [statusTab, setStatusTab] = useState('all')
  const [notes, setNotes] = useState<LearningNote[]>(mockNotes)
  const [editNote, setEditNote] = useState<LearningNote | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const filtered = useMemo(() => {
    let result = selectedClientId
      ? notes.filter((n) => n.clientId === selectedClientId)
      : [...notes]
    if (statusTab === 'draft') result = result.filter((n) => n.status === 'draft')
    if (statusTab === 'published') result = result.filter((n) => n.status === 'published')
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [notes, selectedClientId, statusTab])

  const scopedNotes = selectedClientId
    ? notes.filter((n) => n.clientId === selectedClientId)
    : notes
  const draftCount = scopedNotes.filter((n) => n.status === 'draft').length
  const publishedCount = scopedNotes.filter((n) => n.status === 'published').length

  const handleSave = (note: LearningNote) => {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === note.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = note
        return updated
      }
      return [...prev, note]
    })
    setEditNote(null)
    setShowCreate(false)
  }

  const handlePublish = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, status: 'published' as NoteStatus } : n))
  }

  const handleUnpublish = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, status: 'draft' as NoteStatus } : n))
  }

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-[var(--space-5)]">
        <div>
          <h1 className="text-24-bold text-grey-01">Agent 学习笔记</h1>
          <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
            管理客户端展示的 AI Agent 投放洞察与学习记录
          </p>
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          <select
            value={selectedClientId}
            onChange={handleClientChange}
            className="text-14-regular rounded-md px-3 py-1 h-[var(--size-avatar-md)] border border-grey-12 bg-white text-grey-01 outline-none focus:border-grey-01 transition-colors"
            aria-label="选择客户"
          >
            <option value="">全部客户</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedClient && (
            <Button onClick={() => setShowCreate(true)}>+ 新建笔记</Button>
          )}
        </div>
      </div>

      {/* ── Client info (when filtered) ── */}
      {selectedClient && (
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
          <Avatar name={selectedClient.name[0]} size="sm" />
          <span className="text-14-bold text-grey-01">{selectedClient.name}</span>
          <Badge variant="grey">{selectedClient.industry}</Badge>
        </div>
      )}

      <Tabs
        tabs={[
          { key: 'all', label: '全部', count: scopedNotes.length },
          { key: 'published', label: '已发布', count: publishedCount },
          { key: 'draft', label: '草稿', count: draftCount },
        ]}
        activeKey={statusTab}
        onChange={setStatusTab}
      >
        {/* ── Notes list ── */}
        <div className="flex flex-col gap-[var(--space-3)]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px]">
              <p className="text-14-regular text-grey-08">暂无{statusTab === 'draft' ? '草稿' : statusTab === 'published' ? '已发布' : ''}笔记</p>
              {selectedClient && (
                <Button variant="ghost" onClick={() => setShowCreate(true)} className="mt-[var(--space-2)]">
                  + 创建第一条笔记
                </Button>
              )}
            </div>
          ) : (
            filtered.map((note) => {
              const noteClient = clients.find((c) => c.id === note.clientId)
              return (
                <Card key={note.id} padding="standard">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-[var(--space-2)]">
                    <div className="flex items-center gap-[var(--space-2)]">
                      {!selectedClientId && noteClient && (
                        <span className="text-12-bold text-grey-01">{noteClient.name}</span>
                      )}
                      <span className="text-12-regular text-grey-08 tabular-nums">{note.date}</span>
                      <span className={`text-10-medium px-[6px] py-[2px] rounded ${NOTE_TYPE_STYLE[note.type]}`}>
                        {note.type}
                      </span>
                    </div>
                    <Badge variant={note.status === 'published' ? 'cyan' : 'grey'}>
                      {note.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                  </div>

                  {/* Title + Description */}
                  <h3 className="text-14-bold text-grey-01 mb-[var(--space-1)]">{note.title}</h3>
                  <p className="text-12-regular text-grey-06 line-clamp-3 mb-[var(--space-3)]">{note.description}</p>

                  {/* Capability tags */}
                  {note.capabilityTags.length > 0 && (
                    <div className="flex flex-wrap gap-[var(--space-1)] mb-[var(--space-3)]">
                      {note.capabilityTags.map((tag) => (
                        <span
                          key={tag.skill}
                          className="inline-flex items-center gap-[2px] px-[var(--space-2)] py-[2px] rounded-full bg-cyan-tint-12 text-l-cyan text-12-medium"
                        >
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M6 9V3M3 5l3-3 3 3" />
                          </svg>
                          {tag.skill} +{tag.delta}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: meta + actions */}
                  <div className="flex items-center justify-between pt-[var(--space-2)] border-t border-stroke">
                    <span className="text-10-regular text-grey-08">
                      {note.createdBy} · {note.createdAt}
                    </span>
                    <div className="flex items-center gap-[var(--space-2)]">
                      <Button variant="ghost" onClick={() => setEditNote(note)} className="!text-12-medium !px-[var(--space-2)] !py-[3px]">
                        编辑
                      </Button>
                      {note.status === 'draft' ? (
                        <Button variant="secondary" onClick={() => handlePublish(note.id)} className="!text-12-medium !px-[var(--space-2)] !py-[3px]">
                          发布
                        </Button>
                      ) : (
                        <Button variant="ghost" onClick={() => handleUnpublish(note.id)} className="!text-12-medium !px-[var(--space-2)] !py-[3px]">
                          取消发布
                        </Button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(note.id)}
                        className="text-grey-08 hover:text-red bg-transparent border-none cursor-pointer p-[2px] font-[inherit]"
                        aria-label="删除"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 5h10M5 5V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5M6.5 8v4M9.5 8v4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </Tabs>

      {/* ── Delete confirm dialog ── */}
      {confirmDelete && (
        <Dialog open onClose={() => setConfirmDelete(null)} title="确认删除" width={380}>
          <p className="text-14-regular text-grey-06 mb-[var(--space-4)]">
            确定要删除这条笔记吗？此操作无法撤销。
          </p>
          <div className="flex justify-end gap-[var(--space-2)]">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>删除</Button>
          </div>
        </Dialog>
      )}

      {/* ── Create/Edit Dialog ── */}
      {(showCreate || editNote) && (
        <NoteFormDialog
          note={editNote}
          clientId={selectedClientId}
          onSave={handleSave}
          onClose={() => { setEditNote(null); setShowCreate(false) }}
        />
      )}
    </div>
  )
}

/* ── Note Form Dialog ── */
function NoteFormDialog({
  note,
  clientId,
  onSave,
  onClose,
}: {
  note: LearningNote | null
  clientId: string
  onSave: (n: LearningNote) => void
  onClose: () => void
}) {
  const [date, setDate] = useState(note?.date || new Date().toISOString().split('T')[0])
  const [type, setType] = useState<NoteType>(note?.type || 'LIVE CAMPAIGN')
  const [title, setTitle] = useState(note?.title || '')
  const [description, setDescription] = useState(note?.description || '')
  const [tags, setTags] = useState<CapabilityTag[]>(note?.capabilityTags || [])
  const [status, setStatus] = useState<NoteStatus>(note?.status || 'draft')

  const [newSkill, setNewSkill] = useState('')
  const [newDelta, setNewDelta] = useState('')

  const addTag = () => {
    if (!newSkill.trim() || !newDelta) return
    setTags((prev) => [...prev, { skill: newSkill.trim(), delta: Number(newDelta) }])
    setNewSkill('')
    setNewDelta('')
  }

  const removeTag = (skill: string) => {
    setTags((prev) => prev.filter((t) => t.skill !== skill))
  }

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return
    onSave({
      id: note?.id || `note-${Date.now()}`,
      clientId,
      date,
      type,
      title,
      description,
      capabilityTags: tags,
      status,
      createdBy: note?.createdBy || '罗依桐',
      createdAt: note?.createdAt || new Date().toISOString().split('T')[0],
    })
  }

  return (
    <Dialog open onClose={onClose} title={note ? '编辑笔记' : '新建笔记'} width={580}>
      <div className="flex flex-col gap-[var(--space-4)]">
        {/* Date + Type + Status row */}
        <div className="grid grid-cols-3 gap-[var(--space-3)]">
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors"
            />
          </div>
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NoteType)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors bg-white"
            >
              {NOTE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">状态</label>
            <div className="flex gap-[var(--space-1)] h-[var(--height-input)] items-center">
              <button
                onClick={() => setStatus('draft')}
                className={`flex-1 py-[5px] rounded-md text-12-medium border-none cursor-pointer font-[inherit] transition-colors ${
                  status === 'draft' ? 'bg-grey-01 text-white' : 'bg-selected text-grey-06'
                }`}
              >
                草稿
              </button>
              <button
                onClick={() => setStatus('published')}
                className={`flex-1 py-[5px] rounded-md text-12-medium border-none cursor-pointer font-[inherit] transition-colors ${
                  status === 'published' ? 'bg-l-cyan text-white' : 'bg-selected text-grey-06'
                }`}
              >
                发布
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">标题 <span className="text-red">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入洞察标题..."
            className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">描述 <span className="text-red">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述 Agent 的学习发现与优化建议..."
            className="w-full h-[100px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-grey-01 transition-colors"
          />
        </div>

        {/* Capability Tags */}
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-2)] block">能力变化标签</label>

          {/* Existing tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[var(--space-1)] mb-[var(--space-2)]">
              {tags.map((tag) => (
                <span
                  key={tag.skill}
                  className="inline-flex items-center gap-[4px] px-[var(--space-2)] py-[3px] rounded-full bg-cyan-tint-12 text-l-cyan text-12-medium"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M6 9V3M3 5l3-3 3 3" />
                  </svg>
                  {tag.skill} +{tag.delta}
                  <button
                    onClick={() => removeTag(tag.skill)}
                    className="text-l-cyan hover:text-red bg-transparent border-none cursor-pointer p-0 ml-[2px] font-[inherit]"
                    aria-label={`删除 ${tag.skill}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 2l6 6M8 2l-6 6" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add tag row */}
          <div className="flex items-center gap-[var(--space-2)]">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="技能名称"
              className="flex-1 h-[32px] px-[var(--space-2)] rounded-md border border-stroke text-12-regular outline-none focus:border-grey-01"
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <div className="flex items-center gap-[2px]">
              <span className="text-12-regular text-grey-08">+</span>
              <input
                type="number"
                value={newDelta}
                onChange={(e) => setNewDelta(e.target.value)}
                placeholder="0"
                className="w-[48px] h-[32px] px-[var(--space-1)] rounded-md border border-stroke text-12-regular outline-none focus:border-grey-01 text-center"
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
            </div>
            <button
              onClick={addTag}
              disabled={!newSkill.trim() || !newDelta}
              className="h-[32px] px-[var(--space-2)] rounded-md bg-selected text-12-medium text-grey-06 hover:bg-grey-12 border-none cursor-pointer disabled:opacity-50 font-[inherit]"
            >
              添加
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !description.trim()}>
            {note ? '保存' : '创建'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default function LearningNotesPage() {
  return <Suspense><LearningNotesPageContent /></Suspense>
}
