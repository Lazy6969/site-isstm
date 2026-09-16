import { Head, Link } from '@inertiajs/react';
import SiteHeader from '../Components/Layout/SiteHeader';
import Footer from '../Components/Home/Footer';

function PortalCard({ slides, logo, title, description, href }) {
    return (
        <section className="relative overflow-hidden rounded-3xl">
            <div className="grid grid-cols-3 gap-1">
                {slides.map((slide) => (
                    <div key={slide} className="h-56 bg-cover bg-center" style={{ backgroundImage: `url('/${slide}')` }} />
                ))}
            </div>
            <div className="absolute inset-0 bg-isstm-navy-dark/75" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                <img src={logo} alt="" className="mb-3 h-14 w-14 rounded-full object-cover ring-2 ring-white/70" />
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 max-w-md text-sm text-white/85">{description}</p>
                <Link
                    href={href}
                    className="mt-4 rounded-full bg-isstm-gold px-6 py-2 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                >
                    Découvrir
                </Link>
            </div>
        </section>
    );
}

export default function VieEtudiante() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Vie étudiante" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-3xl font-bold">Vie Étudiante</h1>
                    <p className="mt-2 text-white/80">L'expérience ISSTM au-delà des salles de classe.</p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-16 px-6 py-12">
                <div className="flex flex-col items-center gap-8 sm:flex-row">
                    <img src="/images/campus/etudiant1.png" alt="" className="w-full max-w-xs sm:w-64" />
                    <p className="text-base leading-relaxed text-slate-700">
                        La vie à l'ISSTM est une aventure enrichissante qui va bien au-delà des cours. C'est un
                        écosystème vibrant où les amitiés se forgent, les passions se révèlent et les futurs
                        leaders prennent leur envol. Explorez les multiples facettes de notre communauté et
                        découvrez un environnement conçu pour votre épanouissement.
                    </p>
                </div>

                <PortalCard
                    slides={['images/portal_campus_1.jpg', 'images/portal_campus_2.jpg', 'images/portal_campus_3.jpg']}
                    logo="/images/umg.jpg"
                    title="La Vie au Campus"
                    description={'L\'université est un melting-pot culturel. Explorez les 30 associations régionales, appelées "blocs", qui représentent la diversité et la solidarité des étudiants de tout Madagascar.'}
                    href="/campus"
                />

                <div className="flex flex-col items-center gap-8 sm:flex-row-reverse">
                    <img src="/images/campus/etudiant2.png" alt="" className="w-full max-w-xs sm:w-64" />
                    <p className="text-base leading-relaxed text-slate-700">
                        L'engagement dans les clubs et associations est une pierre angulaire de l'expérience
                        ISSTM. C'est ici que les compétences de leadership s'épanouissent, que les projets
                        collaboratifs prennent vie et que des liens durables se tissent.
                    </p>
                </div>

                <PortalCard
                    slides={['images/portal_assoc_4.jpg', 'images/portal_assoc_5.jpg', 'images/portal_assoc_6.jpg']}
                    logo="/images/aei.jpeg"
                    title="Clubs et Associations"
                    description="Au-delà des études, la vie étudiante est riche en activités. Découvrez les clubs sportifs, culturels et académiques pour vous épanouir et développer de nouvelles compétences."
                    href="/associations"
                />
            </main>

            <Footer />
        </div>
    );
}
