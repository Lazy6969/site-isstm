import Skeleton from './Skeleton';

export default function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
        </div>
    );
}
