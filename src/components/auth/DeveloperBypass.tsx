
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DeveloperBypass: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDevBypass = async () => {
    setLoading(true);
    
    try {
      console.log('Starting developer bypass login...');
      
      // Use a simple, consistent dev account
      const devEmail = "dev@temp.com";
      const devPassword = "devpass123";
      
      // First, try to sign in
      console.log('Attempting to sign in with existing account...');
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });
      
      if (signInError) {
        console.log('Sign in failed:', signInError.message);
        
        // If signin fails due to user not found or invalid credentials, create account
        if (signInError.message.includes("Invalid login credentials")) {
          console.log('Creating new dev account...');
          
          // Create account with email confirmation disabled for dev
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: devEmail,
            password: devPassword,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                dev_account: true
              }
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          console.log('Dev account created:', signUpData);
          
          // If the account was created but needs confirmation, show appropriate message
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            toast({
              title: "Developer Account Created",
              description: "A confirmation email has been sent. For instant access in development, the admin should disable email confirmation in Supabase Auth settings.",
              variant: "default",
            });
            return;
          }
          
          // If account was created and confirmed, try signing in again
          if (signUpData.user && signUpData.user.email_confirmed_at) {
            console.log('Account confirmed, signing in...');
            const { data: finalSignIn, error: finalError } = await supabase.auth.signInWithPassword({
              email: devEmail,
              password: devPassword,
            });
            
            if (finalError) {
              throw finalError;
            }
            
            signInData = finalSignIn;
          }
        } else if (signInError.message.includes("Email not confirmed")) {
          toast({
            title: "Email Confirmation Required",
            description: "The dev account exists but needs email confirmation. Check your email or ask the admin to disable email confirmation in Supabase Auth settings for faster development.",
            variant: "destructive",
          });
          return;
        } else {
          throw signInError;
        }
      }
      
      console.log('Authentication successful:', signInData);
      
      if (signInData?.session && signInData?.user) {
        toast({
          title: "Developer Login Successful",
          description: `Signed in as ${signInData.user.email}`,
        });
        
        // The auth state change listener will handle the redirect
        console.log('Session established, waiting for auth state change...');
      } else {
        throw new Error('No session established after authentication');
      }
      
    } catch (error: any) {
      console.error('Dev bypass error:', error);
      let errorMessage = "Failed to authenticate with developer account";
      
      if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Dev account needs email confirmation. Check email or ask admin to disable email confirmation.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Developer Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show in development environments (not production lovable.app)
  const isProduction = window.location.hostname.includes('lovable.app') && 
                      !window.location.hostname.includes('preview');
  
  if (isProduction) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mt-4 border-orange-200 bg-orange-50">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-orange-700">
          <Code className="h-4 w-4" />
          Developer Mode
        </CardTitle>
        <CardDescription className="text-orange-600">
          Quick login for development (may require email verification)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleDevBypass}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <User className="h-4 w-4 mr-2" />
          {loading ? "Authenticating..." : "Developer Login"}
        </Button>
        <p className="text-xs text-orange-600 mt-2 text-center">
          Note: If login fails due to email confirmation, ask admin to disable email confirmation in Supabase Auth settings.
        </p>
      </CardContent>
    </Card>
  );
};

export default DeveloperBypass;
