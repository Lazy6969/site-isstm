import { Head, router, useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import BiblioAdminLayout from '../../../Components/Bibliotheque/BiblioAdminLayout';
import { Card } from '../../../Components/ui/card';
import { useTranslations } from '../../../lib/useTranslations';

export default function Reglages({ mentions, filieres, annees }) {
    const { t } = useTranslations();
    const mentionForm = useForm({ nom: '', abreviation: '' });
    const filiereForm = useForm({ nom: '', abreviation: '', niveau: 'Licence', mention_id: mentions[0]?.id ?? '' });
    const anneeForm = useForm({ libelle: '' });

    function submitMention(e) {
        e.preventDefault();
        mentionForm.post('/bibliotheque/admin/reglages/mentions', { preserveScroll: true, onSuccess: () => mentionForm.reset() });
    }

    function submitFiliere(e) {
        e.preventDefault();
        filiereForm.post('/bibliotheque/admin/reglages/filieres', { preserveScroll: true, onSuccess: () => filiereForm.reset('nom', 'abreviation') });
    }

    function submitAnnee(e) {
        e.preventDefault();
        anneeForm.post('/bibliotheque/admin/reglages/annees', { preserveScroll: true, onSuccess: () => anneeForm.reset() });
    }

    function destroyMention(id) {
        if (confirm(t('bibliotheque_admin.confirmer_suppression_mention', 'Supprimer cette mention ? Les filières et mémoires rattachés seront aussi supprimés.'))) {
            router.delete(`/bibliotheque/admin/reglages/mentions/${id}`, { preserveScroll: true });
        }
    }

    function destroyFiliere(id) {
        if (confirm(t('bibliotheque_admin.confirmer_suppression_filiere', 'Supprimer cette filière ? Les mémoires rattachés seront aussi supprimés.'))) {
            router.delete(`/bibliotheque/admin/reglages/filieres/${id}`, { preserveScroll: true });
        }
    }

    function destroyAnnee(id) {
        if (confirm(t('bibliotheque_admin.confirmer_suppression_annee', 'Supprimer cette année universitaire ?'))) {
            router.delete(`/bibliotheque/admin/reglages/annees/${id}`, { preserveScroll: true });
        }
    }

    return (
        <BiblioAdminLayout title={t('bibliotheque_admin.reglages_titre', 'Réglages — mentions, filières, années')}>
            <Head title="Bibliothèque — Réglages" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy">{t('bibliotheque_admin.mentions', 'Mentions')}</h2>
                    <form onSubmit={submitMention} className="mb-4 space-y-2">
                        <input
                            type="text"
                            value={mentionForm.data.nom}
                            onChange={(e) => mentionForm.setData('nom', e.target.value)}
                            placeholder={t('bibliotheque_admin.nom_complet', 'Nom complet')}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <input
                            type="text"
                            value={mentionForm.data.abreviation}
                            onChange={(e) => mentionForm.setData('abreviation', e.target.value)}
                            placeholder={t('bibliotheque_admin.abreviation', 'Abréviation')}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <button disabled={mentionForm.processing} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('bibliotheque_admin.ajouter', 'Ajouter')}
                        </button>
                    </form>
                    <ul className="space-y-1.5 text-sm">
                        {mentions.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-2">
                                <span className="truncate text-slate-700">{m.abreviation} — {m.nom}</span>
                                <button onClick={() => destroyMention(m.id)} className="flex-shrink-0 text-slate-400 hover:text-red-600" aria-label={t('communaute.supprimer', 'Supprimer')}>
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy">{t('nav.filieres', 'Filières')}</h2>
                    <form onSubmit={submitFiliere} className="mb-4 space-y-2">
                        <input
                            type="text"
                            value={filiereForm.data.nom}
                            onChange={(e) => filiereForm.setData('nom', e.target.value)}
                            placeholder={t('bibliotheque_admin.nom_filiere', 'Nom de la filière')}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <input
                            type="text"
                            value={filiereForm.data.abreviation}
                            onChange={(e) => filiereForm.setData('abreviation', e.target.value)}
                            placeholder={t('bibliotheque_admin.abreviation', 'Abréviation')}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <select
                            value={filiereForm.data.niveau}
                            onChange={(e) => filiereForm.setData('niveau', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            <option value="Licence">Licence</option>
                            <option value="Master">Master</option>
                        </select>
                        <select
                            value={filiereForm.data.mention_id}
                            onChange={(e) => filiereForm.setData('mention_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {mentions.map((m) => (
                                <option key={m.id} value={m.id}>{m.abreviation}</option>
                            ))}
                        </select>
                        <button disabled={filiereForm.processing} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('bibliotheque_admin.ajouter', 'Ajouter')}
                        </button>
                    </form>
                    <ul className="space-y-1.5 text-sm">
                        {filieres.map((f) => (
                            <li key={f.id} className="flex items-center justify-between gap-2">
                                <span className="truncate text-slate-700">{f.niveau} - {f.nom} ({f.mention_abrev})</span>
                                <button onClick={() => destroyFiliere(f.id)} className="flex-shrink-0 text-slate-400 hover:text-red-600" aria-label={t('communaute.supprimer', 'Supprimer')}>
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-isstm-navy">{t('bibliotheque_admin.annees_universitaires', 'Années universitaires')}</h2>
                    <form onSubmit={submitAnnee} className="mb-4 space-y-2">
                        <input
                            type="text"
                            value={anneeForm.data.libelle}
                            onChange={(e) => anneeForm.setData('libelle', e.target.value)}
                            placeholder="2026-2027"
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        {anneeForm.errors.libelle && <p className="text-xs text-red-600">{anneeForm.errors.libelle}</p>}
                        <button disabled={anneeForm.processing} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('bibliotheque_admin.ajouter', 'Ajouter')}
                        </button>
                    </form>
                    <ul className="space-y-1.5 text-sm">
                        {annees.map((a) => (
                            <li key={a.id} className="flex items-center justify-between gap-2">
                                <span className="text-slate-700">{a.libelle}</span>
                                <button onClick={() => destroyAnnee(a.id)} className="text-slate-400 hover:text-red-600" aria-label={t('communaute.supprimer', 'Supprimer')}>
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </BiblioAdminLayout>
    );
}
