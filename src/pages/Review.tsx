
import React, { useState } from "react";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ExternalLink, Copy } from "lucide-react";

const Review = () => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);

  const googleReviewLink = "https://www.google.com/search?sca_esv=61e37518a919a791&rlz=1C1VDKB_enIN973IN973&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E7jGhC45FaCl4zPGgq5gyCK7nFr5ErvUhhhwU-PLuelxFVDNky20YXkqqy0-_EmfxLv5v2Wo5fHXMJcrcB-nNHMw-_gfIAD_Iwkb9n3u7l9j1iqijd0od-lKylr2y3lcy_Bmmirh8zrr-6W2OS9QDhwE5xxRYB4VfHlz7O7ZdrwGm8k81A%3D%3D&q=Loan+For+India+-+SBI+Home+Loan+%26+HDFC+Home+Loan+provider+In+Mumbai+Reviews&sa=X&ved=2ahUKEwiDscDmpIeOAxXKcGwGHbwIDyIQ0bkNegQINhAE&biw=1536&bih=730&dpr=1.25";

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    
    if (review.trim() === "") {
      toast.error("Please enter your review");
      return;
    }
    
    // Here we would submit the review to backend
    toast.success("Thank you for your feedback!");
    setRating(0);
    setReview("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const suggestionTexts = [
    "Customer Name: Sales-Executive\nThe dashboard is super intuitive! I could track my loan status, view disbursement history, and filter data without any hassle.\nLoved the minimal design.",
    "Customer Name: Sales-Executive\nThe dashboard is super intuitive! I could track my loan status, view disbursement history, and filter data without any hassle.\nLoved the minimal design.",
    "Customer Name: Sales-Executive The dashboard is super intuitive! I could track my loan status, view disbursement history, and filter data without any hassle. Loved the minimal design."
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Rate Your Experience</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We value your feedback. Your review helps us improve our services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Review Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Leave a review for Loan for India</h2>
                
                {/* Star Rating */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Rate your overall experience</p>
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-8 w-8 ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300 dark:text-gray-600"
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Review Text */}
              <div>
                <label htmlFor="review" className="block text-sm font-medium mb-2">
                  Write your review
                </label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience with Loan for India..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitReview}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  Submit Review
                </Button>
              </div>

              {/* Google Review Link */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a 
                    href={googleReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View or Submit Review on Google
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Our Suggestions */}
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Our suggestions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copy the suggested review and paste it in the Google link
              </p>
            </div>

            <div className="space-y-4">
              {suggestionTexts.map((text, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">
                    {text}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Review;
