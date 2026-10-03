import { usePage } from '@inertiajs/react';
import EditableText from '../QuickEdit/EditableText';
import ExternalPencil from '../QuickEdit/ExternalPencil';
import EditLinkDialog from '../QuickEdit/EditLinkDialog';
import ContactFieldVisibility from '../QuickEdit/ContactFieldVisibility';
import { useTranslations } from '../../lib/useTranslations';

const locations = [
    {
        key: 'principale',
        field: 'carte_principale',
        titleKey: 'localisation_principale',
        coordsKey: 'contact_carte_principale_coords',
        defaultCoords: '-15.702528,46.353861',
        marker: 'ISSTM+-+Campus+Principal',
    },
    {
        key: 'annexe',
        field: 'carte_annexe',
        titleKey: 'localisation_annexe_titre',
        coordsKey: 'contact_carte_annexe_coords',
        defaultCoords: '-15.72335804693739,46.31172101165267',
        marker: 'ISSTM+-+Campus+Majunga+Be',
    },
];

export default function ContactMaps({ content }) {
    const { t } = useTranslations();
    const { hiddenContactFields } = usePage().props;

    return (
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {locations.map((location) => {
                const coords = content[location.coordsKey] || location.defaultCoords;

                return (
                    <ContactFieldVisibility
                        key={location.key}
                        field={location.field}
                        label={content[location.titleKey] ?? 'cette localisation'}
                        hidden={hiddenContactFields?.includes(location.field)}
                    >
                        <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
                            <iframe
                                title={content[location.titleKey] ?? 'Localisation ISSTM'}
                                src={`https://www.google.com/maps?q=${coords}(${location.marker})&hl=fr&z=17&t=k&output=embed`}
                                width="100%"
                                height="320"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-slate-800">
                                <EditableText
                                    as="p"
                                    contentKey={location.titleKey}
                                    className="truncate text-sm font-medium text-isstm-navy dark:text-white"
                                >
                                    {content[location.titleKey]}
                                </EditableText>
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <ExternalPencil
                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow transition hover:scale-110"
                                        label={t('contact.modifier_gps', 'Modifier les coordonnées GPS')}
                                        dialog={EditLinkDialog}
                                        dialogProps={{
                                            contentKey: location.coordsKey,
                                            initialValue: content[location.coordsKey] || '',
                                            title: t('contact.modifier_gps', 'Modifier les coordonnées GPS'),
                                            label: t('contact.coordonnees_gps', 'Coordonnées (latitude,longitude)'),
                                            placeholder: location.defaultCoords,
                                            helpText: t(
                                                'contact.coordonnees_gps_aide',
                                                'Format : latitude,longitude (ex. -15.702528,46.353861), sans espace.',
                                            ),
                                            inputType: 'text',
                                        }}
                                    />
                                    <a
                                        href={`https://www.google.com/maps?q=${coords}&z=17&t=k`}
                                        target="_blank"
                                        rel="noopener"
                                        className="text-xs font-medium text-isstm-gold hover:underline"
                                    >
                                        {t('contact.ouvrir_maps', 'Ouvrir dans Maps')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ContactFieldVisibility>
                );
            })}
        </div>
    );
}
