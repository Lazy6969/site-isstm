import Skeleton from './Skeleton';

/**
 * Full-page placeholder shown in place of the previous page's content while
 * an Inertia visit targeting an espace étudiant route is in flight (mirrors
 * HomeLoadingSkeleton's role for "/") — a generic header+list shape close
 * enough to fil communautaire/amis/messages/groupes/notifications alike,
 * since they all share AppLayout's chrome.
 */
export default function CommunitySkeleton() {
    return (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-50 dark:bg-slate-900" aria-hidden="true">
            <div className="flex h-[60px] items-center justify-between bg-isstm-menu px-4 sm:px-6">
                <div className="hidden gap-1 md:flex">
                    <Skeleton className="h-8 w-28 rounded-full bg-white/15" />
                    <Skeleton className="h-8 w-16 rounded-full bg-white/15" />
                    <Skeleton className="h-8 w-20 rounded-full bg-white/15" />
                    <Skeleton className="h-8 w-20 rounded-full bg-white/15" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full bg-white/15 md:hidden" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/15" />
                    <Skeleton className="h-9 w-9 rounded-full bg-white/15" />
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <div className="mb-6 flex gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-16 flex-shrink-0 rounded-full" />
                    ))}
                </div>

                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
