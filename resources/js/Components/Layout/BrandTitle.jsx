export default function BrandTitle({ className = '' }) {
    return (
        <div className={`min-w-0 border-l border-white/25 pl-2.5 sm:pl-3.5 ${className}`}>
            <span className="block truncate text-[0.65rem] leading-tight font-bold tracking-tight text-white sm:text-[0.95rem]">
                Institut Supérieur des Sciences
            </span>
            <span className="block truncate text-[0.65rem] leading-tight font-bold tracking-tight text-white sm:text-[0.95rem]">
                et Technologies de Mahajanga
            </span>
            <span className="mt-0.5 hidden text-[0.65rem] font-bold tracking-[0.14em] text-isstm-gold uppercase sm:mt-1 sm:block">
                Honnêteté - Discipline - Excellence
            </span>
        </div>
    );
}
