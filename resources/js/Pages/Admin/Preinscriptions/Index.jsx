import { Head, router, usePage } from '@inertiajs/react';
import SiteHeader from '../../../Components/Layout/SiteHeader';
import Footer from '../../../Components/Home/Footer';

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ preinscriptions }) {
    const { flash } = usePage().props;

    function approve(id) {
        if (!confirm('Créer le compte étudiant pour cette préinscription ?')) return;
        router.post(`/admin/preinscriptions/${id}/approve`, {}, { preserveScroll: true });
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Préinscriptions en attente" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-3xl font-bold">Préinscriptions en attente</h1>
                    <p className="mt-2 text-white/80">{preinscriptions.length} dossier(s) à traiter.</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                {flash?.status && (
                    <p className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.status}</p>
                )}

                {preinscriptions.length === 0 ? (
                    <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
                        Aucune préinscription en attente.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {preinscriptions.map((p) => (
                            <div key={p.id} className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                                {p.photo_path ? (
                                    <img src={`/storage/${p.photo_path}`} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <div className="h-16 w-16 shrink-0 rounded-full bg-isstm-navy/10" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-700">{p.nom} {p.prenoms}</p>
                                    <p className="text-sm text-slate-500">
                                        {p.filiere?.nom_fr} · {p.niveau} · {p.email}
                                    </p>
                                    <p className="text-xs text-slate-400">Déposée le {formatDate(p.created_at)}</p>
                                </div>
                                <button
                                    onClick={() => approve(p.id)}
                                    className="shrink-0 rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                >
                                    Approuver
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
