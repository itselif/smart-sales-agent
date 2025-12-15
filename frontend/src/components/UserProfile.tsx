import { useState } from "react";
import { useAppStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Building2, Hash, Shield, Phone, Edit3, Save, X, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, setUser, selectedStores, setSelectedStores, stores } = useAppStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    storeCode: user?.storeCode || "",
    phone: user?.phone || "",
  });
  const [localSelectedStores, setLocalSelectedStores] = useState<string[]>(user?.assignedStores || []);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (!user) return null;

  const toggleStore = (storeId: string) => {
    setLocalSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(s => s !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSave = () => {
    setUser({
      ...user,
      storeCode: editData.storeCode || user.storeCode,
      phone: editData.phone,
      assignedStores: localSelectedStores,
    });
    // Dashboard'da görüntülenen mağazaları da güncelle
    setSelectedStores(localSelectedStores);
    setIsEditing(false);
    toast({
      title: "Başarılı",
      description: "Bilgileriniz güncellendi",
    });
  };

  const handleCancel = () => {
    setEditData({
      storeCode: user?.storeCode || "",
      phone: user?.phone || "",
    });
    setLocalSelectedStores(user?.assignedStores || []);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Hata", description: "Şifreler uyuşmuyor", variant: "destructive" });
      return;
    }
    
    // Burada şifre değiştirme API çağrısı yapılabilir
    toast({ title: "Başarılı", description: "Şifre güncellendi" });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Kullanıcı Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Kişisel Bilgiler</h3>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">Ad Soyad</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground">Email</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <Badge variant="secondary">{user.role}</Badge>
              <p className="text-xs text-muted-foreground">Rol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              {isEditing || !user.storeCode ? (
                <div className="space-y-1">
                  <Label htmlFor="storeCode" className="text-xs text-muted-foreground">
                    Mağaza Kodu
                  </Label>
                  <Input
                    id="storeCode"
                    value={editData.storeCode}
                    onChange={(e) => setEditData({...editData, storeCode: e.target.value})}
                    placeholder="Mağaza kodunu girin"
                    className="h-8"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{user.storeCode}</p>
                  <p className="text-xs text-muted-foreground">Mağaza Kodu</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs text-muted-foreground">
                    Telefon Numarası
                  </Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder="Telefon numaranızı girin"
                    className="h-8"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">{user.phone || "Telefon numarası girilmemiş"}</p>
                  <p className="text-xs text-muted-foreground">Telefon Numarası</p>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Erişim Verilen Mağazalar</Label>
              <div className="flex flex-wrap gap-2">
                {stores.map(store => (
                  <Badge
                    key={store.id}
                    variant={localSelectedStores.includes(store.id) ? "default" : "outline"}
                    onClick={() => toggleStore(store.id)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {store.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Seçtiğiniz mağazalar dashboard'da görüntülenecektir
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {localSelectedStores.length} mağaza erişimi
              </p>
              <p className="text-xs text-muted-foreground">
                {localSelectedStores.length > 0
                  ? stores
                      .filter(s => localSelectedStores.includes(s.id))
                      .map(s => s.name)
                      .join(', ')
                  : 'Mağaza seçilmemiş'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {showPasswordForm ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Şifre Değiştir
            </h3>
            <Input
              type="password"
              placeholder="Mevcut Şifre"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            />
            <Input
              type="password"
              placeholder="Yeni Şifre"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
            <Input
              type="password"
              placeholder="Yeni Şifre (Tekrar)"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={handlePasswordChange} size="sm" className="flex-1">
                Şifreyi Kaydet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(false)} 
                size="sm"
              >
                İptal
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setShowPasswordForm(true)} 
            className="w-full flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Şifre Değiştir
          </Button>
        )}

        <Separator />

        <div className="flex justify-center">
          <Button variant="outline" onClick={onClose} className="w-full">
            Kapat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}