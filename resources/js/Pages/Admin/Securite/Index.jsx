import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, Clock, KeyRound, MailCheck, ShieldCheck, X } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import StatCard from '../../../Components/Admin/StatCard';
import { Avatar, AvatarFallback, AvatarImage } from '../../../Components/ui/avatar';
import { Badge } from '../../../Components/ui/badge';
import { Button } from '../../../Components/ui/button';
import { useTranslations } from '../../../lib/useTranslations';
import { useConfirm } from '../../../lib/useConfirm';
import DateRangeFilter from '../../../Components/Admin/DateRangeFilter';
import { useDateRange } from '../../../lib/dateRange';
import FilterPanel from '../../../Components/Admin/FilterPanel';

const STATUS_VARIANT = { en_attente: 'warning', accepte: 'success', refuse: 'danger' };
const DATE_LOCALES = { fr: 'fr-FR', en: 'en-GB', mg: 'fr-MG' };

export default function Index({ requests }) {
    const { t, locale } = useTranslations();
    const confirmAction = useConfirm();
    const [tab, setTab] = useState('en_attente');
    const [search, setSearch] = useState('');

    const counts = useMemo(
        () => ({
            en_attente: requests.filter((r) => r.status === 'en_attente').length,
            accepte: requests.filter((r) => r.status === 'accepte').length,
            refuse: requests.filter((r) => r.status === 'refuse').length,
        }),
        [requests],
    );
    const range = useDateRange();
    const visible = (tab === 'tous' ? requests : requests.filter((r) => r.status === tab)).filter((r) => range.matches(r.created_at))
        .filter((r) => !search.trim() || `${r.user.name} ${r.user.email}`.toLowerCase().includes(search.trim().toLowerCase()));
    const statusLabels = {
        en_attente: t('admin.securite.status_en_attente', 'En attente'),
        accepte: t('admin.securite.status_accepte', 'Acceptée'),
        refuse: t('admin.securite.status_refuse', 'Refusée'),
    };

    function formatDate(value) {
        return new Date(value).toLocaleString(DATE_LOCALES[locale] ?? 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    async function approve(item) {
        const ok = await confirmAction({
            title: t('admin.securite.confirm_accept_title', 'Réinitialiser ce mot de passe ?'),
            message: t('admin.securite.confirm_accept_text', 'Le mot de passe de ce compte deviendra 00000000 et sera envoyé par e-mail à l’étudiant, qui devra le modifier dès sa connexion.'),
            details: `${item.user.name} — ${item.user.email}`,
            confirmLabel: t('admin.securite.accept', 'Accepter'),
        });
        if (ok) router.post(`/console/securite/${item.id}/accepter`, {}, { preserveScroll: true });
    }

    async function refuse(item) {
        const ok = await confirmAction({
            title: t('admin.securite.confirm_refuse_title', 'Refuser cette demande ?'),
            message: t('admin.securite.confirm_refuse_text', 'Le mot de passe ne sera pas modifié. L’étudiant sera prévenu par e-mail.'),
            details: `${item.user.name} — ${item.user.email}`,
            tone: 'danger',
            confirmLabel: t('admin.securite.refuse', 'Refuser'),
        });
        if (ok) router.post(`/console/securite/${item.id}/refuser`, {}, { preserveScroll: true });
    }

    const tabs = [
        ['en_attente', t('admin.securite.tab_en_attente', 'En attente'), counts.en_attente],
        ['accepte', t('admin.securite.tab_accepte', 'Acceptées'), counts.accepte],
        ['refuse', t('admin.securite.tab_refuse', 'Refusées'), counts.refuse],
        ['tous', t('admin.securite.tab_tous', 'Toutes'), requests.length],
    ];

    return (
        <AdminLayout title={t('admin.securite.title', 'Réinitialisation de mot de passe')}>
            <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <StatCard label={t('admin.securite.stat_attente', 'À valider')} value={counts.en_attente} icon={Clock} hint={t('admin.securite.stat_attente_hint', 'Demandes en attente')} />
                <StatCard label={t('admin.securite.stat_accepte', 'Acceptées')} value={counts.accepte} icon={MailCheck} hint={t('admin.securite.stat_accepte_hint', 'Mot de passe envoyé par e-mail')} />
                <StatCard label={t('admin.securite.stat_refuse', 'Refusées')} value={counts.refuse} icon={ShieldCheck} hint={t('admin.securite.stat_refuse_hint', 'Aucun changement')} />
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5 border-b border-admin-border">
                {tabs.map(([key, label, count]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                            tab === key ? 'border-admin-accent text-admin-text' : 'border-transparent text-admin-text-secondary hover:text-admin-text'
                        }`}
                    >
                        {label}
                        <span className="rounded-full bg-admin-hover px-2 py-0.5 text-[11px] tabular-nums text-admin-muted">{count}</span>
                    </button>
                ))}
            </div>

            <FilterPanel activeCount={Number(range.active)} search={search} onSearch={setSearch} searchPlaceholder={t('admin.securite.search', 'Rechercher par nom ou e-mail...')}>
            <DateRangeFilter range={range} label={t('admin.dates.request_date', 'Date de la demande')} />
            </FilterPanel>

            {visible.length === 0 ? (
                <div className="admin-card flex flex-col items-center gap-2 py-12 text-center">
                    <KeyRound className="h-8 w-8 text-admin-muted" aria-hidden="true" />
                    <p className="text-sm text-admin-text-secondary">{t('admin.securite.empty', 'Aucune demande de réinitialisation pour le moment.')}</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {visible.map((item) => (
                        <li key={item.id} className="admin-card flex flex-wrap items-center gap-4 p-4">
                            <Avatar className="h-11 w-11 ring-2 ring-admin-accent/20">
                                <AvatarImage src={item.user.avatar_path ? `/storage/${item.user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback className="bg-admin-accent/15 text-admin-accent">{item.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-admin-text">{item.user.name}</p>
                                <p className="truncate text-xs text-admin-muted">{item.user.email}</p>
                                <p className="mt-0.5 text-xs text-admin-muted">
                                    {t('admin.securite.requested_on', 'Demandée le')} {formatDate(item.created_at)}
                                    {item.handled_at && (
                                        <>
                                            {' · '}
                                            {t('admin.securite.handled_on', 'Traitée le')} {formatDate(item.handled_at)}
                                            {item.handler ? ` — ${item.handler}` : ''}
                                        </>
                                    )}
                                </p>
                            </div>
                            <Badge variant={STATUS_VARIANT[item.status]}>{statusLabels[item.status]}</Badge>
                            {item.status === 'en_attente' && (
                                <div className="flex items-center gap-2">
                                    <Button type="button" onClick={() => approve(item)} className="bg-emerald-600 text-white hover:bg-emerald-600/90">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                        {t('admin.securite.accept', 'Accepter')}
                                    </Button>
                                    <Button type="button" onClick={() => refuse(item)} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                                        <X className="h-4 w-4" aria-hidden="true" />
                                        {t('admin.securite.refuse', 'Refuser')}
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </AdminLayout>
    );
}
