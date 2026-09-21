import { Head } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';

export default function Index({ content = {} }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Historique" />

            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <EditableText
                        as="h1"
                        contentKey="histoire_titre"
                        className="text-2xl font-bold sm:text-3xl"
                    >
                        {content.histoire_titre}
                    </EditableText>

                    <EditableText
                        as="p"
                        contentKey="histoire_soustitre"
                        className="mt-2 max-w-2xl text-white/80"
                    >
                        {content.histoire_soustitre}
                    </EditableText>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <article className="space-y-10">
                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <EditableText
                            as="h2"
                            contentKey="creation_contexte"
                            className="text-xl font-bold text-isstm-navy dark:text-white"
                        >
                            {content.creation_contexte}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="creation_p1"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.creation_p1}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="creation_p2"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.creation_p2}
                        </EditableText>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <EditableText
                            as="h2"
                            contentKey="objectifs_majeurs"
                            className="text-xl font-bold text-isstm-navy dark:text-white"
                        >
                            {content.objectifs_majeurs}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="objectifs_p1"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.objectifs_p1}
                        </EditableText>

                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-300">
                            <li>
                                <EditableText contentKey="objectif_1">
                                    {content.objectif_1}
                                </EditableText>
                            </li>

                            <li>
                                <EditableText contentKey="objectif_2">
                                    {content.objectif_2}
                                </EditableText>
                            </li>

                            <li>
                                <EditableText contentKey="objectif_3">
                                    {content.objectif_3}
                                </EditableText>
                            </li>
                        </ul>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <EditableText
                            as="h2"
                            contentKey="statut_pedagogie"
                            className="text-xl font-bold text-isstm-navy dark:text-white"
                        >
                            {content.statut_pedagogie}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="statut_p1"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.statut_p1}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="statut_p2"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.statut_p2}
                        </EditableText>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8 dark:bg-slate-800 dark:ring-slate-700">
                        <EditableText
                            as="h2"
                            contentKey="offre_formation"
                            className="text-xl font-bold text-isstm-navy dark:text-white"
                        >
                            {content.offre_formation}
                        </EditableText>

                        <EditableText
                            as="p"
                            contentKey="offre_p1"
                            className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                            {content.offre_p1}
                        </EditableText>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">
                                STI
                            </div>

                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">
                                STGC
                            </div>

                            <div className="rounded-xl bg-isstm-navy/5 px-4 py-3 text-center text-sm font-semibold text-isstm-navy dark:bg-white/5 dark:text-white">
                                STNPA
                            </div>
                        </div>
                    </section>
                </article>
            </main>

            <Footer />
        </div>
    );
}