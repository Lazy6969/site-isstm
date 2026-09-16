export default function Filieres({ filieres }) {
    if (filieres.length === 0) return null;

    return (
        <section id="filieres" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-isstm-navy sm:text-3xl">🎓 Nos filières</h2>
                        <p className="mt-2 text-slate-500">Des formations d'ingénieurs et de techniciens reconnues.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filieres.map((filiere) => (
                        <article
                            key={filiere.slug}
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className="h-40 bg-cover bg-center"
                                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
                            />
                            <div className="p-5">
                                {filiere.mention && (
                                    <span className="inline-block rounded-full bg-isstm-navy/10 px-3 py-1 text-xs font-semibold text-isstm-navy">
                                        {filiere.mention}
                                    </span>
                                )}
                                <h3 className="mt-3 text-lg font-semibold text-isstm-navy">{filiere.nom}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{filiere.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
