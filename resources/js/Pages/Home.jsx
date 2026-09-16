import { Head } from '@inertiajs/react';
import Header from '../Components/Home/Header';
import Hero from '../Components/Home/Hero';
import Stats from '../Components/Home/Stats';
import Director from '../Components/Home/Director';
import MissionVision from '../Components/Home/MissionVision';
import Filieres from '../Components/Home/Filieres';
import Testimonials from '../Components/Home/Testimonials';
import Contact from '../Components/Home/Contact';
import Footer from '../Components/Home/Footer';

export default function Home({ content, heroSlides, testimonials, filieres }) {
    return (
        <>
            <Head title="Accueil" />

            <Header />
            <Hero slides={heroSlides} />
            <Stats content={content} />
            <Director content={content} />
            <MissionVision content={content} />
            <Filieres filieres={filieres} />
            <Testimonials testimonials={testimonials} />
            <Contact content={content} />
            <Footer />
        </>
    );
}
