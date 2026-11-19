import { createContext, useContext } from "react";

export interface SidebarContextValue {
  /** Sidebar is in its compressed (icon-only, 60px) mode. */
  collapsed: boolean;
}

export const SidebarContext = createContext<SidebarContextValue>({ collapsed: false });

export const useSidebar = () => useContext(SidebarContext);
