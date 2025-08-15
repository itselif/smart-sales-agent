import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Literal
import google.generativeai as genai

class StockAgent:
    def __init__(self, gemini_api_key: Optional[str] = None):
        """Başlatıcı: Gemini API'si isteğe bağlı"""
        self.gemini = None
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.gemini = genai.GenerativeModel('gemini-pro')
        
        # Kritik stok kuralları
        self.critical_threshold_rules = {
            "high": {"min_stock": 20, "sales_threshold": 15},
            "medium": {"min_stock": 10, "sales_threshold": 5},
            "low": {"min_stock": 3, "sales_threshold": 1}
        }

    async def get_stock_data(self, store_id: str) -> List[Dict]:
        """Mock veri üretir (Gerçekte DB/API bağlantısı yapılacak)"""
        return [
            {
                "product_id": "P100",
                "name": "Premium Kulaklık",
                "current_stock": 8,
                "min_required": 5,
                "lead_time_days": 3,
                "category": "electronics"
            },
            {
                "product_id": "P200",
                "name": "Kablosuz Şarj Aleti",
                "current_stock": 2,  # Kritik stok seviyesi
                "min_required": 10,
                "lead_time_days": 7,
                "category": "electronics"
            }
        ]

    async def analyze_stock(self, store_id: str) -> Dict:
        """Stok analizini yürütür"""
        stock_data = await self.get_stock_data(store_id)
        analyzed_products = []
        
        for product in stock_data:
            analysis = self._analyze_single_product(product)
            analyzed_products.append(analysis)
        
        return {
            "store_id": store_id,
            "analysis_date": datetime.now().isoformat(),
            "products": analyzed_products,
            "critical_products": [p for p in analyzed_products if p["is_critical"]]
        }

    def _analyze_single_product(self, product: Dict) -> Dict:
        """Tek ürün analizi"""
        traffic_level = self._determine_traffic_level(product.get("sales_rate", 0))
        days_left = product["current_stock"] / (product.get("daily_sales", 1) or 1)
        
        is_critical = (
            product["current_stock"] < self.critical_threshold_rules[traffic_level]["min_stock"] or
            days_left < product["lead_time_days"] + 3
        )
        
        return {
            **product,
            "is_critical": is_critical,
            "estimated_days_left": round(days_left, 1),
            "traffic_level": traffic_level
        }

    def _determine_traffic_level(self, sales_rate: float) -> str:
        """Satış hızına göre trafik seviyesi"""
        if sales_rate >= self.critical_threshold_rules["high"]["sales_threshold"]:
            return "high"
        elif sales_rate >= self.critical_threshold_rules["medium"]["sales_threshold"]:
            return "medium"
        return "low"

    async def generate_report(self, analysis_result: Dict, 
                            format: Literal["text", "json", "ai"] = "text") -> str:
        """Rapor oluşturucu"""
        if format == "json":
            return analysis_result
        elif format == "ai":
            return await self._generate_ai_report(analysis_result)
        else:
            return self._format_text_report(analysis_result)

    async def _generate_ai_report(self, analysis: Dict) -> str:
        """Gemini ile akıllı rapor"""
        if not self.gemini:
            return "Gemini API not configured"
        
        prompt = f"""
        Stok Analiz Sonuçları:
        {analysis}
        
        Görev:
        1. Kritik ürünleri özetle
        2. Acil aksiyon gerektirenleri listele
        3. Satış trendi tahmini yap
        """
        
        response = await self.gemini.generate_content_async(prompt)
        return response.text

    def _format_text_report(self, analysis: Dict) -> str:
        """Basit metin raporu"""
        criticals = analysis.get("critical_products", [])
        if not criticals:
            return "✅ Tüm stoklar normal seviyede"
        
        report = ["⚠️ KRİTİK STOK UYARILARI:"]
        for product in criticals:
            report.append(
                f"- {product['name']}: Sadece {product['current_stock']} adet kaldı "
                f"(Tahmini {product['estimated_days_left']} günlük stok)"
            )
        return "\n".join(report)

# Kullanım Örneği
async def main():
    # Gemini API anahtarı olmadan başlat
    agent = StockAgent()
    
    # Analiz yap
    result = await agent.analyze_stock("store_123")
    
    # Rapor al
    print(await agent.generate_report(result, format="text"))
    
    # Gemini ile rapor (API anahtarı gerektirir)
    # agent = StockAgent(gemini_api_key="AIzaSy...")
    # print(await agent.generate_report(result, format="ai"))

if __name__ == "__main__":
    asyncio.run(main())