import { createContext, useContext, useState } from 'react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) { const [toast, setToast] = useState(null); const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); }; return <ToastContext.Provider value={showToast}>{children}{toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}</ToastContext.Provider>; }
export const useToast = () => useContext(ToastContext);
