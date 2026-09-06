import { PageHeader } from '@/components/layout/page-header';
import { RolesTable } from '@/features/roles/components/roles-table';

function RolesSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Role management"
        description="Manage custom roles and permission assignments. Changes to your own role take effect after you sign in again."
      />
      <RolesTable />
    </div>
  );
}

export { RolesSettingsPage };
export default RolesSettingsPage;
