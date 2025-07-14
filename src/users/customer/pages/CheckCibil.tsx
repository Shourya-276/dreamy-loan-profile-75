import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CheckCibil = () => {
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    aadhaar: "",
    pan: "",
    gender: "",
    dateOfBirth: undefined as Date | undefined,
  });

  const [showResults, setShowResults] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [animateCircle, setAnimateCircle] = useState(false);

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckCibil = () => {
    setShowResults(true);
    setAnimateScore(false);
    setDisplayScore(0);
    setAnimateCircle(false);
    
    // Start animation after a short delay
    setTimeout(() => {
      setAnimateScore(true);
      setAnimateCircle(true);
      
      // Animate score counting up
      let currentScore = 0;
      const targetScore = 790;
      const increment = targetScore / 60; // 60 frames for smooth animation
      
      const scoreInterval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          currentScore = targetScore;
          clearInterval(scoreInterval);
        }
        setDisplayScore(Math.round(currentScore));
      }, 16); // ~60fps
    }, 300);
  };

  const handleClear = () => {
    setFormData({
      name: "",
      middleName: "",
      lastName: "",
      email: "",
      mobile: "",
      aadhaar: "",
      pan: "",
      gender: "",
      dateOfBirth: undefined,
    });
    setShowResults(false);
    setAnimateScore(false);
    setDisplayScore(0);
    setAnimateCircle(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-sm font-medium">Personal details</span>
              </div>
              <div className="w-16 h-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">CIBIL Records</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Personal Details (One free CIBIL report every year.)</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name*</label>
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Middle Name</label>
              <Input
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address*</label>
              <Input
                placeholder="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number*</label>
              <Input
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aadhar Number</label>
              <Input
                placeholder="Aadhar Number"
                value={formData.aadhaar}
                onChange={(e) => handleInputChange("aadhaar", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Card Number</label>
              <Input
                placeholder="PAN Card Number"
                value={formData.pan}
                onChange={(e) => handleInputChange("pan", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gender*</label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth*</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => handleInputChange("dateOfBirth", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleCheckCibil} className="bg-brand-purple hover:bg-brand-purple/90">
              Check Cibil
            </Button>
          </div>

          {showResults && (
            <div className="border-t pt-8">
              <div className="text-center">
                <div className="relative w-80 h-48 mx-auto mb-6">
                  <svg className="w-full h-full" viewBox="0 0 320 200" style={{ overflow: 'visible' }}>
                    {/* Define gradients for professional colors */}
                    <defs>
                      <linearGradient id="poorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="fairGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#ca8a04" />
                      </linearGradient>
                      <linearGradient id="excellentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      
                      {/* Blue gradient for arrow */}
                      <linearGradient id="blueArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      
                      {/* Arrow shadow filter */}
                      <filter id="arrowShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
                      </filter>
                    </defs>
                    
                    {/* Semi-circle background track with subtle shadow */}
                    <path
                      d="M 60 160 A 100 100 0 0 1 260 160"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}
                    />
                    
                    {/* Poor range (red gradient) - 300-579 */}
                    <path
                      d="M 60 160 A 100 100 0 0 1 120 70"
                      stroke="url(#poorGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        animateCircle ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transitionDelay: '0.2s',
                        filter: 'drop-shadow(0 1px 3px rgba(239,68,68,0.3))'
                      }}
                    />
                    
                    {/* Fair range (orange gradient) - 580-669 */}
                    <path
                      d="M 120 70 A 100 100 0 0 1 160 60"
                      stroke="url(#fairGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        animateCircle ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transitionDelay: '0.4s',
                        filter: 'drop-shadow(0 1px 3px rgba(245,158,11,0.3))'
                      }}
                    />
                    
                    {/* Good range (yellow gradient) - 670-739 */}
                    <path
                      d="M 160 60 A 100 100 0 0 1 200 70"
                      stroke="url(#goodGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        animateCircle ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transitionDelay: '0.5s',
                        filter: 'drop-shadow(0 1px 3px rgba(234,179,8,0.3))'
                      }}
                    />
                    
                    {/* Excellent range (green gradient) - 740-900 */}
                    <path
                      d="M 200 70 A 100 100 0 0 1 260 160"
                      stroke="url(#excellentGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${
                        animateCircle ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transitionDelay: '0.6s',
                        filter: 'drop-shadow(0 1px 3px rgba(34,197,94,0.3))'
                      }}
                    />
                    
                    {/* Complete blue arrow pointer - positioned for score 790 */}
                    <g 
                      className={`transition-all duration-1500 ease-out ${
                        animateCircle ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        transform: animateCircle ? 'rotate(65deg)' : 'rotate(-90deg)',
                        transformOrigin: '160px 160px',
                        transitionDelay: '0.8s'
                      }}
                    >
                      {/* Complete modern arrow pointer with blue color */}
                      <path
                        d="M 160 160 L 155 85 L 160 75 L 165 85 Z"
                        fill="url(#blueArrowGradient)"
                        stroke="#1d4ed8"
                        strokeWidth="1"
                        strokeLinejoin="round"
                        filter="url(#arrowShadow)"
                      />
                      
                      {/* Center hub with blue gradient */}
                      <circle
                        cx="160"
                        cy="160"
                        r="6"
                        fill="url(#blueArrowGradient)"
                        stroke="#1d4ed8"
                        strokeWidth="2"
                        filter="url(#arrowShadow)"
                      />
                    </g>
                  </svg>
                </div>
                
                {/* Score display below the gauge */}
                <div className={`mb-4 transition-all duration-500 ${
                  animateScore ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`} style={{ transitionDelay: '1s' }}>
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {displayScore}
                  </div>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 transition-all duration-500 ${
                  animateScore ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`} style={{ transitionDelay: '1.2s' }}>
                  Your Credit Score is Excellent
                </h3>
                <p className={`text-gray-600 dark:text-gray-400 mb-4 transition-all duration-500 ${
                  animateScore ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`} style={{ transitionDelay: '1.4s' }}>
                  Updated 30-05-2025
                </p>
                <Button 
                  variant="outline" 
                  className={`inline-flex items-center gap-2 transition-all duration-500 ${
                    animateScore ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: '1.6s' }}
                >
                  <Download className="w-4 h-4" />
                  Reports
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckCibil;
