import { useEffect, useMemo, useState } from 'react'

const MODES = {
  VI_EN: 'VI_EN',
  EN_VI: 'EN_VI',
  FILL_BLANK: 'FILL_BLANK',
  EXAMPLE: 'EXAMPLE',
}

function maskWord(word) {
  if (!word) return ''
  if (word.length <= 2) return word[0] + '_'
  const keep = Math.ceil(word.length * 0.3)
  const visible = word.slice(0, keep)
  return visible + '_'.repeat(Math.max(1, word.length - keep))
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildWordVariants(word) {
  const base = String(word || '').trim()
  const lower = base.toLowerCase()
  const variants = new Set()
  if (!lower) return variants
  // base forms
  variants.add(lower)
  variants.add(lower[0].toUpperCase() + lower.slice(1))
  // pluralization rules
  if (/[sxz]$/.test(lower) || /(ch|sh)$/.test(lower)) {
    variants.add(lower + 'es')
    variants.add((lower[0].toUpperCase() + lower.slice(1)) + 'es')
  } else if (/[^aeiou]y$/.test(lower)) {
    variants.add(lower.replace(/y$/, 'ies'))
    const cap = lower[0].toUpperCase() + lower.slice(1)
    variants.add(cap.replace(/y$/, 'ies'))
  } else if (/(fe)$/.test(lower)) {
    variants.add(lower.replace(/fe$/, 'ves'))
    const cap = lower[0].toUpperCase() + lower.slice(1)
    variants.add(cap.replace(/fe$/, 'ves'))
  } else if (/(f)$/.test(lower)) {
    variants.add(lower.replace(/f$/, 'ves'))
    const cap = lower[0].toUpperCase() + lower.slice(1)
    variants.add(cap.replace(/f$/, 'ves'))
  } else {
    variants.add(lower + 's')
    variants.add((lower[0].toUpperCase() + lower.slice(1)) + 's')
  }
  return variants
}

function maskWordInSentence(sentence, word) {
  const text = sentence || ''
  const variants = buildWordVariants(word)
  if (!text || variants.size === 0) return { masked: text, answer: '' }

  // Find the first variant that exists in the sentence with word boundaries
  let foundVariant = ''
  let foundMatch = ''
  for (const v of variants) {
    const re = new RegExp(`\\b${escapeRegex(v)}\\b`, 'i')
    const m = text.match(re)
    if (m) {
      foundVariant = v
      foundMatch = m[0]
      break
    }
  }
  if (!foundVariant) return { masked: text, answer: '' }

  // Mask all occurrences of that variant (case-insensitive) preserving length
  const reAll = new RegExp(`\\b${escapeRegex(foundVariant)}\\b`, 'ig')
  const masked = text.replace(reAll, (m) => '_'.repeat(m.length))
  return { masked, answer: foundMatch }
}

export default function Practice({ vocabularies = [] }) {
  const [mode, setMode] = useState(MODES.VI_EN)
  
  // Separate state for each mode
  const [modeStates, setModeStates] = useState({
    [MODES.VI_EN]: { index: 0, score: 0, finished: false, input: '', feedback: { show: false, correctAnswer: '' }, order: [] },
    [MODES.EN_VI]: { index: 0, score: 0, finished: false, input: '', feedback: { show: false, correctAnswer: '' }, order: [] },
    [MODES.FILL_BLANK]: { index: 0, score: 0, finished: false, input: '', feedback: { show: false, correctAnswer: '' }, order: [] },
    [MODES.EXAMPLE]: { index: 0, score: 0, finished: false, input: '', feedback: { show: false, correctAnswer: '' }, order: [] },
  })

  const currentState = modeStates[mode]
  const { index, score, finished, input, feedback, order } = currentState

  // Initialize order for each mode when vocabularies change
  useEffect(() => {
    const newStates = { ...modeStates }
    Object.keys(MODES).forEach(modeKey => {
      const initialOrder = vocabularies.map((_, i) => i)
      for (let i = initialOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[initialOrder[i], initialOrder[j]] = [initialOrder[j], initialOrder[i]]
      }
      newStates[modeKey] = {
        index: 0,
        score: 0,
        finished: false,
        input: '',
        feedback: { show: false, correctAnswer: '' },
        order: initialOrder
      }
    })
    setModeStates(newStates)
  }, [vocabularies])

  const questions = useMemo(() => vocabularies, [vocabularies])
  const current = questions[order[index] ?? 0]
  const firstMeaning = current?.meanings?.[0]

  function normalize(s) {
    return (s || '').trim().toLowerCase()
  }

  const exampleData = useMemo(() => {
    const exs = current?.examples || []
    const variants = Array.from(buildWordVariants(current?.word || ''))
    // pick an example that contains any variant by word boundary
    let chosen = exs.find(e => {
      const s = e?.example_english || ''
      return variants.some(v => new RegExp(`\\b${escapeRegex(v)}\\b`, 'i').test(s))
    })
    if (!chosen) chosen = exs[0]
    const sentence = chosen?.example_english || ''
    return maskWordInSentence(sentence, current?.word || '')
  }, [current])

  function getCorrectAnswer() {
    if (mode === MODES.VI_EN) return current?.word || ''
    if (mode === MODES.EN_VI) return firstMeaning?.meaning_vietnamese || ''
    if (mode === MODES.FILL_BLANK) return current?.word || ''
    if (mode === MODES.EXAMPLE) return exampleData?.answer || ''
    return current?.word || ''
  }

  function updateModeState(updates) {
    setModeStates(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...updates }
    }))
  }

  function nextQuestion() {
    if (index === questions.length - 1) {
      updateModeState({ finished: true })
      return
    }
    updateModeState({
      index: index + 1,
      input: '',
      feedback: { show: false, correctAnswer: '' }
    })
  }

  function checkAnswer() {
    if (!current) return
    const answer = normalize(input)
    let correct = false

    if (mode === MODES.VI_EN) {
      correct = answer === normalize(current?.word)
    } else if (mode === MODES.EN_VI) {
      correct = answer === normalize(firstMeaning?.meaning_vietnamese)
    } else if (mode === MODES.FILL_BLANK) {
      correct = answer === normalize(current?.word)
    } else if (mode === MODES.EXAMPLE) {
      correct = answer === normalize(exampleData?.answer)
    } else {
      correct = answer === normalize(current?.word)
    }

    if (correct) {
      const newScore = score + 1
      if (index === questions.length - 1) {
        updateModeState({ finished: true, score: newScore })
      } else {
        updateModeState({
          index: index + 1,
          score: newScore,
          input: '',
          feedback: { show: false, correctAnswer: '' }
        })
      }
    } else {
      updateModeState({
        feedback: { show: true, correctAnswer: getCorrectAnswer() }
      })
    }
  }

  function tryAgain() {
    // reshuffle order for current mode
    const newOrder = vocabularies.map((_, i) => i)
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]]
    }
    updateModeState({
      index: 0,
      score: 0,
      finished: false,
      input: '',
      feedback: { show: false, correctAnswer: '' },
      order: newOrder
    })
  }

  function handleModeChange(newMode) {
    setMode(newMode)
  }

  if (!vocabularies.length) {
    return <div className="text-sm text-slate-500">Không có dữ liệu luyện tập.</div>
  }

  if (finished) {
    return (
      <div className="card p-6 text-center">
        <div className="text-xl font-semibold text-slate-800">Kết quả</div>
        <div className="text-primary-700 text-2xl mt-2">{score} / {questions.length}</div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button className="btn-primary" onClick={tryAgain}>Try Again</button>
          <a href="/" className="btn-primary">Back to Topics</a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${mode === MODES.VI_EN ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => handleModeChange(MODES.VI_EN)}>VI → EN</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${mode === MODES.EN_VI ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => handleModeChange(MODES.EN_VI)}>EN → VI</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${mode === MODES.FILL_BLANK ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => handleModeChange(MODES.FILL_BLANK)}>Fill in the blank</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm border ${mode === MODES.EXAMPLE ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`} onClick={() => handleModeChange(MODES.EXAMPLE)}>Điền từ vào câu ví dụ</button>
        <div className="ml-auto text-sm text-slate-600">Câu {index + 1}/{questions.length} • Điểm: {score}</div>
      </div>

      <div className="card p-6">
        {mode === MODES.VI_EN && (
          <div className="text-lg text-slate-800">{firstMeaning?.meaning_vietnamese}</div>
        )}
        {mode === MODES.EN_VI && (
          <div className="text-lg text-slate-800">{current?.word}</div>
        )}
        {mode === MODES.FILL_BLANK && (
          <div className="text-lg text-slate-800">{maskWord(current?.word)}</div>
        )}
        {mode === MODES.EXAMPLE && (
          <div className="text-lg text-slate-800">{exampleData?.masked || 'Không có ví dụ phù hợp.'}</div>
        )}

        <input
          value={input}
          onChange={(e) => updateModeState({ input: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') { feedback.show ? nextQuestion() : checkAnswer() } }}
          className={`mt-4 w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${feedback.show ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-primary-500'}`}
          placeholder="Nhập câu trả lời..."
        />

        {feedback.show && (
          <div className="mt-3 text-sm">
            <div className="text-red-600">Chưa đúng. Đáp án đúng: <span className="font-semibold">{feedback.correctAnswer}</span></div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          {!feedback.show && <button className="btn-primary" onClick={checkAnswer}>Submit</button>}
          {feedback.show && <button className="btn-primary" onClick={nextQuestion}>Next</button>}
        </div>
      </div>
    </div>
  )
}
