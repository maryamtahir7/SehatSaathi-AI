"use client"
import { useState, useEffect } from 'react'
import { apiEndpoints } from '../lib/api'

interface Props {
  onPredict: (symptoms: string[]) => void
}

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

export default function SymptomInput({ onPredict }: Props) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([])

  useEffect(() => {
    fetch(apiEndpoints.symptoms)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.symptoms)) {
          setAvailableSymptoms(data.symptoms)
        } else {
          throw new Error("Invalid response format")
        }
      })
      .catch(() =>
        setAvailableSymptoms(['fever', 'cough', 'fatigue', 'headache', 'nausea', 'vomiting', 'sore_throat', 'body_ache'])
      )
  }, [])

  const toggleSymptom = (s: string) => {
    if (selectedSymptoms.includes(s)) {
      setSelectedSymptoms(selectedSymptoms.filter((item) => item !== s))
    } else {
      setSelectedSymptoms([...selectedSymptoms, s])
    }
  }

  const filtered = availableSymptoms
    .filter((s) => s.toLowerCase().includes(search.toLowerCase()) && !selectedSymptoms.includes(s))
    .slice(0, 14)

  const formatLabel = (s: string) => s.replace(/_/g, ' ')

  return (
    <div className="symptom-ui">
      <section className="symptom-ui__section">
        <div className="symptom-ui__section-head">
          <label className="symptom-ui__label" htmlFor="symptom-search">
            <SearchIcon />
            Search symptoms
          </label>
          <span className="symptom-ui__hint">Type to filter the clinical library</span>
        </div>
        <div className="symptom-ui__search-wrap">
          <span className="symptom-ui__search-icon" aria-hidden>
            <SearchIcon />
          </span>
          <input
            id="symptom-search"
            data-diagnose-focus="symptom-search"
            type="text"
            placeholder="e.g. fever, persistent cough, fatigue…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="symptom-ui__search"
          />
        </div>
      </section>

      <section className="symptom-ui__section">
        <div className="symptom-ui__section-head symptom-ui__section-head--row">
          <label className="symptom-ui__label symptom-ui__label--plain">Suggested matches</label>
          <span className="symptom-ui__badge">{filtered.length} shown</span>
        </div>
        <div className="symptom-ui__chips">
          {filtered.map((s) => (
            <button key={s} type="button" onClick={() => toggleSymptom(s)} className="symptom-chip symptom-chip--add">
              <span className="symptom-chip__icon">
                <PlusIcon />
              </span>
              {formatLabel(s)}
            </button>
          ))}
          {filtered.length === 0 && search && (
            <p className="symptom-ui__empty">No symptoms match that phrase—try another keyword.</p>
          )}
        </div>
      </section>

      <section className="symptom-ui__section symptom-ui__queue">
        <div className="symptom-ui__queue-head">
          <div>
            <p className="symptom-ui__queue-title">Selected for analysis</p>
            <p className="symptom-ui__queue-sub">{selectedSymptoms.length} symptom{selectedSymptoms.length === 1 ? '' : 's'} in queue</p>
          </div>
          {selectedSymptoms.length > 0 && (
            <button type="button" className="symptom-ui__clear" onClick={() => setSelectedSymptoms([])}>
              <TrashIcon />
              Clear all
            </button>
          )}
        </div>

        <div className={`symptom-ui__queue-zone ${selectedSymptoms.length === 0 ? 'symptom-ui__queue-zone--empty' : ''}`}>
          {selectedSymptoms.map((s) => (
            <button key={s} type="button" onClick={() => toggleSymptom(s)} className="symptom-chip symptom-chip--selected">
              {formatLabel(s)}
              <span className="symptom-chip__remove" aria-hidden>
                ×
              </span>
            </button>
          ))}
          {selectedSymptoms.length === 0 && (
            <p className="symptom-ui__placeholder">Select symptoms above to build your case profile.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPredict(selectedSymptoms)}
          disabled={selectedSymptoms.length === 0}
          className="symptom-ui__cta"
        >
          <span>{selectedSymptoms.length > 0 ? 'Generate clinical brief' : 'Select symptoms to continue'}</span>
          {selectedSymptoms.length > 0 && (
            <span className="symptom-ui__cta-arrow" aria-hidden>
              →
            </span>
          )}
        </button>
      </section>

      <style jsx>{`
        .symptom-ui {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }
        .symptom-ui__section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .symptom-ui__section-head {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .symptom-ui__section-head--row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .symptom-ui__label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: Outfit, system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .symptom-ui__label--plain {
          letter-spacing: 0.1em;
        }
        .symptom-ui__label svg {
          color: #38bdf8;
          opacity: 0.9;
        }
        .symptom-ui__hint {
          font-size: 0.82rem;
          color: #64748b;
          padding-left: 0.1rem;
        }
        .symptom-ui__badge {
          font-family: Outfit, sans-serif;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #a5b4fc;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
        }

        .symptom-ui__search-wrap {
          position: relative;
        }
        .symptom-ui__search-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: #38bdf8;
          opacity: 0.65;
          pointer-events: none;
        }
        .symptom-ui__search {
          width: 100%;
          padding: 1.15rem 1.25rem 1.15rem 3.35rem;
          border-radius: 18px;
          border: 1px solid rgba(226, 232, 240, 1);
          background: linear-gradient(180deg, rgba(2, 6, 23, 0.72) 0%, rgba(15, 23, 42, 0.45) 100%);
          color: #0f172a;
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .symptom-ui__search::placeholder {
          color: #64748b;
        }
        .symptom-ui__search:focus {
          border-color: rgba(56, 189, 248, 0.65);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          background: rgba(14, 165, 233, 0.07);
        }

        .symptom-ui__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }
        .symptom-chip {
          font-family: Outfit, system-ui, sans-serif;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s, border-color 0.22s, background 0.22s;
        }
        .symptom-chip--add {
          padding: 0.55rem 1.1rem 0.55rem 0.65rem;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #1e293b;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(226, 232, 240, 1);
        }
        .symptom-chip__icon {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(14, 165, 233, 0.12);
          color: #38bdf8;
        }
        .symptom-chip--add:hover {
          transform: translateY(-3px);
          border-color: rgba(56, 189, 248, 0.45);
          background: rgba(14, 165, 233, 0.1);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        }

        .symptom-chip--selected {
          padding: 0.55rem 1rem 0.55rem 1.1rem;
          border-radius: 999px;
          font-size: 0.88rem;
          font-weight: 700;
          color: #ecfeff;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%);
          border: 1px solid rgba(56, 189, 248, 0.45);
          box-shadow: 0 10px 26px rgba(14, 165, 233, 0.15);
        }
        .symptom-chip__remove {
          opacity: 0.55;
          font-size: 1.15rem;
          font-weight: 400;
          line-height: 1;
          margin-left: 0.15rem;
        }
        .symptom-chip--selected:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(129, 230, 217, 0.65);
          box-shadow: 0 16px 36px rgba(14, 165, 233, 0.28);
        }

        .symptom-ui__empty {
          margin: 0;
          color: #64748b;
          font-size: 0.92rem;
          font-style: italic;
          width: 100%;
        }

        .symptom-ui__queue {
          padding-top: 0.25rem;
        }
        .symptom-ui__queue-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .symptom-ui__queue-title {
          font-family: Outfit, sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.2rem;
          letter-spacing: -0.02em;
        }
        .symptom-ui__queue-sub {
          margin: 0;
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 500;
        }
        .symptom-ui__clear {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border: none;
          background: transparent;
          color: #f87171;
          font-family: Outfit, sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.35rem 0;
          transition: color 0.2s;
        }
        .symptom-ui__clear:hover {
          color: #fca5a5;
        }

        .symptom-ui__queue-zone {
          min-height: 120px;
          padding: 1.35rem;
          border-radius: 22px;
          border: 1px dashed rgba(255, 255, 255, 0.12);
          background: rgba(2, 6, 23, 0.35);
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          align-content: flex-start;
          position: relative;
          transition: border-color 0.25s, background 0.25s;
        }
        .symptom-ui__queue-zone:not(.symptom-ui__queue-zone--empty) {
          border-style: solid;
          border-color: rgba(14, 165, 233, 0.22);
          background: rgba(14, 165, 233, 0.04);
        }
        .symptom-ui__placeholder {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
          width: 90%;
          text-align: center;
          font-size: 0.92rem;
          color: #475569;
          font-weight: 500;
          line-height: 1.55;
          pointer-events: none;
        }

        .symptom-ui__cta {
          width: 100%;
          margin-top: 0.25rem;
          padding: 1.2rem 1.5rem;
          border-radius: 18px;
          border: 1px solid transparent;
          font-family: Outfit, sans-serif;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s, opacity 0.2s;
          background: rgba(255, 255, 255, 0.04);
          color: #64748b;
        }
        .symptom-ui__cta:disabled {
          cursor: not-allowed;
          opacity: 0.85;
        }
        .symptom-ui__cta:not(:disabled) {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.18);
          background: linear-gradient(125deg, #0ea5e9 0%, #6366f1 48%, #8b5cf6 100%);
          background-size: 160% auto;
          box-shadow: 0 18px 44px rgba(79, 70, 229, 0.38);
        }
        .symptom-ui__cta:not(:disabled):hover {
          transform: translateY(-4px);
          background-position: 90% center;
          box-shadow: 0 26px 56px rgba(79, 70, 229, 0.48);
        }
        .symptom-ui__cta-arrow {
          font-size: 1.15rem;
          font-weight: 600;
          opacity: 0.95;
        }
      `}</style>
    </div>
  )
}
