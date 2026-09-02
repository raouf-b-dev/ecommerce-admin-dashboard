import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PermissionResponseDto } from '@/features/roles/types';

type PermissionCheckboxListProps = {
  permissions: PermissionResponseDto[];
  selected: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
};

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

  return (
    <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
      {permissions.map((permission) => {
        const id = `permission-${permission.code}`;
        const checked = selected.includes(permission.code);
        return (
          <div key={permission.code} className="flex items-start gap-2">
            <input
              id={id}
              type="checkbox"
              className="mt-1 size-4 rounded border border-input"
              checked={checked}
              disabled={disabled}
              onChange={(event) =>
                toggle(permission.code, event.target.checked)
              }
            />
            <div className="space-y-0.5">
              <Label htmlFor={id} className="font-medium">
                {permission.code}
              </Label>
              {permission.description ? (
                <p className="text-xs text-muted-foreground">
                  {permission.description}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
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
