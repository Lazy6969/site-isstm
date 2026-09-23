function Block({ className = '' }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

/**
 * Full-page placeholder shown in place of the previous page's content while
 * an Inertia visit targeting the homepage is in flight — mirrors Home.jsx's
 * section order/proportions so the swap-in doesn't jump around.
 */
export default function HomeLoadingSkeleton() {
    return (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-white dark:bg-slate-950" aria-hidden="true">
            <div className="flex h-16 items-center justify-between bg-isstm-navy px-4 sm:px-6">
                <div className="flex items-center gap-3.5">
                    <Block className="h-10 w-10 rounded-full bg-white/15" />
                    <Block className="h-4 w-28 bg-white/15" />
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <Block className="h-8 w-20 bg-white/15" />
                    <Block className="h-8 w-24 bg-white/15" />
                    <Block className="h-8 w-16 bg-white/15" />
                    <Block className="h-8 w-16 bg-white/15" />
                </div>
                <Block className="h-8 w-8 rounded-full bg-white/15" />
            </div>

            <Block className="h-[70vh] min-h-[420px] rounded-none bg-slate-300 dark:bg-slate-800" />

            <section className="relative z-20 mx-auto -mt-16 max-w-5xl px-6">
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                            <Block className="mx-auto h-5 w-5 rounded-full" />
                            <Block className="mx-auto mt-2 h-5 w-10" />
                            <Block className="mx-auto mt-2 h-3 w-16" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-6 py-12 sm:py-20">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row">
                    <Block className="h-64 w-64 flex-shrink-0 rounded-2xl" />
                    <div className="w-full space-y-3">
                        <Block className="h-4 w-1/3" />
                        <Block className="h-3 w-full" />
                        <Block className="h-3 w-full" />
                        <Block className="h-3 w-2/3" />
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
                <div className="mx-auto max-w-6xl px-6">
                    <Block className="h-[420px] w-full rounded-[2.5rem]" />
                </div>
            </section>

            <section className="py-12 sm:py-20">
                <div className="mx-auto max-w-6xl px-6">
                    <Block className="mx-auto h-6 w-48" />
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                <Block className="h-28 w-full rounded-none" />
                                <div className="space-y-2 p-3.5">
                                    <Block className="h-3 w-2/3" />
                                    <Block className="h-3 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
                <div className="mx-auto max-w-6xl px-6">
                    <Block className="h-6 w-56" />
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                                <Block className="h-36 w-full rounded-none" />
                                <div className="space-y-2 p-4">
                                    <Block className="h-3 w-1/3" />
                                    <Block className="h-3 w-full" />
                                    <Block className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 sm:py-20">
                <div className="mx-auto max-w-4xl px-6">
                    <Block className="h-40 w-full rounded-2xl" />
                </div>
            </section>

            <section className="py-10 sm:py-16">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Block key={i} className="h-10 w-24" />
                    ))}
                </div>
            </section>

            <section className="bg-slate-50 py-12 sm:py-20 dark:bg-slate-900">
                <div className="mx-auto max-w-6xl px-6">
                    <Block className="mx-auto h-6 w-32" />
                    <Block className="mt-8 h-64 w-full rounded-2xl" />
                </div>
            </section>

            <div className="bg-isstm-navy-dark px-6 py-14">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Block className="h-3 w-24 bg-white/15" />
                            <Block className="h-3 w-full bg-white/15" />
                            <Block className="h-3 w-full bg-white/15" />
                            <Block className="h-3 w-2/3 bg-white/15" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
