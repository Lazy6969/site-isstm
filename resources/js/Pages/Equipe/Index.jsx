import { Head } from '@inertiajs/react';
import { Crown, Heart, Link2, Phone, Quote, Server, Sparkles, Wrench } from 'lucide-react';
import Footer from '../../Components/Home/Footer';
import SiteHeader from '../../Components/Layout/SiteHeader';
import { useTranslations } from '../../lib/useTranslations';

export default function Index() {
    const { t } = useTranslations();

    const team = [
        {
            nom: 'RAMANANA Mirindra Michel',
            photo: 'images/etudiant/mirindra.jpeg',
            icon: Crown,
            featured: true,
            role: t('equipe.role_mirindra', 'Leader & Développeur Frontend'),
            mention: t('equipe.mention_m', 'Étudiant en Génie Informatique — ISSTM'),
            bio: t(
                'equipe.bio_mirindra',
                "Leader et développeur Frontend, Mirindra a mis sa passion pour l'expérience utilisateur au service de ce site : conception des interfaces, animations et attention portée à chaque détail visuel, du header jusqu'à la dernière page. Toujours curieux et à l'aise avec de nouveaux outils, il s'est aussi chargé de l'organisation et de la planification du travail d'équipe, pour avancer ensemble vers une expérience fluide, moderne et cohérente.",
            ),
            highlight: t(
                'equipe.highlight_mirindra',
                "Un développeur passionné, minutieux et engagé, du premier croquis jusqu'à la mise en ligne du site.",
            ),
            tel: '0380746987',
            facebook: 'https://web.facebook.com/lauthner.ramanana',
        },
        {
            nom: 'RANDRIAMAHAFALY Safidy Thierry',
            photo: 'images/etudiant/safidy.jpg',
            icon: Server,
            role: t('equipe.role_safidy', 'Développeur Backend'),
            mention: t('equipe.mention_m', 'Étudiant en Génie Informatique — ISSTM'),
            bio: t(
                'equipe.bio_safidy',
                "Architecte de l'ombre, Safidy a bâti les fondations solides sur lesquelles repose tout le site : bases de données, logique métier et sécurité des échanges. Rigoureux et méthodique, il a conçu un backend robuste capable d'accompagner la croissance de l'ISSTM sans jamais faillir. Son travail, invisible pour le visiteur, est pourtant le socle sur lequel tout le reste a pu être construit.",
            ),
            tel: '0380545618',
            facebook: 'https://web.facebook.com/safilaureat.randriamahafaly',
        },
        {
            nom: 'RAZAFINDRABARY Heather Doleen Jameelah',
            photo: 'images/etudiant/jameelah.jpg',
            icon: Sparkles,
            role: t('equipe.role_jameelah', 'Assistante Frontend'),
            mention: t('equipe.mention_f', 'Étudiante en Génie Informatique — ISSTM'),
            bio: t(
                'equipe.bio_jameelah',
                "Œil attentif aux détails, Jameelah a épaulé le développement de l'interface avec créativité et précision. Entre ajustements visuels, tests d'ergonomie et petites touches qui font toute la différence, elle a contribué à peaufiner l'expérience offerte à chaque visiteur du site. Son sens du détail a permis de transformer de bonnes idées en une interface réellement agréable à utiliser.",
            ),
            tel: '0385229010',
            facebook: 'https://web.facebook.com/profile.php?id=100073469688031',
        },
        {
            nom: 'JAOSOA Tanael Faustin',
            photo: 'images/etudiant/tanael.jpg',
            icon: Wrench,
            role: t('equipe.role_tanael', 'Assistant Backend'),
            mention: t('equipe.mention_m', 'Étudiant en Génie Informatique — ISSTM'),
            bio: t(
                'equipe.bio_tanael',
                "Complice de l'ombre côté serveur, Tanael a prêté main forte à la construction de la logique backend et à la fiabilité des données. Curieux et impliqué, il a participé aux tests, aux corrections et à l'optimisation des performances du site. Son soutien a été précieux pour livrer un backend à la fois stable et évolutif.",
            ),
            tel: '0344306616',
            facebook: 'https://web.facebook.com/tanael.rolland.90',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={t('equipe.titre', 'Notre Équipe')} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">{t('equipe.titre', 'Notre Équipe')}</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        {t('equipe.soustitre', 'Les étudiants qui ont conçu et développé ce site.')}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <p className="text-center leading-relaxed text-slate-600">
                    {t(
                        'equipe.intro',
                        "Derrière chaque page, chaque animation et chaque ligne de code de ce site se cache le travail d'une petite équipe d'étudiants en Génie Informatique, en Licence 3 à l'ISSTM. Ce projet est le fruit de leur travail collectif, mené avec passion dans le cadre de leur formation.",
                    )}
                </p>

                <div className="mt-10 space-y-6">
                    {team.map((member) => {
                        const RoleIcon = member.icon;

                        return (
                            <div
                                key={member.nom}
                                className={`flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 sm:flex-row sm:items-start sm:p-8 ${
                                    member.featured ? 'ring-2 ring-isstm-gold' : 'ring-slate-100'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={`/${member.photo}`}
                                        alt={member.nom}
                                        className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/30"
                                        loading="lazy"
                                    />
                                    {member.featured && (
                                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-isstm-gold px-2.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-isstm-navy-dark shadow">
                                            {t('equipe.badge_leader', "À l'honneur")}
                                        </span>
                                    )}
                                </div>

                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-isstm-navy">{member.nom}</h3>
                                    <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-isstm-gold">
                                        <RoleIcon className="h-4 w-4" aria-hidden="true" />
                                        {member.role}
                                    </span>
                                    <p className="mt-1 text-sm text-slate-500">{member.mention}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{member.bio}</p>
                                    {member.highlight && (
                                        <p className="mt-3 flex items-start gap-2 text-sm text-slate-500 italic">
                                            <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                            {member.highlight}
                                        </p>
                                    )}
                                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                                        <a
                                            href={`tel:${member.tel}`}
                                            title={t('equipe.telephone', 'Téléphone')}
                                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy/5 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/10"
                                        >
                                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                                            {member.tel}
                                        </a>
                                        <a
                                            href={member.facebook}
                                            target="_blank"
                                            rel="noopener"
                                            title={t('equipe.facebook', 'Facebook')}
                                            className="flex items-center gap-1.5 rounded-full bg-isstm-navy/5 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/10"
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

                <div className="mt-10 flex flex-col items-center gap-2 text-center text-slate-500">
                    <Heart className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                    <p>{t('equipe.merci', 'Merci d\'avoir visité notre site, conçu avec passion par notre équipe.')}</p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
