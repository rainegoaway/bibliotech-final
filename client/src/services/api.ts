import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://192.168.1.9:3000/api'; //change ip as needed (jru hyflex ip: 17.17.5.182, wifi: 14.14.8.202, home ip: 192.168.1.5)


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
    // Temporarily disabled error logging for demo purposes
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
  
  searchBooks: (query: string) =>
    api.get('/books/search', { params: { q: query } }),
  
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

  getMyPreferences: () =>
    api.get('/users/my-preferences'),
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
  
  setMySubjects: (subjectIds: number[]) =>
    api.put('/subjects/my-subjects', { subjectIds }),
  
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
  
  getBorrowHistory: () =>
    api.get('/borrows/history'),

  getOverdueBorrows: () =>
    api.get('/borrows/overdue'),
};

// Reservations API
export const reservationsAPI = {
  // Get user's reservations
  getMyReservations: () =>
    api.get('/reservations/my-reservations'),
  
  // Reserve a book
  reserveBook: (bookId: number) =>
    api.post('/reservations', { bookId }),
  
  // Cancel reservation
  cancelReservation: (reservationId: number) =>
    api.delete(`/reservations/${reservationId}`),
};

export const notificationsAPI = {
  getNotifications: () =>
    api.get('/notifications'),
  markNotificationAsRead: (id: number) =>
    api.post(`/notifications/${id}/read`),
};

export default api;