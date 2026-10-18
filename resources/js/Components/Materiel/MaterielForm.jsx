import { useEffect, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Camera, PackagePlus, Save, X } from 'lucide-react';
import { ErrorBanner, Field, PrimaryButton, GhostButton, inputClass, Thumb } from './kit';
import { prepareImage } from '../../lib/materiel';
import { cn } from '../../lib/utils';

/**
 * Create / edit form of one item, shown beside the list (not in a pop-up).
 * `materiel` null → creation (the code is generated when left empty).
 */
export default function MaterielForm({ materiel, options, localisations, onClose }) {
    const editing = materiel !== null;
    const form = useForm({
        code: materiel?.code ?? '',
        nom: materiel?.nom ?? '',
        categorie: materiel?.categorie ?? 'informatique',
        marque: materiel?.marque ?? '',
        modele: materiel?.modele ?? '',
        numero_serie: materiel?.numero_serie ?? '',
        localisation: materiel?.localisation ?? '',
        date_acquisition: materiel?.date_acquisition ?? '',
        valeur: materiel?.valeur ?? '',
        notes: materiel?.notes ?? '',
        photo: null,
    });
    const [preview, setPreview] = useState(null);
    const [problem, setProblem] = useState(null);
    const fileInput = useRef(null);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    async function pickPhoto(file) {
        if (!file) return;
        setProblem(null);
        try {
            const prepared = await prepareImage(file);
            form.setData('photo', prepared);
            setPreview(URL.createObjectURL(prepared));
        } catch (error) {
            setProblem(error.message);
        }
    }

    function submit(e) {
        e.preventDefault();
        setProblem(null);
        form.post(editing ? `/materiel/inventaire/${materiel.id}/modifier` : '/materiel/inventaire', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    const set = (key) => (e) => form.setData(key, e.target.value);
    const errors = { ...form.errors, ...(problem ? { photo: problem } : {}) };

    return (
        <aside className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card shadow-lg" aria-label={editing ? 'Modifier le matériel' : 'Ajouter un matériel'}>
            <header className="flex items-center gap-3 border-b border-admin-border bg-gradient-to-r from-admin-accent/10 to-transparent px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-admin-accent to-sky-500 text-white shadow-md shadow-admin-accent/30">
                    <PackagePlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-admin-text">{editing ? 'Modifier le matériel' : 'Ajouter un matériel'}</h2>
                    <p className="truncate text-xs text-admin-text-secondary">{editing ? materiel.code : 'Un code d’inventaire est généré automatiquement'}</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-full text-admin-muted transition hover:bg-admin-hover hover:text-admin-text">
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </header>

            <form onSubmit={submit} className="space-y-4 p-5">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-admin-border transition hover:ring-admin-accent"
                        aria-label="Choisir une photo"
                    >
                        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Thumb materiel={{ photo_path: editing ? materiel.photo_path : null, categorie: form.data.categorie }} className="h-full w-full !rounded-none" iconClass="h-8 w-8" />}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                            <Camera className="h-5 w-5" aria-hidden="true" />
                        </span>
                    </button>
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
                    <div className="min-w-0 text-xs text-admin-text-secondary">
                        <p className="font-semibold text-admin-text">Photo (facultative)</p>
                        <p>JPG, PNG ou WebP — réduite automatiquement si elle est trop lourde.</p>
                        {form.data.photo && <p className="mt-1 truncate text-admin-accent">{form.data.photo.name}</p>}
                    </div>
                </div>
                {errors.photo && <p className="-mt-2 text-xs text-rose-500">{errors.photo}</p>}

                <Field label="Désignation *" error={form.errors.nom}>
                    <input value={form.data.nom} onChange={set('nom')} className={inputClass} placeholder="Ex. Vidéoprojecteur Epson EB-X06" autoFocus />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Catégorie *" error={form.errors.categorie}>
                        <select value={form.data.categorie} onChange={set('categorie')} className={inputClass}>
                            {Object.entries(options.categories).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Code d’inventaire" error={form.errors.code} hint={editing ? undefined : 'Vide = généré'}>
                        <input value={form.data.code} onChange={set('code')} className={cn(inputClass, 'font-mono')} placeholder="MAT-2026-00001" />
                    </Field>
                    <Field label="Marque" error={form.errors.marque}>
                        <input value={form.data.marque} onChange={set('marque')} className={inputClass} />
                    </Field>
                    <Field label="Modèle" error={form.errors.modele}>
                        <input value={form.data.modele} onChange={set('modele')} className={inputClass} />
                    </Field>
                </div>

                <Field label="Numéro de série" error={form.errors.numero_serie}>
                    <input value={form.data.numero_serie} onChange={set('numero_serie')} className={cn(inputClass, 'font-mono')} />
                </Field>

                <Field label="Localisation actuelle" error={form.errors.localisation}>
                    <input value={form.data.localisation} onChange={set('localisation')} className={inputClass} list="materiel-localisations" placeholder="Salle, bureau, magasin…" />
                    <datalist id="materiel-localisations">
                        {localisations.map((place) => (
                            <option key={place} value={place} />
                        ))}
                    </datalist>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Date d’acquisition" error={form.errors.date_acquisition}>
                        <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.data.date_acquisition} onChange={set('date_acquisition')} className={inputClass} />
                    </Field>
                    <Field label="Valeur (Ar)" error={form.errors.valeur}>
                        <input type="number" min="0" step="1" value={form.data.valeur} onChange={set('valeur')} className={inputClass} />
                    </Field>
                </div>

                <Field label="Notes" error={form.errors.notes}>
                    <textarea value={form.data.notes} onChange={set('notes')} rows={3} className={cn(inputClass, 'h-auto py-2')} />
                </Field>

                <ErrorBanner errors={Object.fromEntries(Object.entries(form.errors).filter(([key]) => !['nom', 'categorie', 'code', 'marque', 'modele', 'numero_serie', 'localisation', 'date_acquisition', 'valeur', 'notes', 'photo'].includes(key)))} />

                <div className="flex justify-end gap-2 border-t border-admin-border pt-4">
                    <GhostButton type="button" onClick={onClose}>
                        Annuler
                    </GhostButton>
                    <PrimaryButton type="submit" icon={Save} disabled={form.processing || form.data.nom.trim() === ''}>
                        {editing ? 'Enregistrer' : 'Ajouter à l’inventaire'}
                    </PrimaryButton>
                </div>
            </form>
        </aside>
    );
}
