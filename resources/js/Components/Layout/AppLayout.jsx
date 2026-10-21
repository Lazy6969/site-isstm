import CommunityHeader from './CommunityHeader';
import CommunityMobileTabBar from './CommunityMobileTabBar';
import AdminLayout from './AdminLayout';
import { isAdminEmbedded } from '../../lib/adminEmbed';

export default function AppLayout({ children, title }) {
    if (isAdminEmbedded()) {
        return (
            <AdminLayout title={title} showTitle={Boolean(title)}>
                <div className="community-shell rounded-2xl">{children}</div>
            </AdminLayout>
        );
    }

    return (
        <div className="community-shell flex min-h-screen flex-col">
            <CommunityHeader />

            <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-8 max-md:pb-16 sm:px-6 lg:px-10">
                {title && <h1 className="mb-6 text-2xl font-bold text-isstm-navy dark:text-white">{title}</h1>}
                {children}
            </main>

            <CommunityMobileTabBar />
        </div>
    );
}
