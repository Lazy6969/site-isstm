import { Link } from '@inertiajs/react';
import { ClipboardList, Wallet } from 'lucide-react';

export default function CandidateSidebar({ content }) {
    const annee = content.inscription_annee_universitaire;
    const dateLimite = content.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="rounded-2xl bg-isstm-navy p-6 text-white lg:sticky lg:top-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-isstm-gold/20">
                <ClipboardList className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
            </div>

            <p className="mt-4 text-xs font-semibold tracking-wide text-white/50 uppercase">Dossier candidat</p>

            <span className="mt-2 inline-block rounded-full bg-isstm-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-isstm-gold uppercase">
                Campagne ouverte
            </span>

            <h2 className="mt-2 text-lg font-bold">Inscriptions {annee}</h2>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
                <div>
                    <p className="text-white/50">Année universitaire</p>
                    <p className="font-semibold">{annee}</p>
                </div>
                {dateLimite && (
                    <div>
                        <p className="text-white/50">Clôture</p>
                        <p className="font-semibold">{dateLimite}</p>
                    </div>
                )}
            </div>

            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/60">
                Complétez soigneusement le formulaire et vérifiez vos informations avant l&apos;envoi. Les conditions officielles publiées par
                l&apos;établissement prévalent.
            </p>

            <Link
                href="/inscription"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Voir les frais de formation
            </Link>
        </div>
    );
}
