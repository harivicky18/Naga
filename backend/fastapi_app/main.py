from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional
import random
import requests
from datetime import datetime
import uvicorn

app = FastAPI(title="Payment Gateway - Payment Processor", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Django Backend URL
DJANGO_API_URL = "http://localhost:8000/api"

# Pydantic Models
class PaymentRequest(BaseModel):
    transaction_id: int = Field(..., description="Transaction ID from Django")
    auth_token: Optional[str] = Field(None, description="Authentication token")
    
    @validator('transaction_id')
    def validate_transaction_id(cls, v):
        if v <= 0:
            raise ValueError('Transaction ID must be positive')
        return v

class PaymentResponse(BaseModel):
    status: str
    message: str
    transaction_id: int
    payment_status: str
    amount: Optional[float] = None
    timestamp: str

# Dummy Card Database for Testing
DUMMY_CARDS = {
    "4532015112830366": {"status": "SUCCESS", "bank": "Test Bank"},  # Visa - Always Success
    "5425233430109903": {"status": "SUCCESS", "bank": "Test Bank"},  # Mastercard - Always Success
    "374245455400126": {"status": "SUCCESS", "bank": "Test Bank"},   # Amex - Always Success
    "4111111111111111": {"status": "FAILED", "bank": "Test Bank"},   # Visa - Always Fail
    "5555555555554444": {"status": "FAILED", "bank": "Test Bank"},   # Mastercard - Always Fail
}

def simulate_payment_processing(transaction_id: int, auth_token: str = None) -> dict:
    """
    Simulate payment processing with dummy card logic
    Returns SUCCESS or FAILED based on card number pattern
    """
    # Simulate processing delay
    import time
    time.sleep(1)
    
    # Get transaction details from Django
    try:
        headers = {}
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'
        
        response = requests.get(
            f"{DJANGO_API_URL}/transactions/{transaction_id}/",
            headers=headers
        )
        
        if response.status_code != 200:
            return {"status": "FAILED", "reason": "Transaction not found"}
        
        transaction_data = response.json()['data']
        card_number = transaction_data['card_details']['last_four_digits']
        amount = float(transaction_data['amount'])
        
        # Check if last 4 digits match any dummy card pattern
        # Cards ending in 0000-4999 = SUCCESS
        # Cards ending in 5000-9999 = FAILED
        last_four = int(card_number)
        
        if last_four < 5000:
            payment_status = "SUCCESS"
            reason = "Payment processed successfully"
        else:
            payment_status = "FAILED"
            reason = "Insufficient funds or card declined"
        
        # Alternatively, use random simulation (70% success rate)
        # payment_status = random.choices(["SUCCESS", "FAILED"], weights=[70, 30])[0]
        
        return {
            "status": payment_status,
            "reason": reason,
            "amount": amount,
            "transaction_id": transaction_id
        }
        
    except Exception as e:
        return {
            "status": "FAILED",
            "reason": f"Processing error: {str(e)}"
        }

@app.get("/")
def root():
    return {
        "message": "Payment Gateway - Payment Processor API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/process-payment", response_model=PaymentResponse)
async def process_payment(payment_request: PaymentRequest):
    """
    Process payment for a given transaction
    
    Dummy Card Logic:
    - Cards with last 4 digits 0000-4999: SUCCESS
    - Cards with last 4 digits 5000-9999: FAILED
    """
    transaction_id = payment_request.transaction_id
    auth_token = payment_request.auth_token
    
    # Simulate payment processing
    result = simulate_payment_processing(transaction_id, auth_token)
    
    if result["status"] in ["SUCCESS", "FAILED"]:
        # Update transaction status in Django
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'
            
            update_response = requests.patch(
                f"{DJANGO_API_URL}/transactions/{transaction_id}/update-status/",
                json={"status": result["status"]},
                headers=headers
            )
            
            if update_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update transaction status"
                )
            
            return PaymentResponse(
                status="success",
                message=result["reason"],
                transaction_id=transaction_id,
                payment_status=result["status"],
                amount=result.get("amount"),
                timestamp=datetime.now().isoformat()
            )
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Communication error with Django: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("reason", "Payment processing failed")
        )

@app.get("/transaction-status/{transaction_id}")
async def get_transaction_status(transaction_id: int):
    """Get transaction status from Django"""
    try:
        response = requests.get(f"{DJANGO_API_URL}/transactions/{transaction_id}/")
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch transaction status"
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Communication error: {str(e)}"
        )

@app.get("/dummy-cards")
def get_dummy_cards():
    """Get list of dummy test cards"""
    return {
        "status": "success",
        "message": "Test cards for payment simulation",
        "cards": [
            {
                "number": "4532015112830366",
                "type": "Visa",
                "last_four": "0366",
                "result": "SUCCESS",
                "cvv": "123",
                "expiry": "12/2025"
            },
            {
                "number": "5425233430109903",
                "type": "Mastercard",
                "last_four": "9903",
                "result": "SUCCESS",
                "cvv": "456",
                "expiry": "06/2026"
            },
            {
                "number": "4111111111115678",
                "type": "Visa",
                "last_four": "5678",
                "result": "FAILED",
                "cvv": "789",
                "expiry": "09/2024"
            }
        ],
        "note": "Cards with last 4 digits 0000-4999 will succeed, 5000-9999 will fail"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)