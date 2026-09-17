import { Head, router, useForm } from '@inertiajs/react';
import BiblioAdminLayout from '../../../../Components/Bibliotheque/BiblioAdminLayout';

export default function Index({ canevas, annees }) {
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
        if (confirm('Supprimer ce canevas ?')) {
            router.delete(`/bibliotheque/admin/canevas/${id}`, { preserveScroll: true });
        }
    }

    return (
        <BiblioAdminLayout title="Canevas de mémoire">
            <Head title="Bibliothèque — Canevas" />

            <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-isstm-navy">Ajouter un canevas</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <input
                        type="text"
                        value={data.titre}
                        onChange={(e) => setData('titre', e.target.value)}
                        placeholder="Titre (ex : Canevas mémoire Licence 2026)"
                        className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none sm:col-span-2"
                    />
                    <select
                        value={data.niveau}
                        onChange={(e) => setData('niveau', e.target.value)}
                        className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                    >
                        <option value="Licence">Licence</option>
                        <option value="Master">Master</option>
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
                    <input
                        type="file"
                        accept=".doc,.docx,.pdf,.ppt,.pptx"
                        onChange={(e) => setData('fichier', e.target.files[0] ?? null)}
                        className="text-sm text-slate-500 sm:col-span-2"
                    />
                </div>
                {(errors.titre || errors.fichier || errors.annee_id) && (
                    <p className="mt-2 text-sm text-red-600">{errors.titre || errors.fichier || errors.annee_id}</p>
                )}
                <button disabled={processing} className="mt-3 rounded-lg bg-isstm-navy px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    Ajouter
                </button>
            </form>

            <div className="space-y-2">
                {canevas.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-700">{c.titre}</p>
                            <p className="text-xs text-slate-400">{c.niveau} · {c.annee}</p>
                        </div>
                        <button onClick={() => destroy(c.id)} className="text-xs font-medium text-slate-400 hover:text-red-600">
                            Supprimer
                        </button>
                    </div>
                ))}
            </div>
        </BiblioAdminLayout>
    );
}
