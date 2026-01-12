import { createContext, useContext, useState } from "react";
import type { PrivateUser } from "../types/user";

type AuthContextType = {
  user: PrivateUser | null;
  setUser: (user: PrivateUser | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PrivateUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
};