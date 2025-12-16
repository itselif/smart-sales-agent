from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Store(Base):
    __tablename__ = "stores"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String)

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    store_id = Column(String, ForeignKey("stores.id"))
    current_stock = Column(Integer, default=0)
    avg_daily_sales = Column(Float, default=0)
    safety_stock = Column(Integer, default=0)
    lead_time_days = Column(Integer, default=7)
