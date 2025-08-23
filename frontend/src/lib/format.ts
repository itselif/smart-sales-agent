import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY');
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('tr-TR').format(num);
};

export const getReasonLabel = (reason: string): string => {
  const labels: Record<string, string> = {
    'PURCHASE_RETURN': 'Satın Alma İadesi',
    'DAMAGED': 'Hasarlı',
    'MANUAL_ADJUSTMENT': 'Manuel Düzeltme',
    'SALE_CORRECTION': 'Satış Düzeltmesi',
    'STORE_TRANSFER_IN': 'Mağazadan Transfer (Gelen)',
    'STORE_TRANSFER_OUT': 'Mağazaya Transfer (Giden)',
    'INITIAL_STOCK': 'İlk Stok Girişi',
    'INVENTORY_COUNT': 'Sayım Düzeltmesi',
    'OTHER': 'Diğer',
  };
  return labels[reason] || reason;
};

export const getTypeLabel = (type: 'IN' | 'OUT'): string => {
  return type === 'IN' ? 'Giriş' : 'Çıkış';
};