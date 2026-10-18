import AdminLayout from '../Layout/AdminLayout';

/**
 * The matériel pages use the console's own layout — same sidebar, header and
 * theme as the other staff roles — with the matériel entries in the menu. Each
 * page draws its own banner, so the layout's plain title bar is hidden.
 */
export default function MaterielLayout({ title, children }) {
    return (
        <AdminLayout title={title} showTitle={false}>
            {children}
        </AdminLayout>
    );
}
