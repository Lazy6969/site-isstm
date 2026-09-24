import Skeleton from './Skeleton';

export default function StoriesBarSkeleton() {
    return (
        <div className="mb-6 flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-28 flex-shrink-0 rounded-2xl" />
            ))}
        </div>
    );
}
