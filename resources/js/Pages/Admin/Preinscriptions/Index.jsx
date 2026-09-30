import { Link } from '@inertiajs/react';
import { Download, Eye } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../../Components/ui/avatar';
import { buttonVariants } from '../../../Components/ui/button';
import { cn } from '../../../lib/utils';
import { useTranslations } from '../../../lib/useTranslations';

const STATUS_LABELS = {
    en_attente: 'Soumis',
    en_cours_examen: "En cours d'examen",
    a_completer: 'À compléter',
};

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function Index({ preinscriptions, brouillons }) {
    const { t } = useTranslations();

    return (
        <AdminLayout
            title={t(
                'preinscriptions_admin.titre',
                'Préinscriptions en attente',
            )}
        >
            <div className="-mt-4 mb-6 flex items-center justify-between">
                <p className="text-sm text-admin-text-secondary">
                    {preinscriptions.length}{' '}
                    {t(
                        'preinscriptions_admin.dossiers_a_traiter',
                        'dossier(s) à traiter.',
                    )}
                </p>
                <a href="/console/preinscriptions/export" className={cn(buttonVariants(), 'border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover')}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t('preinscriptions_admin.exporter', 'Exporter')}
                </a>
            </div>

            {preinscriptions.length === 0 ? (
                <div className="rounded-xl border border-admin-border bg-admin-card p-8 text-center text-sm text-admin-muted">
                    {t(
                        'preinscriptions_admin.aucune_preinscription',
                        'Aucune préinscription en attente.',
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {preinscriptions.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-col items-stretch gap-4 rounded-xl border border-admin-border bg-admin-card p-5 sm:flex-row sm:items-center sm:gap-5"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0">
                                <AvatarImage
                                    src={
                                        p.photo_path
                                            ? `/storage/${p.photo_path}`
                                            : undefined
                                    }
                                    alt=""
                                />
                                <AvatarFallback className="bg-admin-hover text-admin-text">
                                    {p.nom?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <p className="flex items-center gap-2 font-medium text-admin-text">
                                    {p.nom} {p.prenoms}
                                    <span className="rounded-full bg-admin-hover px-2 py-0.5 text-[11px] font-medium text-admin-text-secondary">
                                        {STATUS_LABELS[p.status] ?? p.status}
                                    </span>
                                </p>

                                <p className="text-sm text-admin-text-secondary">
                                    {p.filiere?.nom_fr} · {p.niveau} · {p.email}
                                </p>

                                <p className="text-xs text-admin-muted">
                                    {t(
                                        'preinscriptions_admin.deposee_le',
                                        'Déposée le',
                                    )}{' '}
                                    {formatDate(p.created_at)}
                                </p>
                            </div>

                            <Link
                                href={`/console/preinscriptions/${p.id}`}
                                className={cn(buttonVariants(), 'flex-shrink-0 bg-admin-text text-admin-bg hover:bg-admin-text/90')}
                            >
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                {t('preinscriptions_admin.examiner', 'Examiner le dossier')}
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <section className="mt-10">
                <h2 className="text-sm font-semibold text-admin-text">
                    {t('preinscriptions_admin.comptes_ouverts', 'Comptes créés depuis le formulaire')}
                </h2>
                <p className="mt-1 mb-4 text-sm text-admin-text-secondary">
                    {t(
                        'preinscriptions_admin.comptes_ouverts_texte',
                        'Candidats ayant ouvert un compte sans avoir envoyé leur dossier. Rien à traiter ici — la liste sert au suivi.',
                    )}
                </p>

                {brouillons.length === 0 ? (
                    <div className="rounded-xl border border-admin-border bg-admin-card p-6 text-center text-sm text-admin-muted">
                        {t('preinscriptions_admin.aucun_compte_ouvert', 'Aucun compte en attente de dépôt.')}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-admin-border bg-admin-card">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-admin-border text-xs text-admin-muted uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">{t('preinscriptions_admin.col_candidat', 'Candidat')}</th>
                                    <th className="px-4 py-3 font-medium">{t('preinscriptions_admin.col_email', 'E-mail')}</th>
                                    <th className="px-4 py-3 font-medium">{t('preinscriptions_admin.col_telephone', 'Téléphone')}</th>
                                    <th className="px-4 py-3 font-medium">{t('preinscriptions_admin.col_cree_le', 'Compte créé le')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brouillons.map((b) => (
                                    <tr key={b.id} className="border-b border-admin-border last:border-0">
                                        <td className="px-4 py-3 font-medium text-admin-text">{b.nom} {b.prenoms}</td>
                                        <td className="px-4 py-3 text-admin-text-secondary">{b.email}</td>
                                        <td className="px-4 py-3 text-admin-text-secondary">{b.telephone ?? '—'}</td>
                                        <td className="px-4 py-3 text-admin-muted">{formatDate(b.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}