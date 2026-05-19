const SkeletonProductionEtaStrip = () => {
  return (
    <div
      aria-hidden
      className="flex items-center justify-between gap-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-36 rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-3 w-16 rounded bg-gray-200" />
    </div>
  )
}

export default SkeletonProductionEtaStrip
