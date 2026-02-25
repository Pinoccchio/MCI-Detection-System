"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SignInModal } from "./SignInModal";
import { SignUpModal } from "./SignUpModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

type ModalType = "signin" | "signup" | "forgot-password" | null;

interface AuthModalContextValue {
  openSignIn: () => void;
  openSignUp: () => void;
  openForgotPassword: () => void;
  closeModal: () => void;
  activeModal: ModalType;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(
  undefined
);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}

interface AuthModalProviderProps {
  children: ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openSignIn = () => setActiveModal("signin");
  const openSignUp = () => setActiveModal("signup");
  const openForgotPassword = () => setActiveModal("forgot-password");
  const closeModal = () => setActiveModal(null);

  const switchToSignUp = () => setActiveModal("signup");
  const switchToSignIn = () => setActiveModal("signin");
  const switchToForgotPassword = () => setActiveModal("forgot-password");

  return (
    <AuthModalContext.Provider
      value={{
        openSignIn,
        openSignUp,
        openForgotPassword,
        closeModal,
        activeModal,
      }}
    >
      {children}

      {/* Sign In Modal */}
      <SignInModal
        open={activeModal === "signin"}
        onOpenChange={(open) => !open && closeModal()}
        onSwitchToSignUp={switchToSignUp}
        onForgotPassword={switchToForgotPassword}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        open={activeModal === "signup"}
        onOpenChange={(open) => !open && closeModal()}
        onSwitchToSignIn={switchToSignIn}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={activeModal === "forgot-password"}
        onOpenChange={(open) => !open && closeModal()}
        onBackToSignIn={switchToSignIn}
      />
    </AuthModalContext.Provider>
  );
}
