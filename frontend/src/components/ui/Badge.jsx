import './Badge.css'

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge priority-badge priority-${priority}`}>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  )
}

export function LabelBadge({ label }) {
  return <span className="badge label-badge">{label}</span>
}

export default function Badge({ children, color }) {
  return (
    <span className="badge" style={color ? { background: color, color: '#fff' } : undefined}>
      {children}
    </span>
  )
}
