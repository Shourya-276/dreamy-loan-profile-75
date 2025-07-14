
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

// const serverUrl = import.meta.env.VITE_SERVER_URL;

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isVerified: boolean;
  role: 'customer' | 'salesmanager' | 'loancoordinator' | 'loanadministrator' | 'connector' | 'superadmin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, mobile: string, password: string) => Promise<boolean>;
  googleSignIn: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("loanForIndiaUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      // console.log("login");
      // console.log(email, password);
      // console.log(serverUrl);
      // console.log(response);
      
      
      // Check user role based on email
      // const isSalesManager = email.includes('@salesmanager.com');
      // const isLoanCoordinator = email.includes('@loancoordinator.com');
      // const isLoanAdministrator = email.includes('@loanadministrator.com');
      // const isConnector = email.includes('@connector.com');
      
      // For demo, accept any valid-looking email with password
      if (email && password.length > 3) {
        const response = await axios.post(serverUrl + '/login', { email, password });
        // const mockUser: User = {
        //   id: "user-" + Math.floor(Math.random() * 1000),
        //   name: email.split("@")[0],
        //   email,
        //   isVerified: true,
        //   role: isSalesManager ? 'salesmanager' : 
        //         isLoanCoordinator ? 'loancoordinator' : 
        //         isLoanAdministrator ? 'loanadministrator' :
        //         isConnector ? 'connector' : 'customer'
        // };
        if(response.status === 200){
          const user: User = {
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            isVerified: true,
            role: response.data.role
          };
          setUser(user);
          localStorage.setItem("loanForIndiaUser", JSON.stringify(user));
          toast.success("Login successful");
          return true;
        }
        else {
          toast.error("Invalid credentials");
          return false;
        }
      } else {
        toast.error("Invalid credentials");
        return false;
      }
      
    } catch (error) {
      console.log(error);
      if(error.response.status === 400){
        toast.error("Invalid credentials");
        return false;
      }
      else {
        toast.error("Login failed");
        return false;
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, mobile: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const serverUrl = import.meta.env.VITE_SERVER_URL;
      const response = await axios.post(serverUrl + '/signup', { name, email, mobile, password });
      console.log(response);
      
      // Check user role based on email
      const isSalesManager = email.includes('@salesmanager.com');
      const isLoanCoordinator = email.includes('@loancoordinator.com');
      const isLoanAdministrator = email.includes('@loanadministrator.com');
      const isConnector = email.includes('@connector.com');
      
      // For demo, accept any valid data
      if (name && email && mobile && password.length > 3) {
        // const mockUser: User = {
        //   id: "user-" + Math.floor(Math.random() * 1000),
        //   name,
        //   email,
        //   mobile,
        //   isVerified: false,
        //   role: isSalesManager ? 'salesmanager' : 
        //         isLoanCoordinator ? 'loancoordinator' : 
        //         isLoanAdministrator ? 'loanadministrator' :
        //         isConnector ? 'connector' : 'customer'
        // };
        if(response.status === 200){
          const user: User = {
            id: response.data.id,
            name: name,
            email: email,
            mobile: mobile,
            isVerified: false,  
            role: response.data.role
          };
          setUser(user);
          localStorage.setItem("loanForIndiaUser", JSON.stringify(user));
          toast.success("Account created successfully");
          return true;
        } 
        else {
          toast.error("Account creation failed");
          return false;
        }
      } else {
        toast.error("Please fill all required fields");
        return false;
      }
      
    } catch (error) {
      if(error.response.status === 400){
        toast.error("Account already exists");
        return false;
      }
      else {
        toast.error("Signup failed");
        return false;
      }

    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store last logged in timestamp
      localStorage.setItem("lastLoggedIn", new Date().toISOString());
      
      const mockUser: User = {
        id: "google-user-" + Math.floor(Math.random() * 1000),
        name: "Google User",
        email: "google.user@gmail.com",
        isVerified: true,
        role: 'customer'
      };
      
      setUser(mockUser);
      localStorage.setItem("loanForIndiaUser", JSON.stringify(mockUser));
      toast.success("Signed in with Google successfully");
      return true;
    } catch (error) {
      toast.error("Google sign in failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("loanForIndiaUser");
    localStorage.removeItem("loanApplication");
    localStorage.removeItem("lastLoggedIn");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    signUp,
    googleSignIn,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};