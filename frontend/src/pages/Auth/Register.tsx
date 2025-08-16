import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore, mockStores } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { StoreSelector } from "@/components/StoreSelector";
import { Building2, Lock, Mail, User } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setStoreId } = useAppStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storeId) {
      toast({
        title: "Hata",
        description: "Lütfen bir mağaza seçin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Mock registration - replace with real API call later
    setTimeout(() => {
      setUser({
        id: "user_1",
        name: formData.name,
        email: formData.email,
        role: "Satış Temsilcisi",
      });
      
      setStoreId(formData.storeId);
      
      toast({
        title: "Kayıt başarılı",
        description: "Dashboard'a yönlendiriliyorsunuz...",
      });
      
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">StorePilot</h1>
          </div>
          <CardTitle>Kayıt Ol</CardTitle>
          <CardDescription>
            Mağaza operasyon paneline erişim için kayıt olun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ornek.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mağaza *</Label>
              <StoreSelector
                value={formData.storeId}
                onChange={(storeId) => setFormData(prev => ({ ...prev, storeId }))}
                stores={mockStores}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Button variant="link" className="p-0" onClick={() => navigate("/auth/login")}>
              Giriş yap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}