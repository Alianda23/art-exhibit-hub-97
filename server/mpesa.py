
import base64
import datetime
import json
import requests
import os
from typing import Dict, Any

# Get the credentials
CONSUMER_KEY = "sMwMwGZ8oOiSkNrUIrPbcCeWIO8UiQ3SV4CyX739uAyZVs1F"
CONSUMER_SECRET = "A3Hs5zRY3nDCn7XpxPuc1iAKpfy6UDdetiCalIAfuAIpgTROI5yCqqOewDfThh2o"

# M-Pesa API URLs - these would typically be different for sandbox and production
# Using sandbox URLs for demonstration
MPESA_AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
MPESA_STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
MPESA_QUERY_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"

# M-Pesa Shortcode and Passkey - these would need to be provided by Safaricom
# Using placeholder values for demonstration
MPESA_SHORTCODE = "174379"  # Example Sandbox shortcode
MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"  # Example Sandbox passkey
MPESA_CALLBACK_URL = "https://example.com/callback"  # This should be your server's callback URL

# Helper function to get M-Pesa access token
def get_mpesa_access_token() -> str:
    """Get M-Pesa access token"""
    try:
        # Create the auth header
        auth_string = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")
        
        # Make the request
        headers = {
            "Authorization": f"Basic {auth_base64}"
        }
        
        response = requests.get(MPESA_AUTH_URL, headers=headers)
        data = response.json()
        
        # Check if the request was successful
        if "access_token" in data:
            return data["access_token"]
        else:
            print("Error getting M-Pesa access token:", data)
            return ""
    except Exception as e:
        print("Exception getting M-Pesa access token:", e)
        return ""

# Helper function to generate the M-Pesa timestamp
def get_mpesa_timestamp() -> str:
    """Generate M-Pesa timestamp (YYYYMMDDHHmmss)"""
    return datetime.datetime.now().strftime("%Y%m%d%H%M%S")

# Helper function to generate the M-Pesa password
def get_mpesa_password(timestamp: str) -> str:
    """Generate M-Pesa password for STK Push (base64 of shortcode+passkey+timestamp)"""
    password_string = f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
    password_bytes = password_string.encode("utf-8")
    password_base64 = base64.b64encode(password_bytes).decode("utf-8")
    return password_base64

# Function to initiate STK Push
def initiate_stk_push(phone_number: str, amount: int, account_reference: str, transaction_desc: str) -> Dict[str, Any]:
    """Initiate M-Pesa STK Push"""
    try:
        # Get access token
        access_token = get_mpesa_access_token()
        if not access_token:
            return {"error": "Failed to get M-Pesa access token"}
        
        # Generate timestamp and password
        timestamp = get_mpesa_timestamp()
        password = get_mpesa_password(timestamp)
        
        # Prepare the request payload
        payload = {
            "BusinessShortCode": MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": MPESA_SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": MPESA_CALLBACK_URL,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        # Make the request
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(MPESA_STK_PUSH_URL, json=payload, headers=headers)
        data = response.json()
        
        # Check if the request was successful
        if "ResponseCode" in data and data["ResponseCode"] == "0":
            return data
        else:
            print("Error initiating M-Pesa STK Push:", data)
            return {"error": "Failed to initiate M-Pesa payment", "details": data}
    except Exception as e:
        print("Exception initiating M-Pesa STK Push:", e)
        return {"error": f"Exception: {str(e)}"}

# Function to check transaction status
def check_transaction_status(checkout_request_id: str) -> Dict[str, Any]:
    """Check M-Pesa transaction status"""
    try:
        # Get access token
        access_token = get_mpesa_access_token()
        if not access_token:
            return {"error": "Failed to get M-Pesa access token"}
        
        # Generate timestamp and password
        timestamp = get_mpesa_timestamp()
        password = get_mpesa_password(timestamp)
        
        # Prepare the request payload
        payload = {
            "BusinessShortCode": MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        # Make the request
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(MPESA_QUERY_URL, json=payload, headers=headers)
        data = response.json()
        
        return data
    except Exception as e:
        print("Exception checking M-Pesa transaction status:", e)
        return {"error": f"Exception: {str(e)}"}

# Function to handle STK push request from the server
def handle_stk_push_request(data):
    """Handle STK push request from the client"""
    try:
        phone_number = data.get("phoneNumber")
        amount = data.get("amount")
        order_type = data.get("orderType")
        order_id = data.get("orderId")
        account_reference = data.get("accountReference")
        
        # Validate required fields
        if not all([phone_number, amount, order_type, order_id, account_reference]):
            return {"error": "Missing required fields for M-Pesa payment"}
        
        # Format phone number if needed (remove + and ensure it starts with 254)
        if phone_number.startswith("+"):
            phone_number = phone_number[1:]
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        
        # Generate transaction description
        transaction_desc = f"Payment for {order_type} #{order_id}"
        
        # Initiate STK Push
        result = initiate_stk_push(phone_number, amount, account_reference, transaction_desc)
        
        return result
    except Exception as e:
        print("Exception handling STK push request:", e)
        return {"error": f"Exception: {str(e)}"}

# Function to handle callback from M-Pesa
def handle_mpesa_callback(data):
    """Handle callback from M-Pesa"""
    try:
        # Log the callback data
        print("M-Pesa callback data:", json.dumps(data, indent=2))
        
        # Process the callback data
        # In a production system, you would update your database with the payment status
        
        return {"success": True}
    except Exception as e:
        print("Exception handling M-Pesa callback:", e)
        return {"error": f"Exception: {str(e)}"}
