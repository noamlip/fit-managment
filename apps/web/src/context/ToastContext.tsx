import React, { createContext, useCallback, useContext, type ReactNode } from 'react';
import { toast, type ToastOptions } from 'react-toastify';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
    addToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const opts = (kind: ToastKind): ToastOptions => ({
    type: kind === 'error' ? 'error' : kind === 'success' ? 'success' : kind === 'warning' ? 'warning' : 'info',
});

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const addToast = useCallback((message: string, kind: ToastKind = 'info') => {
        toast(message, opts(kind));
    }, []);

    return <ToastContext.Provider value={{ addToast }}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
