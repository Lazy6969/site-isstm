export default function BrandTitle({ className = '' }) {
    return (
        <div className={`brand-title hidden border-l border-white/25 pl-3.5 sm:block ${className}`}>
            <span className="brand-title-line1 text-[0.95rem] font-bold leading-tight tracking-tight text-white">
                Institut Supérieur des Sciences
            </span>
            <span className="brand-title-line2 text-[0.95rem] font-bold leading-tight tracking-tight text-white">
                et Technologies de Mahajanga
            </span>
            <span className="brand-title-motto mt-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-isstm-gold">
                Honnêteté - Discipline - Excellence
            </span>
        </div>
    );
}
