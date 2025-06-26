
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import AuthForm from "./AuthForm";
import { useAuthForm } from "./hooks/useAuthForm";

const AuthCard: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    authLoading,
    handleAuth,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Intelligent Prompt Architect
          </CardTitle>
          <CardDescription>
            Sign in to access your AI-powered document management and prompt generation tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSignUp={isSignUp}
            setIsSignUp={setIsSignUp}
            authLoading={authLoading}
            onSubmit={handleAuth}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard;
