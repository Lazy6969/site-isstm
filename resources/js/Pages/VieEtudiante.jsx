import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';
import EditableText from '../Components/QuickEdit/EditableText';
import EditableImage from '../Components/QuickEdit/EditableImage';
import { useTranslations } from '../lib/useTranslations';

function PortalCard({ slides, logoKey, logo, titleKey, title, descKey, description, href }) {
    const { t } = useTranslations();
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
        return () => clearInterval(timerRef.current);
    }, [slides.length]);

    return (
        <section className="relative h-72 overflow-hidden rounded-3xl shadow-lg sm:h-[420px]">
            {slides.map((slide, index) => (
                <div
                    key={slide.key}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                        index === current ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundImage: `url('/${slide.value}')` }}
                >
                    {index === current && <EditableImage contentKey={slide.key} value={slide.value} className="absolute top-3 right-3 z-20" />}
                </div>
            ))}

            <div className="absolute inset-0 bg-isstm-navy-dark/75" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <div className="relative mb-4">
                    <img src={`/${logo}`} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-white/70" />
                    <EditableImage contentKey={logoKey} value={logo} className="absolute -top-1.5 -right-1.5 z-10 h-6 w-6" />
                </div>

                <EditableText as="h3" contentKey={titleKey} className="text-2xl font-bold">
                    {title}
                </EditableText>

                <EditableText as="p" contentKey={descKey} className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
                    {description}
                </EditableText>

                <Link
                    href={href}
                    className="mt-5 flex items-center gap-1.5 rounded-full bg-isstm-gold px-6 py-2.5 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                >
                    {t('vie_etudiante.decouvrir', 'Découvrir')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <div className="absolute bottom-5 flex gap-1.5">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.key}
                            type="button"
                            onClick={() => setCurrent(index)}
                            aria-label={`Slide ${index + 1}`}
                            className={`h-1.5 rounded-full transition-all ${index === current ? 'w-7 bg-isstm-gold' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function VieEtudiante({ content = {} }) {
    const { t } = useTranslations();

    const campusSlides = [
        { key: 'vie_etudiante_campus_slide1_image_path', value: content.vie_etudiante_campus_slide1_image_path ?? 'images/portal_campus_1.jpg' },
        { key: 'vie_etudiante_campus_slide2_image_path', value: content.vie_etudiante_campus_slide2_image_path ?? 'images/portal_campus_2.jpg' },
        { key: 'vie_etudiante_campus_slide3_image_path', value: content.vie_etudiante_campus_slide3_image_path ?? 'images/portal_campus_3.jpg' },
    ];

    const assocSlides = [
        { key: 'vie_etudiante_assoc_slide1_image_path', value: content.vie_etudiante_assoc_slide1_image_path ?? 'images/portal_assoc_4.jpg' },
        { key: 'vie_etudiante_assoc_slide2_image_path', value: content.vie_etudiante_assoc_slide2_image_path ?? 'images/portal_assoc_5.jpg' },
        { key: 'vie_etudiante_assoc_slide3_image_path', value: content.vie_etudiante_assoc_slide3_image_path ?? 'images/portal_assoc_6.jpg' },
    ];

    const intro1Image = content.vie_etudiante_intro1_image_path ?? 'images/campus/etudiant1.png';
    const intro2Image = content.vie_etudiante_intro2_image_path ?? 'images/campus/etudiant2.png';
    const campusLogo = content.vie_etudiante_campus_logo_image_path ?? 'images/umg.jpg';
    const assocLogo = content.vie_etudiante_assoc_logo_image_path ?? 'images/aei.jpeg';

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
                    <div className="relative w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl sm:w-64">
                        <img
                            src={`/${intro1Image}`}
                            alt=""
                            className="w-full scale-100 transition-transform duration-500 hover:scale-110"
                        />
                        <EditableImage contentKey="vie_etudiante_intro1_image_path" value={intro1Image} />
                    </div>
                    <EditableText
                        as="p"
                        contentKey="vie_etudiante_intro1_texte"
                        className="text-base leading-relaxed text-slate-700 dark:text-slate-200"
                    >
                        {content.vie_etudiante_intro1_texte}
                    </EditableText>
                </div>

                <PortalCard
                    slides={campusSlides}
                    logoKey="vie_etudiante_campus_logo_image_path"
                    logo={campusLogo}
                    titleKey="vie_etudiante_campus_titre"
                    title={content.vie_etudiante_campus_titre}
                    descKey="vie_etudiante_campus_texte"
                    description={content.vie_etudiante_campus_texte}
                    href="/campus"
                />

                <div className="flex flex-col items-center gap-8 sm:flex-row-reverse">
                    <div className="relative w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl sm:w-64">
                        <img
                            src={`/${intro2Image}`}
                            alt=""
                            className="w-full scale-100 transition-transform duration-500 hover:scale-110"
                        />
                        <EditableImage contentKey="vie_etudiante_intro2_image_path" value={intro2Image} />
                    </div>
                    <EditableText
                        as="p"
                        contentKey="vie_etudiante_intro2_texte"
                        className="text-base leading-relaxed text-slate-700 dark:text-slate-200"
                    >
                        {content.vie_etudiante_intro2_texte}
                    </EditableText>
                </div>

                <PortalCard
                    slides={assocSlides}
                    logoKey="vie_etudiante_assoc_logo_image_path"
                    logo={assocLogo}
                    titleKey="vie_etudiante_assoc_titre"
                    title={content.vie_etudiante_assoc_titre}
                    descKey="vie_etudiante_assoc_texte"
                    description={content.vie_etudiante_assoc_texte}
                    href="/associations"
                />
            </main>

            <Footer />
        </div>
    );
}
