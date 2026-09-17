import { Head, Link } from '@inertiajs/react';
import BiblioLayout from '../../Components/Bibliotheque/BiblioLayout';

export default function Index({ derniersCanevas, derniersMemoires }) {
    return (
        <BiblioLayout title="Bibliothèque numérique">
            <Head title="Bibliothèque numérique" />

            <p className="mb-8 max-w-2xl text-sm text-slate-500">
                Canevas de mémoire officiels, mémoires et projets d'anciens étudiants consultables en ligne, et recherche
                sur l'ensemble du fonds documentaire de l'ISSTM.
            </p>

            <div className="mb-10 grid gap-4 sm:grid-cols-2">
                <Link href="/bibliotheque/canevas" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-isstm-navy/30 hover:shadow-md">
                    <h2 className="font-semibold text-isstm-navy">📄 Canevas de mémoire</h2>
                    <p className="mt-2 text-sm text-slate-500">Modèles officiels Licence et Master, téléchargeables librement.</p>
                </Link>
                <Link href="/bibliotheque/memoires" className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-isstm-navy/30 hover:shadow-md">
                    <h2 className="font-semibold text-isstm-navy">📚 Mémoires & projets</h2>
                    <p className="mt-2 text-sm text-slate-500">Travaux d'anciens étudiants, consultables en ligne uniquement.</p>
                </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Derniers canevas ajoutés</h2>
                    <div className="space-y-2">
                        {derniersCanevas.length === 0 && <p className="text-sm text-slate-400">Aucun canevas pour le moment.</p>}
                        {derniersCanevas.map((c) => (
                            <Link key={c.id} href="/bibliotheque/canevas" className="block rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                <span className="font-medium text-slate-700">{c.titre}</span>
                                <span className="ml-2 text-xs text-slate-400">{c.niveau} · {c.annee}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Derniers mémoires & projets</h2>
                    <div className="space-y-2">
                        {derniersMemoires.length === 0 && <p className="text-sm text-slate-400">Aucun mémoire pour le moment.</p>}
                        {derniersMemoires.map((m) => (
                            <Link key={m.id} href={`/bibliotheque/memoires/${m.id}/consulter`} className="block rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm hover:border-isstm-navy/30">
                                <span className="font-medium text-slate-700">{m.titre}</span>
                                <span className="ml-2 text-xs text-slate-400">{m.categorie} · {m.filiere} · {m.auteur}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </BiblioLayout>
    );
}
