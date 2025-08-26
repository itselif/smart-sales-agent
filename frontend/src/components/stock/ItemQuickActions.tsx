import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductForm } from './ProductForm';
import { RequestModal } from './RequestModal';
import { useDeleteItem } from '@/lib/hooks';
import type { InventoryItem } from '@/lib/api';

interface ItemQuickActionsProps {
  item: InventoryItem;
  canEdit: boolean;
}

export function ItemQuickActions({ item, canEdit }: ItemQuickActionsProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteItemMutation = useDeleteItem();

  const handleDelete = async () => {
    try {
      await deleteItemMutation.mutateAsync(item.id);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowRequestModal(true)}>
            <Send className="mr-2 h-4 w-4" />
            Talep Et
          </DropdownMenuItem>
          
          {canEdit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        item={item}
      />

      <RequestModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        item={item}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. "{item.name}" ürünü kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteItemMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}