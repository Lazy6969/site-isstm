import { Head, useForm } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '../../Components/Layout/AppLayout';
import { Card } from '../../Components/ui/card';
import { useTranslations } from '../../lib/useTranslations';

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function Presence({ group, canMark, students, sessions }) {
    const { t } = useTranslations();
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
        <AppLayout title={`${t('groupes.presence_titre', 'Présence')} — ${group.name}`}>
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
                    <Card className="p-5">
                        <form onSubmit={submit}>
                            <h2 className="mb-3 text-sm font-semibold text-isstm-navy dark:text-white">{t('groupes.faire_appel', "Faire l'appel")}</h2>
                            <input
                                type="date"
                                value={data.session_date}
                                onChange={(e) => setData('session_date', e.target.value)}
                                className="mb-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                            />
                            <div className="max-h-80 space-y-1 overflow-y-auto">
                                {students.map((s) => (
                                    <label key={s.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <input
                                            type="checkbox"
                                            checked={data.present_user_ids.includes(s.id)}
                                            onChange={() => toggleStudent(s.id)}
                                            className="h-4 w-4 rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy dark:border-slate-600 dark:bg-slate-900"
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                            <button disabled={processing} className="mt-3 w-full rounded-lg bg-isstm-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                                {t('groupes.enregistrer_presence', 'Enregistrer la présence')}
                            </button>
                        </form>
                    </Card>
                )}

                <Card className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-isstm-navy dark:text-white">{t('groupes.seances_enregistrees', 'Séances enregistrées')}</h2>
                        {selectedSession && (
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy dark:text-white hover:bg-isstm-navy/5"
                            >
                                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('groupes.imprimer', 'Imprimer')}
                            </button>
                        )}
                    </div>

                    {sessions.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">{t('groupes.aucune_seance', 'Aucune séance enregistrée pour ce groupe.')}</p>}

                    {sessions.length > 0 && (
                        <select
                            value={selectedSessionId ?? ''}
                            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                            className="mb-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-isstm-navy focus:outline-none"
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.session_date} ({s.present_ids.length} {t('groupes.presents', 'présent')}{s.present_ids.length > 1 ? 's' : ''})
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedSession && (
                        <div className="printable-presence">
                            <h3 className="mb-2 hidden text-lg font-semibold print:block">
                                {group.name} — {t('groupes.feuille_presence_du', 'Feuille de présence du')} {selectedSession.session_date}
                            </h3>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-400 dark:text-slate-500">
                                        <th className="py-2">{t('groupes.etudiant', 'Étudiant')}</th>
                                        <th className="py-2">{t('groupes.statut', 'Statut')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s) => (
                                        <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800">
                                            <td className="py-2">{s.name}</td>
                                            <td className="py-2">
                                                {presentIdsForPrint.has(String(s.id)) ? (
                                                    <span className="font-medium text-emerald-600">{t('groupes.present', 'Présent')}</span>
                                                ) : (
                                                    <span className="font-medium text-red-500">{t('groupes.absent', 'Absent')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
