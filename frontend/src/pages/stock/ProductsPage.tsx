import { useState, useMemo } from 'react';
import { Plus, Search, ArrowLeft } from 'lucide-react';
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
import { ProductForm } from '@/components/stock/ProductForm';
import { ItemQuickActions } from '@/components/stock/ItemQuickActions';
import { useItems } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';
import { formatCurrency } from '@/lib/format';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const { currentStoreId } = useUserStore();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: itemsData, isLoading } = useItems({
    storeId: currentStoreId || '',
    q: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    isActive: activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined,
    page,
    size: pageSize,
    sort: `${sortBy}${sortOrder === 'desc' ? '-desc' : ''}`,
  });

  // Kategorileri dinamik olarak çek
  const availableCategories = useMemo(() => {
    if (!itemsData?.items) return [];
    const categories = new Set(
      itemsData.items
        .map(item => item.category)
        .filter(Boolean) // null/undefined değerleri filtrele
    );
    return Array.from(categories).sort();
  }, [itemsData?.items]);

  // şimdilik sabit: gerçek rolde API bağlanınca değiştirilebilir
  const canEdit = true;

  const totalPages = Math.ceil((itemsData?.total || 0) / pageSize);

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
            <p className="text-muted-foreground">
              Ürün yönetimi için önce anasayfadan bir mağaza seçin.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
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
          <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">Toplam {itemsData?.total || 0} ürün</p>
            {sortBy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sıralama:</span>
                <span className="font-medium">
                  {sortBy === 'name' && 'İsim'}
                  {sortBy === 'stock' && 'Stok'}
                  {sortBy === 'price' && 'Fiyat'}
                  {sortBy === 'createdAt' && 'Oluşturma Tarihi'}
                </span>
                <span className="text-xs">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              </div>
            )}
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün Ekle
          </Button>
        )}
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün adı veya SKU ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tüm Durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Pasif</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">İsim</SelectItem>
                  <SelectItem value="stock">Stok</SelectItem>
                  <SelectItem value="price">Fiyat</SelectItem>
                  <SelectItem value="createdAt">Oluşturma Tarihi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Artan ↑</SelectItem>
                  <SelectItem value="desc">Azalan ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setActiveFilter('all');
                setSortBy('name');
                setSortOrder('asc');
                setPage(1);
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ürün Tablosu */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : !itemsData?.items.length ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Ürün bulunamadı.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Kritik Eşik</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[50px]">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.reorderLevel && item.stock <= item.reorderLevel
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell>{item.reorderLevel || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ItemQuickActions item={item} canEdit={canEdit} />
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

      <ProductForm open={showCreateForm} onOpenChange={setShowCreateForm} />
    </div>
  );
}
