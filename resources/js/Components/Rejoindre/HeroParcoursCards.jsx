import { Link, usePage } from '@inertiajs/react';
import { Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { useTranslations } from '../../lib/useTranslations';
import { getIcon } from '../QuickEdit/icons';
import EditParcoursCardDialog from './EditParcoursCardDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

// Only these two entry points are gated — "Suivre mon dossier" stays open
// regardless of registration status or account role.
const GATED_CARD_KEYS = ['rejoindre_parcours_1', 'rejoindre_parcours_2'];

const CARDS = [
    {
        key: 'rejoindre_parcours_1',
        href: '/preinscription',
        defaultLabel: 'Préinscription',
        descriptionKey: 'rejoindre.parcours_nouveau_candidat',
        defaultDescription: 'Nouveau candidat',
        defaultIcon: 'IdCard',
    },
    {
        // Was "Réinscription", then merged with "Redoublant" into "Ancien
        // étudiant" — same content key throughout, so any text/icon/blur an
        // admin already set for this slot still carries over.
        key: 'rejoindre_parcours_2',
        href: '/ancien-etudiant',
        defaultLabel: 'Ancien étudiant',
        descriptionKey: 'rejoindre.parcours_ancien_etudiant',
        defaultDescription: 'Déjà étudiant(e)',
        defaultIcon: 'UserCheck',
    },
    {
        key: 'rejoindre_parcours_3',
        href: '/suivi-dossier',
        defaultLabel: 'Suivre mon dossier',
        descriptionKey: 'rejoindre.parcours_suivre_dossier',
        defaultDescription: 'Déjà soumis',
        defaultIcon: 'Search',
    },
];

const BLUR_PX = { none: 0, sm: 4, md: 10, lg: 18, xl: 28 };

function Card({ card }) {
    const { canEdit, active } = useQuickEdit();
    const { t } = useTranslations();
    const { auth, content, contentStyles, inscriptionsClosed, inscriptionsClosedMessage } = usePage().props;
    const editable = canEdit && active;
    const style = contentStyles?.[card.key] ?? {};
    const label = content[card.key] ?? card.defaultLabel;
    const description = t(card.descriptionKey, card.defaultDescription);
    const Icon = getIcon(style.icon || card.defaultIcon);
    const blur = BLUR_PX[style.blur ?? 'md'] ?? BLUR_PX.md;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState(null);

    const isGated = GATED_CARD_KEYS.includes(card.key);
    const alreadyEnrolled = isGated && auth?.user?.role === 'etudiant';
    const closed = isGated && inscriptionsClosed;
    const blocked = closed || alreadyEnrolled;

    const glass = {
        backgroundColor: 'rgba(255,255,255,0.16)',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
    };

    const body = (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 py-4 text-center text-white">
            <Icon className="h-6 w-6 text-isstm-gold" aria-hidden="true" />
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-white/75">{description}</p>
        </div>
    );

    function onBlockedClick() {
        setBlockedMessage(
            closed
                ? inscriptionsClosedMessage
                : t('rejoindre.deja_inscrit', 'Vous êtes déjà inscrit(e) en tant qu’étudiant.'),
        );
    }

    return (
        <div className="relative h-full">
            <div className="h-full min-h-[110px] rounded-2xl border border-white/30 shadow-lg" style={glass}>
                {editable ? (
                    body
                ) : blocked ? (
                    <button type="button" onClick={onBlockedClick} className="block h-full w-full cursor-not-allowed opacity-75">
                        {body}
                    </button>
                ) : (
                    <Link href={card.href} className="block h-full w-full">
                        {body}
                    </Link>
                )}
            </div>

            {editable && (
                <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                    aria-label="Modifier cette carte"
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            )}

            <EditParcoursCardDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                contentKey={card.key}
                initialLabel={label}
                initialStyle={style}
                defaultIcon={card.defaultIcon}
            />

            <Dialog open={blockedMessage !== null} onOpenChange={(next) => !next && setBlockedMessage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-isstm-navy" aria-hidden="true" />
                            {t('rejoindre.acces_ferme_titre', 'Accès indisponible')}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-admin-text-secondary">{blockedMessage}</p>
                    <DialogFooter>
                        <Button onClick={() => setBlockedMessage(null)} className="bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90">
                            {t('rejoindre.compris', 'Compris')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/**
 * The "Rejoindre" hero's 2 parcours cards — a fixed, non-draggable side-by-side
 * pair (frosted glass over the photo), each still editable (text/icon/blur)
 * by a super admin via the pencil. An earlier version let an admin freely
 * drag/resize each card; that was removed in favor of this simple, always-
 * aligned layout.
 */
export default function HeroParcoursCards() {
    return (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:w-[620px]">
            {CARDS.map((card) => (
                <Card key={card.key} card={card} />
            ))}
        </div>
    );
}
