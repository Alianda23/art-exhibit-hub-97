
// This file contains functions for interacting with M-Pesa payment system

/**
 * Initiates M-Pesa payment
 * @param phoneNumber The phone number to send STK push
 * @param amount The amount to charge
 * @param orderType Whether it's for artwork or exhibition
 * @param referenceId The ID of the item (artwork or exhibition)
 * @param userId The ID of the user making the payment
 * @param accountReference Reference for the transaction
 * @returns Promise with the response from the STK push request
 */
export const initiateMpesaPayment = async (
  phoneNumber: string,
  amount: number,
  orderType: 'artwork' | 'exhibition',
  referenceId: string,
  userId: string,
  accountReference: string
) => {
  try {
    console.log(`Initiating M-Pesa payment: ${amount} for ${orderType} (${referenceId})`);
    
    // Format phone number if needed (remove + and ensure starts with 254)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('+')) {
      formattedPhone = phoneNumber.substring(1);
    }
    if (phoneNumber.startsWith('0')) {
      formattedPhone = `254${phoneNumber.substring(1)}`;
    }
    
    const response = await fetch('http://localhost:8000/mpesa/stk-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        amount,
        orderType,
        itemId: referenceId,
        userId,
        accountReference
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment initiation failed');
    }
    
    const data = await response.json();
    console.log('STK push response:', data);
    return data;
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    return { error: error instanceof Error ? error.message : 'Failed to initiate payment' };
  }
};

/**
 * Checks the status of an M-Pesa transaction
 * @param checkoutRequestId The checkout request ID from the STK push
 * @returns Promise with the transaction status
 */
export const checkPaymentStatus = async (checkoutRequestId: string) => {
  try {
    console.log(`Checking payment status for checkout request: ${checkoutRequestId}`);
    
    const response = await fetch(`http://localhost:8000/mpesa/status/${checkoutRequestId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check payment status');
    }
    
    const data = await response.json();
    console.log('Payment status response:', data);
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return { error: error instanceof Error ? error.message : 'Failed to check payment status' };
  }
};
