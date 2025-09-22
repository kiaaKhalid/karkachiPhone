"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
}

const mockReviews: Review[] = [
  {
    id: "rev1",
    author: "Alice Smith",
    rating: 5,
    comment: "Absolutely love this product! Exceeded my expectations.",
    date: "2023-10-26",
  },
  {
    id: "rev2",
    author: "Bob Johnson",
    rating: 4,
    comment: "Great value for money. The battery life could be better, but overall very satisfied.",
    date: "2023-10-20",
  },
  {
    id: "rev3",
    author: "Charlie Brown",
    rating: 5,
    comment: "Sleek design and powerful performance. Highly recommend!",
    date: "2023-10-15",
  },
];

export default function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);

  const handleSubmitReview = () => {
    if (newReview.trim() === "" || newRating === 0) {
      alert("Please provide a rating and a comment.");
      return;
    }

    const review: Review = {
      id: `rev${reviews.length + 1}`,
      author: "Anonymous User", // In a real app, get authenticated user's name
      rating: newRating,
      comment: newReview,
      date: new Date().toISOString().split("T")[0],
    };

    // In a real app, this would send the review to the server
    setReviews([...reviews, review]);
    setNewReview("");
    setNewRating(0);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          review.rating > i ? "fill-current" : "fill-gray-300 dark:fill-gray-600",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 font-medium">{review.author}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 ml-auto">{review.date}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </div>
            ))
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating:</label>
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-6 h-6 cursor-pointer",
                      newRating > i
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600",
                      "hover:fill-yellow-400 hover:text-yellow-400 transition-colors",
                    )}
                    onClick={() => setNewRating(i + 1)}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your thoughts on this product..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={4}
              className="mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
            />
            <Button onClick={handleSubmitReview} className="w-full">
              Submit Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}