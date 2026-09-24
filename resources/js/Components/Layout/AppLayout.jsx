import CommunityHeader from './CommunityHeader';
import CommunityMobileTabBar from './CommunityMobileTabBar';

export default function AppLayout({ children, title }) {
    return (
        <div className="community-shell flex min-h-screen flex-col">
            <CommunityHeader />

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                {title && <h1 className="mb-6 text-2xl font-bold text-isstm-navy dark:text-white">{title}</h1>}
                {children}
            </main>

            <CommunityMobileTabBar />
        </div>
    );
}
