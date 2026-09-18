import { Head, Link } from '@inertiajs/react';
import { CalendarClock, FileSignature, MapPin, Wallet } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

function FeeTable({ title, rows }) {
    return (
        <Card className="overflow-hidden">
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
        </Card>
    );
}

export default function Index({ content }) {
    const { t } = useTranslations();
    const dateLimite = content.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Inscription" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">
                        {t('inscription.titre', 'Inscription — Année')} {content.inscription_annee_universitaire}
                    </h1>
                    <p className="mt-2 text-white/80">{t('inscription.soustitre', 'Frais de scolarité, dates et modalités de dépôt.')}</p>
                    <Link
                        href="/preinscription"
                        className="mt-5 flex w-fit items-center gap-2 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        <FileSignature className="h-4 w-4" aria-hidden="true" />
                        {t('inscription.preinscription_cta', 'Faire ma préinscription en ligne')}
                    </Link>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-10 px-6 py-12">
                {dateLimite && (
                    <Card className="flex flex-col items-center gap-1 p-5 text-center">
                        <CalendarClock className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        <p className="text-sm text-slate-500">{t('inscription.date_limite', 'Date limite de dépôt des dossiers')}</p>
                        <p className="text-xl font-bold text-isstm-navy">{dateLimite}</p>
                    </Card>
                )}

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy">
                        {t('inscription.frais_nationaux', 'Frais de scolarité — Étudiants nationaux')}
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                ["Droit d'inscription", content.frais_nat_lic_droit],
                                ['1ère versement', content.frais_nat_lic_v1],
                                ['2ème versement', content.frais_nat_lic_v2],
                                ['3ème versement', content.frais_nat_lic_v3],
                            ]}
                        />
                        <FeeTable
                            title="Master"
                            rows={[
                                ["Droit d'inscription", content.frais_nat_mas_droit],
                                ['1ère versement', content.frais_nat_mas_v1],
                                ['2ème versement', content.frais_nat_mas_v2],
                                ['3ème versement', content.frais_nat_mas_v3],
                            ]}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('inscription.tenue_reglementaire', 'Tenue réglementaire :')} {content.frais_nat_tenue}
                    </p>
                </section>

                <section>
                    <h2 className="mb-4 text-lg font-semibold text-isstm-navy">
                        {t('inscription.frais_etrangers', 'Frais de scolarité — Étudiants étrangers')}
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FeeTable
                            title="Licence"
                            rows={[
                                ["Droit d'inscription", content.frais_etr_lic_droit],
                                ['1ère versement', content.frais_etr_lic_v1],
                                ['2ème versement', content.frais_etr_lic_v2],
                                ['3ème versement', content.frais_etr_lic_v3],
                            ]}
                        />
                        <FeeTable
                            title="Master"
                            rows={[
                                ["Droit d'inscription", content.frais_etr_mas_droit],
                                ['1ère versement', content.frais_etr_mas_v1],
                                ['2ème versement', content.frais_etr_mas_v2],
                                ['3ème versement', content.frais_etr_mas_v3],
                            ]}
                        />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        {t('inscription.tenue_reglementaire', 'Tenue réglementaire :')} {content.frais_etr_tenue}
                    </p>
                </section>

                <Card className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy">
                        <MapPin className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        {t('inscription.modalites_titre', 'Modalités de dépôt')}
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{content.inscription_adresse_bloc}</p>
                    <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                        <Wallet className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {t('inscription.compte_bancaire', 'Compte bancaire :')}{' '}
                        <span className="font-medium text-slate-700">{content.inscription_compte_bancaire}</span>
                    </p>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
