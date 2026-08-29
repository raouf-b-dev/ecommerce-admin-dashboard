import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

export function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold leading-none tracking-tight">
              Change your password
            </h1>
          </CardTitle>
          <CardDescription>
            Your account requires a new password before you can use the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
