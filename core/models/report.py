from __future__ import annotations
from typing import List, Any, Optional, Literal
from pydantic import BaseModel

class KPI(BaseModel):
    label: str
    value: str

class BlockChart(BaseModel):
    type: Literal["chart"] = "chart"
    title: str
    chart_type: Literal["line","bar","pie"] = "line"
    x: List[Any]
    y: List[float]
    caption: Optional[str] = ""

class BlockTable(BaseModel):
    type: Literal["table"] = "table"
    title: str
    headers: List[str]
    rows: List[List[Any]]

class BlockText(BaseModel):
    type: Literal["text"] = "text"
    title: str
    text: str

ReportBlock = BlockChart | BlockTable | BlockText

class ReportSpec(BaseModel):
    title: str
    kpis: List[KPI] = []
    blocks: List[ReportBlock] = []
