const SkeletonDecorationEstimator = () => {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-4 rounded-xl border border-ui-border-base bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-2 phone:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-44 rounded bg-gray-200" />
        <div className="h-4 w-36 rounded bg-gray-200" />
      </div>
      <div className="h-7 w-32 rounded bg-gray-200" />
    </div>
  )
}

export default SkeletonDecorationEstimator
