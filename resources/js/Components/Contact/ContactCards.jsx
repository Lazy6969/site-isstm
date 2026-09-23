import { usePage } from '@inertiajs/react';
import { Mail, Phone, Link2 } from 'lucide-react';
import EditableText from '../QuickEdit/EditableText';
import EditableIcon from '../QuickEdit/EditableIcon';
import ContactFieldVisibility from '../QuickEdit/ContactFieldVisibility';

export default function ContactCards({ content }) {
    const { hiddenContactFields } = usePage().props;

    const cards = [
        { field: 'email', icon: Mail, title: 'Email', value: content.contact_email, href: `mailto:${content.contact_email}` },
        {
            field: 'telephone',
            icon: Phone,
            title: 'Téléphone',
            value: content.contact_telephone,
            href: `tel:${(content.contact_telephone ?? '').replace(/[^0-9+]/g, '')}`,
        },
        {
            field: 'adresse',
            iconKey: 'contact_adresse_icon',
            title: content.contact_adresse,
            titleKey: 'contact_adresse',
            value: content.contact_adresse_detail,
            valueKey: 'contact_adresse_detail',
            href: null,
        },
        { field: 'facebook', icon: Link2, title: 'Facebook', value: '@isstm.umg', href: content.contact_facebook },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Wrapper = card.href ? 'a' : 'div';
                return (
                    <ContactFieldVisibility
                        key={card.title}
                        field={card.field}
                        label={card.title}
                        hidden={hiddenContactFields?.includes(card.field)}
                    >
                        <Wrapper
                            {...(card.href
                                ? { href: card.href, target: card.href.startsWith('http') ? '_blank' : undefined, rel: 'noopener' }
                                : {})}
                            className="block rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
                        >
                            {/* Cards with a link (email/phone/facebook) can't nest the pencil's <button> inside
                                the <a> — only the address card (no href) gets an editable icon. */}
                            {card.iconKey ? (
                                <EditableIcon contentKey={card.iconKey} value={content[card.iconKey]} className="mx-auto h-6 w-6 text-isstm-gold" />
                            ) : (
                                <card.icon className="mx-auto h-6 w-6 text-isstm-gold" aria-hidden="true" />
                            )}
                            {card.titleKey ? (
                                <EditableText as="h4" contentKey={card.titleKey} className="mt-3 font-semibold text-isstm-navy dark:text-white">
                                    {card.title}
                                </EditableText>
                            ) : (
                                <h4 className="mt-3 font-semibold text-isstm-navy dark:text-white">{card.title}</h4>
                            )}
                            {card.valueKey ? (
                                <EditableText as="p" contentKey={card.valueKey} className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {card.value}
                                </EditableText>
                            ) : (
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.value}</p>
                            )}
                        </Wrapper>
                    </ContactFieldVisibility>
                );
            })}
        </div>
    );
}
