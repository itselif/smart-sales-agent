import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyPatternChartProps {
  data?: Record<string, number>;
}

const dayNames = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar'
};

export function WeeklyPatternChart({ data }: WeeklyPatternChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Satış Deseni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Veri bulunamadı
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([day, value]) => ({
    day: dayNames[day as keyof typeof dayNames] || day,
    sales: value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Satış Deseni</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}