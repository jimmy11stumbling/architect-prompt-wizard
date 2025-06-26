
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
      
      // Try to sign in with a generic dev account first
      const genericEmail = "dev@temp.com";
      const devPassword = "devpass123";
      
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: genericEmail,
        password: devPassword,
      });
      
      if (signInError) {
        console.log('Generic dev account signin failed, creating account:', signInError.message);
        
        // If signin fails, create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: genericEmail,
          password: devPassword,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        console.log('Account created, now signing in...');
        
        // Now try to sign in again
        const { data: finalSignIn, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email: genericEmail,
          password: devPassword,
        });
        
        if (finalSignInError) {
          throw finalSignInError;
        }
        
        signInData = finalSignIn;
      }
      
      console.log('Sign in successful:', signInData);
      
      if (signInData.session) {
        toast({
          title: "Developer Login Successful",
          description: "You've been signed in with a temporary developer account.",
        });
        
        // The auth state change listener will handle the redirect
        console.log('Session established:', signInData.session.user.email);
      } else {
        throw new Error('No session established after signin');
      }
      
    } catch (error: any) {
      console.error('Dev bypass error:', error);
      toast({
        title: "Developer Login Failed",
        description: error.message || "Failed to create developer session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show in all non-production environments (including Lovable preview)
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
          Quick login for development (bypasses email verification)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleDevBypass}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <User className="h-4 w-4 mr-2" />
          {loading ? "Signing in..." : "Developer Login"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeveloperBypass;
