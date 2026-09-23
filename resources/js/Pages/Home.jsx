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

export default function Home({ content, heroSlides, testimonials, filieres, partenaires, actualites }) {
    return (
        <>
            <Head title="Accueil" />

            <Header />
            <Hero slides={heroSlides} />
            <Stats content={content} />
            <Director content={content} />
            <MissionVision content={content} />
            <Filieres filieres={filieres} />
            <Actualites articles={actualites} />
            <Testimonials testimonials={testimonials} />
            <Partenaires partenaires={partenaires} />
            <Contact content={content} />
            <Footer />
        </>
    );
}
