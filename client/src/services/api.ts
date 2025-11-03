import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://14.14.8.202:3000/api'; //change ip as needed (jru hyflex ip: 17.17.5.182, home ip: 192.168.1.5)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (school_id: string, password: string, role: string) => 
    api.post('/auth/login', { school_id, password, role }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  changePassword: (oldPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// Books API
export const booksAPI = {
  getAllBooks: (params?: any) => 
    api.get('/books', { params }),
  
  getBookById: (id: number) => 
    api.get(`/books/${id}`), // ✅ Fixed: parenthesis + template literal
  
  createBook: (bookData: any) =>
    api.post('/books', bookData),
  
  updateBook: (id: number, bookData: any) =>
    api.put(`/books/${id}`, bookData), // ✅ Fixed
  
  deleteBook: (id: number) =>
    api.delete(`/books/${id}`), // ✅ Fixed
};

// Users API
export const usersAPI = {
  getAllUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUserById: (id: number) =>
    api.get(`/users/${id}`), // ✅ Fixed
  
  createUser: (userData: any) =>
    api.post('/users', userData),
  
  updateUser: (id: number, userData: any) =>
    api.put(`/users/${id}`, userData), // ✅ Fixed
  
  deleteUser: (id: number) =>
    api.delete(`/users/${id}`), // ✅ Fixed
  
  resetPassword: (userId: number) => 
    api.post(`/users/${userId}/reset-password`), // ✅ Fixed
  
  getMyBooks: () => 
    api.get('/users/my-books'),
  
  getMyFines: () => 
    api.get('/users/my-fines'),

  getUserProfile: () =>
    api.get('/users/profile'),
};

// Genres API
export const genresAPI = {
  getAllGenres: () =>
    api.get('/genres'),
  
  getMyGenres: () =>
    api.get('/genres/my-genres'),
  
  setMyGenres: (genreIds: number[]) =>
    api.post('/genres/my-genres', { genreIds }),
  
  getRecommendations: (type?: string, limit?: number) =>
    api.get('/genres/recommendations', { params: { type, limit } }),
};

// Subjects API
export const subjectsAPI = {
  getAllSubjects: () =>
    api.get('/subjects'),
  
  getMySubjects: () =>
    api.get('/subjects/my-subjects'),
  
  getCourses: () =>
    api.get('/subjects/courses'),
};

// Borrows API
export const borrowsAPI = {
  // Get user's borrowed books
  getMyBorrows: () =>
    api.get('/borrows/my-books'),
  
  // Borrow a book
  borrowBook: (bookId: number) =>
    api.post(`/borrows/borrow/${bookId}`),
  
  // Return a book
  returnBook: (borrowId: number) =>
    api.post(`/borrows/return/${borrowId}`),
  
  // Renew a book
  renewBook: (borrowId: number) =>
    api.post(`/borrows/renew/${borrowId}`),
  
  // Get user's reservations
  getMyReservations: () =>
    api.get('/borrows/my-reservations'),

  getBorrowHistory: () =>
    api.get('/borrows/history'),
  
  // Reserve a book
  reserveBook: (bookId: number) =>
    api.post('/borrows/reserve', { bookId }),
  
  // Cancel reservation
  cancelReservation: (reservationId: number) =>
    api.delete(`/borrows/reservations/${reservationId}`),
  
  // Admin: Get overdue borrows
  getOverdueBorrows: () =>
    api.get('/borrows/overdue'),
};

export default api;