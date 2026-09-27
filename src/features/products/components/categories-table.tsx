import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  CreateCategoryDialog,
  toCreateCategoryDto,
} from '@/features/products/components/create-category-dialog';
import {
  EditCategoryDialog,
  toUpdateCategoryDto,
} from '@/features/products/components/edit-category-dialog';
import {
  useActivateCategory,
  useCategoriesListQuery,
  useCreateCategory,
  useDeactivateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/products/hooks/use-categories';
import type { CategoryResponseDto } from '@/features/products/types';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import {
  QueryLoading,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth/auth-context';

function emptyCell(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : '-';
}

export function CategoriesTable() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_products');
  const categoriesQuery = useCategoriesListQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const activateCategory = useActivateCategory();
  const deactivateCategory = useDeactivateCategory();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryResponseDto | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponseDto | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  if (categoriesQuery.isLoading) {
    return <QueryLoading>Loading categories…</QueryLoading>;
  }

  if (categoriesQuery.isError) {
    return (
      <QueryStateAlert
        isError
        hasData={false}
        error={categoriesQuery.error}
        onRetry={() => {
          void categoriesQuery.refetch();
        }}
        resource="categories"
      />
    );
  }

  const categories = categoriesQuery.data ?? [];
  const statusPending =
    activateCategory.isPending || deactivateCategory.isPending;

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create category
          </Button>
        </div>
      ) : null}
      <ActionErrorAlert message={actionError} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              {canManage ? (
                <TableHead className="text-right">Actions</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 5 : 4}
                  className="text-center text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                      {emptyCell(category.slug)}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emptyCell(category.description)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant="product" isActive={category.isActive} />
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditCategory(category)}
                        >
                          Edit
                        </Button>
                        {category.isActive ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={statusPending}
                            onClick={async () => {
                              setActionError(null);
                              try {
                                await deactivateCategory.mutateAsync(
                                  category.id,
                                );
                              } catch (error) {
                                setActionError(
                                  getErrorMessage(
                                    error,
                                    'Failed to deactivate category',
                                  ),
                                );
                              }
                            }}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={statusPending}
                            onClick={async () => {
                              setActionError(null);
                              try {
                                await activateCategory.mutateAsync(category.id);
                              } catch (error) {
                                setActionError(
                                  getErrorMessage(
                                    error,
                                    'Failed to activate category',
                                  ),
                                );
                              }
                            }}
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(category)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {canManage ? (
        <>
          <CreateCategoryDialog
            open={createOpen}
            isPending={createCategory.isPending}
            onOpenChange={setCreateOpen}
            onSubmit={async (values) => {
              setActionError(null);
              await createCategory.mutateAsync(toCreateCategoryDto(values));
            }}
          />
          <EditCategoryDialog
            category={editCategory}
            open={editCategory !== null}
            isPending={updateCategory.isPending}
            onOpenChange={(open) => {
              if (!open) {
                setEditCategory(null);
              }
            }}
            onSubmit={async (values) => {
              if (!editCategory) {
                return;
              }
              setActionError(null);
              await updateCategory.mutateAsync({
                id: editCategory.id,
                body: toUpdateCategoryDto(values),
              });
              setEditCategory(null);
            }}
          />
          <Dialog
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteTarget(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete category</DialogTitle>
                <DialogDescription>
                  Delete “{deleteTarget?.name}”? Products in this category will
                  become unassigned (their category is cleared). Unassigned
                  products cannot be activated until they are recategorized.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteCategory.isPending}
                  onClick={async () => {
                    if (!deleteTarget) {
                      return;
                    }
                    setActionError(null);
                    try {
                      await deleteCategory.mutateAsync(deleteTarget.id);
                      setDeleteTarget(null);
                    } catch (error) {
                      setActionError(
                        getErrorMessage(error, 'Failed to delete category'),
                      );
                    }
                  }}
                >
                  {deleteCategory.isPending ? 'Deleting…' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}
