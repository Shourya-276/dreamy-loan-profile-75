import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import happyCoupleImage from "../../public/lovable-uploads/ba532ea3-fc3d-42af-9b62-6a559550b93d.png";
import logoImage from "../../public/lovable-uploads/fa221462-754a-4d8b-ba2c-5c28aca42f6c.png";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { login, googleSignIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms & Conditions");
      return;
    }
    
    const success = await login(mobile, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreeTerms) {
      alert("Please agree to the Terms & Conditions");
      return;
    }
    
    const success = await googleSignIn();
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50 dark:bg-gray-900">
      {/* Left section with image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={happyCoupleImage}
          alt="Happy couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-8">
          <img 
            src={logoImage}
            alt="Loan for India"
            className="h-12"
          />
        </div>
      </div>
      
      {/* Right section with login form */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="lg:hidden mb-6">
          <img 
            src={logoImage}
            alt="Loan for India"
            className="h-12"
          />
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img 
              src={logoImage}
              alt="Loan for India Logo"
              className="h-16 mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-brand-purple mb-1">Login Your Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Fast, secure, and easy loan applications start here!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobile">Enter mobile number</Label>
              <Input
                id="mobile"
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full"
                required
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the Terms & Conditions
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90">
              Login
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-blue-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or Login with</span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Continue with Google
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-purple font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
