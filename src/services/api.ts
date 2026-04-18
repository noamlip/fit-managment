import axios from 'axios';
import type { Trainee, AppConfig, FoodItem } from '../types.js';

// Setup base instance
const API = axios.create({
    baseURL: 'http://localhost:5173/api', // Address to our Express server
});

// Configure simple response/error handling if needed
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

// --- TRAINER CONFIGURATION CALLS ---

export const getConfig = async () => {
    const response = await API.get<AppConfig>('/config');
    return response.data;
};

export const updateConfig = async (configData: Partial<AppConfig>) => {
    const response = await API.put<AppConfig>('/config', configData);
    return response.data;
};

// --- TRAINEE CALLS ---

export const getTrainees = async () => {
    const response = await API.get<Trainee[]>('/trainees');
    return response.data;
};

export const getTraineeById = async (id: string) => {
    const response = await API.get<Trainee>(`/trainees/${id}`);
    return response.data;
};

export const createTrainee = async (traineeData: Partial<Trainee>) => {
    const response = await API.post<Trainee>('/trainees', traineeData);
    return response.data;
};

export const updateTrainee = async (id: string, updateData: Partial<Trainee>) => {
    const response = await API.put<Trainee>(`/trainees/${id}`, updateData);
    return response.data;
};

export const deleteTrainee = async (id: string) => {
    const response = await API.delete(`/trainees/${id}`);
    return response.data;
};

// --- FOOD DB CALLS ---

export const getFoodItems = async () => {
    const response = await API.get<FoodItem[]>('/food');
    return response.data;
};

export const createFoodItem = async (foodData: Partial<FoodItem>) => {
    const response = await API.post<FoodItem>('/food', foodData);
    return response.data;
};

export default API;
