import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function Presence({ group, canMark, students, sessions }) {
    const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? null);
    const { data, setData, post, processing } = useForm({ session_date: today(), present_user_ids: [] });

    const selectedSession = useMemo(() => sessions.find((s) => s.id === selectedSessionId), [sessions, selectedSessionId]);
    const presentIdsForPrint = useMemo(() => new Set((selectedSession?.present_ids ?? []).map(String)), [selectedSession]);

    function toggleStudent(id) {
        setData('present_user_ids', data.present_user_ids.includes(id) ? data.present_user_ids.filter((x) => x !== id) : [...data.present_user_ids, id]);
    }

    function submit(e) {
        e.preventDefault();
        post(`/groupes/${group.id}/presence`, { preserveScroll: true });
    }

    return (
        <AppLayout title={`Présence — ${group.name}`}>
            <Head title={`Présence — ${group.name}`} />

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .printable-presence, .printable-presence * { visibility: visible; }
                    .printable-presence { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>

            <div className="grid gap-6 lg:grid-cols-2">
                {canMark && (
                    <form onSubmit={submit} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-sm font-semibold text-isstm-navy">Faire l'appel</h2>
                        <input
                            type="date"
                            value={data.session_date}
                            onChange={(e) => setData('session_date', e.target.value)}
                            className="mb-3 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        />
                        <div className="max-h-80 space-y-1 overflow-y-auto">
                            {students.map((s) => (
                                <label key={s.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        checked={data.present_user_ids.includes(s.id)}
                                        onChange={() => toggleStudent(s.id)}
                                        className="h-4 w-4 rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy"
                                    />
                                    {s.name}
                                </label>
                            ))}
                        </div>
                        <button disabled={processing} className="mt-3 w-full rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            Enregistrer la présence
                        </button>
                    </form>
                )}

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-isstm-navy">Séances enregistrées</h2>
                        {selectedSession && (
                            <button onClick={() => window.print()} className="rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/5">
                                Imprimer
                            </button>
                        )}
                    </div>

                    {sessions.length === 0 && <p className="text-sm text-slate-400">Aucune séance enregistrée pour ce groupe.</p>}

                    {sessions.length > 0 && (
                        <select
                            value={selectedSessionId ?? ''}
                            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                            className="mb-3 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.session_date} ({s.present_ids.length} présent{s.present_ids.length > 1 ? 's' : ''})
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedSession && (
                        <div className="printable-presence">
                            <h3 className="mb-2 hidden text-lg font-semibold print:block">
                                {group.name} — Feuille de présence du {selectedSession.session_date}
                            </h3>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                                        <th className="py-2">Étudiant</th>
                                        <th className="py-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s) => (
                                        <tr key={s.id} className="border-b border-slate-50">
                                            <td className="py-2">{s.name}</td>
                                            <td className="py-2">
                                                {presentIdsForPrint.has(String(s.id)) ? (
                                                    <span className="font-medium text-emerald-600">Présent</span>
                                                ) : (
                                                    <span className="font-medium text-red-500">Absent</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
