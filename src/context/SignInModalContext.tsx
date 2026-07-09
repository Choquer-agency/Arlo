"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SignInModalContextValue {
  isOpen: boolean;
  initialMode: "signIn" | "signUp";
  open: (mode?: "signIn" | "signUp") => void;
  close: () => void;
}

const SignInModalContext = createContext<SignInModalContextValue>({
  isOpen: false,
  initialMode: "signIn",
  open: () => {},
  close: () => {},
});

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"signIn" | "signUp">("signIn");

  const open = useCallback((mode: "signIn" | "signUp" = "signIn") => {
    setInitialMode(mode);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SignInModalContext.Provider value={{ isOpen, initialMode, open, close }}>
      {children}
    </SignInModalContext.Provider>
  );
}

export function useSignInModal() {
  return useContext(SignInModalContext);
}
