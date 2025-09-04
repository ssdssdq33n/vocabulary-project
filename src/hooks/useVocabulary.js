import { useEffect, useMemo, useState, useCallback } from 'react'
import { fetchTopics, fetchVocabulariesByTopic, filterVocabularies } from '../utils/api'

/**
 * Loads topics once at app start and provides methods to load vocabularies per topic on demand.
 */
export function useVocabulary() {
  const [topics, setTopics] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [topicsError, setTopicsError] = useState('')

  const [topicIdToVocab, setTopicIdToVocab] = useState({})
  const [loadingTopicIds, setLoadingTopicIds] = useState(new Set())
  const [vocabErrorByTopic, setVocabErrorByTopic] = useState({})

  useEffect(() => {
    let cancelled = false
    async function loadTopics() {
      try {
        setLoadingTopics(true)
        setTopicsError('')
        const results = await fetchTopics()
        if (!cancelled) setTopics(results)
      } catch (e) {
        if (!cancelled) setTopicsError(e?.message || 'Failed to load topics')
      } finally {
        if (!cancelled) setLoadingTopics(false)
      }
    }
    loadTopics()
    return () => { cancelled = true }
  }, [])

  const ensureVocabForTopic = useCallback(async (topicId) => {
    if (!topicId) return
    if (topicIdToVocab[topicId]) return
    if (loadingTopicIds.has(topicId)) return

    setLoadingTopicIds(prev => new Set(prev).add(topicId))
    setVocabErrorByTopic(prev => ({ ...prev, [topicId]: '' }))
    try {
      const vocab = await fetchVocabulariesByTopic(Number(topicId))
      setTopicIdToVocab(prev => ({ ...prev, [topicId]: vocab }))
    } catch (e) {
      setVocabErrorByTopic(prev => ({ ...prev, [topicId]: e?.message || 'Failed to load vocabularies' }))
    } finally {
      setLoadingTopicIds(prev => {
        const next = new Set(prev)
        next.delete(topicId)
        return next
      })
    }
  }, [topicIdToVocab, loadingTopicIds])

  const isTopicLoading = useMemo(() => (id) => loadingTopicIds.has(id), [loadingTopicIds])

  const filterVocab = useCallback(async ({ topicId, page = 1, size = 10, keyword = '' }) => {
    const { list, total, totalPages } = await filterVocabularies({ topicId, page, size, keyword })
    return { list, total, totalPages }
  }, [])

  return {
    topics,
    loadingTopics,
    topicsError,
    topicIdToVocab,
    ensureVocabForTopic,
    isTopicLoading,
    vocabErrorByTopic,
    filterVocab,
  }
} 