const SkeletonOrderCard = () => {
  return (
    <div
      aria-hidden
      className="rounded-xl border border-ui-border-base bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 phone:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md bg-gray-100" />
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <div className="h-8 w-24 rounded bg-gray-200" />
      </div>
    </div>
  )
}

const SkeletonOrderCardList = ({ count = 3 }: { count?: number }) => {
  return (
    <ul className="flex flex-col gap-3 list-none p-0">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <SkeletonOrderCard />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonOrderCardList
