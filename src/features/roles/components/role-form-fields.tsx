import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PermissionResponseDto } from '@/features/roles/types';

type PermissionCheckboxListProps = {
  permissions: PermissionResponseDto[];
  selected: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
};

type GroupKey =
  | 'Catalog & Products'
  | 'Inventory & Stock'
  | 'Orders & Fulfillment'
  | 'Users & Accounts'
  | 'System & Administration'
  | 'Other';

function groupPermissions(
  permissions: PermissionResponseDto[],
): { name: string; items: PermissionResponseDto[] }[] {
  const groups: Record<GroupKey, PermissionResponseDto[]> = {
    'Catalog & Products': [],
    'Inventory & Stock': [],
    'Orders & Fulfillment': [],
    'Users & Accounts': [],
    'System & Administration': [],
    Other: [],
  };

  for (const permission of permissions) {
    const code = permission.code.toLowerCase();
    if (code.includes('product') || code.includes('catalog')) {
      groups['Catalog & Products'].push(permission);
    } else if (code.includes('inventory') || code.includes('stock')) {
      groups['Inventory & Stock'].push(permission);
    } else if (code.includes('order') || code.includes('cart')) {
      groups['Orders & Fulfillment'].push(permission);
    } else if (code.includes('user') || code.includes('address')) {
      groups['Users & Accounts'].push(permission);
    } else if (
      code.includes('admin') ||
      code.includes('role') ||
      code.includes('payment')
    ) {
      groups['System & Administration'].push(permission);
    } else {
      groups.Other.push(permission);
    }
  }

  return (Object.keys(groups) as GroupKey[])
    .filter((key) => groups[key].length > 0)
    .map((name) => ({ name, items: groups[name] }));
}

export function PermissionCheckboxList({
  permissions,
  selected,
  onChange,
  disabled = false,
}: PermissionCheckboxListProps) {
  function toggle(code: string, checked: boolean) {
    if (checked) {
      onChange([...selected, code]);
      return;
    }
    onChange(selected.filter((item) => item !== code));
  }

  const grouped = groupPermissions(permissions);

  return (
    <div className="max-h-80 space-y-4 overflow-y-auto rounded-md border p-3">
      {grouped.map((group) => (
        <div key={group.name} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.name}
          </p>
          <div className="space-y-2">
            {group.items.map((permission) => {
              const id = `permission-${permission.code}`;
              const checked = selected.includes(permission.code);
              return (
                <div key={permission.code} className="flex items-start gap-2.5 py-0.5">
                  <input
                    id={id}
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border border-input"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) =>
                      toggle(permission.code, event.target.checked)
                    }
                  />
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Label
                        htmlFor={id}
                        className="cursor-pointer text-sm font-medium leading-none"
                      >
                        {permission.description || permission.code}
                      </Label>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                        {permission.code}
                      </code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

type RoleNameFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  error?: string;
};

export function RoleNameField({
  id,
  value,
  onChange,
  readOnly = false,
  error,
}: RoleNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Name</Label>
      <Input
        id={id}
        value={value}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
      {readOnly ? (
        <p className="text-xs text-muted-foreground">
          System role names cannot be changed.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

type RoleCodeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function RoleCodeField({ value, onChange, error }: RoleCodeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role-code">Code</Label>
      <Input
        id="role-code"
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
