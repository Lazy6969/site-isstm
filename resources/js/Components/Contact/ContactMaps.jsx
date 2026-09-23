import { usePage } from '@inertiajs/react';
import EditableText from '../QuickEdit/EditableText';
import ContactFieldVisibility from '../QuickEdit/ContactFieldVisibility';

const locations = [
    {
        key: 'principale',
        field: 'carte_principale',
        titleKey: 'localisation_principale',
        query: '-15.702528,46.353861(ISSTM+-+Campus+Principal)',
        coords: '-15.702528,46.353861',
    },
    {
        key: 'annexe',
        field: 'carte_annexe',
        titleKey: 'localisation_annexe_titre',
        query: '-15.72335804693739,46.31172101165267(ISSTM+-+Campus+Majunga+Be)',
        coords: '-15.72335804693739,46.31172101165267',
    },
];

export default function ContactMaps({ content }) {
    const { hiddenContactFields } = usePage().props;

    return (
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {locations.map((location) => (
                <ContactFieldVisibility
                    key={location.key}
                    field={location.field}
                    label={content[location.titleKey] ?? 'cette localisation'}
                    hidden={hiddenContactFields?.includes(location.field)}
                >
                    <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
                        <iframe
                            title={content[location.titleKey] ?? 'Localisation ISSTM'}
                            src={`https://www.google.com/maps?q=${location.query}&hl=fr&z=17&t=k&output=embed`}
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
                            <a
                                href={`https://www.google.com/maps?q=${location.coords}&z=17&t=k`}
                                target="_blank"
                                rel="noopener"
                                className="flex-shrink-0 text-xs font-medium text-isstm-gold hover:underline"
                            >
                                Ouvrir dans Maps
                            </a>
                        </div>
                    </div>
                </ContactFieldVisibility>
            ))}
        </div>
    );
}
