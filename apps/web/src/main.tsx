import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ToastProvider>
            <App />
            <ToastContainer theme="dark" position="top-right" />
        </ToastProvider>
    </StrictMode>
);
