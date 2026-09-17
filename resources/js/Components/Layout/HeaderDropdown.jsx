import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function HeaderDropdown({ label, items, align = 'left', trigger = null }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function onClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium transition hover:text-isstm-gold"
                aria-expanded={open}
            >
                {trigger ?? (
                    <>
                        {label}
                        <svg viewBox="0 0 20 20" fill="currentColor" className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}>
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </>
                )}
            </button>

            {open && (
                <div
                    className={`absolute z-50 mt-2 w-56 rounded-xl bg-white py-1.5 text-slate-700 shadow-xl ring-1 ring-slate-200 ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    {items.map((item) =>
                        item.divider ? (
                            <div key={item.key ?? 'divider'} className="my-1 border-t border-slate-100" />
                        ) : item.onClick ? (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setOpen(false);
                                    item.onClick();
                                }}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 hover:text-isstm-navy"
                            >
                                {item.label}
                            </button>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm hover:bg-slate-50 hover:text-isstm-navy"
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
