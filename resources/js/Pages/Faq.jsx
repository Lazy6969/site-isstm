import { Link, usePage } from '@inertiajs/react';
import { GraduationCap, HelpCircle, Mail, Search, SearchX, Video, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import BackButton from '../Components/Layout/BackButton';
import BannerBackground from '../Components/QuickEdit/BannerBackground';
import EditableText from '../Components/QuickEdit/EditableText';
import SeoHead from '../Components/QuickEdit/SeoHead';
import FaqAccordionItem from '../Components/Faq/FaqAccordionItem';
import { useTranslations } from '../lib/useTranslations';

const QUICK_LINKS = [
    { key: 'video', href: '/aide-inscription', icon: Video, color: 'bg-isstm-gold text-isstm-navy-dark', fallback: 'Vidéo tutorielle' },
    { key: 'filieres', href: '/filieres', icon: GraduationCap, color: 'bg-blue-600 text-white', fallback: 'Nos filières' },
    { key: 'suivi', href: '/suivi-dossier', icon: Search, color: 'bg-emerald-600 text-white', fallback: 'Suivre mon dossier' },
    { key: 'bourse', href: '/bourse', icon: Wallet, color: 'bg-isstm-navy text-white', fallback: 'Bourses & aides' },
];

const FAQ_ITEMS = [
    {
        key: 'preinscription',
        questionDefault: "Comment faire ma préinscription à l'ISSTM ?",
        answerDefault:
            "Remplissez le formulaire de préinscription en ligne avec vos informations et vos documents (photo, CIN, diplôme, relevé de notes). Une vidéo tutorielle détaille chaque étape.",
        link: { href: '/aide-inscription', labelDefault: 'Voir la vidéo tutorielle' },
    },
    {
        key: 'documents',
        questionDefault: 'Quels documents dois-je fournir pour ma préinscription ?',
        answerDefault:
            "Une photo d'identité, votre CIN recto et verso, votre diplôme ou attestation du baccalauréat, et votre relevé de notes du bac.",
    },
    {
        key: 'filieres',
        questionDefault: "Quelles filières propose l'ISSTM ?",
        answerDefault:
            "L'ISSTM propose plusieurs filières en Génie Informatique, Génie Civil, Génie Biomédical, Génie Électrique et bien d'autres, réparties en Licence et Master.",
        link: { href: '/filieres', labelDefault: 'Découvrir les filières' },
    },
    {
        key: 'frais',
        questionDefault: "Quels sont les frais d'inscription ?",
        answerDefault: 'Les frais varient selon la filière et le statut (national ou étranger). Le détail complet est disponible sur la page Inscription.',
        link: { href: '/inscription', labelDefault: 'Voir les frais' },
    },
    {
        key: 'suivi',
        questionDefault: 'Comment suivre mon dossier de préinscription ?',
        answerDefault: "Entrez votre numéro de dossier sur la page de suivi pour connaître son statut : reçu, en cours d'examen, accepté ou refusé.",
        link: { href: '/suivi-dossier', labelDefault: 'Suivre mon dossier' },
    },
    {
        key: 'bourse',
        questionDefault: 'Comment faire une demande de bourse ?',
        answerDefault: "L'ISSTM vous oriente vers les plateformes officielles de bourse d'État et de gestion du portefeuille Trésor Public.",
        link: { href: '/bourse', labelDefault: 'Voir les options de bourse' },
    },
    {
        key: 'ancien_etudiant',
        questionDefault: 'Je suis un ancien étudiant, comment réactiver mon compte ?',
        answerDefault:
            "Indiquez l'adresse e-mail et le mot de passe de votre ancien compte sur la page de réactivation ; votre demande sera transmise à la scolarité.",
        link: { href: '/ancien-etudiant', labelDefault: 'Réactiver mon compte' },
    },
    {
        key: 'mot_de_passe',
        questionDefault: "J'ai oublié mon mot de passe, que faire ?",
        answerDefault: 'Cliquez sur « Mot de passe oublié » sur la page de connexion pour recevoir un lien de réinitialisation par e-mail.',
        link: { href: '/mot-de-passe-oublie', labelDefault: 'Réinitialiser mon mot de passe' },
    },
    {
        key: 'contact',
        questionDefault: "Comment contacter la scolarité ou l'administration ?",
        answerDefault: 'Retrouvez nos coordonnées (e-mail, téléphone, adresse) sur la page Contact, ou en bas de chaque page du site.',
        link: { href: '/contact', labelDefault: 'Nous contacter' },
    },
];

export default function Faq() {
    const { content } = usePage().props;
    const { t } = useTranslations();
    const [query, setQuery] = useState('');
    const [openKey, setOpenKey] = useState(FAQ_ITEMS[0].key);

    const items = useMemo(() => {
        const items = FAQ_ITEMS.map((item) => ({
            ...item,
            question: content[`faq_${item.key}_question`] ?? item.questionDefault,
            answer: content[`faq_${item.key}_reponse`] ?? item.answerDefault,
            link: item.link ? { href: item.link.href, label: t(`faq.lien_${item.key}`, item.link.labelDefault) } : null,
        }));

        const term = query.trim().toLowerCase();
        if (!term) return items;

        return items.filter((item) => item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term));
    }, [content, query, t]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="faq"
                defaultTitle="Questions fréquentes"
                defaultDescription="Toutes les réponses aux questions courantes sur la préinscription, les filières, les frais et le suivi de dossier à l'ISSTM Mahajanga."
            />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="faq_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <BackButton />
                    <h1 className="flex items-center justify-center gap-2.5 text-2xl font-bold sm:text-3xl">
                        <HelpCircle className="h-7 w-7 text-isstm-gold" aria-hidden="true" />
                        <EditableText as="span" contentKey="faq_titre">
                            {content.faq_titre ?? t('faq.titre', 'Questions fréquentes')}
                        </EditableText>
                    </h1>
                    <p className="mx-auto mt-2 max-w-xl text-white/80">
                        <EditableText as="span" contentKey="faq_soustitre">
                            {content.faq_soustitre ??
                                t('faq.soustitre', "Tout ce qu'il faut savoir sur la préinscription, les filières et votre dossier à l'ISSTM.")}
                        </EditableText>
                    </p>

                    <div className="relative mx-auto mt-6 max-w-lg">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('faq.rechercher_placeholder', 'Rechercher une question...')}
                            className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur transition focus:border-isstm-gold focus:bg-white/15 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.key}
                                href={link.href}
                                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
                            >
                                <span
                                    className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-transform duration-300 group-hover:scale-110 ${link.color}`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <span className="text-xs font-semibold text-isstm-navy dark:text-white">
                                    {t(`faq.lien_rapide_${link.key}`, link.fallback)}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-10 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <SearchX className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('faq.aucun_resultat', 'Aucune question ne correspond à votre recherche.')}
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <FaqAccordionItem
                                key={item.key}
                                item={item}
                                open={openKey === item.key}
                                onToggle={() => setOpenKey((current) => (current === item.key ? null : item.key))}
                            />
                        ))
                    )}
                </div>

                <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl bg-isstm-navy px-6 py-8 text-center text-white">
                    <p className="text-base font-semibold">
                        <EditableText as="span" contentKey="faq_cta_titre">
                            {content.faq_cta_titre ?? t('faq.cta_titre', "Vous n'avez pas trouvé votre réponse ?")}
                        </EditableText>
                    </p>
                    <p className="max-w-md text-sm text-white/80">
                        <EditableText as="span" contentKey="faq_cta_texte">
                            {content.faq_cta_texte ?? t('faq.cta_texte', "L'équipe de la scolarité est là pour vous aider.")}
                        </EditableText>
                    </p>
                    <Link
                        href="/contact"
                        className="mt-1 flex items-center gap-2 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {t('faq.cta_bouton', 'Nous contacter')}
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}
