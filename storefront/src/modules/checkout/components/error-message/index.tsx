const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
}: {
  error?: string | null
  "data-testid"?: string
}) => {
  if (!error) {
    return null
  }

  // Suppress Next.js internal redirect/notFound markers — these surface briefly
  // during a successful server-action redirect and shouldn't be shown to users.
  if (
    typeof error === "string" &&
    /NEXT_(REDIRECT|NOT_FOUND)/i.test(error)
  ) {
    return null
  }

  return (
    <div
      className="pt-2 text-rose-500 text-small-regular"
      data-testid={dataTestid}
    >
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
