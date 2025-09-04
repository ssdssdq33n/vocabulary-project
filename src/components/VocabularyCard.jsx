export default function VocabularyCard({ vocab }) {
  const firstMeaning = vocab?.meanings?.[0]
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-800">{vocab.word}</h4>
          {vocab.pronunciation && (
            <p className="text-xs text-slate-500 mt-0.5">{vocab.pronunciation}</p>
          )}
        </div>
        {firstMeaning?.word_type?.displayName && (
          <span className="text-xs text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded">
            {firstMeaning.word_type.displayName}
          </span>
        )}
      </div>
      {firstMeaning?.meaning_vietnamese && (
        <p className="text-sm text-slate-700 mt-2">{firstMeaning.meaning_vietnamese}</p>
      )}
      {vocab.examples?.[0]?.example_english && (
        <p className="text-xs text-slate-500 mt-3 italic">“{vocab.examples[0].example_english}”</p>
      )}
    </div>
  )
} 