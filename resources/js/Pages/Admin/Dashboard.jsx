import { useMemo, useState } from 'react';
import { GraduationCap, School, UserPlus, ClipboardCheck, BookOpen, Presentation, Newspaper, Images, Quote, HeartHandshake } from 'lucide-react';
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
} from 'recharts';
import AdminLayout from '../../Components/Layout/AdminLayout';
import StatCard from '../../Components/Admin/StatCard';
import ChartCard from '../../Components/Admin/ChartCard';
import ActivityList from '../../Components/Admin/ActivityList';
import { Tabs, TabsList, TabsTrigger } from '../../Components/ui/tabs';

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

const periodOptions = [
    { value: 3, label: '3 mois' },
    { value: 6, label: '6 mois' },
];

export default function Dashboard({ stats, contentStats, preinscriptionsParMois, etudiantsParNiveau, etudiantsParFiliere, activiteRecente }) {
    const [periode, setPeriode] = useState(6);

    const evolutionData = useMemo(() => preinscriptionsParMois.slice(-periode), [preinscriptionsParMois, periode]);

    return (
        <AdminLayout title="Tableau de bord">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Étudiants" value={stats.etudiants} icon={GraduationCap} hint="Dossiers actifs" />
                <StatCard label="Classes" value={stats.classes} icon={School} hint="Toutes années confondues" />
                <StatCard label="Préinscriptions" value={stats.preinscriptions_en_attente} icon={UserPlus} hint="En attente de traitement" />
                <StatCard label="Inscriptions validées" value={stats.inscriptions_validees} icon={ClipboardCheck} hint="Année en cours" />
            </div>

            <p className="mt-8 mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-admin-muted uppercase">
                <span className="h-1 w-1 rounded-full bg-admin-accent" aria-hidden="true" />
                Contenu du site
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Filières" value={contentStats.filieres} icon={BookOpen} />
                <StatCard label="Enseignants" value={contentStats.enseignants} icon={Presentation} />
                <StatCard label="Actualités publiées" value={contentStats.actualites_publiees} icon={Newspaper} />
                <StatCard label="Albums galerie" value={contentStats.albums_galerie} icon={Images} />
                <StatCard label="Témoignages" value={contentStats.temoignages} icon={Quote} />
                <StatCard label="Partenaires" value={contentStats.partenaires} icon={HeartHandshake} />
            </div>

            <div className="mt-5">
                <ChartCard
                    title="Évolution des préinscriptions"
                    description="Dossiers déposés par mois"
                    action={
                        <Tabs value={String(periode)} onValueChange={(value) => setPeriode(Number(value))}>
                            <TabsList className="gap-1 rounded-lg bg-admin-hover p-1">
                                {periodOptions.map((option) => (
                                    <TabsTrigger
                                        key={option.value}
                                        value={String(option.value)}
                                        className="rounded-md px-2.5 py-1 text-xs font-medium text-admin-muted transition-all duration-200 data-[state=active]:bg-admin-accent data-[state=active]:text-admin-accent-foreground data-[state=active]:shadow-sm hover:text-admin-text"
                                    >
                                        {option.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    }
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={evolutionData} margin={{ left: -20, right: 10, top: 10 }}>
                            <defs>
                                <linearGradient id="preinscriptionsFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-admin-chart-1)" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="var(--color-admin-chart-1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                            <XAxis dataKey="mois" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--color-admin-text)' }} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Préinscriptions"
                                stroke="var(--color-admin-chart-1)"
                                strokeWidth={2}
                                fill="url(#preinscriptionsFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ChartCard title="Étudiants par niveau">
                    {etudiantsParNiveau.length === 0 ? (
                        <p className="py-10 text-center text-sm text-admin-muted">Aucun étudiant affecté à une classe.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={etudiantsParNiveau} margin={{ left: -20, right: 10, top: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-admin-border)" vertical={false} />
                                <XAxis dataKey="niveau" tick={axisTick} axisLine={{ stroke: 'var(--color-admin-border)' }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={30} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-admin-hover)' }} />
                                <Bar dataKey="total" name="Étudiants" fill="var(--color-admin-chart-3)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Étudiants par filière">
                    {etudiantsParFiliere.length === 0 ? (
                        <p className="py-10 text-center text-sm text-admin-muted">Aucun étudiant affecté à une classe.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Pie
                                    data={etudiantsParFiliere}
                                    dataKey="total"
                                    nameKey="filiere"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {etudiantsParFiliere.map((entry, index) => (
                                        <Cell key={entry.filiere} fill={chartColors[index % chartColors.length]} stroke="var(--color-admin-card)" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    <ul className="mt-2 space-y-1.5">
                        {etudiantsParFiliere.map((entry, index) => (
                            <li key={entry.filiere} className="flex items-center gap-2 text-xs text-admin-text-secondary">
                                <span
                                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                />
                                <span className="flex-1 truncate">{entry.filiere}</span>
                                <span className="font-medium text-admin-text">{entry.total}</span>
                            </li>
                        ))}
                    </ul>
                </ChartCard>
            </div>

            <div className="mt-5">
                <ChartCard title="Activité récente">
                    <ActivityList items={activiteRecente} />
                </ChartCard>
            </div>
        </AdminLayout>
    );
}
