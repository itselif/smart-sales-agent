import unittest
from core.agents.stock_agent import StockAgent

class TestStockAgent(unittest.TestCase):
    def setUp(self):
        self.agent = StockAgent("StockAgent")
        self.store_id = 1

    def test_critical_stock(self):
        result = self.agent.run(self.store_id)
        self.assertEqual(result["status"], "ok")
        self.assertIn("critical_stock", result)
        # Kritik stokta en az bir ürün olmalı (mock veriyle)
        self.assertTrue(len(result["critical_stock"]) > 0)

    def test_product_query_found(self):
        result = self.agent.run(self.store_id, product_id=1)
        self.assertEqual(result["status"], "ok")
        self.assertIn("product", result)
        self.assertEqual(result["product"]["product_id"], 1)

    def test_product_query_not_found(self):
        result = self.agent.run(self.store_id, product_id=999)
        self.assertEqual(result["status"], "not_found")

if __name__ == "__main__":
    unittest.main()
