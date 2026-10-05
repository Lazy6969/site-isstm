import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check, Globe, LayoutDashboard, Palette, PanelLeft, RotateCcw, Rows3, Save, SwatchBook, Type } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { useTranslations } from '../../../lib/useTranslations';

function densityOptions(t) {
    return [
        { value: 'compact', label: t('admin.appearance.density_compact', 'Compact'), gap: 'gap-0.5' },
        { value: 'normal', label: t('admin.appearance.density_normal', 'Normal'), gap: 'gap-1.5' },
        { value: 'comfortable', label: t('admin.appearance.density_comfortable', 'Confortable'), gap: 'gap-2.5' },
    ];
}

function buildSections(t) {
    return [
        { id: 'couleurs-site', label: t('admin.appearance.section_site_colors', 'Couleurs du site'), icon: Palette },
        { id: 'palette-admin', label: t('admin.appearance.section_admin_palette', 'Palette admin'), icon: SwatchBook },
        { id: 'sidebar-menu', label: t('admin.appearance.section_sidebar_menu', 'Sidebar & menu'), icon: PanelLeft },
        { id: 'typographie', label: t('admin.appearance.typography', 'Typographie'), icon: Type },
        { id: 'densite', label: t('admin.appearance.density', 'Densité'), icon: Rows3 },
    ];
}

/** Sticky jump-to-section bar, keeps the active section highlighted while scrolling. */
function QuickNav({ activeId, sections }) {
    const { t } = useTranslations();
    return (
        <nav aria-label={t('admin.appearance.quicknav_aria', 'Accès rapide aux sections')} className="sticky top-16 z-20 -mx-1 mb-6 overflow-x-auto rounded-xl bg-admin-bg/80 px-1 py-2 backdrop-blur-md">
            <ul className="flex w-max min-w-full gap-1.5 sm:w-auto">
                {sections.map(({ id, label, icon: Icon }) => {
                    const active = activeId === id;
                    return (
                        <li key={id}>
                            <a
                                href={`#${id}`}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                                    active
                                        ? 'border-admin-accent bg-admin-accent text-admin-accent-foreground shadow-sm shadow-admin-accent/25'
                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

/** Round swatches; a null `swatch` renders as a striped "auto" pattern (inherits the primary). */
function SwatchPicker({ options, value, onChange, dark = false }) {
    const selected = options.find((option) => option.value === value);
    return (
        <div>
            <div className="flex flex-wrap gap-2.5" role="radiogroup">
                {options.map((color) => {
                    const active = value === color.value;
                    return (
                        <button
                            key={color.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={color.label}
                            title={color.label}
                            onClick={() => onChange(color.value)}
                            className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
                                active ? 'scale-110 ring-2 ring-admin-accent ring-offset-2 ring-offset-admin-card' : 'hover:scale-110'
                            }`}
                            style={
                                color.swatch
                                    ? { backgroundColor: color.swatch, boxShadow: 'inset 0 0 0 1px rgba(128,128,128,0.35)' }
                                    : { background: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 3px, #e2e8f0 3px, #e2e8f0 6px)' }
                            }
                        >
                            {active && (
                                <Check
                                    className={`h-5 w-5 drop-shadow ${color.isDark ?? dark ? 'text-white' : 'text-slate-900'}`}
                                    strokeWidth={3}
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {selected && <p className="mt-2.5 text-xs text-admin-muted">{selected.label}</p>}
        </div>
    );
}

/** Native color-wheel/RGB picker tile — lets the admin pick any hex instead of a fixed preset. */
function CustomColorSwatch({ value, onChange }) {
    const { t } = useTranslations();
    const isCustom = typeof value === 'string' && value.startsWith('#');

    return (
        <label
            className={`mt-2.5 flex w-fit cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition ${
                isCustom ? 'border-admin-accent bg-admin-hover' : 'border-admin-border hover:bg-admin-hover'
            }`}
        >
            <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-black/10"
                style={{ background: isCustom ? value : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
            >
                {isCustom && <Check className="h-3.5 w-3.5 text-white mix-blend-difference" aria-hidden="true" />}
            </span>
            <span className="text-admin-text">
                {t('admin.appearance.custom_color', 'Personnalisée')}
                {isCustom ? ` (${value})` : ''}
            </span>
            <input type="color" value={isCustom ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="sr-only" />
        </label>
    );
}

function Card({ id, refCallback, icon: Icon, title, description, children }) {
    return (
        <section id={id} ref={refCallback} className="admin-card scroll-mt-32 p-5">
            <div className="mb-4 flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-admin-accent/15 text-admin-accent">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-base font-semibold text-admin-text">{title}</h2>
                    <p className="text-sm text-admin-text-secondary">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

function find(options, value) {
    return options.find((option) => option.value === value);
}

/** Live mock-up of the admin console or the public site with the chosen colors. */
function LivePreview({ mode, setMode, picks }) {
    const { t } = useTranslations();
    const primary = picks.primary ?? '#003366';
    const primaryDark = `color-mix(in srgb, ${primary} 60%, black)`;
    const menu = picks.menu ?? primary;
    const footer = picks.footer ?? primaryDark;
    const lightText = (hex) => (/^#(f|e|d)[0-9a-f]{5}$/i.test(hex) ? '#0f172a' : '#ffffff');

    return (
        <div className="admin-card overflow-hidden !p-0 lg:sticky lg:top-32">
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
                <p className="text-sm font-semibold text-admin-text">{t('admin.appearance.live_preview', 'Aperçu en direct')}</p>
                <div className="flex gap-1 rounded-lg bg-admin-hover p-1">
                    {[
                        ['admin', LayoutDashboard, t('admin.appearance.preview_admin', 'Admin')],
                        ['site', Globe, t('admin.appearance.preview_site', 'Site')],
                    ].map(([value, Icon, label]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setMode(value)}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                mode === value ? 'bg-admin-accent text-admin-accent-foreground' : 'text-admin-muted hover:text-admin-text'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4">
                {mode === 'admin' ? (
                    <div className="flex h-64 overflow-hidden rounded-xl border border-admin-border bg-admin-bg text-[0.6rem]">
                        <div className="flex w-1/3 flex-col gap-1.5 p-2.5" style={{ backgroundColor: picks.chrome ?? 'var(--color-admin-chrome)', color: picks.chromeText }}>
                            <div className="mb-1 flex items-center gap-1.5">
                                <span className="h-4 w-4 rounded" style={{ backgroundColor: picks.accent }} />
                                <span className="font-bold">ISSTM</span>
                            </div>
                            <span className="rounded px-1.5 py-1 font-semibold" style={{ backgroundColor: picks.accent, color: picks.accentText }}>
                                Dashboard
                            </span>
                            {['Étudiants', 'Actualités', 'Galerie', 'Rôles'].map((label) => (
                                <span key={label} className="px-1.5 py-1 opacity-70">
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="flex-1 space-y-2 p-2.5">
                            <div className="h-3 w-1/2 rounded bg-admin-text/80" />
                            <div className="grid grid-cols-2 gap-2">
                                {[0, 1].map((i) => (
                                    <div key={i} className="rounded-lg border border-admin-border bg-admin-card p-2">
                                        <span className="mb-1 block h-4 w-4 rounded" style={{ backgroundColor: picks.accent }} />
                                        <div className="h-2 w-2/3 rounded bg-admin-text/60" />
                                        <div className="mt-1 h-2 w-1/3 rounded bg-admin-muted/50" />
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-lg border border-admin-border bg-admin-card p-2">
                                <svg viewBox="0 0 100 30" className="h-12 w-full" preserveAspectRatio="none" aria-hidden="true">
                                    <polyline points="0,25 20,18 40,20 60,10 80,12 100,3" fill="none" stroke={picks.accent} strokeWidth="2.5" />
                                </svg>
                            </div>
                            <span className="inline-block rounded px-2 py-1 font-semibold" style={{ backgroundColor: picks.accent, color: picks.accentText }}>
                                {t('admin.common.save', 'Enregistrer')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 overflow-hidden rounded-xl border border-admin-border bg-white text-[0.6rem] text-slate-800">
                        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: menu, color: lightText(menu) }}>
                            <span className="font-bold">ISSTM</span>
                            <span className="flex gap-2 opacity-90">
                                <span>Accueil</span>
                                <span>Filières</span>
                                <span>Contact</span>
                            </span>
                        </div>
                        <div className="px-4 py-5" style={{ backgroundColor: primary, color: '#fff' }}>
                            <p className="text-sm font-bold">Bienvenue à l’ISSTM</p>
                            <p className="mt-0.5 opacity-80">Former aujourd’hui les compétences de demain.</p>
                            <span className="mt-2 inline-block rounded px-2 py-1 font-semibold" style={{ backgroundColor: picks.siteAccent, color: lightText(picks.siteAccent ?? '#d4a017') === '#0f172a' ? '#0f172a' : primaryDark }}>
                                Découvrir
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 p-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="rounded border border-slate-200 p-1.5">
                                    <span className="mb-1 block h-3 w-3 rounded-full" style={{ backgroundColor: picks.siteAccent }} />
                                    <div className="h-1.5 w-full rounded bg-slate-300" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto px-3 py-2" style={{ backgroundColor: footer, color: lightText(footer) }}>
                            © ISSTM
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Appearance({ settings, palettes, chromes, fonts, sitePrimaries, siteAccents, siteMenus, siteFooters }) {
    const { t } = useTranslations();
    const sections = buildSections(t);
    const form = useForm({
        palette: settings.palette,
        chrome: settings.chrome,
        font: settings.font,
        density: settings.density,
        sitePrimary: settings.sitePrimary,
        siteAccent: settings.siteAccent,
        siteMenu: settings.siteMenu,
        siteFooter: settings.siteFooter,
    });

    const [activeId, setActiveId] = useState(sections[0].id);
    const [previewMode, setPreviewMode] = useState('admin');
    const sectionRefs = useRef({});
    const saved = useRef(false);

    const dirty = useMemo(() => Object.keys(settings).some((key) => settings[key] !== form.data[key]), [settings, form.data]);

    const chromeOption = find(chromes, form.data.chrome);
    const paletteOption = find(palettes, form.data.palette);
    const picks = {
        accent: paletteOption?.swatch ?? '#e11d3f',
        accentText: form.data.palette === 'amber' ? '#111827' : '#ffffff',
        chrome: chromeOption?.swatch,
        chromeText: chromeOption?.isDark || form.data.chrome === 'default' ? '#f8fafc' : '#101828',
        primary: find(sitePrimaries, form.data.sitePrimary)?.swatch,
        siteAccent: find(siteAccents, form.data.siteAccent)?.swatch,
        menu: find(siteMenus, form.data.siteMenu)?.swatch ?? null,
        footer: find(siteFooters, form.data.siteFooter)?.swatch ?? null,
    };

    // Try the admin accent live on the whole console while choosing; drop it on leaving unsaved.
    useEffect(() => {
        if (picks.accent) document.documentElement.style.setProperty('--color-admin-accent', picks.accent);
    }, [picks.accent]);

    useEffect(
        () => () => {
            if (!saved.current) document.documentElement.style.removeProperty('--color-admin-accent');
        },
        [],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
        );
        Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    function registerSection(id) {
        return (el) => {
            sectionRefs.current[id] = el;
        };
    }

    function submit(e) {
        e.preventDefault();
        form.put('/console/settings/appearance', {
            preserveScroll: true,
            onSuccess: () => {
                saved.current = true;
            },
        });
    }

    return (
        <AdminLayout title={t('admin.appearance.title', 'Apparence')}>
            <form onSubmit={submit}>
                <QuickNav activeId={activeId} sections={sections} />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        <Card
                            id="couleurs-site"
                            refCallback={registerSection('couleurs-site')}
                            icon={Palette}
                            title={t('admin.appearance.site_colors_heading', 'Couleurs du site public')}
                            description={t(
                                'admin.appearance.site_colors_description',
                                "Couleur principale, d'accent, du menu et du footer du site (accueil, filières, actualités...) — indépendant de l'apparence de l'administration ci-dessous.",
                            )}
                        >
                            <div className="space-y-6">
                                {[
                                    ['sitePrimary', t('admin.appearance.primary_color_label', 'Couleur principale'), sitePrimaries, true],
                                    ['siteAccent', t('admin.appearance.accent_color_label', "Couleur d'accent"), siteAccents, false],
                                    ['siteMenu', t('admin.appearance.menu_color_label', 'Couleur du menu (barre de navigation)'), siteMenus, true],
                                    ['siteFooter', t('admin.appearance.footer_color_label', 'Couleur du footer'), siteFooters, true],
                                ].map(([key, label, options, dark]) => (
                                    <div key={key}>
                                        <p className="mb-2.5 text-sm font-medium text-admin-text">{label}</p>
                                        <SwatchPicker options={options} value={form.data[key]} onChange={(value) => form.setData(key, value)} dark={dark} />
                                        {key === 'sitePrimary' && <CustomColorSwatch value={form.data.sitePrimary} onChange={(value) => form.setData('sitePrimary', value)} />}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            id="palette-admin"
                            refCallback={registerSection('palette-admin')}
                            icon={SwatchBook}
                            title={t('admin.appearance.palette_heading', 'Palette de couleurs')}
                            description={t('admin.appearance.palette_description', "S'applique à l'ensemble de l'administration, pour tous les utilisateurs.")}
                        >
                            <SwatchPicker options={palettes} value={form.data.palette} onChange={(value) => form.setData('palette', value)} dark />
                        </Card>

                        <Card
                            id="sidebar-menu"
                            refCallback={registerSection('sidebar-menu')}
                            icon={PanelLeft}
                            title={t('admin.appearance.sidebar_heading', 'Couleur de la sidebar et du menu')}
                            description={t('admin.appearance.sidebar_description', "Fond de la barre latérale et du menu horizontal en haut, indépendant de la couleur d'accent.")}
                        >
                            <SwatchPicker options={chromes} value={form.data.chrome} onChange={(value) => form.setData('chrome', value)} />
                        </Card>

                        <Card
                            id="typographie"
                            refCallback={registerSection('typographie')}
                            icon={Type}
                            title={t('admin.appearance.typography', 'Typographie')}
                            description={t('admin.appearance.typography_description', "Police utilisée dans l'administration uniquement.")}
                        >
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label={t('admin.appearance.font_label', 'Police')}>
                                {fonts.map((font) => {
                                    const active = form.data.font === font.value;
                                    return (
                                        <button
                                            key={font.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => form.setData('font', font.value)}
                                            className={`rounded-xl border p-3 text-left transition ${
                                                active ? 'border-admin-accent bg-admin-accent/10 ring-1 ring-admin-accent/40' : 'border-admin-border hover:border-admin-accent/50 hover:bg-admin-hover'
                                            }`}
                                        >
                                            <span className="block text-2xl font-semibold text-admin-text">Aa</span>
                                            <span className="mt-1 block truncate text-xs text-admin-text-secondary">{font.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card
                            id="densite"
                            refCallback={registerSection('densite')}
                            icon={Rows3}
                            title={t('admin.appearance.density', 'Densité')}
                            description={t('admin.appearance.density_description', "Contrôle l'espacement des tableaux et listes.")}
                        >
                            <div className="grid grid-cols-3 gap-2.5" role="radiogroup">
                                {densityOptions(t).map((option) => {
                                    const active = form.data.density === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() => form.setData('density', option.value)}
                                            className={`rounded-xl border p-3 text-left transition ${
                                                active ? 'border-admin-accent bg-admin-accent/10 ring-1 ring-admin-accent/40' : 'border-admin-border hover:border-admin-accent/50 hover:bg-admin-hover'
                                            }`}
                                        >
                                            <span className={`mb-2 flex flex-col ${option.gap}`} aria-hidden="true">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <span key={i} className={`h-1.5 rounded ${active ? 'bg-admin-accent/60' : 'bg-admin-muted/40'}`} />
                                                ))}
                                            </span>
                                            <span className="text-sm font-medium text-admin-text">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    <LivePreview mode={previewMode} setMode={setPreviewMode} picks={picks} />
                </div>

                <div className="admin-card sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 p-3 shadow-xl">
                    <p className="text-xs text-admin-muted">
                        {dirty ? t('admin.appearance.unsaved', 'Modifications non enregistrées') : t('admin.appearance.changes_notice', "Les changements s'appliquent après actualisation de la page.")}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => form.setData({ ...settings })}
                            disabled={!dirty}
                            className="flex items-center gap-2 rounded-lg border border-admin-border px-4 py-2 text-sm font-medium text-admin-text-secondary transition hover:bg-admin-hover disabled:opacity-40"
                        >
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                            {t('admin.appearance.reset', 'Réinitialiser')}
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing || !dirty}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-admin-accent to-admin-accent/80 px-5 py-2 text-sm font-semibold text-admin-accent-foreground shadow-md shadow-admin-accent/25 transition hover:brightness-110 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {t('admin.common.save', 'Enregistrer')}
                        </button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
