
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export const useAuthState = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'No session');
        
        // Update state immediately
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully:', session?.user?.email);
          toast({
            title: "Welcome!",
            description: "You have been signed in successfully.",
          });
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }

        // Handle email confirmation
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          if (session?.user?.email_confirmed_at) {
            console.log('Email confirmed for user:', session.user.email);
          }
        }
      }
    );

    // Get initial session after setting up listener
    getInitialSession();

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    handleSignOut,
  };
};
