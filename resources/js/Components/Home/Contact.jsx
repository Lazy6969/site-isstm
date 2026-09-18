import ContactCards from '../Contact/ContactCards';
import ContactMaps from '../Contact/ContactMaps';

export default function Contact({ content }) {
    return (
        <section id="contact" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-6">
                <h2 className="text-center text-2xl font-bold text-isstm-navy sm:text-3xl">Contactez-nous</h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
                    Une question ? Notre équipe vous répond avec plaisir.
                </p>

                <div className="mt-10">
                    <ContactCards content={content} />
                </div>

                <ContactMaps content={content} />
            </div>
        </section>
    );
}
