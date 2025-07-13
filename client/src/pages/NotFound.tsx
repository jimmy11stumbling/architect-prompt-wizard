import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-blue-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
        <p className="text-slate-300 mb-4 max-w-md">
          The page you're looking for doesn't exist. Redirecting to home...
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
          <span className="text-slate-400">Auto-redirecting in 3 seconds</span>
        </div>
        <Button 
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Go Home Now
        </Button>
      </div>
    </div>
  );
};

export default NotFound;