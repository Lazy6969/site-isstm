import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';

const categoryLabels = {
    permanent: 'Permanent',
    vacataire: 'Vacataire',
};

export default function Index({ teachers }) {
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(
        () => (filter === 'all' ? teachers : teachers.filter((t) => t.category === filter)),
        [teachers, filter],
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Enseignants" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-3xl font-bold">Corps enseignant</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        Une équipe pédagogique permanente et vacataire au service de la réussite des étudiants.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="mb-8 flex gap-2">
                    {[
                        { key: 'all', label: 'Tous' },
                        { key: 'permanent', label: 'Permanents' },
                        { key: 'vacataire', label: 'Vacataires' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                filter === tab.key ? 'bg-isstm-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((teacher) => (
                        <div key={teacher.id} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <img
                                src={teacher.photo_path ? `/${teacher.photo_path}` : '/images/logo-isstm.jpg'}
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-isstm-navy/10"
                            />
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold text-isstm-navy">{teacher.name}</h3>
                                <p className="text-sm text-slate-500">{teacher.specialty}</p>
                                <span className="mt-1 inline-block rounded-full bg-isstm-navy/10 px-2.5 py-0.5 text-xs font-medium text-isstm-navy">
                                    {categoryLabels[teacher.category] ?? teacher.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && <p className="text-center text-slate-500">Aucun enseignant dans cette catégorie.</p>}
            </main>

            <Footer />
        </div>
    );
}
