
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
      // Create a temporary dev user
      const devEmail = `dev-${Date.now()}@temp.com`;
      const devPassword = "devpass123";
      
      console.log('Creating dev user:', devEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          // Skip email confirmation for dev users
          data: {
            email_confirm: true,
          }
        }
      });
      
      if (error) {
        // If signup fails, try to sign in (user might already exist)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: devEmail,
          password: devPassword,
        });
        
        if (signInError) {
          throw signInError;
        }
      }
      
      toast({
        title: "Developer Login Successful",
        description: "You've been signed in with a temporary developer account.",
      });
      
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

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
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
