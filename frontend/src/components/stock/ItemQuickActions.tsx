import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
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
import { MovementForm } from './MovementForm';
import { StoreTransferForm } from './StoreTransferForm';
import { useDeleteItem } from '@/hooks/useInventoryQueries';
import type { InventoryItem } from '@/services/inventory';

interface ItemQuickActionsProps {
  item: InventoryItem;
  canEdit: boolean;
}

export function ItemQuickActions({ item, canEdit }: ItemQuickActionsProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const deleteMutation = useDeleteItem();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.id);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditForm(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
          )}
          
          {canEdit && (
            <>
              <DropdownMenuItem onClick={() => setShowMovementForm(true)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Stok Giriş (+)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMovementForm(true)}>
                <TrendingDown className="mr-2 h-4 w-4" />
                Stok Çıkış (-)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTransferForm(true)}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Mağazalar Arası Transfer
              </DropdownMenuItem>
            </>
          )}
          
          {canEdit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
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

      <MovementForm
        open={showMovementForm}
        onOpenChange={setShowMovementForm}
        preSelectedItem={item}
      />

      <StoreTransferForm
        open={showTransferForm}
        onOpenChange={setShowTransferForm}
        preSelectedItem={item}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{item.name}" ürününü silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}