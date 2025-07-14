
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { exportToExcel } from "../utils/exportToExcel";

interface EMICalculatorProps {
  amount?: number; // in rupees
  tenure?: number; // in months
  interestRate?: number; // in percent
}

const EMICalculator: React.FC<EMICalculatorProps> = ({ amount, tenure, interestRate }) => {
  // console.log("amount", amount);
  // console.log("tenure", tenure);
  // console.log("interestRate", interestRate);
  // If props are provided, use them as initial values, else use defaults
  const [emi, setEmi] = useState(23000);
  const [tenureState, setTenure] = useState(tenure ?? 360);
  const [amountState, setAmount] = useState(amount ? Math.round(amount / 100000) : 53); // store in lakhs for slider
  const [interestRateState, setInterestRate] = useState(interestRate ?? 8.15);
  const [showSummary, setShowSummary] = useState(false);

  const calculateEMI = () => {
    const principal = amountState * 100000; // Convert lakhs to rupees
    const monthlyRate = interestRateState / (12 * 100);
    const calculatedEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureState)) / (Math.pow(1 + monthlyRate, tenureState) - 1);
    setEmi(Math.round(calculatedEmi));
  };

  useEffect(() => {
    calculateEMI();
    // eslint-disable-next-line
  }, [amountState, tenureState, interestRateState]);

  const totalInterest = (emi * tenureState) - (amountState * 100000);
  const totalPayment = emi * tenureState;
  const principleAmount = amountState * 100000;

  const generateAmortizationSchedule = () => {
    const schedule = [];
    let remainingBalance = amountState * 100000;
    const monthlyRate = interestRateState / (12 * 100);

    for (let month = 1; month <= Math.min(4, tenureState); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(remainingBalance)
      });
    }
    return schedule;
  };

  const generateFullAmortizationSchedule = () => {
    const schedule = [];
    let remainingBalance = amountState * 100000;
    const monthlyRate = interestRateState / (12 * 100);

    for (let month = 1; month <= tenureState; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        Month: month,
        Principal: Math.round(principalPayment),
        Interest: Math.round(interestPayment),
        Balance: Math.round(Math.max(0, remainingBalance))
      });
    }
    return schedule;
  };

  const handleDownloadExcel = () => {
    const fullSchedule = generateFullAmortizationSchedule();
    exportToExcel(
      fullSchedule,
      `EMI_Schedule_${amountState}L_${tenureState}M_${interestRateState}percent`,
      'EMI Schedule'
    );
  };

  const amortizationSchedule = generateAmortizationSchedule();

  return (
    <div className="flex w-full h-full bg-gray-100 dark:bg-gray-900">
      {/* EMI Calculator Section */}
      <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-l-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-purple rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">EMI</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">EMI Calculator</h2>
          </div>
        </div>

        <div className="space-y-6">
          {/* EMI Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">EMI</label>
              <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">₹ {emi.toLocaleString()}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={Math.round((amountState * 100000 * (interestRateState / (12 * 100)) * Math.pow(1 + (interestRateState / (12 * 100)), tenureState)) / (Math.pow(1 + (interestRateState / (12 * 100)), tenureState) - 1) * 0.5)}
                max={Math.round((amountState * 100000 * (interestRateState / (12 * 100)) * Math.pow(1 + (interestRateState / (12 * 100)), tenureState)) / (Math.pow(1 + (interestRateState / (12 * 100)), tenureState) - 1) * 1.5)}
                value={emi}
                onChange={(e) => setEmi(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min</span>
                <span>Max</span>
              </div>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tenure</label>
              <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">{tenureState} months</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="12"
                max="360"
                value={tenureState}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>12 months</span>
                <span>360 months</span>
              </div>
            </div>
          </div>

          {/* Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">₹ {amountState} lakh</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={20}
                max={200}
                value={amountState}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹20 lakh</span>
                <span>₹ 200 lakh</span>
              </div>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interest %</label>
              <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">{interestRateState}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={6}
                max={20}
                step={0.05}
                value={interestRateState}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>6%</span>
                <span>20%</span>
              </div>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex justify-center my-8">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(principleAmount / (principleAmount + totalInterest)) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">₹ {(amountState * 100000).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">₹ {emi.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Monthly EMI</div>
          </div>

          {/* Legend */}
          <div className="flex justify-between bg-brand-purple text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-xs">Principle Amount</div>
                <div className="font-semibold">₹ {principleAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <div className="text-xs">Interest Amount</div>
                <div className="font-semibold">₹ {Math.round(totalInterest).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="w-96 bg-white dark:bg-gray-800 p-6 rounded-r-lg border-l border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Summary</h3>
        </div>

        {/* Summary Table */}
        <div className="space-y-4 mb-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-0">
              <div className="p-3 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">₹ {(amountState * 100000).toLocaleString()}</div>
              </div>
              
              <div className="p-3 border-b border-r border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Tenure</div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{tenureState} months</div>
              </div>
              
              <div className="p-3 border-b border-r border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{interestRateState}%</div>
              </div>
              
              <div className="p-3 border-b border-r border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Interest</div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">₹ {Math.round(totalInterest).toLocaleString()}</div>
              </div>
              
              <div className="p-3 border-b border-r border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Payment</div>
              </div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">₹ {Math.round(totalPayment).toLocaleString()}</div>
              </div>
              
              <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly EMI</div>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">₹ {emi.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Amortization Schedule Section with Details heading and Download button */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Details Header with Download Button */}
          <div className="bg-brand-purple text-white p-3 flex justify-between items-center">
            <h4 className="text-lg font-semibold">Details</h4>
            <Button
              onClick={handleDownloadExcel}
              variant="outline"
              size="sm"
              className="bg-white text-brand-purple hover:bg-gray-100 border-white text-xs h-8 px-3"
            >
              <Download className="w-3 h-3 mr-1" />
              Download in Excel
            </Button>
          </div>
          
          {/* Table Header */}
          <div className="bg-brand-purple/80 text-white p-3">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium">
              <div>Month</div>
              <div>Principle</div>
              <div>Interest</div>
              <div>Balance</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {amortizationSchedule.map((row) => (
              <div key={row.month} className="grid grid-cols-4 gap-2 p-3 text-xs">
                <div className="font-medium text-gray-800 dark:text-gray-100">{row.month}</div>
                <div className="text-gray-600 dark:text-gray-400">{row.principal.toLocaleString()}</div>
                <div className="text-gray-600 dark:text-gray-400">{row.interest.toLocaleString()}</div>
                <div className="text-gray-600 dark:text-gray-400">{row.balance.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
