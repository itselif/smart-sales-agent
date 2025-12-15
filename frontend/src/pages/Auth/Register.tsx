// src/pages/Auth/Register.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { StoreSelector } from "@/components/StoreSelector";
import { Building2, Lock, Mail, User, IdCard } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8000";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeId: "",
    socialCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setCurrentStoreId, stores } = useAppStore();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeId) {
      toast({ title: "Hata", description: "Lütfen bir mağaza seçin.", variant: "destructive" });
      return;
    }
    if (!formData.socialCode.trim()) {
      toast({ title: "Hata", description: "Lütfen sosyal kod (socialCode) girin.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // (1) Kayıt
      const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.name,
          email: formData.email,
          password: formData.password,
          socialCode: formData.socialCode,
          // registerAs: "owner", // gerekirse aç
          // avatar: "https://picsum.photos/200"
        }),
      });

      const regBody = await regRes.json().catch(() => ({} as any));

      if (!regRes.ok || regBody?.ok !== true) {
        const d = regBody?.detail || regBody;
        const msg = d?.errorMessage || d?.message || "Kayıt başarısız";
        toast({ title: "Kayıt başarısız", description: msg, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // (2) Otomatik giriş – email + password ile dene
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const loginBody = await loginRes.json().catch(() => ({} as any));

      if (!loginRes.ok) {
        const d = loginBody?.detail || loginBody;
        const msg = d?.errorMessage || d?.message || "Giriş başarısız";
        // kayıt başarılı + auto login başarısız ise kullanıcıyı login sayfasına yönlendir
        toast({
          title: "Kayıt başarılı",
          description: "Otomatik giriş yapılamadı. Lütfen giriş sayfasından deneyin.",
        });
        navigate("/auth/login");
        return;
      }

      const accessToken =
        loginBody?.accessToken ||
        loginBody?.data?.accessToken; // header yerine body'ye yazılmış olabilir
      const refreshToken =
        loginBody?.refreshToken ||
        loginBody?.data?.refreshToken;

      if (!accessToken) {
        toast({
          title: "Kayıt başarılı",
          description: "Token alınamadı, lütfen giriş sayfasından giriş yapın.",
        });
        navigate("/auth/login");
        return;
      }

      // token’ları sakla
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // kullanıcı objesi
      const displayName =
        loginBody?.data?.user?.fullname ||
        formData.name ||
        (formData.email ? formData.email.split("@")[0] : formData.socialCode);

      setUser({
        id: loginBody?.data?.user?.id || "me",
        name: displayName,
        email: formData.email || `${formData.socialCode}@local`,
        role: loginBody?.data?.user?.role || "Kullanıcı",
        assignedStores: [formData.storeId],
      });
      setCurrentStoreId(formData.storeId);

      toast({ title: "Kayıt başarılı", description: "Dashboard'a yönlendiriliyorsunuz..." });
      navigate("/dashboard");
    } catch {
      toast({ title: "Ağ hatası", description: "Sunucuya ulaşılamadı.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
          <CardDescription>Mağaza operasyon paneline erişim için kayıt olun</CardDescription>
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
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
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
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
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
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialCode">Sosyal Kod (socialCode) *</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="socialCode"
                  type="text"
                  placeholder="örn. TEST-001"
                  value={formData.socialCode}
                  onChange={(e) => setFormData((p) => ({ ...p, socialCode: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mağaza *</Label>
              <StoreSelector
                value={formData.storeId}
                onChange={(storeId) => setFormData((p) => ({ ...p, storeId }))}
                // Eğer erişimi kısıtlamak istersen:
                // allowedStoreIds={stores.map(s => s.id)}
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