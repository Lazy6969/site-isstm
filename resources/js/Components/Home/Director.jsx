export default function Director({ content }) {
    return (
        <section className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[280px_1fr]">
                <img
                    src={`/${content.directeur_image_path ?? 'images/directeur.jpg'}`}
                    alt={`Photo du Directeur de l'ISSTM`}
                    className="mx-auto h-64 w-64 rounded-full object-cover shadow-lg ring-4 ring-isstm-gold/40 md:h-72 md:w-72"
                    loading="lazy"
                />
                <div>
                    <h2 className="text-2xl font-bold text-isstm-navy sm:text-3xl">Le mot du Directeur</h2>
                    <blockquote className="mt-4 text-lg italic leading-relaxed text-slate-600">
                        "{content.mot_directeur_contenu}"
                    </blockquote>
                    <p className="mt-6 font-semibold text-isstm-navy">
                        {content.directeur_nom}
                        <br />
                        <span className="text-sm font-normal text-slate-500">Directeur de l'ISSTM</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
