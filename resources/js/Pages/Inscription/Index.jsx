import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

function FeeTable({ title, rows }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <h3 className="border-b border-slate-100 bg-isstm-navy/5 px-5 py-3 font-semibold text-isstm-navy">{title}</h3>
            <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                    {rows.map(([label, value]) => (
                        <tr key={label}>
                            <td className="px-5 py-2.5 text-slate-500">{label}</td>
                            <td className="px-5 py-2.5 text-right font-medium text-slate-700">{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Index({ content }) {
    const dateLimite = content.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Inscription" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">Inscription — Année {content.inscription_annee_universitaire}</h1>
                    <p className="mt-2 text-white/80">Frais de scolarité, dates et modalités de dépôt.</p>
                    <Link
                        href="/preinscription"
                        className="mt-5 inline-block rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        Faire ma préinscription en ligne
                    </Link>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
                {dateLimite && (
                    <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
                        <p className="text-sm text-slate-500">Date limite de dépôt des dossiers</p>
                        <p className="mt-1 text-xl font-bold text-isstm-navy">{dateLimite}</p>
                    </div>
                )}

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy">Frais de scolarité — Étudiants nationaux</h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                ['Droit d’inscription', content.frais_nat_lic_droit],
                                ['1ère versement', content.frais_nat_lic_v1],
                                ['2ème versement', content.frais_nat_lic_v2],
                                ['3ème versement', content.frais_nat_lic_v3],
                            ]}
                        />
                        <FeeTable
                            title="Master"
                            rows={[
                                ['Droit d’inscription', content.frais_nat_mas_droit],
                                ['1ère versement', content.frais_nat_mas_v1],
                                ['2ème versement', content.frais_nat_mas_v2],
                                ['3ème versement', content.frais_nat_mas_v3],
                            ]}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Tenue réglementaire : {content.frais_nat_tenue}</p>
                </section>

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy">Frais de scolarité — Étudiants étrangers</h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                ['Droit d’inscription', content.frais_etr_lic_droit],
                                ['1ère versement', content.frais_etr_lic_v1],
                                ['2ème versement', content.frais_etr_lic_v2],
                                ['3ème versement', content.frais_etr_lic_v3],
                            ]}
                        />
                        <FeeTable
                            title="Master"
                            rows={[
                                ['Droit d’inscription', content.frais_etr_mas_droit],
                                ['1ère versement', content.frais_etr_mas_v1],
                                ['2ème versement', content.frais_etr_mas_v2],
                                ['3ème versement', content.frais_etr_mas_v3],
                            ]}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Tenue réglementaire : {content.frais_etr_tenue}</p>
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-isstm-navy">Modalités de dépôt</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {content.inscription_adresse_bloc}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                        Compte bancaire : <span className="font-medium text-slate-700">{content.inscription_compte_bancaire}</span>
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
}
