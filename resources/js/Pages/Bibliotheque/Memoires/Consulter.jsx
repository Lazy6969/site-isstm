import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import BiblioLayout from '../../../Components/Bibliotheque/BiblioLayout';

export default function Consulter({ memoire, token }) {
    const containerRef = useRef(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        function onContextMenu(e) {
            e.preventDefault();
        }

        function onKeyDown(e) {
            const key = e.key.toLowerCase();
            if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u', 'c'].includes(key)) {
                e.preventDefault();
            }
        }

        function loadScript(src) {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async function load() {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const url = `/bibliotheque/memoires/${memoire.id}/flux?token=${token}`;
            const watermarkText = `ISSTM — consultation uniquement — ${new Date().toLocaleDateString('fr-FR')}`;

            const pdf = await pdfjsLib.getDocument({
                url,
                httpHeaders: { 'X-Requete-Visionneuse': '1' },
            }).promise;

            if (cancelled || !containerRef.current) return;
            setLoading(false);

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.4 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.className = 'mx-auto mb-3 max-w-full rounded-lg shadow-sm';
                const ctx = canvas.getContext('2d');

                await page.render({ canvasContext: ctx, viewport }).promise;
                if (cancelled) return;

                ctx.save();
                ctx.globalAlpha = 0.12;
                ctx.font = '20px Arial';
                ctx.fillStyle = '#000000';
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-Math.PI / 7);
                for (let y = -canvas.height; y < canvas.height; y += 110) {
                    ctx.fillText(watermarkText, -canvas.width / 2, y);
                }
                ctx.restore();

                containerRef.current.appendChild(canvas);
            }
        }

        load().catch(() => !cancelled && setError(true));

        const wrapper = containerRef.current;
        wrapper?.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            cancelled = true;
            wrapper?.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [memoire.id, token]);

    return (
        <BiblioLayout>
            <Head title={memoire.titre} />

            <h1 className="text-xl font-bold text-isstm-navy">{memoire.titre}</h1>
            <p className="mt-1 text-sm text-slate-500">
                {memoire.auteur}
                {memoire.encadreur ? ` — Encadreur : ${memoire.encadreur}` : ''} — {memoire.categorie} — {memoire.niveau} - {memoire.filiere} ({memoire.mention}) — {memoire.annee}
            </p>

            <div className="mt-4 rounded-xl bg-isstm-gold/10 px-4 py-2.5 text-sm text-isstm-navy">
                🔒 Consultation en ligne uniquement — téléchargement désactivé.
            </div>

            <div ref={containerRef} className="mt-6 select-none">
                {loading && !error && <p className="text-center text-sm text-slate-400">Chargement du document…</p>}
                {error && <p className="text-center text-sm text-red-500">Impossible de charger le document. Rechargez la page.</p>}
            </div>
        </BiblioLayout>
    );
}
