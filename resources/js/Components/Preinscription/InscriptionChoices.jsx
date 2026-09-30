import { Link } from '@inertiajs/react';
import { CalendarClock, FileSignature, Repeat, RotateCcw, Wallet } from 'lucide-react';

const CHOICES = [
    { key: 'preinscription', href: '/preinscription', icon: FileSignature, label: 'Préinscription', description: 'Nouveau candidat' },
    { key: 'reinscription', href: '/reinscription?type=reinscription', icon: Repeat, label: 'Réinscription', description: 'Déjà étudiant(e)' },
    { key: 'redoublement', href: '/reinscription?type=redoublement', icon: RotateCcw, label: 'Redoublant', description: 'Reprise d’année' },
];

/**
 * The "Votre parcours" panel shown alongside a wizard's actual form steps —
 * once the candidate/étudiant has already picked their parcours on the intro
 * screen (see ParcoursSelector), this only carries the année universitaire /
 * date limite de dépôt and the link to the frais page. Set `showChoices` to
 * also list the 3 parcours (used where there's no separate intro screen to
 * pick one from).
 */
export default function InscriptionChoices({ active, content, showChoices = false }) {
    const annee = content?.inscription_annee_universitaire;
    const dateLimite = content?.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="rounded-2xl bg-isstm-navy p-6 text-white lg:sticky lg:top-6">
            <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">Votre parcours</p>

            {showChoices && (
                <div className="mt-4 space-y-2">
                    {CHOICES.map((choice) => {
                        const Icon = choice.icon;
                        const isActive = choice.key === active;
                        return (
                            <Link
                                key={choice.key}
                                href={choice.href}
                                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
                                    isActive ? 'border-isstm-gold bg-isstm-gold/15' : 'border-white/10 hover:bg-white/5'
                                }`}
                            >
                                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-isstm-gold' : 'text-white/60'}`} aria-hidden="true" />
                                <div>
                                    <p className="text-sm font-semibold">{choice.label}</p>
                                    <p className="text-xs text-white/50">{choice.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {(annee || dateLimite) && (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
                    {annee && (
                        <div>
                            <p className="text-white/50">Année universitaire</p>
                            <p className="font-semibold">{annee}</p>
                        </div>
                    )}
                    {dateLimite && (
                        <div className="flex items-start gap-2">
                            <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                            <div>
                                <p className="text-white/50">Clôture des dépôts</p>
                                <p className="font-semibold">{dateLimite}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Link
                href="/inscription"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Voir les frais et dossiers à fournir
            </Link>
        </div>
    );
}
