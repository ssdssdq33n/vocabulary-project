import { useEffect, useMemo, useState } from 'react'

export default function FlashCard({ vocabularies = [] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [order, setOrder] = useState([])

  useEffect(() => {
    setOrder(vocabularies.map((_, i) => i))
    setIndex(0)
    setFlipped(false)
  }, [vocabularies])

  const current = useMemo(() => vocabularies[order[index] ?? 0], [order, index, vocabularies])

  function next() {
    setIndex((i) => Math.min(i + 1, (vocabularies.length - 1)))
    setFlipped(false)
  }
  function prev() {
    setIndex((i) => Math.max(i - 1, 0))
    setFlipped(false)
  }
  function shuffle() {
    const shuffled = [...order]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setOrder(shuffled)
    setIndex(0)
    setFlipped(false)
  }

  if (!vocabularies.length) {
    return <div className="text-sm text-slate-500">Không có từ vựng.</div>
  }

  const firstMeaning = current?.meanings?.[0]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-600">Thẻ {index + 1}/{vocabularies.length}</div>
        <button className="text-sm text-primary-700 hover:text-primary-800" onClick={shuffle}>Shuffle</button>
      </div>

      <div
        className={`relative h-56 [perspective:1000px] select-text`}
      >
        <div className={`card absolute inset-0 p-6 flex items-center justify-center text-center transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          <div className={`absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center`}>
            <div className="text-2xl font-bold text-slate-800">{current?.word}</div>
          </div>
          <div className={`absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center`}>
            <div className="text-xl font-semibold text-primary-700">{firstMeaning?.meaning_vietnamese}</div>
            {current?.pronunciation && (
              <div className="text-sm text-slate-500 mt-1">{current.pronunciation}</div>
            )}
            {current?.examples?.[0]?.example_english && (
              <div className="text-xs text-slate-500 mt-3 max-w-md">“{current.examples[0].example_english}”</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button className="btn-primary" onClick={prev} disabled={index === 0}>Previous</button>
        <button className="btn-primary" onClick={() => setFlipped(f => !f)}>Flip</button>
        <button className="btn-primary" onClick={next} disabled={index === vocabularies.length - 1}>Next</button>
      </div>
    </div>
  )
} 