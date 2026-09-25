import { Link } from '@inertiajs/react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function GroupCard({ group, action }) {
    const { t } = useTranslations();

    return (
        <Card className="p-5 transition hover:border-isstm-navy/30 hover:shadow-md">
            <Link href={`/groupes/${group.id}`} className="block">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</h3>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            {[group.filiere, group.niveau, group.annee].filter(Boolean).join(' · ') || group.type_label}
                        </p>
                    </div>
                    {group.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-isstm-gold px-1.5 text-[11px] font-bold text-white">
                            {group.unread_count}
                        </span>
                    )}
                </div>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    {t('groupes.cree_par', 'Créé par :')} {group.teacher_name}
                </p>
                <div className="mt-2 flex items-center gap-2">
                    {group.is_delegate && <Badge variant="gold">{t('groupes.delegue', 'Délégué')}</Badge>}
                    {group.join_code && (
                        <Badge>
                            {t('groupes.code', 'Code :')} {group.join_code}
                        </Badge>
                    )}
                </div>
            </Link>
            {action && <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">{action}</div>}
        </Card>
    );
}
