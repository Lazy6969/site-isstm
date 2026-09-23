import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import { useTranslations } from '../lib/useTranslations';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableImage from '../Components/QuickEdit/EditableImage';

function PortalCard({ slideItems, content, logoKey, logo, titleKey, title, descriptionKey, description, href }) {
    const { t } = useTranslations();

    return (
        <section className="relative overflow-hidden rounded-3xl">
            <div className="grid grid-cols-3 gap-1">
                {slideItems.map((item) => {
                    const image = content[item.key] ?? item.image;
                    return (
                        <div key={item.key} className="relative h-24 bg-cover bg-center sm:h-56" style={{ backgroundImage: `url('/${image}')` }}>
                            <EditableImage contentKey={item.key} value={image} />
                        </div>
                    );
                })}
            </div>
            <div className="absolute inset-0 bg-isstm-navy-dark/75" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <div className="relative">
                    <img src={`/${logo}`} alt="" className="mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-white/70" />
                    <EditableImage contentKey={logoKey} value={logo} className="absolute -right-1 -top-1 z-10" />
                </div>
                <h3 className="text-xl font-bold">
                    <EditableText as="span" contentKey={titleKey}>
                        {title}
                    </EditableText>
                </h3>
                <p className="mt-2 max-w-md text-sm text-white/85">
                    <EditableText as="span" contentKey={descriptionKey}>
                        {description}
                    </EditableText>
                </p>
                <Link
                    href={href}
                    className="mt-4 flex items-center gap-1.5 rounded-full bg-isstm-gold px-6 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                >
                    {t('vie_etudiante.decouvrir', 'Découvrir')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}

const campusSlides = [
    { key: 'vie_etudiante_campus_slide_1', image: 'images/portal_campus_1.jpg' },
    { key: 'vie_etudiante_campus_slide_2', image: 'images/portal_campus_2.jpg' },
    { key: 'vie_etudiante_campus_slide_3', image: 'images/portal_campus_3.jpg' },
];

const associationsSlides = [
    { key: 'vie_etudiante_associations_slide_1', image: 'images/portal_assoc_4.jpg' },
    { key: 'vie_etudiante_associations_slide_2', image: 'images/portal_assoc_5.jpg' },
    { key: 'vie_etudiante_associations_slide_3', image: 'images/portal_assoc_6.jpg' },
];

export default function VieEtudiante() {
    const { content } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Vie étudiante" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="vie_etudiante_titre">
                            {content.vie_etudiante_titre}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="vie_etudiante_soustitre">
                            {content.vie_etudiante_soustitre}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-16 px-6 py-12">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <div className="relative w-full max-w-xs sm:w-64">
                        <img src={`/${content.vie_etudiante_image_1 ?? 'images/campus/etudiant1.png'}`} alt="" className="w-full" />
                        <EditableImage contentKey="vie_etudiante_image_1" value={content.vie_etudiante_image_1 ?? 'images/campus/etudiant1.png'} />
                    </div>
                    <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        <EditableText as="span" contentKey="vie_etudiante_intro_1">
                            {content.vie_etudiante_intro_1}
                        </EditableText>
                    </p>
                </div>

                <PortalCard
                    slideItems={campusSlides}
                    content={content}
                    logoKey="vie_etudiante_campus_logo"
                    logo={content.vie_etudiante_campus_logo ?? 'images/umg.jpg'}
                    titleKey="vie_etudiante_campus_titre"
                    title={content.vie_etudiante_campus_titre}
                    descriptionKey="vie_etudiante_campus_description"
                    description={content.vie_etudiante_campus_description}
                    href="/campus"
                />

                <div className="flex flex-col items-center gap-8 sm:flex-row-reverse">
                    <div className="relative w-full max-w-xs sm:w-64">
                        <img src={`/${content.vie_etudiante_image_2 ?? 'images/campus/etudiant2.png'}`} alt="" className="w-full" />
                        <EditableImage contentKey="vie_etudiante_image_2" value={content.vie_etudiante_image_2 ?? 'images/campus/etudiant2.png'} />
                    </div>
                    <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                        <EditableText as="span" contentKey="vie_etudiante_intro_2">
                            {content.vie_etudiante_intro_2}
                        </EditableText>
                    </p>
                </div>

                <PortalCard
                    slideItems={associationsSlides}
                    content={content}
                    logoKey="vie_etudiante_associations_logo"
                    logo={content.vie_etudiante_associations_logo ?? 'images/aei.jpeg'}
                    titleKey="vie_etudiante_associations_titre"
                    title={content.vie_etudiante_associations_titre}
                    descriptionKey="vie_etudiante_associations_description"
                    description={content.vie_etudiante_associations_description}
                    href="/associations"
                />
            </main>

            <Footer />
        </div>
    );
}
