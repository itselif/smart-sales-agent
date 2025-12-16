import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/context/StoreContext";
import { ChatMessage, ChatIntent } from "@/types/inventory";
import { orchestrate } from "@/services/api";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBotProps {
  onStockData?: (data: any) => void;
  onSalesData?: (data: any) => void;
  onReportData?: (data: any) => void;
}

const intentIcons: Record<ChatIntent, typeof Bot> = {
  stock: Bot,
  sales: Bot,
  report: Bot,
  general: Bot,
};

const intentColors: Record<ChatIntent, string> = {
  stock: "bg-warning/10 text-warning border-warning/20",
  sales: "bg-success/10 text-success border-success/20",
  report: "bg-primary/10 text-primary border-primary/20",
  general: "bg-muted text-muted-foreground border-border",
};

export function ChatBot({ onStockData, onSalesData, onReportData }: ChatBotProps) {
  const [storeMessages, setStoreMessages] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { currentStoreId } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = storeMessages[currentStoreId] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setStoreMessages(prev => ({
      ...prev,
      [currentStoreId]: [...(prev[currentStoreId] || []), userMessage],
    }));
    setInput("");
    setIsLoading(true);

    try {
      const response = await orchestrate(input, `Store: ${currentStoreId}\nPrevious messages: ${JSON.stringify(messages)}`);
      const { agent, output = response.response, data, publicUrl } = response;

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: "bot",
        content: output,
        intent: agent ? (agent.replace("_agent", "") as ChatIntent) : "general",
        data,
        publicUrl,
        downloadUrl: publicUrl,
        timestamp: new Date(),
        meta: { cached: false },
      };

      setStoreMessages(prev => ({
        ...prev,
        [currentStoreId]: [...(prev[currentStoreId] || []), botMessage],
      }));

      if (agent === "stock_agent") onStockData?.(data);
      if (agent === "sales_agent") onSalesData?.(data);
      if (agent === "reporting_agent") onReportData?.({ publicUrl });
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "bot",
        content: error instanceof Error ? `Error: ${error.message}` : "An error occurred. Please try again.",
        intent: "general",
        timestamp: new Date(),
      };
      setStoreMessages(prev => ({
        ...prev,
        [currentStoreId]: [...(prev[currentStoreId] || []), errorMessage],
      }));
      console.error("Orchestrate error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-floating z-50 transition-all duration-200",
          "bg-primary hover:bg-primary/90",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <div
        className={cn(
          "fixed bottom-6 right-6 w-96 h-[32rem] z-50 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <Card className="h-full flex flex-col shadow-floating border-border">
          <CardHeader className="pb-3 flex-shrink-0 border-b bg-card rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                AI Assistant
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                X
              </Button>
            </div>
            {currentStoreId && (
              <Badge variant="secondary" className="w-fit text-xs mt-2">
                Store: {currentStoreId}
              </Badge>
            )}
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-slide-up",
                    message.type === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn("flex flex-col gap-2 max-w-[80%]", message.type === "user" && "items-end")}>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.intent && message.type === "bot" && (
                      <Badge variant="outline" className={cn("text-xs w-fit", intentColors[message.intent])}>
                        {(() => {
                          const Icon = intentIcons[message.intent];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {message.intent}
                      </Badge>
                    )}
                    {message.publicUrl && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Open
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-slide-up">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse-soft" />
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="p-3 border-t flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inventory, sales, or reports..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
