import { StockProduct } from "@/lib/api";
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
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StockTableProps {
  products: StockProduct[];
  title?: string;
  variant?: "critical" | "all";
}

export function StockTable({ products, title, variant = "all" }: StockTableProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "decreasing":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "Artış";
      case "decreasing":
        return "Azalış";
      default:
        return "Sabit";
    }
  };

  const getDaysLeftBadge = (daysLeft: number | null, isCritical: boolean) => {
    if (daysLeft === null) return <Badge variant="outline">Belirsiz</Badge>;
    
    if (isCritical || daysLeft <= 7) {
      return <Badge variant="destructive">{daysLeft} gün</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge variant="secondary">{daysLeft} gün</Badge>;
    }
    return <Badge variant="outline">{daysLeft} gün</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {variant === "critical" && <AlertTriangle className="h-5 w-5 text-red-600" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead className="text-right">Mevcut Stok</TableHead>
                <TableHead className="text-right">Günlük Ortalama</TableHead>
                <TableHead className="text-center">Trend</TableHead>
                <TableHead className="text-center">Tahmini Süre</TableHead>
                <TableHead className="text-right">Önerilen Sipariş</TableHead>
                {variant === "all" && <TableHead className="text-center">Durum</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.product_id}
                  className={product.is_critical ? "bg-red-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {product.is_critical && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <div className="flex flex-col">
                        <span>{product.name || product.product_id}</span>
                        {product.price && (
                          <span className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            }).format(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={product.current_stock <= product.safety_stock ? "text-red-600" : ""}>
                      {product.current_stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.avg_daily_sales.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(product.sales_trend)}
                      <span className="text-sm">{getTrendLabel(product.sales_trend)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getDaysLeftBadge(product.estimated_days_left, product.is_critical)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{product.reorder_qty_suggestion}</Badge>
                  </TableCell>
                  {variant === "all" && (
                    <TableCell className="text-center">
                      {product.is_critical ? (
                        <Badge variant="destructive">Kritik</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}