export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:top-16 md:bottom-0">
      <div
        role="status"
        aria-label="Finding films"
        className="mx-auto flex h-full max-w-110 flex-col px-3 pt-3 pb-4"
      >
        <div className="h-9" />
        <div className="flex-1 rounded-xl bg-raised motion-safe:animate-skeleton" />
        <div className="h-17" />
      </div>
    </div>
  );
}
