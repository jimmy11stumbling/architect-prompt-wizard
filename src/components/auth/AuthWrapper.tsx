
import React from "react";
import { useAuthState } from "./hooks/useAuthState";
import LoadingSpinner from "./LoadingSpinner";
import AuthCard from "./AuthCard";
import AuthHeader from "./AuthHeader";

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading, handleSignOut } = useAuthState();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthCard />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader user={user} onSignOut={handleSignOut} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AuthWrapper;
