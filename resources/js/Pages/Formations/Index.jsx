import { usePage } from '@inertiajs/react';
import { Banknote, Building2, FlaskConical, GraduationCap, MapPin, Phone } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';
import EditableImage from '../../Components/QuickEdit/EditableImage';
import SeoHead from '../../Components/QuickEdit/SeoHead';
import { imageStyleToCss } from '../../lib/imageStyle';
import { Card } from '../../Components/ui/card';

const licenceFilieres = [
    'Génie Informatique',
    'Génie Électronique Informatique',
    'Génie Biomédical',
    'Génie Industriel',
    'Génie Électrique',
    'Froid et Énergie',
    'Génie Civil',
    'Génie Hydraulique',
    "Génie de l'Architecture",
];

const masterFilieres = [
    'Génie Logiciel',
    'Électronique Informatique Industrielle',
    'Télécommunications & Réseaux',
    'Génie Biomédical',
    'Génie Industriel',
    'Ingénierie des Systèmes Électriques Automatisés',
    'Thermique-Énergétique',
    'Bâtiments',
    'Aménagement & Travaux Publics',
    'Hydraulique & Ouvrages',
];

const laboratoires = [
    "Laboratoire d'Informatique",
    'Laboratoire du Génie Électrique',
    'Laboratoire du Génie Civil',
    'Laboratoire du Génie Industriel',
    'Laboratoire du Génie Électronique Informatique',
    'Laboratoire du Froid et Énergie',
    'Atelier de Fabrication Mécanique',
    'Laboratoire du Génie Biomédical',
];

const frais = [
    { designation: 'Licence', malagasy: 'Ar 750 000', etranger: 'Ar 1 090 000' },
    { designation: 'Master', malagasy: 'Ar 1 050 000', etranger: 'Ar 1 450 000' },
];

export default function Index() {
    const { content, contentStyles } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <SeoHead
                seoKey="formations"
                defaultTitle="Formations LMD"
                defaultDescription="Licence Professionnelle, Master-Ingénieur et Master-Recherche à l'ISSTM Mahajanga : filières, frais et modalités d'inscription."
            />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="formations_titre">
                            {content.formations_titre ?? "Formation d'Ingénieurs"}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="formations_soustitre">
                            {content.formations_soustitre ?? 'Licence Professionnelle | Master-Ingénieur | Master-Recherche'}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
                <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-700">
                    <img
                        src={`/${content.formations_offre_image ?? 'images/slide1.jpg'}`}
                        alt="Offre de formation LMD — ISSTM Mahajanga"
                        className="h-auto w-full object-cover"
                        style={imageStyleToCss(contentStyles?.formations_offre_image)}
                    />
                    <EditableImage contentKey="formations_offre_image" value={content.formations_offre_image ?? 'images/slide1.jpg'} />
                </div>

                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    <EditableText as="span" contentKey="formations_intro">
                        {content.formations_intro ??
                            "L'ISSTM Mahajanga, université publique, propose des formations payantes, diplômantes et qualifiantes du LMD : Licence Professionnelle (03 ans) et Master-Ingénieur / Master-Recherche (02 ans), avec accès par sélection de dossiers."}
                    </EditableText>
                </p>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                            <GraduationCap className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            Licence Professionnelle (03 ans)
                        </h2>
                        <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                            {licenceFilieres.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </Card>
                    <Card className="p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                            <GraduationCap className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                            Master (02 ans)
                        </h2>
                        <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                            {masterFilieres.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">Modalité d'inscription</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Accès par sélection de dossiers.</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <li>
                            <strong>Licence :</strong> L1 après Baccalauréat série C, D, S, A2, L, Technique Industrielle, Électrotechnique et
                            Génie Civil ou équivalent — Biomédical, L2 après PACES.
                        </li>
                        <li>
                            <strong>Master :</strong> M1 après Licence.
                        </li>
                    </ul>
                </Card>

                <Card className="overflow-hidden p-0">
                    <h2 className="flex items-center gap-2 border-b border-slate-100 px-6 py-4 text-lg font-semibold text-isstm-navy dark:border-slate-700 dark:text-white">
                        <Banknote className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        Frais de formation annuel estimatif
                    </h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                <th className="px-6 py-2 font-medium">Désignation</th>
                                <th className="px-6 py-2 font-medium">Malagasy</th>
                                <th className="px-6 py-2 font-medium">Étranger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {frais.map((row) => (
                                <tr key={row.designation}>
                                    <td className="px-6 py-2.5 font-medium text-isstm-navy dark:text-white">{row.designation}</td>
                                    <td className="px-6 py-2.5 text-slate-600 dark:text-slate-300">{row.malagasy}</td>
                                    <td className="px-6 py-2.5 text-slate-600 dark:text-slate-300">{row.etranger}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                <Card className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                        <FlaskConical className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                        Nos laboratoires
                    </h2>
                    <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300">
                        {laboratoires.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </Card>

                <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Bâtiment Ex-Lolo, Majunga-Be, Mahajanga (401), Madagascar
                        </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">034 45 289 45 · 032 05 572 30</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <Building2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                        <p className="text-sm text-slate-600 dark:text-slate-300">isstm.umg@gmail.com</p>
                    </div>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
