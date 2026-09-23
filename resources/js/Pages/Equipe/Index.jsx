import { Head, usePage } from '@inertiajs/react';
import { Heart, Link2, Phone, Quote } from 'lucide-react';
import Footer from '../../Components/Home/Footer';
import SiteHeader from '../../Components/Layout/SiteHeader';
import { useTranslations } from '../../lib/useTranslations';
import EditableText from '../../Components/QuickEdit/EditableText';
import EditableIcon from '../../Components/QuickEdit/EditableIcon';
import EditableImage from '../../Components/QuickEdit/EditableImage';
import { imageStyleToCss } from '../../lib/imageStyle';

const team = [
    { key: 'equipe_membre_1', featured: true, hasHighlight: true, iconDefault: 'Crown' },
    { key: 'equipe_membre_2', featured: false, hasHighlight: false, iconDefault: 'Server' },
    { key: 'equipe_membre_3', featured: false, hasHighlight: false, iconDefault: 'Sparkles' },
    { key: 'equipe_membre_4', featured: false, hasHighlight: false, iconDefault: 'Wrench' },
];

export default function Index() {
    const { t } = useTranslations();
    const { content, contentStyles } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Notre Équipe" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="equipe_titre">
                            {content.equipe_titre}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="equipe_soustitre">
                            {content.equipe_soustitre}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <p className="text-center leading-relaxed text-slate-600 dark:text-slate-300">
                    <EditableText as="span" contentKey="equipe_intro">
                        {content.equipe_intro}
                    </EditableText>
                </p>

                <div className="mt-10 space-y-6">
                    {team.map((member) => {
                        const photo = content[`${member.key}_photo`];

                        return (
                            <div
                                key={member.key}
                                className={`flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:flex-row sm:items-start sm:p-8 dark:bg-slate-800 ${
                                    member.featured ? 'ring-2 ring-isstm-gold' : 'ring-slate-100 dark:ring-slate-700'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={`/${photo}`}
                                        alt={content[`${member.key}_nom`] ?? ''}
                                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/30"
                                        loading="lazy"
                                        style={imageStyleToCss(contentStyles?.[`${member.key}_photo`])}
                                    />
                                    <EditableImage contentKey={`${member.key}_photo`} value={photo} />
                                    {member.featured && (
                                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-isstm-gold px-2.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-isstm-navy-dark shadow">
                                            {t('equipe.badge_leader', "À l'honneur")}
                                        </span>
                                    )}
                                </div>

                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-isstm-navy dark:text-white">
                                        <EditableText as="span" contentKey={`${member.key}_nom`}>
                                            {content[`${member.key}_nom`]}
                                        </EditableText>
                                    </h3>
                                    <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-gold">
                                        <EditableIcon
                                            contentKey={`${member.key}_icon`}
                                            value={content[`${member.key}_icon`] ?? member.iconDefault}
                                            className="h-4 w-4"
                                        />
                                        <EditableText as="span" contentKey={`${member.key}_role`}>
                                            {content[`${member.key}_role`]}
                                        </EditableText>
                                    </span>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        <EditableText as="span" contentKey={`${member.key}_mention`}>
                                            {content[`${member.key}_mention`]}
                                        </EditableText>
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        <EditableText as="span" contentKey={`${member.key}_bio`}>
                                            {content[`${member.key}_bio`]}
                                        </EditableText>
                                    </p>
                                    {member.hasHighlight && (
                                        <p className="mt-3 flex items-start gap-2 text-sm text-slate-500 italic dark:text-slate-400">
                                            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                            <EditableText as="span" contentKey={`${member.key}_highlight`}>
                                                {content[`${member.key}_highlight`]}
                                            </EditableText>
                                        </p>
                                    )}
                                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                                        <a
                                            href={`tel:${content[`${member.key}_tel`]}`}
                                            title={t('equipe.telephone', 'Téléphone')}
                                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy/5 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                        >
                                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                                            <EditableText as="span" contentKey={`${member.key}_tel`}>
                                                {content[`${member.key}_tel`]}
                                            </EditableText>
                                        </a>
                                        <a
                                            href={content[`${member.key}_facebook`]}
                                            target="_blank"
                                            rel="noopener"
                                            title={t('equipe.facebook', 'Facebook')}
                                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy/5 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                        >
                                            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            Facebook
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 flex flex-col items-center gap-2 text-center text-slate-500 dark:text-slate-400">
                    <Heart className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                    <p>
                        <EditableText as="span" contentKey="equipe_merci">
                            {content.equipe_merci}
                        </EditableText>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
