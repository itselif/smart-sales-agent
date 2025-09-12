import { useState } from 'react';
import { Plus, Filter, ArrowLeft, Package, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MovementForm } from '@/components/stock/MovementForm';
import { useItems, useMe } from '@/hooks/useInventoryQueries';
import { useListRequests, useUpdateRequest, useTransferStock, useStores, useMovements } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';
import { formatDateTime, getReasonLabel, getTypeLabel } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { StockRequest } from '@/lib/api';

export default function MovementsPage() {
  const { currentStoreId } = useUserStore();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'transfer' | null>(null);
  
  // Filters
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: movementsData, isLoading } = useMovements({
    storeId: currentStoreId || '',
    itemId: itemFilter && itemFilter !== 'all' ? itemFilter : undefined,
    type: (typeFilter && typeFilter !== 'all' ? typeFilter as 'IN' | 'OUT' : undefined),
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    size: pageSize,
    sort: '-createdAt',
  });

  const { data: itemsData } = useItems({
    storeId: currentStoreId || '',
    isActive: true,
    size: 1000,
  });

  const { data: meData } = useMe();
  const canEdit = meData?.roles?.some(role => ['Admin', 'StoreManager'].includes(role)) ?? false;

  // Request data
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

  const totalPages = Math.ceil((movementsData?.total || 0) / pageSize);

  const getItemName = (itemId: string) => {
    const item = itemsData?.items.find(i => i.id === itemId);
    return item ? `${item.name} (${item.sku})` : itemId;
  };

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

  if (!currentStoreId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anasayfaya Dön
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Stok hareketleri için önce anasayfadan bir mağaza seçin.</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-4"
            >
              Anasayfaya Git
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anasayfaya Dön
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stok Hareketleri</h1>
          <p className="text-muted-foreground">
            Stok hareketleri ve mağazalar arası talep takibi
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Hareket Ekle
          </Button>
        )}
      </div>

      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Stok Hareketleri</TabsTrigger>
          <TabsTrigger value="requests">Talep Takibi</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Stok Hareketleri</h2>
              <p className="text-muted-foreground">
                Toplam {movementsData?.total || 0} hareket kaydı
              </p>
            </div>
          </div>

          <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={itemFilter} onValueChange={setItemFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Ürünler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ürünler</SelectItem>
                {itemsData?.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Tipler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="IN">Giriş (+)</SelectItem>
                <SelectItem value="OUT">Çıkış (-)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Başlangıç tarihi"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Bitiş tarihi"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <Button
              variant="outline"
              onClick={() => {
                setItemFilter('all');
                setTypeFilter('all');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : !movementsData?.items.length ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Stok hareketi bulunamadı.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Sebep</TableHead>
                  <TableHead>Not</TableHead>
                  <TableHead>Oluşturan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementsData.items.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {formatDateTime(movement.createdAt)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getItemName(movement.itemId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={movement.type === 'IN' ? 'default' : 'destructive'}>
                        {getTypeLabel(movement.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getReasonLabel(movement.reason)}
                    </TableCell>
                    <TableCell>
                      {movement.note || '-'}
                    </TableCell>
                    <TableCell>
                      {movement.createdBy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

          <MovementForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Mağazalar Arası Talep Takibi</h2>
              <p className="text-muted-foreground">
                Gelen ve giden stok taleplerini yönetin
              </p>
            </div>
          </div>

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
                    <div className="space-y-4">
                      {incomingRequests.map((request) => (
                        <Card key={request.id} className="p-4">
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
                                  <span>Talep Eden: {getStoreName(request.requesterStoreId)}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
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

                            {request.status === 'pending' && (
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

                            {request.status === 'approved' && (
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
                        </Card>
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
                    <div className="space-y-4">
                      {outgoingRequests.map((request) => (
                        <Card key={request.id} className="p-4">
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
                                  <span>Talep Edilen: {request.targetStoreId ? getStoreName(request.targetStoreId) : 'Herhangi Mağaza'}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
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
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
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