import { Mail, Phone, MapPin, Link2 } from 'lucide-react';

export default function ContactCards({ content }) {
    const cards = [
        { icon: Mail, title: 'Email', value: content.contact_email, href: `mailto:${content.contact_email}` },
        { icon: Phone, title: 'Téléphone', value: content.contact_telephone, href: `tel:${(content.contact_telephone ?? '').replace(/[^0-9+]/g, '')}` },
        { icon: MapPin, title: content.contact_adresse, value: content.contact_adresse_detail, href: null },
        { icon: Link2, title: 'Facebook', value: '@isstm.umg', href: content.contact_facebook },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Wrapper = card.href ? 'a' : 'div';
                return (
                    <Wrapper
                        key={card.title}
                        {...(card.href ? { href: card.href, target: card.href.startsWith('http') ? '_blank' : undefined, rel: 'noopener' } : {})}
                        className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
                    >
                        <card.icon className="mx-auto h-6 w-6 text-isstm-gold" aria-hidden="true" />
                        <h4 className="mt-3 font-semibold text-isstm-navy dark:text-white">{card.title}</h4>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.value}</p>
                    </Wrapper>
                );
            })}
        </div>
    );
}
