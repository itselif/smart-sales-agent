import { useState } from 'react';
import { Plus, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MovementForm } from '@/components/stock/MovementForm';
import { useMovements, useItems, useMe } from '@/hooks/useInventoryQueries';
import { useUserStore } from '@/lib/stores';
import { formatDateTime, getReasonLabel, getTypeLabel } from '@/lib/format';
import { useNavigate } from 'react-router-dom';

export default function MovementsPage() {
  const { currentStoreId } = useUserStore();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
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

  const totalPages = Math.ceil((movementsData?.total || 0) / pageSize);

  const getItemName = (itemId: string) => {
    const item = itemsData?.items.find(i => i.id === itemId);
    return item ? `${item.name} (${item.sku})` : itemId;
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
            Toplam {movementsData?.total || 0} hareket kaydı
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Hareket Ekle
          </Button>
        )}
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
    </div>
  );
}