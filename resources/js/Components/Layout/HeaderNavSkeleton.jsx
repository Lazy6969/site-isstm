/** Placeholder shown in the header's nav + controls slots while an Inertia visit is in flight. */
export default function HeaderNavSkeleton() {
    return (
        <>
            <div className="hidden min-w-0 items-center gap-2 justify-self-center md:flex" aria-hidden="true">
                <span className="h-8 w-24 animate-pulse rounded-md bg-white/15" />
                <span className="h-8 w-28 animate-pulse rounded-md bg-white/15" />
                <span className="h-8 w-20 animate-pulse rounded-md bg-white/15" />
                <span className="h-8 w-16 animate-pulse rounded-md bg-white/15" />
                <span className="h-8 w-16 animate-pulse rounded-md bg-white/15" />
            </div>

            <div className="flex items-center gap-2 justify-self-end sm:gap-3" aria-hidden="true">
                <span className="hidden h-8 w-8 animate-pulse rounded-full bg-white/15 md:block" />
                <span className="hidden h-8 w-8 animate-pulse rounded-full bg-white/15 md:block" />
                <span className="h-8 w-8 animate-pulse rounded-full bg-white/15" />
            </div>
        </>
    );
}
