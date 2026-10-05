import { Link } from '@inertiajs/react';
import { IdCard, Repeat, RotateCcw } from 'lucide-react';

function ParcoursCard({ href, icon: Icon, title, description }) {
    return (
        <Link
            href={href}
            className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-0.5 hover:border-isstm-gold hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-isstm-navy/5 text-isstm-navy transition group-hover:bg-isstm-gold/15 group-hover:text-isstm-gold dark:bg-white/5 dark:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 font-semibold text-isstm-navy dark:text-white">{title}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </Link>
    );
}

/**
 * The "Rejoindre" landing screen: the 3 parcours (Préinscription /
 * Réinscription / Redoublant), each its own real page — kept separate from
 * the préinscription wizard itself (/preinscription) so the address bar
 * always distinguishes "choosing a path" from "filling that path's form".
 */
export default function ParcoursSelector() {
    return (
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <ParcoursCard href="/preinscription" icon={IdCard} title="Préinscription" description="Nouveau candidat" />
            <ParcoursCard href="/reinscription?type=reinscription" icon={Repeat} title="Réinscription" description="Déjà étudiant(e)" />
            <ParcoursCard href="/reinscription?type=redoublement" icon={RotateCcw} title="Redoublant" description="Reprise d’année" />
        </div>
    );
}
