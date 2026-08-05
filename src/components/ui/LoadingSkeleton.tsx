export default function LoadingSkeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${className}`} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card space-y-4 animate-pulse">
      <div className="skeleton h-6 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex gap-3">
        <div className="skeleton h-10 w-24 rounded-xl" />
        <div className="skeleton h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="glass-card flex items-center gap-4 animate-pulse">
      <div className="skeleton w-16 h-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-4 w-48" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 animate-pulse">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
