import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';

type RoleOption = {
  code: string;
  name: string;
};

type UserRoleActionsProps = {
  currentRoleCode: string | null;
  roles: RoleOption[];
  rolesLoading: boolean;
  isPending: boolean;
  onAssign: (roleCode: string) => Promise<void>;
};

export function UserRoleActions({
  currentRoleCode,
  roles,
  rolesLoading,
  isPending,
  onAssign,
}: UserRoleActionsProps) {
  const [selected, setSelected] = useState(currentRoleCode ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  const unchanged = selected === (currentRoleCode ?? '');
  const selectedRole = roleOptions.find((role) => role.code === selected);

  async function runAssign() {
    if (!selected || unchanged) {
      return;
    }

    setErrorMessage(null);
    try {
      await onAssign(selected);
      setConfirmOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to assign user role'));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-assigned-role">Assigned role</Label>
          <select
            id="user-assigned-role"
            className="flex h-10 w-56 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selected}
            disabled={rolesLoading || isPending}
            onChange={(event) => setSelected(event.target.value)}
          >
            {currentRoleCode ? null : <option value="">Select a role</option>}
            {roleOptions.map((role) => (
              <option key={role.code} value={role.code}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          disabled={unchanged || !selected || isPending || rolesLoading}
          onClick={() => setConfirmOpen(true)}
        >
          Change role
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Changes to your own role take effect after you sign in again.
      </p>
      <ActionErrorAlert message={errorMessage} />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change assigned role</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? `This replaces the current role with ${selectedRole.name} (${selectedRole.code}).`
                : "This replaces the user's current role."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => void runAssign()}
            >
              {isPending ? 'Changing…' : 'Change role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
