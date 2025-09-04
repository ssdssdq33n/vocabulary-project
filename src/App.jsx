import { Routes, Route, Link } from 'react-router-dom'
import TopicList from './components/TopicList'
import TopicDetail from './components/TopicDetail'
import LoadingSpinner from './components/LoadingSpinner'
import { useVocabulary } from './hooks/useVocabulary'

export default function App() {
  const {
    topics,
    loadingTopics,
    topicsError,
    topicIdToVocab,
    ensureVocabForTopic,
    isTopicLoading,
    vocabErrorByTopic,
    filterVocab,
  } = useVocabulary()

  return (
    <div className="min-h-full bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary-600 text-white grid place-items-center font-bold">V</div>
            <div>
              <div className="text-slate-800 font-semibold leading-tight">Vocabulary Trainer</div>
              <div className="text-xs text-slate-500 leading-tight">LearnEnglish</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {loadingTopics && <LoadingSpinner label="Đang tải chủ đề..." />}
        {!loadingTopics && (
          <Routes>
            <Route
              path="/"
              element={<TopicList topics={topics} loading={loadingTopics} error={topicsError} />}
            />
            <Route
              path="/topics/:topicId"
              element={
                <TopicDetail
                  topics={topics}
                  ensureVocabForTopic={ensureVocabForTopic}
                  isTopicLoading={isTopicLoading}
                  topicIdToVocab={topicIdToVocab}
                  vocabErrorByTopic={vocabErrorByTopic}
                  filterVocab={filterVocab}
                />
              }
            />
          </Routes>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        © {new Date().getFullYear()} Learn-English
      </footer>
    </div>
  )
} 