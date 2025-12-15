import { SalesProduct } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SalesTableProps {
  products: SalesProduct[];
  title?: string;
}

export function SalesTable({ products, title = "En Çok Satan Ürünler" }: SalesTableProps) {
  const sortedProducts = [...products]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead className="text-right">Toplam Satış</TableHead>
                <TableHead className="text-right">Ciro</TableHead>
                <TableHead className="text-right">Günlük Ort.</TableHead>
                <TableHead className="text-right">Haftalık Trend</TableHead>
                <TableHead className="text-right">Tahmin (7 gün)</TableHead>
                <TableHead className="text-right">Güven</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{product.product_name || product.product_id}</span>
                      {product.category && (
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{product.total_sold}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.total_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.avg_daily_sales.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(product.weekly_trend)}
                      <span className={getTrendColor(product.weekly_trend)}>
                        {(product.weekly_trend * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sales_forecast.next_7days.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.sales_forecast.confidence > 0.8 ? "default" : "secondary"}>
                      %{(product.sales_forecast.confidence * 100).toFixed(0)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}