import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { Building2, Lock, Mail } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8000"; // <- boş bırakma, fallback dursun
const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS || "").toLowerCase() === "true";
let mockLoginFn: undefined | ((p: { email?: string; socialCode?: string; password: string }) => Promise<any>);
try { mockLoginFn = (await import("@/lib/mocks/auth")).mockLogin; } catch {}

export default function Login() {
  const [email, setEmail] = useState("");
  const [socialCode, setSocialCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setCurrentStoreId, stores } = useAppStore();

  const canSubmit = !!password && (!!email || !!socialCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast({
        title: "Hata",
        description: "Email ya da mağaza kodu ve şifre gerekli.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, string> = { password };
      if (socialCode.trim()) payload.socialCode = socialCode.trim();
      else payload.email = email.trim();

      let body: any;
      if (USE_MOCKS && mockLoginFn) {
        body = await mockLoginFn(payload);
      } else {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        body = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          const d = body?.detail || body;
          const msg = d?.errorMessage || d?.message || (typeof d === "string" ? d : "Giriş başarısız");
          toast({ title: "Giriş başarısız", description: msg, variant: "destructive" });
          return;
        }
      }

      // BE artık token'ı her zaman body'ye koyuyor.
      const accessToken = body?.accessToken;
      const refreshToken = body?.refreshToken;

      if (!accessToken) {
        const d = body?.detail || body;
        const msg =
          d?.errorMessage ||
          d?.message ||
          (typeof d === "string" ? d : "Giriş başarısız");
        toast({ title: "Giriş başarısız", description: msg, variant: "destructive" });
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const apiUser = body?.data?.user;
      const name =
        apiUser?.fullname ||
        (email ? email.split("@")[0] : socialCode) ||
        "Kullanıcı";

      const assignedFromApi: string[] =
        apiUser?.assignedStoreIds ||
        apiUser?.stores ||
        [];

      const fallbackStoreId = stores?.[0]?.id;
      const assignedStores =
        assignedFromApi.length > 0
          ? assignedFromApi
          : fallbackStoreId
          ? [fallbackStoreId]
          : [];

      setUser({
        id: apiUser?.id || "me",
        name,
        email: email || `${socialCode}@local`,
        role: apiUser?.role || "Kullanıcı",
        assignedStores,
      });

      if (assignedStores.length > 0) {
        setCurrentStoreId(assignedStores[0]);
      }

      toast({ title: "Giriş başarılı", description: "Dashboard'a yönlendiriliyorsunuz..." });
      navigate("/dashboard");
    } catch {
      toast({ title: "Ağ hatası", description: "Sunucuya ulaşılamadı.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (v) setSocialCode("");
  };
  const handleSocialChange = (v: string) => {
    setSocialCode(v);
    if (v) setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">StorePilot</h1>
          </div>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>Mağaza operasyon panelinize erişim için giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ornek.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="pl-10"
                  disabled={!!socialCode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialCode">Mağaza Kodu (socialCode)</Label>
              <Input
                id="socialCode"
                placeholder="örn. TEST-LOGIN"
                value={socialCode}
                onChange={(e) => handleSocialChange(e.target.value)}
                disabled={!!email}
              />
              <p className="text-xs text-muted-foreground">
                Email yerine socialCode ile giriş gerekiyorsa bu alanı kullanın.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Hesabınız yok mu? </span>
            <Button variant="link" className="p-0" onClick={() => navigate("/auth/register")}>
              Kayıt ol
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
