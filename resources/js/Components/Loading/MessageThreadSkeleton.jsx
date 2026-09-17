import Skeleton from './Skeleton';

export default function MessageThreadSkeleton() {
    return (
        <div className="flex-1 space-y-3 overflow-hidden p-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton className={`h-9 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
                </div>
            ))}
        </div>
    );
}
