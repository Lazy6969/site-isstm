import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, FileClock, GraduationCap, PencilLine, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../Components/ui/dialog';
import { Button } from '../../Components/ui/button';
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

export default function Dossier({ preinscription }) {
    const { flash, content } = usePage().props;
    const { t } = useTranslations();
    // Shown as a window rather than only a banner: the candidate usually
    // arrives here because they were sent away from the préinscription form,
    // and a message they can scroll past wouldn't explain why.
    const [notice, setNotice] = useState(flash?.status ?? '');
    const [noticeOpen, setNoticeOpen] = useState(Boolean(flash?.status));

    useEffect(() => {
        if (flash?.status) {
            setNotice(flash.status);
            setNoticeOpen(true);
        }
    }, [flash?.status]);
    const isRefused = preinscription.status === 'refuse';
    const isAccepted = preinscription.status === 'approuve';
    const isDraft = preinscription.status === 'brouillon';
    const needsCorrection = preinscription.status === 'a_completer';
    const stepIndex = currentStepIndex(preinscription);

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
            <Head title="Mon dossier" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="dossier_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-3xl px-6">
                    <BackButton />
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="dossier_titre">
                            {content.dossier_titre ?? t('dossier.titre', 'Suivi de mon dossier')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        {preinscription.nom} {preinscription.prenoms} · {preinscription.filiere?.nom_fr} · {preinscription.niveau}
                    </p>
                    {preinscription.numero_dossier && (
                        <p className="mt-1 text-sm font-medium text-isstm-gold">{t('dossier.numero', 'Dossier n°')} {preinscription.numero_dossier}</p>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {notice && (
                    <p className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {notice}
                    </p>
                )}

                {(isDraft || needsCorrection) && (
                    <Card className="p-6">
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                    needsCorrection
                                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                            >
                                {needsCorrection ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <PencilLine className="h-5 w-5" aria-hidden="true" />}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    {needsCorrection
                                        ? t('dossier.a_completer_titre', 'Votre dossier doit être complété')
                                        : t('dossier.brouillon_titre', 'Votre dossier est encore un brouillon')}
                                </p>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    {needsCorrection
                                        ? (preinscription.commentaire_correction ?? t('dossier.a_completer_texte', "La scolarité a besoin d'informations complémentaires."))
                                        : t('dossier.brouillon_texte', "Il n'a pas encore été envoyé à la scolarité. Reprenez-le pour terminer votre inscription.")}
                                </p>
                                <Link
                                    href="/preinscription"
                                    className="mt-3 inline-block rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                                >
                                    {t('dossier.continuer', 'Continuer mon dossier →')}
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}

                {!isDraft && !needsCorrection && <Card className="p-6">
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
                </Card>}

                {isAccepted && (
                    <Card className="mt-6 flex items-center gap-4 border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                        <GraduationCap className="h-8 w-8 flex-shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                {t('dossier.felicitations', 'Félicitations, votre dossier a été accepté !')}
                            </p>
                            {preinscription.etudiant?.matricule && (
                                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                                    {t('dossier.matricule', 'Matricule')} : <strong>{preinscription.etudiant.matricule}</strong>
                                </p>
                            )}
                            <Link href="/login" className="mt-3 inline-block text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-300">
                                {t('dossier.acceder_espace', "Accéder à mon espace étudiant →")}
                            </Link>
                        </div>
                    </Card>
                )}

                {isRefused && (
                    <Card className="mt-6 p-6">
                        <p className="font-semibold text-red-700 dark:text-red-400">{t('dossier.refuse_titre', "Votre dossier n'a pas été retenu")}</p>
                        {preinscription.motif_refus && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{preinscription.motif_refus}</p>
                        )}
                    </Card>
                )}

                {!isAccepted && !isRefused && !isDraft && !needsCorrection && (
                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('dossier.en_attente', "Votre dossier est en cours de traitement par la scolarité. Vous serez averti(e) par e-mail dès qu'une décision sera prise.")}
                    </p>
                )}
            </main>

            <Footer />

            <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            {t('dossier.deja_envoye_titre', 'Dossier déjà envoyé')}
                        </DialogTitle>
                        <DialogDescription>{notice}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" onClick={() => setNoticeOpen(false)} className="bg-isstm-navy text-white hover:brightness-110">
                            {t('dossier.compris', 'J’ai compris')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
