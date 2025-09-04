import { Link } from 'react-router-dom'

export default function TopicList({ topics, loading, error }) {
  if (loading) {
    return null
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 text-sm">{error}</div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Chủ đề từ vựng</h2>
        <p className="text-sm text-slate-500">Chọn một chủ đề để bắt đầu học</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(topic => (
          <Link
            to={`/topics/${topic.id}`}
            key={topic.id}
            className="card p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary-700">
                {topic.name}
              </h3>
              <span className="text-xs text-slate-500">{topic.word_count ?? 0} từ</span>
            </div>
            {topic.description ? (
              <p className="text-sm text-slate-600 mt-2">{topic.description}</p>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Chủ đề</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
} 