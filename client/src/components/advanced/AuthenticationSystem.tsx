import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  CheckCircle,
  Users,
  Crown
} from 'lucide-react';

interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserAccount | null;
  token: string | null;
}

export default function AuthenticationSystem() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });
  
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'users' | 'settings'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  
  // Register form
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateSession(token);
    }
    
    // Load users for demo
    loadUsers();
  }, []);

  useEffect(() => {
    // Calculate password strength
    const password = registerForm.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [registerForm.password]);

  const validateSession = async (token: string) => {
    try {
      // Simulate session validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: UserAccount = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        permissions: ['read', 'write', 'admin', 'manage_users']
      };
      
      setAuthState({
        isAuthenticated: true,
        user: mockUser,
        token
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
    }
  };

  const loadUsers = () => {
    const mockUsers: UserAccount[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        permissions: ['read', 'write', 'admin', 'manage_users']
      },
      {
        id: '2',
        username: 'developer',
        email: 'dev@example.com',
        role: 'user',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        permissions: ['read', 'write']
      },
      {
        id: '3',
        username: 'viewer',
        email: 'viewer@example.com',
        role: 'guest',
        isActive: false,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        permissions: ['read']
      }
    ];
    
    setUsers(mockUsers);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
        const token = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('auth_token', token);
        
        const user = users.find(u => u.username === loginForm.username);
        if (user) {
          setAuthState({
            isAuthenticated: true,
            user,
            token
          });
        }
      } else {
        setFormErrors({ general: 'Invalid username or password' });
      }
    } catch (error) {
      setFormErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (registerForm.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (registerForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }
    
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newUser: UserAccount = {
        id: Date.now().toString(),
        username: registerForm.username,
        email: registerForm.email,
        role: 'user',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        permissions: ['read', 'write']
      };
      
      setUsers(prev => [...prev, newUser]);
      setActiveTab('login');
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setFormErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'user': return <User className="h-4 w-4 text-blue-500" />;
      case 'guest': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (authState.isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getRoleIcon(authState.user?.role || 'user')}
              <span className="font-medium">Welcome, {authState.user?.username}</span>
            </div>
            <Badge variant="outline">{authState.user?.role}</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Permissions</p>
                  <p className="text-2xl font-bold">{authState.user?.permissions.length || 0}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.username}</span>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Last login: {user.lastLogin.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold">Authentication System</h2>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant={activeTab === 'login' ? 'default' : 'outline'}
          onClick={() => setActiveTab('login')}
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Button>
        <Button
          variant={activeTab === 'register' ? 'default' : 'outline'}
          onClick={() => setActiveTab('register')}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Register
        </Button>
      </div>

      {activeTab === 'login' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {formErrors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{formErrors.general}</span>
                </div>
              )}
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Demo: admin / admin123
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'register' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <Input
                  id="reg-username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Choose a username"
                  required
                />
                {formErrors.username && (
                  <p className="text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {registerForm.password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength} className="flex-1" />
                      <span className="text-sm">
                        {passwordStrength === 100 ? 'Strong' : passwordStrength >= 75 ? 'Good' : passwordStrength >= 50 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                  </div>
                )}
                {formErrors.password && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              {formErrors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{formErrors.general}</span>
                </div>
              )}
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}