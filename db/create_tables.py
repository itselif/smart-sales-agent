import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.models import Base
from config.settings import DATABASE_URL
from sqlalchemy import create_engine

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
print("Tables created!")
