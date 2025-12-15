import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, ExternalLink, FileText, BarChart3, Package, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/stores";
import { orchestrate } from "@/lib/api";

/** Backend'ten gelen intent'i UI için normalize eder */
function normalizeIntent(raw?: string): "report" | "sales" | "stock" | "general" {
  switch (raw) {
    case "report_build": return "report";
    case "sales_analyze": return "sales";
    case "stock_analysis": return "stock";
    default: return "general";
  }
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  intent?: "report" | "sales" | "stock" | "general";
  data?: any;
  publicUrl?: string;
  downloadUrl?: string;
  meta?: { planner?: string; summarizer?: string; cached?: boolean };
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { currentStoreId } = useAppStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Chat geçmişini localStorage'dan yükle
  useEffect(() => {
    if (!currentStoreId) {
      setMessages([]);
      return;
    }
    
    const savedMessages = localStorage.getItem(`chat-history-${currentStoreId}`);
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Chat geçmişi yüklenemedi:", error);
        setMessages([]);
      }
    } else {
      // Bu mağaza için hiç chat geçmişi yoksa boş array set et
      setMessages([]);
    }
  }, [currentStoreId]);

  // Chat geçmişini localStorage'a kaydet
  useEffect(() => {
    if (messages.length > 0 && currentStoreId) {
      localStorage.setItem(`chat-history-${currentStoreId}`, JSON.stringify(messages));
    }
  }, [messages, currentStoreId]);

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Yeni mesaj gelince otomatik aşağı kaydır
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  const clearChatHistory = () => {
    setMessages([]);
    if (currentStoreId) {
      localStorage.removeItem(`chat-history-${currentStoreId}`);
    }
    toast({
      title: "Chat Geçmişi Temizlendi",
      description: "Tüm konuşma geçmişi silindi.",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !currentStoreId) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      type: "user",
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsPending(true);

    try {
      const response = await orchestrate(input, currentStoreId);
      const normalizedIntent = normalizeIntent(response.intent);

      const rawUrl: string | undefined = (response as any)?.public_url || (response as any)?.data?.public_url;
      const publicUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `${apiBase}${rawUrl}`) : undefined;

      const botMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        type: "bot",
        content: (response as any).reply || "İstek işlendi.",
        intent: normalizedIntent,
        data: (response as any).data,
        publicUrl,
        downloadUrl: (response as any).download_url,
        meta: (response as any).meta,
      };

      setMessages(prev => [...prev, botMessage]);

      if (normalizedIntent === "report" && publicUrl) {
        window.open(publicUrl, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Chat isteği başarısız oldu: " + (error?.message || String(error)),
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "report": return <FileText className="h-4 w-4" />;
      case "sales":  return <BarChart3 className="h-4 w-4" />;
      case "stock":  return <Package className="h-4 w-4" />;
      default:       return <Bot className="h-4 w-4" />;
    }
  };

  const getIntentLabel = (intent?: string) => {
    switch (intent) {
      case "report": return "Rapor";
      case "sales":  return "Satış";
      case "stock":  return "Stok";
      default:       return "Sohbet";
    }
  };

  if (!currentStoreId) {
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Asistan
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChatHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div ref={listRef} className="max-h-96 overflow-y-auto space-y-3">
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
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === "bot" && (
                    <div className="flex flex-col items-center min-w-10">
                      {getIntentIcon(message.intent)}
                      {message.intent && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {getIntentLabel(message.intent)}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    {/* meta rozetleri */}
                    {message.type === "bot" && message.meta && (
                      <div className="flex gap-1 mb-1">
                        {message.meta.planner && (
                          <Badge variant="outline" className="text-[10px]">planner: {message.meta.planner}</Badge>
                        )}
                        {message.meta.summarizer && (
                          <Badge variant="outline" className="text-[10px]">summ: {message.meta.summarizer}</Badge>
                        )}
                        {typeof message.meta.cached === "boolean" && (
                          <Badge variant="outline" className="text-[10px]">
                            cache: {message.meta.cached ? "yes" : "no"}
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-line">{message.content}</p>

                    {/* Report link */}
                    {message.publicUrl && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(message.publicUrl!, "_blank")}
                          className="w-full"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Raporu Aç
                        </Button>
                      </div>
                    )}

                    {/* Quick data preview for sales */}
                    {message.intent === "sales" && message.data?.products && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>
                          Toplam ciro{" "}
                          {message.data.products
                            .reduce((s: number, p: any) => s + (p.total_revenue || 0), 0)
                            .toLocaleString("tr-TR")}{" "}
                          TL
                        </p>
                        <p>
                          En çok ciro:{" "}
                          {(() => {
                            const top = [...message.data.products].sort(
                              (a: any, b: any) =>
                                (b.total_revenue || 0) - (a.total_revenue || 0)
                            )[0];
                            return top?.product_name ?? "Bilinmiyor";
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Quick data preview for stock */}
                    {message.intent === "stock" && message.data?.critical_products && (
                      <div className="mt-2 text-xs space-y-1">
                        <p>
                          Toplam değer{" "}
                          {Number(message.data.total_value || 0).toLocaleString("tr-TR")} TL
                        </p>
                        <p>Kritik ürün: {message.data.critical_products.length}</p>
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
            onKeyDown={(e) => e.key === "Enter" && !isPending && handleSend()}
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
