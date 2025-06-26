
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
      // Create a more unique dev user
      const timestamp = Date.now();
      const devEmail = `dev-${timestamp}@temp.com`;
      const devPassword = "devpass123";
      
      console.log('Creating dev user:', devEmail);
      
      // First try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          // Skip email confirmation for dev users
          emailRedirectTo: window.location.origin,
          data: {
            email_confirm: true,
          }
        }
      });
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        // If signup fails, try to sign in with a generic dev account
        const genericEmail = "dev@temp.com";
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: genericEmail,
          password: devPassword,
        });
        
        if (signInError) {
          // Create the generic dev account
          const { error: genericSignUpError } = await supabase.auth.signUp({
            email: genericEmail,
            password: devPassword,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email_confirm: true,
              }
            }
          });
          
          if (genericSignUpError) {
            throw genericSignUpError;
          }
          
          // Now sign in with the generic account
          const { error: finalSignInError } = await supabase.auth.signInWithPassword({
            email: genericEmail,
            password: devPassword,
          });
          
          if (finalSignInError) {
            throw finalSignInError;
          }
        }
      }
      
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Developer Login Successful",
        description: "You've been signed in with a temporary developer account.",
      });
      
      // Force a session check
      const { data: session } = await supabase.auth.getSession();
      console.log('Developer login session:', session);
      
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
          {loading ? "Creating dev session..." : "Developer Login"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeveloperBypass;
