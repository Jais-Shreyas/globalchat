import { createContext, useContext, useRef, useState } from "react";
import { Alert } from "../types/alert";

type AlertContextType = {
  alert: Alert | null;
  showAlert: (alert: Alert) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const timeoutRef = useRef<number | null>(null);

  const [alert, setAlert] = useState<Alert | null>(null);
  const showAlert = (alert: Alert): void => {
    setAlert(alert);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setAlert(null);
      timeoutRef.current = null;
    }, 2500);
  };
  
  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}