import { useStore } from '@tanstack/react-store'
import { useRecall, useRemember } from '../memory/hooks'
import { type FormField, setField, ui } from '../store'

interface Props {
  scope: 'memory' | 'app-memory'
  rememberField: FormField
  recallField: FormField
  disabled?: boolean
}

export function MemoryPanel({
  scope,
  rememberField,
  recallField,
  disabled,
}: Props) {
  const text = useStore(ui, (s) => s[rememberField])
  const query = useStore(ui, (s) => s[recallField])
  const remember = useRemember(scope)
  const recall = useRecall(scope)

  return (
    <div className="memory" data-testid={`${scope}-panel`}>
      <label>
        Fact for the agent to remember
        <textarea
          value={text}
          onChange={(e) => setField(rememberField, e.target.value)}
          rows={2}
        />
      </label>
      <button
        type="button"
        disabled={disabled || remember.isPending}
        onClick={() => remember.mutate(text)}
      >
        {remember.isPending ? 'Storing on Walrus…' : 'Remember'}
      </button>
      {remember.data && (
        <p className="ok" data-testid={`${scope}-remembered`}>
          Stored as blob <code>{remember.data.blob_id}</code> in{' '}
          <code>{remember.data.namespace}</code>
        </p>
      )}
      {remember.error && <p className="error">{remember.error.message}</p>}

      <label>
        Recall query
        <input
          value={query}
          onChange={(e) => setField(recallField, e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={disabled || recall.isPending}
        onClick={() => recall.mutate(query)}
      >
        {recall.isPending ? 'Recalling…' : 'Recall'}
      </button>
      {recall.error && (
        <p className="error" data-testid={`${scope}-recall-error`}>
          {recall.error.message}
        </p>
      )}
      {recall.data && (
        <ol className="results" data-testid={`${scope}-results`}>
          {recall.data.length === 0 && <li>No memories matched.</li>}
          {recall.data.map((m) => (
            <li key={m.blob_id}>
              {m.text}{' '}
              <span className="muted">distance {m.distance.toFixed(3)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
