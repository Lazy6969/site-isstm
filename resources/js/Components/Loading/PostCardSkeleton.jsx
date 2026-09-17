import Skeleton from './Skeleton';

export default function PostCardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
            </div>
            <Skeleton className="mt-4 h-48 w-full" />
            <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}
