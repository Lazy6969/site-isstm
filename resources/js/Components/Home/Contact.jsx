export default function Contact({ content }) {
    const cards = [
        { icon: '✉️', title: 'Email', value: content.contact_email, href: `mailto:${content.contact_email}` },
        { icon: '📞', title: 'Téléphone', value: content.contact_telephone, href: `tel:${(content.contact_telephone ?? '').replace(/[^0-9+]/g, '')}` },
        { icon: '📍', title: content.contact_adresse, value: content.contact_adresse_detail, href: null },
        { icon: '📘', title: 'Facebook', value: '@isstm.umg', href: content.contact_facebook },
    ];

    return (
        <section id="contact" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-6">
                <h2 className="text-center text-2xl font-bold text-isstm-navy sm:text-3xl">Contactez-nous</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
                    Une question ? Notre équipe vous répond avec plaisir.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => {
                        const Wrapper = card.href ? 'a' : 'div';
                        return (
                            <Wrapper
                                key={card.title}
                                {...(card.href ? { href: card.href, target: card.href.startsWith('http') ? '_blank' : undefined, rel: 'noopener' } : {})}
                                className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <span className="text-2xl" aria-hidden="true">{card.icon}</span>
                                <h4 className="mt-3 font-semibold text-isstm-navy">{card.title}</h4>
                                <p className="mt-1 text-sm text-slate-500">{card.value}</p>
                            </Wrapper>
                        );
                    })}
                </div>

                <div className="mt-12 overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
                    <iframe
                        title="Localisation ISSTM"
                        src="https://www.google.com/maps?q=-15.702528,46.353861(ISSTM+-+Campus+Principal)&hl=fr&z=17&t=k&output=embed"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}
