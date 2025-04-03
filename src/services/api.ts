
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

// Interface for artwork data
interface ArtworkData {
  id?: string;
  title: string;
  artist: string;
  description: string;
  price: number;
  imageUrl: string;
  dimensions?: string;
  medium?: string;
  year?: number;
  status: 'available' | 'sold';
}

// Interface for exhibition data
interface ExhibitionData {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  imageUrl: string;
  totalSlots: number;
  availableSlots: number;
  status: 'upcoming' | 'ongoing' | 'past';
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

// Get all artworks
export const getAllArtworks = async () => {
  try {
    const response = await fetch(`${API_URL}/artworks`);
    if (!response.ok) {
      throw new Error('Failed to fetch artworks');
    }
    const data = await response.json();
    return data.artworks || [];
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
};

// Get a single artwork
export const getArtwork = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/artworks/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artwork');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
};

// Create a new artwork (admin only)
export const createArtwork = async (artworkData: ArtworkData) => {
  return await authFetch('/artworks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(artworkData),
  });
};

// Update an existing artwork (admin only)
export const updateArtwork = async (id: string, artworkData: ArtworkData) => {
  return await authFetch(`/artworks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(artworkData),
  });
};

// Delete an artwork (admin only)
export const deleteArtwork = async (id: string) => {
  return await authFetch(`/artworks/${id}`, {
    method: 'DELETE',
  });
};

// Get all exhibitions
export const getAllExhibitions = async () => {
  try {
    const response = await fetch(`${API_URL}/exhibitions`);
    if (!response.ok) {
      throw new Error('Failed to fetch exhibitions');
    }
    const data = await response.json();
    return data.exhibitions || [];
  } catch (error) {
    console.error('Error fetching exhibitions:', error);
    throw error;
  }
};

// Get a single exhibition
export const getExhibition = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/exhibitions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exhibition');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exhibition:', error);
    throw error;
  }
};

// Create a new exhibition (admin only)
export const createExhibition = async (exhibitionData: ExhibitionData) => {
  return await authFetch('/exhibitions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exhibitionData),
  });
};

// Update an existing exhibition (admin only)
export const updateExhibition = async (id: string, exhibitionData: ExhibitionData) => {
  return await authFetch(`/exhibitions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exhibitionData),
  });
};

// Delete an exhibition (admin only)
export const deleteExhibition = async (id: string) => {
  return await authFetch(`/exhibitions/${id}`, {
    method: 'DELETE',
  });
};
