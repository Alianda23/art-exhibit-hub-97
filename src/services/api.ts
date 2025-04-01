
// API service to connect to the Python backend

// Base URL for the API
const API_URL = 'http://localhost:8000';

// Interface for auth responses
interface AuthResponse {
  token?: string;
  user_id?: number;
  admin_id?: number;
  name?: string;
  error?: string;
}

// Interface for registration data
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Interface for login data
interface LoginData {
  email: string;
  password: string;
}

// Helper function to store auth data
const storeAuthData = (data: AuthResponse, isAdmin: boolean) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name || '');
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    
    // Store user or admin ID
    if (data.user_id) {
      localStorage.setItem('userId', data.user_id.toString());
    } else if (data.admin_id) {
      localStorage.setItem('adminId', data.admin_id.toString());
    }
    
    return true;
  }
  
  return false;
};

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      storeAuthData(data, false);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Network error. Please try again.' };
  }
};

// Login a user
export const loginUser = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      storeAuthData(data, false);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Network error. Please try again.' };
  }
};

// Login as admin
export const loginAdmin = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      storeAuthData(data, true);
    }
    
    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    return { error: 'Network error. Please try again.' };
  }
};

// Get the auth token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check if user is an admin
export const isAdmin = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('userId');
  localStorage.removeItem('adminId');
};

// API request with authentication
export const authFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Session expired. Please login again.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};
