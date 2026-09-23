import { Head } from '@inertiajs/react';
import Header from '../Components/Home/Header';
import Hero from '../Components/Home/Hero';
import Stats from '../Components/Home/Stats';
import Director from '../Components/Home/Director';
import MissionVision from '../Components/Home/MissionVision';
import Filieres from '../Components/Home/Filieres';
import Actualites from '../Components/Home/Actualites';
import Testimonials from '../Components/Home/Testimonials';
import Partenaires from '../Components/Home/Partenaires';
import Contact from '../Components/Home/Contact';
import Footer from '../Components/Home/Footer';
import SectionVisibility from '../Components/QuickEdit/SectionVisibility';

export default function Home({ content, heroSlides, testimonials, filieres, partenaires, actualites, hiddenSections = [] }) {
    return (
        <>
            <Head title="Accueil" />

            <Header />
            <Hero slides={heroSlides} />
            <SectionVisibility section="stats" label="Statistiques" hidden={hiddenSections.includes('stats')}>
                <Stats content={content} />
            </SectionVisibility>
            <SectionVisibility section="director" label="Mot du Directeur" hidden={hiddenSections.includes('director')}>
                <Director content={content} />
            </SectionVisibility>
            <SectionVisibility section="mission_vision" label="Mission & Vision" hidden={hiddenSections.includes('mission_vision')}>
                <MissionVision content={content} />
            </SectionVisibility>
            <SectionVisibility section="filieres" label="Filières" hidden={hiddenSections.includes('filieres')}>
                <Filieres filieres={filieres} />
            </SectionVisibility>
            <SectionVisibility section="actualites" label="Actualités" hidden={hiddenSections.includes('actualites')}>
                <Actualites articles={actualites} />
            </SectionVisibility>
            <SectionVisibility section="testimonials" label="Témoignages" hidden={hiddenSections.includes('testimonials')}>
                <Testimonials testimonials={testimonials} />
            </SectionVisibility>
            <SectionVisibility section="partenaires" label="Partenaires" hidden={hiddenSections.includes('partenaires')}>
                <Partenaires partenaires={partenaires} />
            </SectionVisibility>
            <Contact content={content} />
            <Footer />
        </>
    );
}
