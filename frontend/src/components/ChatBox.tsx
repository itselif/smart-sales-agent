import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, ExternalLink, FileText, BarChart3, Package } from "lucide-react";
import { useOrchestrate } from "@/lib/hooks";
import { useAppStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  intent?: string;
  data?: any;
  publicUrl?: string;
  downloadUrl?: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { storeId } = useAppStore();
  const { mutate: orchestrate, isPending } = useOrchestrate();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || !storeId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    orchestrate(
      { query: input, storeId },
      {
        onSuccess: (response) => {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: getBotResponse(response),
            intent: response.intent,
            data: response.data,
            publicUrl: response.public_url,
            downloadUrl: response.download_url,
          };

          setMessages(prev => [...prev, botMessage]);

          // Auto-open report if intent is report
          if (response.intent === "report" && response.public_url) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            window.open(baseUrl + response.public_url, "_blank");
          }
        },
        onError: (error) => {
          toast({
            title: "Hata",
            description: "Chat isteği başarısız oldu: " + error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const getBotResponse = (response: any) => {
    switch (response.intent) {
      case "report":
        return "Rapor başarıyla oluşturuldu. Yeni sekmede açılıyor...";
      case "sales":
        return `Satış analizi tamamlandı. ${response.data?.products?.length || 0} ürün analiz edildi.`;
      case "stock":
        return `Stok analizi tamamlandı. ${response.data?.critical_products?.length || 0} kritik ürün bulundu.`;
      default:
        return "İstek işlendi.";
    }
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "report":
        return <FileText className="h-4 w-4" />;
      case "sales":
        return <BarChart3 className="h-4 w-4" />;
      case "stock":
        return <Package className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getIntentLabel = (intent?: string) => {
    switch (intent) {
      case "report":
        return "Rapor";
      case "sales":
        return "Satış";
      case "stock":
        return "Stok";
      default:
        return "Genel";
    }
  };

  if (!storeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Asistan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Lütfen önce bir mağaza seçin
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Asistan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Merhaba! Size nasıl yardımcı olabilirim?</p>
              <p className="text-sm mt-1">
                "pdf raporu üret", "kritik stokları listele" veya "satış analizi" yazabilirsiniz.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'bot' && (
                    <div className="flex flex-col items-center">
                      {getIntentIcon(message.intent)}
                      {message.intent && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {getIntentLabel(message.intent)}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Report links */}
                    {message.publicUrl && (
                      <div className="mt-2 space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                            window.open(baseUrl + message.publicUrl, "_blank");
                          }}
                          className="w-full"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Raporu Aç
                        </Button>
                      </div>
                    )}
                    
                    {/* Quick data preview for sales/stock */}
                    {message.intent === "sales" && message.data?.products && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>Toplam ciro: {message.data.products.reduce((sum: number, p: any) => sum + p.total_revenue, 0).toLocaleString('tr-TR')} TL</p>
                        <p>En çok satan: {message.data.products[0]?.product_name || "Bilinmiyor"}</p>
                      </div>
                    )}
                    
                    {message.intent === "stock" && message.data?.critical_products && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>Toplam değer: {message.data.total_value?.toLocaleString('tr-TR')} TL</p>
                        <p>Kritik ürün sayısı: {message.data.critical_products.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="pdf raporu üret / kritik stokları listele / son satış analizi"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isPending}
          />
          <Button onClick={handleSend} disabled={isPending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}