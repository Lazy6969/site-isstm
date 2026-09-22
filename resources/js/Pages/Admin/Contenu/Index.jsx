import { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Pencil, CheckCircle2, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Button } from '../../../Components/ui/button';
import { Textarea } from '../../../Components/ui/textarea';
import { Badge } from '../../../Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../Components/ui/dialog';
import { ICONS, getIcon } from '../../../Components/QuickEdit/icons';

const localeLabels = { fr: 'FR', en: 'EN', mg: 'MG' };

function truncate(value, max = 80) {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}…` : value;
}

function EditContentDialog({ editing, onClose, icons }) {
    const open = editing !== null;
    const { content, locale } = editing ?? {};
    const form = useForm({ key: '', value: '', file: null, locale: null });

    useEffect(() => {
        if (!content) return;
        if (content.type === 'text') {
            form.setData({ key: content.content_key, value: content[`content_value_${locale}`] ?? '', file: null, locale });
        } else if (content.type === 'icon') {
            form.setData({ key: content.content_key, value: content.content_value_fr, file: null, locale: null });
        } else {
            form.setData({ key: content.content_key, value: '', file: null, locale: null });
        }
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, locale]);

    function submit(e) {
        e.preventDefault();
        form.post('/console/content/update', {
            preserveScroll: true,
            preserveState: true,
            forceFormData: content?.type === 'image',
            onSuccess: onClose,
        });
    }

    function pickIcon(name) {
        form.setData('value', name);
        form.post('/console/content/update', { preserveScroll: true, preserveState: true, onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                {content && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                {content.content_key}
                                {locale && <span className="ml-2 text-xs font-normal text-admin-muted">({localeLabels[locale]})</span>}
                            </DialogTitle>
                        </DialogHeader>

                        {content.type === 'text' && (
                            <form onSubmit={submit} className="space-y-3">
                                <Textarea value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} rows={6} autoFocus />
                                {form.errors.value && <p className="text-sm text-red-500">{form.errors.value}</p>}
                                <DialogFooter>
                                    <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={form.processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                        Enregistrer
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}

                        {content.type === 'icon' && (
                            <div>
                                <div className="grid grid-cols-6 gap-2">
                                    {icons.map((name) => {
                                        const Icon = ICONS[name];
                                        const selected = name === form.data.value;
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => pickIcon(name)}
                                                disabled={form.processing}
                                                title={name}
                                                className={`flex h-12 w-12 items-center justify-center rounded-lg border transition disabled:opacity-50 ${
                                                    selected
                                                        ? 'border-admin-text bg-admin-hover text-admin-text'
                                                        : 'border-admin-border text-admin-text-secondary hover:bg-admin-hover hover:text-admin-text'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.errors.value && <p className="mt-3 text-sm text-red-500">{form.errors.value}</p>}
                            </div>
                        )}

                        {content.type === 'image' && (
                            <form onSubmit={submit} className="space-y-4">
                                <img
                                    src={`/${content.content_value_fr}`}
                                    alt=""
                                    className="h-40 w-full rounded-lg border border-admin-border object-cover"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)}
                                    className="block w-full text-sm text-admin-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-admin-hover file:px-3 file:py-2 file:text-sm file:font-medium file:text-admin-text"
                                />
                                {form.errors.file && <p className="text-sm text-red-500">{form.errors.file}</p>}
                                <DialogFooter>
                                    <Button type="button" onClick={onClose} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing || !form.data.file}
                                        className="bg-admin-text text-admin-bg hover:bg-admin-text/90"
                                    >
                                        Enregistrer
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function ContentRow({ content, onEdit }) {
    const IconPreview = content.type === 'icon' ? getIcon(content.content_value_fr) : null;

    return (
        <div className="flex flex-col gap-2 border-b border-admin-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="font-mono text-xs text-admin-muted">{content.content_key}</p>

                {content.type === 'text' && (
                    <div className="mt-1 space-y-1">
                        {['fr', 'en', 'mg'].map((locale) => (
                            <div key={locale} className="flex items-center gap-2 text-sm">
                                <Badge className="w-9 justify-center">{localeLabels[locale]}</Badge>
                                <span className="text-admin-text">{truncate(content[`content_value_${locale}`])}</span>
                                <button
                                    onClick={() => onEdit(content, locale)}
                                    className="rounded p-1 text-admin-text-secondary transition hover:bg-admin-hover hover:text-admin-text"
                                    aria-label={`Modifier ${content.content_key} (${localeLabels[locale]})`}
                                >
                                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {content.type === 'icon' && IconPreview && (
                    <div className="mt-1 flex items-center gap-2">
                        <IconPreview className="h-5 w-5 text-admin-text" aria-hidden="true" />
                        <span className="text-sm text-admin-text-secondary">{content.content_value_fr}</span>
                    </div>
                )}

                {content.type === 'image' && (
                    <img src={`/${content.content_value_fr}`} alt="" className="mt-1 h-12 w-20 rounded border border-admin-border object-cover" />
                )}
            </div>

            {content.type !== 'text' && (
                <Button
                    onClick={() => onEdit(content, null)}
                    className="w-fit bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Modifier
                </Button>
            )}
        </div>
    );
}

function GroupSection({ label, items, onEdit }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-card">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-admin-text"
            >
                <span>
                    {label} <span className="font-normal text-admin-muted">({items.length})</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-admin-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {open && <div>{items.map((content) => <ContentRow key={content.id} content={content} onEdit={onEdit} />)}</div>}
        </div>
    );
}

export default function Index({ groups, icons }) {
    const { flash } = usePage().props;
    const [editing, setEditing] = useState(null);

    function onEdit(content, locale) {
        setEditing({ content, locale });
    }

    return (
        <AdminLayout title="Contenu du site">
            <p className="mb-5 text-sm text-admin-text-secondary">
                Textes, icônes et images affichés sur les pages publiques (accueil, contact, histoire, frais, mentions légales…).
            </p>

            {flash?.status && (
                <p className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {flash.status}
                </p>
            )}

            <div className="space-y-3">
                {Object.entries(groups).map(([label, items]) => (
                    <GroupSection key={label} label={label} items={items} onEdit={onEdit} />
                ))}
            </div>

            <EditContentDialog editing={editing} onClose={() => setEditing(null)} icons={icons} />
        </AdminLayout>
    );
}
