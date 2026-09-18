import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, Upload } from 'lucide-react';
import BiblioAdminLayout from '../../../../Components/Bibliotheque/BiblioAdminLayout';
import { Card } from '../../../../Components/ui/card';
import { useTranslations } from '../../../../lib/useTranslations';

export default function Index({ memoires, filieresList, annees }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        titre: '',
        auteur: '',
        encadreur: '',
        categorie: 'Mémoire',
        filiere_id: filieresList[0]?.id ?? '',
        annee_id: annees[0]?.id ?? '',
        resume: '',
        fichier: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/bibliotheque/admin/memoires', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('titre', 'auteur', 'encadreur', 'resume', 'fichier'),
        });
    }

    function destroy(id) {
        if (confirm(t('bibliotheque_admin.confirmer_suppression_document', 'Supprimer ce document ?'))) {
            router.delete(`/bibliotheque/admin/memoires/${id}`, { preserveScroll: true });
        }
    }

    return (
        <BiblioAdminLayout title={t('bibliotheque_admin.memoires_projets', 'Mémoires & projets')}>
            <Head title="Bibliothèque — Mémoires" />

            <Card className="mb-8 p-5">
                <form onSubmit={submit}>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-isstm-navy">
                        <Upload className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                        {t('bibliotheque_admin.ajouter_memoire', 'Ajouter un mémoire ou projet')}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            type="text"
                            value={data.titre}
                            onChange={(e) => setData('titre', e.target.value)}
                            placeholder={t('bibliotheque_admin.titre_memoire', 'Titre du mémoire')}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none sm:col-span-2"
                        />
                        <input
                            type="text"
                            value={data.auteur}
                            onChange={(e) => setData('auteur', e.target.value)}
                            placeholder={t('bibliotheque_admin.auteur', 'Auteur')}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <input
                            type="text"
                            value={data.encadreur}
                            onChange={(e) => setData('encadreur', e.target.value)}
                            placeholder={t('bibliotheque_admin.encadreur_facultatif', 'Encadreur (facultatif)')}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <select
                            value={data.categorie}
                            onChange={(e) => setData('categorie', e.target.value)}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            <option value="Mémoire">Mémoire</option>
                            <option value="Projet">Projet</option>
                        </select>
                        <select
                            value={data.filiere_id}
                            onChange={(e) => setData('filiere_id', e.target.value)}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {filieresList.map((f) => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                        </select>
                        <select
                            value={data.annee_id}
                            onChange={(e) => setData('annee_id', e.target.value)}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {annees.map((a) => (
                                <option key={a.id} value={a.id}>{a.libelle}</option>
                            ))}
                        </select>
                        <textarea
                            value={data.resume}
                            onChange={(e) => setData('resume', e.target.value)}
                            rows={2}
                            placeholder={t('bibliotheque_admin.resume_facultatif', 'Résumé (facultatif)')}
                            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none sm:col-span-2"
                        />
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setData('fichier', e.target.files[0] ?? null)}
                            className="text-sm text-slate-500 sm:col-span-2"
                        />
                    </div>
                    {Object.keys(errors).length > 0 && <p className="mt-2 text-sm text-red-600">{Object.values(errors)[0]}</p>}
                    <button disabled={processing} className="mt-3 flex items-center gap-2 rounded-lg bg-isstm-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('bibliotheque_admin.ajouter', 'Ajouter')}
                    </button>
                </form>
            </Card>

            <div className="space-y-2">
                {memoires.map((m) => (
                    <Card key={m.id} className="flex items-center gap-3 p-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700">{m.titre}</p>
                            <p className="text-xs text-slate-400">{m.auteur} · {m.categorie} · {m.filiere} · {m.annee}</p>
                        </div>
                        <button onClick={() => destroy(m.id)} className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('communaute.supprimer', 'Supprimer')}
                        </button>
                    </Card>
                ))}
            </div>
        </BiblioAdminLayout>
    );
}
