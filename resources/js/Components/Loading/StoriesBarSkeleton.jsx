import Skeleton from './Skeleton';

export default function StoriesBarSkeleton() {
    return (
        <div className="mb-6 flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-shrink-0 flex-col items-center gap-1.5">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-2.5 w-12" />
                </div>
            ))}
        </div>
    );
}
