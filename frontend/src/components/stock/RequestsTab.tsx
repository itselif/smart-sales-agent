import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send,
  Building2,
  Package,
  Calendar
} from 'lucide-react';
import { useListRequests, useUpdateRequest, useTransferStock, useStores } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { StockRequest } from '@/lib/api';

export function RequestsTab() {
  const { currentStoreId } = useUserStore();
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'transfer' | null>(null);
  
  const { data: stores = [] } = useStores();
  const { data: incomingRequests = [], isLoading: incomingLoading } = useListRequests({ 
    storeId: currentStoreId || '', 
    role: 'target' 
  });
  const { data: outgoingRequests = [], isLoading: outgoingLoading } = useListRequests({ 
    storeId: currentStoreId || '', 
    role: 'requester' 
  });
  
  const updateRequestMutation = useUpdateRequest();
  const transferStockMutation = useTransferStock();

  const getStoreName = (storeId: string) => {
    return stores.find(s => s.id === storeId)?.name || 'Bilinmeyen Mağaza';
  };

  const getStatusBadge = (status: StockRequest['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Bekliyor' },
      approved: { variant: 'default' as const, label: 'Onaylandı' },
      rejected: { variant: 'destructive' as const, label: 'Reddedildi' },
      fulfilled: { variant: 'outline' as const, label: 'Tamamlandı' },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAction = (request: StockRequest, action: 'approve' | 'reject' | 'transfer') => {
    setSelectedRequest(request);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      if (actionType === 'transfer') {
        await transferStockMutation.mutateAsync({
          itemId: selectedRequest.itemId,
          quantity: selectedRequest.quantity,
          fromStoreId: currentStoreId!,
          toStoreId: selectedRequest.requesterStoreId,
          note: `Transfer for request: ${selectedRequest.id}`,
        });
        
        // Mark request as fulfilled
        await updateRequestMutation.mutateAsync({
          id: selectedRequest.id,
          data: { status: 'fulfilled' },
        });
      } else {
        await updateRequestMutation.mutateAsync({
          id: selectedRequest.id,
          data: { 
            status: actionType === 'approve' ? 'approved' : 'rejected',
            decisionNote: actionType === 'reject' ? 'Reddedildi' : 'Onaylandı'
          },
        });
      }
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  const RequestCard = ({ request, isIncoming }: { request: StockRequest; isIncoming: boolean }) => (
    <Card key={request.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{request.name}</span>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <span>SKU: {request.sku}</span>
                <span>•</span>
                <span>Miktar: {request.quantity}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                <span>
                  {isIncoming 
                    ? `${getStoreName(request.requesterStoreId)} → Bu Mağaza`
                    : `Bu Mağaza → ${request.targetStoreId ? getStoreName(request.targetStoreId) : 'Herhangi Mağaza'}`
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: tr })}</span>
              </div>
            </div>

            {request.note && (
              <div className="text-sm bg-muted p-2 rounded mb-3">
                <strong>Not:</strong> {request.note}
              </div>
            )}

            {request.decisionNote && (
              <div className="text-sm bg-muted p-2 rounded mb-3">
                <strong>Karar Notu:</strong> {request.decisionNote}
              </div>
            )}
          </div>

          {isIncoming && request.status === 'pending' && (
            <div className="flex gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction(request, 'approve')}
                disabled={updateRequestMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Onayla
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleAction(request, 'reject')}
                disabled={updateRequestMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reddet
              </Button>
            </div>
          )}

          {isIncoming && request.status === 'approved' && (
            <Button 
              size="sm"
              onClick={() => handleAction(request, 'transfer')}
              disabled={transferStockMutation.isPending}
            >
              <Send className="h-4 w-4 mr-1" />
              Gönder
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!currentStoreId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Talepleri görüntülemek için önce bir mağaza seçin.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incoming">Gelen Talepler</TabsTrigger>
          <TabsTrigger value="outgoing">Gönderdiğim Talepler</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Gelen Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              {incomingLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : incomingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz gelen talep bulunmuyor.</p>
                </div>
              ) : (
                <div>
                  {incomingRequests.map((request) => (
                    <RequestCard key={request.id} request={request} isIncoming={true} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>Gönderdiğim Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              {outgoingLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
              ) : outgoingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz gönderdiğiniz talep bulunmuyor.</p>
                </div>
              ) : (
                <div>
                  {outgoingRequests.map((request) => (
                    <RequestCard key={request.id} request={request} isIncoming={false} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog 
        open={!!selectedRequest && !!actionType} 
        onOpenChange={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Talebi Onayla'}
              {actionType === 'reject' && 'Talebi Reddet'}
              {actionType === 'transfer' && 'Stock Transfer Et'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && `${selectedRequest?.name} ürününe yapılan ${selectedRequest?.quantity} adetlik talebi onaylamak istediğinizden emin misiniz?`}
              {actionType === 'reject' && `${selectedRequest?.name} ürününe yapılan talebi reddetmek istediğinizden emin misiniz?`}
              {actionType === 'transfer' && `${selectedRequest?.quantity} adet ${selectedRequest?.name} ürünü ${getStoreName(selectedRequest?.requesterStoreId || '')} mağazasına transfer edilecek. Onaylıyor musunuz?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={updateRequestMutation.isPending || transferStockMutation.isPending}
              className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionType === 'approve' && 'Onayla'}
              {actionType === 'reject' && 'Reddet'}
              {actionType === 'transfer' && 'Transfer Et'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}