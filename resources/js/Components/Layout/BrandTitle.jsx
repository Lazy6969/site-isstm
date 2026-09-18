export default function BrandTitle({ className = '' }) {
    return (
        <div className={`hidden border-l border-white/25 pl-3.5 sm:block ${className}`}>
            <span className="block text-[0.95rem] leading-tight font-bold tracking-tight text-white">Institut Supérieur des Sciences</span>
            <span className="block text-[0.95rem] leading-tight font-bold tracking-tight text-white">et Technologies de Mahajanga</span>
            <span className="mt-1 block text-[0.65rem] font-bold tracking-[0.14em] text-isstm-gold uppercase">Honnêteté - Discipline - Excellence</span>
        </div>
    );
}
