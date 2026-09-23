import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import ChartCard from '../../../Components/Admin/ChartCard';

const tooltipStyle = {
    backgroundColor: 'var(--color-admin-card)',
    borderColor: 'var(--color-admin-border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--color-admin-text)',
};

const axisTick = { fill: 'var(--color-admin-muted)', fontSize: 12 };

const chartColors = [
    'var(--color-admin-chart-1)',
    'var(--color-admin-chart-2)',
    'var(--color-admin-chart-3)',
    'var(--color-admin-chart-4)',
    'var(--color-admin-chart-5)',
    'var(--color-admin-chart-6)',
];

const CONTENT_STATUS_KEYS = ['brouillon', 'en_attente', 'publie', 'rejete', 'archive'];
const CONTENT_STATUS_LABELS = { brouillon: 'Brouillon', en_attente: 'En attente', publie: 'Publié', rejete: 'Rejeté', archive: 'Archivé' };

function StatusDonut({ title, data }) {
    const total = data.reduce((sum, row) => sum + row.total, 0);

    return (
        <ChartCard title={title}>
            {total === 0 ? (
                <p className="py-10 text-center text-sm text-admin-muted">Aucune donnée pour le moment.</p>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Pie data={data} dataKey="total" nameKey="statut" innerRadius={50} outerRadius={78} paddingAngle={2}>
                                {data.map((entry, index) => (
                                    <Cell key={entry.statut} fill={chartColors[index % chartColors.length]} stroke="var(--color-admin-card)" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-2 space-y-1.5">
                        {data.map((entry, index) => (
                            <li key={entry.statut} className="flex items-center gap-2 text-xs text-admin-text-secondary">
                                <span
                                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                />
                                <span className="flex-1 truncate">{entry.statut}</span>
                                <span className="font-medium text-admin-text">{entry.total}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </ChartCard>
    );
}

export default function Index({ usersByRole, contentByStatus, etudiantsByStatut, inscriptionsByStatut, preinscriptionsByStatut, activiteParJour }) {
    return (
        <AdminLayout title="Statistiques">
            <p className="mb-6 text-sm text-admin-text-secondary">Vue d'ensemble chiffrée de l'administration, des inscriptions et du contenu.</p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ChartCard title="Utilisateurs par rôle" description="Comptes administratifs actifs">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={usersByRole} margin={{ left: -20, right: 10, top: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="role" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-admin-hover)' }} />
                            <Bar dataKey="total" name="Utilisateurs" fill="var(--color-admin-chart-1)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Contenu par statut" description="Actualités, galerie et événements">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={contentByStatus} margin={{ left: -20, right: 10, top: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="module" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-admin-hover)' }} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, color: 'var(--color-admin-muted)' }}
                                formatter={(value) => CONTENT_STATUS_LABELS[value] ?? value}
                            />
                            {CONTENT_STATUS_KEYS.map((status, index) => (
                                <Bar key={status} dataKey={status} name={status} stackId="statut" fill={chartColors[index % chartColors.length]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <StatusDonut title="Étudiants par statut" data={etudiantsByStatut} />
                <StatusDonut title="Inscriptions par statut" data={inscriptionsByStatut} />
                <StatusDonut title="Préinscriptions par statut" data={preinscriptionsByStatut} />
            </div>

            <div className="mt-5">
                <ChartCard title="Activité administrative" description="Actions enregistrées au journal d'activité — 14 derniers jours">
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={activiteParJour} margin={{ left: -20, right: 10, top: 10 }}>
                            <defs>
                                <linearGradient id="activiteFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-admin-chart-3)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--color-admin-chart-3)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="jour" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-admin-text)' }} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Actions"
                                stroke="var(--color-admin-chart-3)"
                                strokeWidth={2}
                                fill="url(#activiteFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </AdminLayout>
    );
}
