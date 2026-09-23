import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Quote } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import EditableText from '../../Components/QuickEdit/EditableText';

function Fact({ label, value }) {
    if (!value) return null;

    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{value}</dd>
        </div>
    );
}

export default function Show({ bloc }) {
    const { content } = usePage().props;
    const images = bloc.images ?? [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={bloc.nom} />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <Link href="/campus" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        <EditableText as="span" contentKey="campus_show_retour">
                            {content.campus_show_retour}
                        </EditableText>
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{bloc.nom}</h1>
                    {bloc.signification && <p className="mt-2 max-w-2xl text-white/80">{bloc.signification}</p>}
                    {bloc.slogan && (
                        <p className="mt-3 flex items-center gap-1.5 text-sm italic text-isstm-gold">
                            <Quote className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {bloc.slogan}
                        </p>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {images.length > 0 && (
                    <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {images.map((image) => (
                            <div key={image} className="h-40 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('/${image}')` }} />
                        ))}
                    </div>
                )}

                <Card className="p-7">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Fact
                            label={
                                <EditableText as="span" contentKey="campus_show_fondation_label">
                                    {content.campus_show_fondation_label}
                                </EditableText>
                            }
                            value={bloc.fondation}
                        />
                        <Fact
                            label={
                                <EditableText as="span" contentKey="campus_show_fondateurs_label">
                                    {content.campus_show_fondateurs_label}
                                </EditableText>
                            }
                            value={bloc.fondateurs}
                        />
                        <Fact
                            label={
                                <EditableText as="span" contentKey="campus_show_danses_label">
                                    {content.campus_show_danses_label}
                                </EditableText>
                            }
                            value={bloc.danse}
                        />
                        <Fact
                            label={
                                <EditableText as="span" contentKey="campus_show_distinction_label">
                                    {content.campus_show_distinction_label}
                                </EditableText>
                            }
                            value={bloc.mampiavaka}
                        />
                    </dl>
                </Card>

                <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {bloc.objectifs && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                                <EditableText as="span" contentKey="campus_show_objectifs_label">
                                    {content.campus_show_objectifs_label}
                                </EditableText>
                            </h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bloc.objectifs}</p>
                        </div>
                    )}
                    {bloc.activites && (
                        <div>
                            <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                                <EditableText as="span" contentKey="campus_show_activites_label">
                                    {content.campus_show_activites_label}
                                </EditableText>
                            </h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{bloc.activites}</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
