
// M-Pesa API utilities

// M-Pesa credentials
const CONSUMER_KEY = "sMwMwGZ8oOiSkNrUIrPbcCeWIO8UiQ3SV4CyX739uAyZVs1F";
const CONSUMER_SECRET = "A3Hs5zRY3nDCn7XpxPuc1iAKpfy6UDdetiCalIAfuAIpgTROI5yCqqOewDfThh2o";
const API_URL = 'http://localhost:8000';

// Function to initiate STK Push
export const initiateSTKPush = async (
  phoneNumber: string,
  amount: number,
  orderType: 'artwork' | 'exhibition',
  orderId: string,
  accountReference: string
): Promise<any> => {
  try {
    // Format phone number to match M-Pesa requirements (remove '+' if present)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;
    
    const response = await fetch(`${API_URL}/mpesa/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount,
        orderType,
        orderId,
        accountReference
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    throw error;
  }
};

// Function to check transaction status
export const checkTransactionStatus = async (checkoutRequestId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/mpesa/status/${checkoutRequestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('M-Pesa transaction status check error:', error);
    throw error;
  }
};
