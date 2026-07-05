from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from models import UserProfile, Invoice, InvoiceItem
from database import create_db_and_tables, get_session
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np

app = FastAPI(title="Horticultural Invoicing API")

# Setup CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Replace with vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/api/users/", response_model=UserProfile)
def create_user(user: UserProfile, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.post("/api/invoices/")
def create_invoice(invoice: Invoice, items: List[InvoiceItem], session: Session = Depends(get_session)):
    # Validate Math using Pandas/NumPy
    df = pd.DataFrame([item.dict() for item in items])
    if not df.empty:
        # Check QTY = CERET * VAGAN
        calculated_qty = np.round(df['ceret'] * df['vagan'], 3)
        if not np.allclose(df['qty'], calculated_qty, atol=1e-3):
            raise HTTPException(status_code=400, detail="Quantity calculation mismatch")
        
        # Check Total = QTY * RATE
        calculated_total = np.round(df['qty'] * df['rate'], 2)
        if not np.allclose(df['totalPrice'], calculated_total, atol=1e-2):
            raise HTTPException(status_code=400, detail="Total price calculation mismatch")

    session.add(invoice)
    session.commit()
    session.refresh(invoice)

    for item in items:
        item.invoiceId = invoice.id
        session.add(item)
    
    session.commit()
    return {"message": "Invoice created successfully", "invoice_id": invoice.id}
