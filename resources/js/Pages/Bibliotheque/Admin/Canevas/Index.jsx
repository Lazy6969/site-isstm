import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, Upload } from 'lucide-react';
import BiblioAdminLayout from '../../../../Components/Bibliotheque/BiblioAdminLayout';
import { Card } from '../../../../Components/ui/card';
import { useTranslations } from '../../../../lib/useTranslations';

export default function Index({ canevas, annees }) {
    const { t } = useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        titre: '',
        niveau: 'Licence',
        annee_id: annees[0]?.id ?? '',
        fichier: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/bibliotheque/admin/canevas', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('titre', 'fichier'),
        });
    }

    function destroy(id) {
        if (confirm(t('bibliotheque_admin.confirmer_suppression_canevas', 'Supprimer ce canevas ?'))) {
            router.delete(`/bibliotheque/admin/canevas/${id}`, { preserveScroll: true });
        }
    }

    return (
        <BiblioAdminLayout title={t('bibliotheque.canevas_titre', 'Canevas de mémoire')}>
            <Head title="Bibliothèque — Canevas" />

            <Card className="mb-8 p-5">
                <form onSubmit={submit}>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-isstm-navy dark:text-white">
                        <Upload className="h-4 w-4 text-isstm-gold" aria-hidden="true" />
                        {t('bibliotheque_admin.ajouter_canevas', 'Ajouter un canevas')}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            type="text"
                            value={data.titre}
                            onChange={(e) => setData('titre', e.target.value)}
                            placeholder={t('bibliotheque_admin.titre_placeholder', 'Titre (ex : Canevas mémoire Licence 2026)')}
                            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none sm:col-span-2"
                        />
                        <select
                            value={data.niveau}
                            onChange={(e) => setData('niveau', e.target.value)}
                            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            <option value="Licence">Licence</option>
                            <option value="Master">Master</option>
                        </select>
                        <select
                            value={data.annee_id}
                            onChange={(e) => setData('annee_id', e.target.value)}
                            className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {annees.map((a) => (
                                <option key={a.id} value={a.id}>{a.libelle}</option>
                            ))}
                        </select>
                        <input
                            type="file"
                            accept=".doc,.docx,.pdf,.ppt,.pptx"
                            onChange={(e) => setData('fichier', e.target.files[0] ?? null)}
                            className="text-sm text-slate-500 dark:text-slate-400 sm:col-span-2"
                        />
                    </div>
                    {(errors.titre || errors.fichier || errors.annee_id) && (
                        <p className="mt-2 text-sm text-red-600">{errors.titre || errors.fichier || errors.annee_id}</p>
                    )}
                    <button disabled={processing} className="mt-3 flex items-center gap-2 rounded-lg bg-isstm-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        {t('bibliotheque_admin.ajouter', 'Ajouter')}
                    </button>
                </form>
            </Card>

            <div className="space-y-2">
                {canevas.map((c) => (
                    <Card key={c.id} className="flex items-center gap-3 p-4">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{c.titre}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{c.niveau} · {c.annee}</p>
                        </div>
                        <button onClick={() => destroy(c.id)} className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('communaute.supprimer', 'Supprimer')}
                        </button>
                    </Card>
                ))}
            </div>
        </BiblioAdminLayout>
    );
}
