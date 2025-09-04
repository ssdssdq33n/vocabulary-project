import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'
import VocabularyCard from './VocabularyCard'
import FlashCard from './FlashCard'
import Practice from './Practice'

export default function TopicDetail({ ensureVocabForTopic, topicIdToVocab, isTopicLoading, topics, vocabErrorByTopic, filterVocab }) {
  const { topicId } = useParams()
  const topic = useMemo(() => topics.find(t => String(t.id) === String(topicId)), [topics, topicId])

  const [tab, setTab] = useState('list')

  // Search and pagination state
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [pagedVocab, setPagedVocab] = useState([])
  const [totalPages, setTotalPages] = useState(undefined)
  const [pagingLoading, setPagingLoading] = useState(false)
  const [pagingError, setPagingError] = useState('')

  // Initial load (cached) for topic
  useEffect(() => {
    if (topicId) ensureVocabForTopic(topicId)
  }, [topicId])

  // Debounce keyword input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400)
    return () => clearTimeout(id)
  }, [keyword])

  // Fetch paginated/filter list whenever page/size/keyword/topic changes
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!topicId) return
      setPagingLoading(true)
      setPagingError('')
      try {
        const { list, totalPages: tp } = await filterVocab({ topicId, page, size, keyword: debouncedKeyword })
        if (!cancelled) {
          setPagedVocab(list)
          setTotalPages(tp)
        }
      } catch (e) {
        if (!cancelled) setPagingError(e?.message || 'Không tải được danh sách')
      } finally {
        if (!cancelled) setPagingLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [topicId, page, size, debouncedKeyword, filterVocab])

  const loading = isTopicLoading(topicId)
  const error = vocabErrorByTopic?.[topicId]
  const vocabularies = topicIdToVocab?.[topicId] ?? []

  const showing = debouncedKeyword || page !== 1 || size !== 10 ? pagedVocab : vocabularies

  function goPrev() {
    setPage(p => Math.max(1, p - 1))
  }
  function goNext() {
    setPage(p => (totalPages ? Math.min(totalPages, p + 1) : p + 1))
  }
  function onSizeChange(e) {
    setSize(Number(e.target.value) || 10)
    setPage(1)
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{topic?.name || 'Chủ đề'}</h2>
          <p className="text-sm text-slate-500">{showing.length} từ</p>
        </div>
        <Link to="/" className="text-primary-700 hover:text-primary-800">← Quay lại</Link>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${tab === 'list' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => setTab('list')}>Danh sách</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${tab === 'flash' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => setTab('flash')}>Flash Cards</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${tab === 'practice' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => setTab('practice')}>Luyện tập</button>
      </div>

      {/* Search + Pagination Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
          placeholder="Tìm kiếm từ vựng..."
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64"
        />
        <select value={size} onChange={onSizeChange} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm">
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Trang trước</button>
          <span className="text-sm text-slate-600">Trang {page}{totalPages ? ` / ${totalPages}` : ''}</span>
          <button onClick={goNext} className="px-3 py-1.5 text-sm border rounded-lg">Trang sau</button>
        </div>
      </div>

      {(pagingLoading || loading) && <LoadingSpinner label="Đang tải từ vựng..." />}
      {(pagingError || error) && <div className="text-red-600 text-sm mb-4">{pagingError || error}</div>}

      {!(pagingLoading || loading) && !(pagingError || error) && tab === 'list' && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {showing.map(v => (
            <VocabularyCard key={v.id} vocab={v} />
          ))}
        </div>
      )}

      {!loading && !error && tab === 'flash' && (
        <div className="max-w-2xl">
          <div className="[perspective:1000px] [--tw-backface-visibility:hidden]">
            <FlashCard vocabularies={showing} />
          </div>
        </div>
      )}

      {!loading && !error && tab === 'practice' && (
        <div className="max-w-2xl">
          <Practice vocabularies={showing} />
        </div>
      )}
    </div>
  )
} 