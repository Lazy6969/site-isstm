import { useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, CornerDownLeft, Hammer, HandCoins, Archive, CalendarPlus, X } from 'lucide-react';
import { ErrorBanner, Field, GhostButton, PrimaryButton, inputClass } from './kit';
import { cn } from '../../lib/utils';

const today = () => new Date().toISOString().slice(0, 10);
const FIELD_KEYS = (form) => Object.keys(form.errors).filter((key) => key !== 'action');

/** Frame shared by every action form: title, close button, then the fields. */
function Frame({ icon: Icon, title, tone = 'text-admin-accent', hint, onClose, children }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-md">
            <header className="flex items-center gap-3 border-b border-admin-border bg-gradient-to-r from-admin-accent/10 to-transparent px-5 py-3.5">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-admin-accent/10', tone)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-admin-text">{title}</h3>
                    {hint && <p className="text-xs text-admin-text-secondary">{hint}</p>}
                </div>
                <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </header>
            <div className="space-y-4 p-5">{children}</div>
        </section>
    );
}

function Footer({ form, onClose, label, disabled }) {
    return (
        <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
            <GhostButton type="button" onClick={onClose}>
                Annuler
            </GhostButton>
            <PrimaryButton type="submit" disabled={form.processing || disabled}>
                {label}
            </PrimaryButton>
        </div>
    );
}

/** Posts the form, closes it on success. */
function useAction(url, initial, onClose) {
    const form = useForm(initial);
    const submit = (e) => {
        e.preventDefault();
        form.post(url, { preserveScroll: true, onSuccess: onClose });
    };

    return [form, submit];
}

export function MoveForm({ materiel, localisations, onClose }) {
    const [form, submit] = useAction(`/materiel/inventaire/${materiel.id}/deplacer`, { vers: '', note: '' }, onClose);

    return (
        <Frame icon={ArrowRightLeft} title="Déplacer le matériel" hint={`Actuellement : ${materiel.localisation ?? 'non localisé'}`} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Nouvelle localisation *" error={form.errors.vers}>
                    <input value={form.data.vers} onChange={(e) => form.setData('vers', e.target.value)} className={inputClass} list="deplacer-localisations" autoFocus placeholder="Salle, bureau, magasin…" />
                    <datalist id="deplacer-localisations">
                        {localisations.map((place) => (
                            <option key={place} value={place} />
                        ))}
                    </datalist>
                </Field>
                <Field label="Note (facultative)" error={form.errors.note}>
                    <input value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} className={inputClass} placeholder="Raison du déplacement" />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Enregistrer le déplacement" disabled={form.data.vers.trim() === ''} />
            </form>
        </Frame>
    );
}

export function LendForm({ materiel, options, onClose }) {
    const [form, submit] = useAction(
        `/materiel/inventaire/${materiel.id}/preter`,
        { emprunteur_nom: '', emprunteur_type: 'etudiant', emprunteur_reference: '', emprunteur_contact: '', motif: '', date_sortie: today(), date_retour_prevue: '' },
        onClose,
    );
    const set = (key) => (e) => form.setData(key, e.target.value);

    return (
        <Frame icon={HandCoins} title="Prêter le matériel" hint="Qui l’emprunte, pour quoi, et jusqu’à quand" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nom de l’emprunteur *" error={form.errors.emprunteur_nom}>
                        <input value={form.data.emprunteur_nom} onChange={set('emprunteur_nom')} className={inputClass} autoFocus />
                    </Field>
                    <Field label="Qualité *" error={form.errors.emprunteur_type}>
                        <select value={form.data.emprunteur_type} onChange={set('emprunteur_type')} className={inputClass}>
                            {Object.entries(options.emprunteur_types).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Matricule / pièce" error={form.errors.emprunteur_reference}>
                        <input value={form.data.emprunteur_reference} onChange={set('emprunteur_reference')} className={inputClass} placeholder="ISSTM-2026-00001" />
                    </Field>
                    <Field label="Contact" error={form.errors.emprunteur_contact}>
                        <input value={form.data.emprunteur_contact} onChange={set('emprunteur_contact')} className={inputClass} placeholder="Téléphone ou e-mail" />
                    </Field>
                    <Field label="Date de sortie *" error={form.errors.date_sortie}>
                        <input type="date" value={form.data.date_sortie} onChange={set('date_sortie')} className={inputClass} />
                    </Field>
                    <Field label="Retour prévu le *" error={form.errors.date_retour_prevue}>
                        <input type="date" min={form.data.date_sortie} value={form.data.date_retour_prevue} onChange={set('date_retour_prevue')} className={inputClass} />
                    </Field>
                </div>
                <Field label="Motif" error={form.errors.motif}>
                    <input value={form.data.motif} onChange={set('motif')} className={inputClass} placeholder="Cours, exposé, événement…" />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Enregistrer le prêt" disabled={form.data.emprunteur_nom.trim() === '' || form.data.date_retour_prevue === ''} />
            </form>
        </Frame>
    );
}

export function BreakdownForm({ materiel, onClose }) {
    const [form, submit] = useAction(`/materiel/inventaire/${materiel.id}/panne`, { titre: '', description: '' }, onClose);

    return (
        <Frame icon={AlertTriangle} tone="text-rose-500" title="Signaler une panne" hint="Le matériel passe « En panne » et n’est plus prêtable" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Nature de la panne *" error={form.errors.titre}>
                    <input value={form.data.titre} onChange={(e) => form.setData('titre', e.target.value)} className={inputClass} autoFocus placeholder="Ex. Ne s’allume plus" />
                </Field>
                <Field label="Détails" error={form.errors.description}>
                    <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={3} className={cn(inputClass, 'h-auto py-2')} />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Signaler la panne" disabled={form.data.titre.trim() === ''} />
            </form>
        </Frame>
    );
}

export function MaintenanceForm({ materiel, onClose }) {
    const broken = materiel.statut === 'en_panne';
    const [form, submit] = useAction(
        `/materiel/inventaire/${materiel.id}/maintenance`,
        { type: broken ? 'reparation' : 'maintenance', titre: broken ? materiel.intervention?.titre ?? '' : '', description: '', prestataire: '' },
        onClose,
    );

    return (
        <Frame icon={Hammer} tone="text-amber-500" title={broken ? 'Prendre en charge la réparation' : 'Mettre en maintenance'} hint={broken ? 'La panne ouverte devient une réparation' : 'Maintenance préventive ou réparation planifiée'} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                {!broken && (
                    <Field label="Type" error={form.errors.type}>
                        <select value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} className={inputClass}>
                            <option value="maintenance">Maintenance</option>
                            <option value="reparation">Réparation</option>
                        </select>
                    </Field>
                )}
                <Field label="Intitulé *" error={form.errors.titre}>
                    <input value={form.data.titre} onChange={(e) => form.setData('titre', e.target.value)} className={inputClass} autoFocus placeholder="Ex. Remplacement de l’alimentation" />
                </Field>
                <Field label="Prestataire / technicien" error={form.errors.prestataire}>
                    <input value={form.data.prestataire} onChange={(e) => form.setData('prestataire', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Détails" error={form.errors.description}>
                    <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={3} className={cn(inputClass, 'h-auto py-2')} />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Mettre en maintenance" disabled={form.data.titre.trim() === ''} />
            </form>
        </Frame>
    );
}

export function ReturnForm({ emprunt, options, onClose }) {
    const [form, submit] = useAction(`/materiel/emprunts/${emprunt.id}/retour`, { etat_au_retour: 'bon', note_retour: '' }, onClose);

    return (
        <Frame icon={CornerDownLeft} title="Enregistrer le retour" hint={`Rendu par ${emprunt.emprunteur_nom}`} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="État au retour *" error={form.errors.etat_au_retour}>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(options.etats_retour).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => form.setData('etat_au_retour', value)}
                                aria-pressed={form.data.etat_au_retour === value}
                                className={cn(
                                    'rounded-xl border px-2 py-2.5 text-xs font-bold transition',
                                    form.data.etat_au_retour === value
                                        ? value === 'endommage'
                                            ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                                            : 'border-admin-accent bg-admin-accent/10 text-admin-accent'
                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover',
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </Field>
                {form.data.etat_au_retour === 'endommage' && <p className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-600">Le matériel sera automatiquement placé « En panne » et une panne sera ouverte.</p>}
                <Field label="Remarques" error={form.errors.note_retour}>
                    <textarea value={form.data.note_retour} onChange={(e) => form.setData('note_retour', e.target.value)} rows={3} className={cn(inputClass, 'h-auto py-2')} placeholder="Accessoires manquants, rayures…" />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Enregistrer le retour" />
            </form>
        </Frame>
    );
}

export function ProlongForm({ emprunt, onClose }) {
    const [form, submit] = useAction(`/materiel/emprunts/${emprunt.id}/prolonger`, { date_retour_prevue: '' }, onClose);

    return (
        <Frame icon={CalendarPlus} title="Prolonger le prêt" hint={`Retour actuellement prévu le ${new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}`} onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Nouvelle date de retour *" error={form.errors.date_retour_prevue}>
                    <input type="date" min={emprunt.date_retour_prevue} value={form.data.date_retour_prevue} onChange={(e) => form.setData('date_retour_prevue', e.target.value)} className={inputClass} autoFocus />
                </Field>
                <Footer form={form} onClose={onClose} label="Prolonger" disabled={form.data.date_retour_prevue === ''} />
            </form>
        </Frame>
    );
}

export function FinishForm({ intervention, onClose }) {
    const [form, submit] = useAction(`/materiel/interventions/${intervention.id}/terminer`, { resolution: '', cout: '' }, onClose);

    return (
        <Frame icon={CheckCircle2} tone="text-emerald-500" title="Terminer l’intervention" hint="Le matériel redevient disponible" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Ce qui a été fait" error={form.errors.resolution}>
                    <textarea value={form.data.resolution} onChange={(e) => form.setData('resolution', e.target.value)} rows={3} className={cn(inputClass, 'h-auto py-2')} autoFocus placeholder="Pièce remplacée, réglage, nettoyage…" />
                </Field>
                <Field label="Coût (Ar)" error={form.errors.cout}>
                    <input type="number" min="0" step="1" value={form.data.cout} onChange={(e) => form.setData('cout', e.target.value)} className={inputClass} />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Remettre en service" />
            </form>
        </Frame>
    );
}

export function ReformForm({ materiel, onClose }) {
    const [form, submit] = useAction(`/materiel/inventaire/${materiel.id}/reformer`, { note: '' }, onClose);

    return (
        <Frame icon={Archive} tone="text-slate-500" title="Réformer le matériel" hint="Il sort définitivement du parc en service" onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700">Un matériel réformé ne peut plus être prêté ni déplacé. Sa fiche et son historique restent consultables.</p>
                <Field label="Motif" error={form.errors.note}>
                    <input value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} className={inputClass} autoFocus placeholder="Irréparable, obsolète, perdu…" />
                </Field>
                <ErrorBanner errors={{ action: form.errors.action }} />
                <Footer form={form} onClose={onClose} label="Réformer" />
            </form>
        </Frame>
    );
}

export { FIELD_KEYS };
