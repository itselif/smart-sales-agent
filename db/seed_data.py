import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from databases import Database
from db.models import Store, Product
from config.settings import DATABASE_URL


database = Database(DATABASE_URL)

async def seed():
    await database.connect()

    stores = [
        {"id": "store-001", "name": "Main Warehouse", "location": "New York"},
        {"id": "store-002", "name": "West Coast Hub", "location": "Los Angeles"},
        {"id": "store-003", "name": "Istanbul Branch", "location": "Istanbul"},
    ]

    for store in stores:
        query = """
        INSERT OR IGNORE INTO stores
        (id, name, location)
        VALUES (:id, :name, :location)
        """
        await database.execute(query=query, values=store)

    products = [
        {"id": "PRD-001", "name": "Wireless Keyboard", "price": 79.99, "store_id": "store-001", "current_stock": 45, "avg_daily_sales": 8.5, "safety_stock": 30, "lead_time_days": 7},
        {"id": "PRD-002", "name": "USB-C Hub", "price": 49.99, "store_id": "store-001", "current_stock": 120, "avg_daily_sales": 3.2, "safety_stock": 20, "lead_time_days": 5},
        {"id": "PRD-003", "name": "Monitor Stand", "price": 129.99, "store_id": "store-002", "current_stock": 28, "avg_daily_sales": 1.8, "safety_stock": 15, "lead_time_days": 10},
        {"id": "PRD-004", "name": "Webcam HD Pro", "price": 149.99, "store_id": "store-003", "current_stock": 12, "avg_daily_sales": 4.2, "safety_stock": 25, "lead_time_days": 7},
        {"id": "PRD-005", "name": "Desk Lamp LED", "price": 34.99, "store_id": "store-003", "current_stock": 95, "avg_daily_sales": 2.1, "safety_stock": 20, "lead_time_days": 4},
        {"id": "PRD-006", "name": "Gaming Mouse", "price": 59.99, "store_id": "store-001", "current_stock": 60, "avg_daily_sales": 5, "safety_stock": 20, "lead_time_days": 6},
        {"id": "PRD-007", "name": "Mechanical Keyboard", "price": 99.99, "store_id": "store-002", "current_stock": 35, "avg_daily_sales": 2.5, "safety_stock": 15, "lead_time_days": 7},
        {"id": "PRD-008", "name": "Laptop Stand", "price": 39.99, "store_id": "store-003", "current_stock": 50, "avg_daily_sales": 3, "safety_stock": 20, "lead_time_days": 5},
        {"id": "PRD-009", "name": "Noise-Cancelling Headphones", "price": 199.99, "store_id": "store-001", "current_stock": 20, "avg_daily_sales": 1.2, "safety_stock": 10, "lead_time_days": 10},
        {"id": "PRD-010", "name": "HDMI Cable", "price": 14.99, "store_id": "store-002", "current_stock": 150, "avg_daily_sales": 7, "safety_stock": 50, "lead_time_days": 3},
    ]
    for product in products:
        query = """
        INSERT OR IGNORE INTO products
        (id, name, price, store_id, current_stock, avg_daily_sales, safety_stock, lead_time_days)
        VALUES (:id, :name, :price, :store_id, :current_stock, :avg_daily_sales, :safety_stock, :lead_time_days)
        """
        await database.execute(query=query, values=product)

    await database.disconnect()
    print("Seed data inserted!")

if __name__ == "__main__":
    asyncio.run(seed())
