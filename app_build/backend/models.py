# pyrefly: ignore [missing-import]
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmName: str
    placeArea: str
    mobileNo: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    lastActive: datetime = Field(default_factory=datetime.utcnow)

class Invoice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="userprofile.id")
    invoiceNumber: str
    invoiceDate: str
    state: str
    reverseCharge: str
    receiverName: str
    gstin: str
    totalAmount: float
    balanceDue: float
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class InvoiceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    invoiceId: int = Field(foreign_key="invoice.id")
    srNo: int
    productName: str
    ceret: float
    vagan: float
    qty: float
    rate: float
    totalPrice: float
