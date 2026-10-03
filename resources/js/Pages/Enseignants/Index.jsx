import { Head, usePage } from '@inertiajs/react';
import { LayoutGrid, List, Mail, Pencil, RotateCcw, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Badge } from '../../Components/ui/badge';
import EditableTeacherDialog from '../../Components/QuickEdit/EditableTeacherDialog';
import EditableText from '../../Components/QuickEdit/EditableText';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { useTranslations } from '../../lib/useTranslations';

const DEPARTEMENTS = ['STI', 'STGC', 'STNPA'];

/** Generic silhouette shown in place of a photo the teacher doesn't have. */
function DefaultPhoto({ className, iconClassName }) {
    return (
        <div className={`flex items-center justify-center bg-isstm-navy/5 dark:bg-white/5 ${className}`}>
            <UserRound className={`text-isstm-navy/25 dark:text-white/20 ${iconClassName}`} aria-hidden="true" />
        </div>
    );
}

function DepartementBadge({ value }) {
    if (!value) {
        return null;
    }

    return (
        <span className="rounded-full bg-isstm-navy px-3 py-1 text-xs font-bold tracking-wide text-white">{value}</span>
    );
}

function EditPencil({ onClick, name, className, size = 'h-8 w-8', iconSize = 'h-4 w-4' }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`flex ${size} items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110 ${className}`}
            aria-label={`Modifier ${name}`}
        >
            <Pencil className={iconSize} aria-hidden="true" />
        </button>
    );
}

/** One filter row's pill — same shape whether it's a category or a department. */
function FilterPill({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
                active
                    ? 'bg-isstm-navy text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-isstm-navy/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
        >
            {children}
        </button>
    );
}

/**
 * Flips in place to reveal what the compact front doesn't have room for
 * (full description, e-mail) — the front stays dense enough to fit several
 * per row, the back is where the rest of the card's own information lives.
 * Both faces occupy the same grid cell ([grid-area:1/1]) so the card's
 * height always matches its tallest face, on both sides of the flip.
 */
function TeacherCard({ teacher, categoryLabel, canEdit, onEdit }) {
    const [flipped, setFlipped] = useState(false);
    const hasBackContent = Boolean(teacher.description || teacher.email);

    return (
        <div className="[perspective:1200px]">
            <div
                role={hasBackContent ? 'button' : undefined}
                tabIndex={hasBackContent ? 0 : undefined}
                onClick={() => hasBackContent && setFlipped((prev) => !prev)}
                onKeyDown={(e) => {
                    if (hasBackContent && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setFlipped((prev) => !prev);
                    }
                }}
                className={`relative grid transition-transform duration-500 [transform-style:preserve-3d] ${
                    hasBackContent ? 'cursor-pointer' : ''
                } ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
            >
                {/* Front */}
                <article className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_-12px_rgba(15,23,42,0.25)] transition [backface-visibility:hidden] [grid-area:1/1] hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)] dark:bg-slate-800">
                    {teacher.photo_path ? (
                        <img src={`/${teacher.photo_path}`} alt="" className="aspect-[4/3] w-full object-cover object-top" />
                    ) : (
                        <DefaultPhoto className="aspect-[4/3] w-full" iconClassName="h-10 w-10" />
                    )}

                    <div className="flex flex-1 flex-col items-center px-3 pt-3 pb-4 text-center">
                        <h3 className="text-xs font-extrabold tracking-wide text-isstm-navy uppercase dark:text-white">{teacher.name}</h3>
                        <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-isstm-navy dark:text-slate-200">{teacher.specialty}</p>

                        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
                            <DepartementBadge value={teacher.departement} />
                            <Badge className="text-[10px]">{categoryLabel}</Badge>
                        </div>
                    </div>

                    {canEdit && <EditPencil onClick={onEdit} name={teacher.name} className="absolute top-2 right-2" size="h-6 w-6" iconSize="h-3 w-3" />}
                </article>

                {/* Back */}
                {hasBackContent && (
                    <article className="relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-isstm-navy px-4 py-5 text-center text-white [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)]">
                        <h3 className="text-xs font-extrabold tracking-wide uppercase">{teacher.name}</h3>

                        {teacher.description && <p className="line-clamp-5 text-xs leading-relaxed text-white/80">{teacher.description}</p>}

                        {teacher.email && (
                            <a
                                href={`mailto:${teacher.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-isstm-gold hover:underline"
                            >
                                <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{teacher.email}</span>
                            </a>
                        )}

                        <span className="mt-2 flex items-center gap-1 text-[10px] text-white/50">
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            Cliquez pour revenir
                        </span>
                    </article>
                )}
            </div>
        </div>
    );
}

export default function Index({ teachers }) {
    const { t } = useTranslations();
    const { auth, content } = usePage().props;
    const { active } = useQuickEdit();
    const canEditTeachers = active && (auth?.permissions ?? []).includes('enseignants.edit');
    const [filter, setFilter] = useState('all');
    const [departement, setDepartement] = useState('all');
    const [layout, setLayout] = useState('grid');
    const [editing, setEditing] = useState(null);

    const categoryLabels = {
        permanent: t('enseignants.permanent', 'Permanent'),
        vacataire: t('enseignants.vacataire', 'Vacataire'),
    };

    // Category and department narrow the list independently, so picking STI
    // keeps whichever of Permanents/Vacataires is already selected.
    const filtered = useMemo(
        () =>
            teachers
                .filter((teacher) => filter === 'all' || teacher.category === filter)
                .filter((teacher) => departement === 'all' || teacher.departement === departement),
        [teachers, filter, departement],
    );

    const countFor = (value) => teachers.filter((teacher) => teacher.departement === value).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Enseignants" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="enseignants_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="enseignants_titre">
                            {content.enseignants_titre ?? t('enseignants.titre', 'Corps enseignant')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        <EditableText as="span" contentKey="enseignants_soustitre">
                            {content.enseignants_soustitre ??
                                t(
                                    'enseignants.soustitre',
                                    'Une équipe pédagogique permanente et vacataire au service de la réussite des étudiants.',
                                )}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                {/* Category, a divider, department, a divider, then the layout switch — wraps onto
                    further lines on narrow screens so every filter stays visible without needing
                    to discover a horizontal scroll; from sm: up it's a single scrollable row. */}
                <div className="mb-8 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-2">
                    <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
                        {t('enseignants.tous', 'Tous')}
                    </FilterPill>
                    <FilterPill active={filter === 'permanent'} onClick={() => setFilter('permanent')}>
                        {t('enseignants.permanents', 'Permanents')}
                    </FilterPill>
                    <FilterPill active={filter === 'vacataire'} onClick={() => setFilter('vacataire')}>
                        {t('enseignants.vacataires', 'Vacataires')}
                    </FilterPill>

                    <span className="mx-1 h-5 w-px flex-shrink-0 bg-slate-200 dark:bg-slate-700" />

                    <FilterPill active={departement === 'all'} onClick={() => setDepartement('all')}>
                        {t('enseignants.tous_departements', 'Tous les départements')}
                    </FilterPill>
                    {DEPARTEMENTS.map((value) => (
                        <FilterPill key={value} active={departement === value} onClick={() => setDepartement(value)}>
                            {value} <span className={departement === value ? 'text-white/60' : 'text-slate-400'}>{countFor(value)}</span>
                        </FilterPill>
                    ))}

                    <span className="mx-1 h-5 w-px flex-shrink-0 bg-slate-200 dark:bg-slate-700" />

                    <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                        <button
                            type="button"
                            onClick={() => setLayout('grid')}
                            aria-pressed={layout === 'grid'}
                            title={t('enseignants.vue_grille', 'Vue grille')}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                layout === 'grid' ? 'bg-isstm-navy text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setLayout('list')}
                            aria-pressed={layout === 'list'}
                            title={t('enseignants.vue_liste', 'Vue liste')}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                layout === 'list' ? 'bg-isstm-navy text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <List className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {layout === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {filtered.map((teacher) => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                categoryLabel={categoryLabels[teacher.category] ?? teacher.category}
                                canEdit={canEditTeachers}
                                onEdit={() => setEditing(teacher)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((teacher) => (
                            <article
                                key={teacher.id}
                                className="relative flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.25)] transition hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)] dark:bg-slate-800"
                            >
                                {teacher.photo_path ? (
                                    <img
                                        src={`/${teacher.photo_path}`}
                                        alt=""
                                        className="h-16 w-16 flex-shrink-0 rounded-xl object-cover object-top"
                                    />
                                ) : (
                                    <DefaultPhoto className="h-16 w-16 flex-shrink-0 rounded-xl" iconClassName="h-7 w-7" />
                                )}

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold tracking-wide text-isstm-navy uppercase dark:text-white">{teacher.name}</h3>
                                    <p className="truncate text-sm font-semibold text-isstm-navy dark:text-slate-200">{teacher.specialty}</p>
                                    {teacher.description && (
                                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{teacher.description}</p>
                                    )}
                                </div>

                                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                                    <DepartementBadge value={teacher.departement} />
                                    <Badge>{categoryLabels[teacher.category] ?? teacher.category}</Badge>
                                </div>

                                {canEditTeachers && (
                                    <EditPencil onClick={() => setEditing(teacher)} name={teacher.name} className="absolute top-2 right-2" />
                                )}
                            </article>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400">
                        {t('enseignants.aucun_resultat', 'Aucun enseignant dans cette catégorie.')}
                    </p>
                )}
            </main>

            <Footer />

            {editing && <EditableTeacherDialog open={editing !== null} onClose={() => setEditing(null)} teacher={editing} />}
        </div>
    );
}
