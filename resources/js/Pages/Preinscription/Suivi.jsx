import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, FileClock, Clock, GraduationCap, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import EditableText from '../../Components/QuickEdit/EditableText';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';
import { useTranslations } from '../../lib/useTranslations';

const STEPS = [
    { key: 'soumis', icon: FileClock },
    { key: 'verification', icon: Clock },
    { key: 'decision', icon: CheckCircle2 },
];

function currentStepIndex(preinscription) {
    if (preinscription.status === 'refuse' || preinscription.status === 'approuve') {
        return 2;
    }

    return preinscription.reviewed_at ? 1 : 0;
}

export default function Suivi({ numero, preinscription }) {
    const { content } = usePage().props;
    const { t } = useTranslations();
    const [value, setValue] = useState(numero ?? '');

    function submit(e) {
        e.preventDefault();
        router.get('/suivi-dossier', { numero: value }, { preserveState: true });
    }

    const isRefused = preinscription?.status === 'refuse';
    const isAccepted = preinscription?.status === 'approuve';
    const isDraft = preinscription?.status === 'brouillon';
    const needsCorrection = preinscription?.status === 'a_completer';
    const stepIndex = preinscription ? currentStepIndex(preinscription) : 0;

    const stepLabels = {
        soumis: t('dossier.etape_soumis', 'Soumis'),
        verification: t('dossier.etape_verification', 'En vérification'),
        decision: isRefused
            ? t('dossier.etape_refuse', 'Refusé')
            : isAccepted
              ? t('dossier.etape_accepte', 'Accepté')
              : t('dossier.etape_decision', 'Décision'),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Suivre mon dossier" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="suivi_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-3xl px-6">
                    <BackButton />
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="suivi_titre">
                            {content.suivi_titre ?? t('suivi.titre', 'Suivre mon dossier')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-xl text-white/80">
                        <EditableText as="span" contentKey="suivi_soustitre">
                            {content.suivi_soustitre ?? t('suivi.soustitre', 'Entrez votre numéro de dossier pour connaître son état.')}
                        </EditableText>
                    </p>

                    <form onSubmit={submit} className="mt-6 flex gap-2">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={t('suivi.placeholder', 'Ex. PI-2026-00001')}
                            className="w-full rounded-full border border-white/20 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm focus:border-isstm-gold focus:outline-none focus:ring-2 focus:ring-isstm-gold"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="flex shrink-0 items-center gap-2 rounded-full bg-isstm-gold px-6 py-3 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                        >
                            <Search className="h-4 w-4" aria-hidden="true" />
                            {t('suivi.suivre', 'Suivre')}
                        </button>
                    </form>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {numero === '' ? (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('suivi.invite', 'Saisissez votre numéro de dossier ci-dessus pour commencer.')}
                    </p>
                ) : !preinscription ? (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('suivi.introuvable', 'Aucun dossier trouvé pour le numéro')} « {numero} ».
                    </p>
                ) : (
                    <>
                        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            {preinscription.nom} {preinscription.prenoms} · {preinscription.filiere?.nom_fr} · {preinscription.niveau}
                        </p>

                        {(isDraft || needsCorrection) && (
                            <Card className="p-6">
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    {needsCorrection
                                        ? t('dossier.a_completer_titre', 'Ce dossier doit être complété')
                                        : t('dossier.brouillon_titre', 'Ce dossier est encore un brouillon')}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {needsCorrection
                                        ? (preinscription.commentaire_correction ?? t('dossier.a_completer_texte', "La scolarité a besoin d'informations complémentaires."))
                                        : t('dossier.brouillon_texte', "Il n'a pas encore été envoyé à la scolarité.")}
                                </p>
                            </Card>
                        )}

                        {!isDraft && !needsCorrection && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    {STEPS.map((step, index) => {
                                        const Icon = isRefused && step.key === 'decision' ? XCircle : step.icon;
                                        const isDone = index < stepIndex || (index === stepIndex && index === 2);
                                        const isCurrent = index === stepIndex;
                                        const tone = isRefused && isCurrent ? 'refused' : isDone || isCurrent ? 'active' : 'pending';

                                        return (
                                            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
                                                <div
                                                    className={
                                                        'flex h-10 w-10 items-center justify-center rounded-full ' +
                                                        (tone === 'refused'
                                                            ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                                                            : tone === 'active'
                                                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500')
                                                    }
                                                >
                                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                                </div>
                                                <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{stepLabels[step.key]}</p>
                                                {index < STEPS.length - 1 && (
                                                    <div className={'mt-4 h-0.5 w-full ' + (index < stepIndex ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-700')} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {isAccepted && (
                            <Card className="mt-6 flex items-center gap-4 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                <GraduationCap className="h-8 w-8 flex-shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                                <div>
                                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                        {t('dossier.felicitations', 'Félicitations, ce dossier a été accepté !')}
                                    </p>
                                    {preinscription.etudiant?.matricule && (
                                        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                                            {t('dossier.matricule', 'Matricule')} : <strong>{preinscription.etudiant.matricule}</strong>
                                        </p>
                                    )}
                                    <Link href="/login" className="mt-3 inline-block text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                                        {t('dossier.acceder_espace', 'Accéder à mon espace étudiant →')}
                                    </Link>
                                </div>
                            </Card>
                        )}

                        {isRefused && (
                            <Card className="mt-6 p-6">
                                <p className="font-semibold text-red-700 dark:text-red-400">{t('dossier.refuse_titre', "Ce dossier n'a pas été retenu")}</p>
                                {preinscription.motif_refus && (
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{preinscription.motif_refus}</p>
                                )}
                            </Card>
                        )}

                        {!isAccepted && !isRefused && !isDraft && !needsCorrection && (
                            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                {t('dossier.en_attente', "Ce dossier est en cours de traitement par la scolarité.")}
                            </p>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
