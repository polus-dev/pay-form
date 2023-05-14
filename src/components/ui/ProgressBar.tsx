export const ProgressBar = ({ value }: { value: number }) => {
  return (
    <div className="progress-bar">
      <div className="progress-bar-value" style={{ width: `${value}%` }}></div>
    </div>)
}
