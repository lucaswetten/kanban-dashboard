import './Spinner.css'

export default function Spinner({ size = 20, color }) {
  return (
    <span
      className="spinner"
      style={{
        width: size,
        height: size,
        borderColor: color ? `${color}33` : undefined,
        borderTopColor: color ?? undefined,
      }}
    />
  )
}
