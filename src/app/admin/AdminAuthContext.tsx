"use client";

import { createContext, useContext } from "react";

export interface AdminAuthContextType {
  adminUsername: string;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUsername: "admin",
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
