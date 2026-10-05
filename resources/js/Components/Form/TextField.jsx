import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from '../../lib/useTranslations';

const inputClass =
    'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

/**
 * Labelled input. Password fields get an eye button to show / hide what was
 * typed (shown → text, hidden → password).
 */
export default function TextField({ label, error, className = '', type, ...props }) {
    const { t } = useTranslations();
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className={className}>
            {label && (
                <label htmlFor={props.id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            {isPassword ? (
                <div className="relative">
                    <input {...props} type={revealed ? 'text' : 'password'} className={`${inputClass} pr-11`} />
                    <button
                        type="button"
                        onClick={() => setRevealed((value) => !value)}
                        aria-label={revealed ? t('auth.masquer_mot_de_passe', 'Masquer le mot de passe') : t('auth.afficher_mot_de_passe', 'Afficher le mot de passe')}
                        aria-pressed={revealed}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:text-isstm-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-isstm-navy/30 dark:text-slate-400 dark:hover:text-isstm-gold"
                    >
                        {revealed ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
                    </button>
                </div>
            ) : (
                <input {...props} type={type} className={inputClass} />
            )}
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
