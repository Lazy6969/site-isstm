import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import ExternalPencil from '../QuickEdit/ExternalPencil';
import EditLinkDialog from '../QuickEdit/EditLinkDialog';
import { useTranslations } from '../../lib/useTranslations';

const INPUT_CLASS =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-isstm-gold focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white';

/**
 * A short "send us a message" form, next to the contact cards/maps rather
 * than making visitors open their own mail client (unlike the mailto: cards
 * in ContactCards) — it posts straight to QuickContactController, which
 * e-mails contact_formulaire_email. ExternalPencil is used (not
 * EditableText) because that recipient address has no visible text of its
 * own on this form for a pencil to attach to — see ContactMaps' GPS
 * coordinates for the same pattern.
 */
export default function QuickContactForm({ content }) {
    const { t } = useTranslations();
    const form = useForm({ objet: '', nom: '', prenoms: '', email: '', telephone: '', message: '' });

    function submit(e) {
        e.preventDefault();
        form.post('/contact/message-rapide', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <div className="relative h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
            <ExternalPencil
                className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow ring-2 ring-white transition hover:scale-110"
                label={t('contact.modifier_destinataire', "Modifier l'adresse de réception des messages")}
                dialog={EditLinkDialog}
                dialogProps={{
                    contentKey: 'contact_formulaire_email',
                    initialValue: content?.contact_formulaire_email ?? '',
                    title: t('contact.modifier_destinataire', "Modifier l'adresse de réception des messages"),
                    label: t('contact.destinataire_label', 'E-mail de réception'),
                    placeholder: 'contact@isstm.mg',
                    helpText: t(
                        'contact.destinataire_aide',
                        'Les messages envoyés depuis ce formulaire seront transmis à cette adresse.',
                    ),
                    inputType: 'email',
                }}
            />

            <h3 className="font-semibold text-isstm-navy dark:text-white">
                {t('contact.formulaire_titre', 'Envoyer un message rapide')}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('contact.formulaire_soustitre', 'Nous vous répondrons directement à votre adresse e-mail.')}
            </p>

            <form onSubmit={submit} className="mt-4 space-y-3">
                <div>
                    <label htmlFor="qc-objet" className="sr-only">
                        {t('contact.formulaire_objet', 'Objet')}
                    </label>
                    <input
                        id="qc-objet"
                        type="text"
                        value={form.data.objet}
                        onChange={(e) => form.setData('objet', e.target.value)}
                        placeholder={t('contact.formulaire_objet', 'Objet')}
                        className={INPUT_CLASS}
                        required
                    />
                    {form.errors.objet && <p className="mt-1 text-xs text-red-500">{form.errors.objet}</p>}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="qc-nom" className="sr-only">
                            {t('contact.formulaire_nom', 'Votre nom')}
                        </label>
                        <input
                            id="qc-nom"
                            type="text"
                            value={form.data.nom}
                            onChange={(e) => form.setData('nom', e.target.value)}
                            placeholder={t('contact.formulaire_nom', 'Votre nom')}
                            className={INPUT_CLASS}
                            required
                        />
                        {form.errors.nom && <p className="mt-1 text-xs text-red-500">{form.errors.nom}</p>}
                    </div>

                    <div>
                        <label htmlFor="qc-prenoms" className="sr-only">
                            {t('contact.formulaire_prenoms', 'Votre prénom')}
                        </label>
                        <input
                            id="qc-prenoms"
                            type="text"
                            value={form.data.prenoms}
                            onChange={(e) => form.setData('prenoms', e.target.value)}
                            placeholder={t('contact.formulaire_prenoms', 'Votre prénom')}
                            className={INPUT_CLASS}
                            required
                        />
                        {form.errors.prenoms && <p className="mt-1 text-xs text-red-500">{form.errors.prenoms}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="qc-email" className="sr-only">
                            {t('contact.formulaire_email', 'Votre e-mail')}
                        </label>
                        <input
                            id="qc-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            placeholder={t('contact.formulaire_email', 'Votre e-mail')}
                            className={INPUT_CLASS}
                            required
                        />
                        {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="qc-telephone" className="sr-only">
                            {t('contact.formulaire_telephone', 'Votre téléphone')}
                        </label>
                        <input
                            id="qc-telephone"
                            type="tel"
                            value={form.data.telephone}
                            onChange={(e) => form.setData('telephone', e.target.value)}
                            placeholder={t('contact.formulaire_telephone', 'Votre téléphone (facultatif)')}
                            className={INPUT_CLASS}
                        />
                        {form.errors.telephone && <p className="mt-1 text-xs text-red-500">{form.errors.telephone}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="qc-message" className="sr-only">
                        {t('contact.formulaire_message', 'Votre message')}
                    </label>
                    <textarea
                        id="qc-message"
                        rows={4}
                        value={form.data.message}
                        onChange={(e) => form.setData('message', e.target.value)}
                        placeholder={t('contact.formulaire_message', 'Votre message')}
                        className={INPUT_CLASS}
                        required
                    />
                    {form.errors.message && <p className="mt-1 text-xs text-red-500">{form.errors.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {t('contact.formulaire_envoyer', 'Envoyer')}
                </button>
            </form>
        </div>
    );
}
