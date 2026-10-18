import { Armchair, FlaskConical, Laptop, Network, Package, Printer, Projector, Dumbbell } from 'lucide-react';

export const CATEGORY_ICONS = {
    informatique: Laptop,
    audiovisuel: Projector,
    mobilier: Armchair,
    laboratoire: FlaskConical,
    reseau: Network,
    sport: Dumbbell,
    bureautique: Printer,
    autre: Package,
};

/** Colour of each statut — the same everywhere in the matériel workspace. */
export const STATUT_STYLES = {
    disponible: { label: 'Disponible', badge: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/25', dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-500' },
    emprunte: { label: 'Emprunté', badge: 'bg-sky-500/10 text-sky-600 ring-sky-500/25', dot: 'bg-sky-500', bar: 'bg-sky-500', text: 'text-sky-500' },
    en_maintenance: { label: 'En maintenance', badge: 'bg-amber-500/10 text-amber-600 ring-amber-500/25', dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-500' },
    en_panne: { label: 'En panne', badge: 'bg-rose-500/10 text-rose-600 ring-rose-500/25', dot: 'bg-rose-500', bar: 'bg-rose-500', text: 'text-rose-500' },
    reforme: { label: 'Réformé', badge: 'bg-slate-500/10 text-slate-500 ring-slate-500/25', dot: 'bg-slate-400', bar: 'bg-slate-400', text: 'text-slate-500' },
};

export const MOUVEMENT_STYLES = {
    creation: 'bg-emerald-500/10 text-emerald-500',
    deplacement: 'bg-violet-500/10 text-violet-500',
    emprunt: 'bg-sky-500/10 text-sky-500',
    retour: 'bg-teal-500/10 text-teal-500',
    panne: 'bg-rose-500/10 text-rose-500',
    maintenance: 'bg-amber-500/10 text-amber-500',
    reparation: 'bg-orange-500/10 text-orange-500',
    remise_en_service: 'bg-emerald-500/10 text-emerald-500',
    reforme: 'bg-slate-500/10 text-slate-500',
};

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const formatMoney = (value) => (value === null || value === undefined ? '—' : `${Number(value).toLocaleString('fr-FR')} Ar`);

/**
 * Scales a picked photo down in the browser (1280 px, JPEG) so that a phone
 * picture never hits the server's size limit.
 */
export async function prepareImage(file, { maxSide = 1280, limitBytes = 4 * 1024 * 1024 } = {}) {
    if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une image (JPG, PNG ou WebP).');
    if (file.size > 20 * 1024 * 1024) throw new Error('Cette image est trop lourde (20 Mo maximum).');

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) {
        if (file.size > limitBytes) throw new Error('Image illisible ou trop lourde : choisissez un JPG, PNG ou WebP plus léger.');
        return file;
    }

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= limitBytes) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));

    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' }) : file;
}
