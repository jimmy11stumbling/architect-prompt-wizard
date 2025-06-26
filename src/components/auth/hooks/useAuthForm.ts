
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
      }
      
      // Clear form
      setEmail("");
      setPassword("");
      
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = "An error occurred during authentication";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSignUp,
    setIsSignUp,
    authLoading,
    handleAuth,
  };
};
