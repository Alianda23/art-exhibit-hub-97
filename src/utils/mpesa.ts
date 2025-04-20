
// Utilities for interacting with M-Pesa payment API
import { getToken } from '@/services/api';

const API_URL = 'http://localhost:8000';

// Function to initiate M-Pesa STK Push payment
export const initiateMpesaPayment = async (
  phoneNumber: string,
  amount: number,
  orderType: 'artwork' | 'exhibition',
  orderId: string,
  userId: string,
  accountReference: string
) => {
  try {
    console.log('Initiating M-Pesa payment with:', {
      phoneNumber, amount, orderType, orderId, userId, accountReference
    });
    
    // Format phone number - ensure it starts with 254
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }
    
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
        userId,
        accountReference,
        callbackUrl: 'https://webhook.site/3c1f62b5-4214-47d6-9f26-71c1f4b9c8f0'
      }),
    });
    
    const data = await response.json();
    console.log('M-Pesa STK Push response:', data);
    
    return data;
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    throw error;
  }
};

// Function to check M-Pesa payment status
export const checkPaymentStatus = async (checkoutRequestId: string) => {
  try {
    const response = await fetch(`${API_URL}/mpesa/status/${checkoutRequestId}`);
    const data = await response.json();
    console.log('M-Pesa payment status response:', data);
    return data;
  } catch (error) {
    console.error('Error checking M-Pesa payment status:', error);
    throw error;
  }
};

// Function to generate exhibition ticket
export const generateExhibitionTicket = async (bookingId: string) => {
  try {
    console.log('Generating exhibition ticket for booking ID:', bookingId);
    
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/tickets/generate/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate ticket');
    }
    
    const data = await response.json();
    console.log('Ticket generation response:', data);
    return data;
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw error;
  }
};

// Function to get user orders and tickets
export const getUserOrders = async (userId: string) => {
  try {
    console.log('Getting user orders for user ID:', userId);
    
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user orders');
    }
    
    const data = await response.json();
    console.log('User orders response:', data);
    
    // Structure the response data properly
    const result = {
      orders: data.orders || [],
      tickets: data.tickets || []
    };
    
    return result;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};
