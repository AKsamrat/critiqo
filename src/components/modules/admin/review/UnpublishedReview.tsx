"use client"
import { reviewUpdateByAdmin } from "@/services/AdminReview";
import { TAdminReview } from "@/types/adminreview";
import { Check, Star, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Add this interface for the API response
interface ReviewsApiResponse {
  reviews: TAdminReview[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Enhanced service function with proper parameter handling
const fetchPublishedReviews = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  additionalParams?: Record<string, any>
): Promise<ReviewsApiResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: 'UNPUBLISHED',
    ...(search && { title: search.trim() }),
    ...(additionalParams && Object.entries(additionalParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>))
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/reviews?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add authorization header if needed
      // 'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch reviews: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  console.log(data)

  // Ensure we return the expected structure
  return {
    reviews: data.reviews || data.data || [],
    totalCount: data?.meta?.total || data.total || 0,
    totalPages: Math.ceil((data?.meta?.total || 0) / limit),
    currentPage: data?.meta?.pages || page,
  };
};

interface PublishedReviewProps {
  initialReviewData?: any;
  defaultPage?: number;
  defaultLimit?: number;
  defaultSearch?: string;
  additionalFilters?: Record<string, any>;
}

const UnPublishedReview = ({
  initialReviewData,
  defaultPage = 1,
  defaultLimit = 10,
  defaultSearch = "",
  additionalFilters = {}
}: PublishedReviewProps) => {
  const [reviews, setReviews] = useState<TAdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(defaultLimit);
  const [filters, setFilters] = useState(additionalFilters);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews data with comprehensive parameter handling
  const fetchReviews = async (
    page: number = currentPage,
    search: string = searchTerm,
    limit: number = itemsPerPage,
    additionalParams: Record<string, any> = filters
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching reviews with params:', {
        page,
        limit,
        search,
        additionalParams
      });

      const data = await fetchPublishedReviews(page, limit, search, additionalParams);

      console.log('Fetched data:', data);

      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setCurrentPage(data.currentPage);

    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      setError(error.message || "Failed to fetch reviews");
      toast.error("Failed to fetch reviews");

      // Fallback to initial data if provided
      if (initialReviewData && Array.isArray(initialReviewData)) {
        const filteredReviews = initialReviewData.filter((r: any) => r.status === "PUBLISHED");
        setReviews(filteredReviews);
        setTotalCount(filteredReviews.length);
        setTotalPages(Math.ceil(filteredReviews.length / limit));
        setCurrentPage(1);
      } else {
        setReviews([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load with URL params support
  useEffect(() => {
    // Check for URL parameters if needed
    const urlParams = new URLSearchParams(window.location.search);
    const urlPage = urlParams.get('page');
    const urlSearch = urlParams.get('search');
    const urlLimit = urlParams.get('limit');

    const initialPage = urlPage ? parseInt(urlPage) : defaultPage;
    const initialSearch = urlSearch || defaultSearch;
    const initialLimit = urlLimit ? parseInt(urlLimit) : defaultLimit;

    if (initialPage !== defaultPage) setCurrentPage(initialPage);
    if (initialSearch !== defaultSearch) setSearchTerm(initialSearch);
    if (initialLimit !== defaultLimit) setItemsPerPage(initialLimit);

    fetchReviews(initialPage, initialSearch, initialLimit, additionalFilters);
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews(1, searchTerm, itemsPerPage, filters);

      // Update URL if needed (optional)
      updateURLParams({ page: 1, search: searchTerm });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle items per page change
  useEffect(() => {
    setCurrentPage(1);
    fetchReviews(1, searchTerm, itemsPerPage, filters);

    // Update URL if needed (optional)
    updateURLParams({ page: 1, limit: itemsPerPage });
  }, [itemsPerPage]);

  // Handle filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      setCurrentPage(1);
      fetchReviews(1, searchTerm, itemsPerPage, filters);
    }
  }, [filters]);

  // Optional: Update URL parameters
  const updateURLParams = (params: Record<string, any>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '') {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    });

    // Update URL without page refresh
    window.history.replaceState({}, '', url.toString());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  type ReviewStatus = "PUBLISHED" | "UNPUBLISHED" | "DRAFT" | "pending";

  const handleStatusChange = async (
    reviewId: string,
    newStatus: ReviewStatus
  ) => {
    try {
      const res = await reviewUpdateByAdmin(reviewId, {
        status: newStatus,
        moderationNote: `Status changed to ${newStatus} by admin`,
      });

      if (res?.success) {
        // If changing from PUBLISHED to another status, remove from list
        if (newStatus !== "PUBLISHED") {
          setReviews((prevReviews) =>
            prevReviews.filter((review) => review.id !== reviewId)
          );
          setTotalCount(prev => prev - 1);
        } else {
          // Update the review in the list
          setReviews((prevReviews) =>
            prevReviews.map((review) =>
              review.id === reviewId
                ? {
                  ...review,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
                : review
            )
          );
        }
        toast.success(`Review status changed successfully to "${newStatus}"`);
      } else {
        toast.error("Failed to update review status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error.message);
      toast.error("Something went wrong while changing review status");
    }
  };

  const togglePremiumStatus = async (reviewId: string) => {
    const review = reviews.find((r: any) => r.id === reviewId);
    if (!review) return;

    const newIsPremium = !review.isPremium;

    try {
      const data = {
        isPremium: newIsPremium,
        moderationNote: newIsPremium
          ? "Excellent in-depth review that provides premium value"
          : "Reverted to free review",
      };

      const res = await reviewUpdateByAdmin(reviewId, data);

      if (res?.success) {
        toast.success(`Review ${newIsPremium ? 'marked as' : 'removed from'} premium`);

        setReviews((prevReviews) =>
          prevReviews.map((r) =>
            r.id === reviewId
              ? {
                ...r,
                isPremium: newIsPremium,
                premiumPrice: newIsPremium ? r.premiumPrice || 4.99 : null,
              }
              : r
          )
        );
      }
    } catch (error: any) {
      console.error("Toggle premium error:", error.message);
      toast.error("Failed to update premium status");
    }
  };

  const Badge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      PUBLISHED: "bg-green-100 text-green-800",
      UNPUBLISHED: "bg-red-100 text-red-800",
      pending: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  // FIXED: Improved handlePageChange function
  const handlePageChange = (page: number) => {
    console.log(`Attempting to change to page ${page}, current: ${currentPage}, total: ${totalPages}`);

    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      console.log(`Changing to page ${page}`);
      setCurrentPage(page);
      fetchReviews(page, searchTerm, itemsPerPage, filters);

      // Update URL parameter
      updateURLParams({ page });

      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log(`Page change blocked - page: ${page}, valid range: 1-${totalPages}, current: ${currentPage}, loading: ${loading}`);
    }
  };

  // Add method to reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setItemsPerPage(defaultLimit);
    setFilters({});
    fetchReviews(1, "", defaultLimit, {});
    updateURLParams({ page: null, search: null, limit: null });
  };

  // FIXED: Improved generatePageNumbers function
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold">All UnPublished Reviews</h2>
        <div className="text-sm text-gray-600">
          Total: {totalCount} reviews
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title, author name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>

          {(searchTerm || Object.keys(filters).length > 0) && (
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={() => fetchReviews(currentPage, searchTerm, itemsPerPage, filters)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Reviews Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premium
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : reviews.length > 0 ? (
              reviews.map((review: TAdminReview) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {review.title}
                    </div>
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {review.author}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={review.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePremiumStatus(review.id)}
                      className={`inline-flex h-5 w-10 rounded-full transition duration-200 ease-in-out ${review.isPremium ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${review.isPremium ? "translate-x-5" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <button
                      title="Keep Published"
                      onClick={() => handleStatusChange(review.id, "PUBLISHED")}
                      className="text-green-600 hover:text-green-900 transition-colors"
                    >
                      <Check size={20} className="inline" />
                    </button>
                    <button
                      title="Unpublish"
                      onClick={() =>
                        handleStatusChange(review.id, "UNPUBLISHED")
                      }
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <X size={20} className="inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-sm py-8 text-gray-500"
                >
                  {searchTerm ? `No reviews found matching "${searchTerm}"` : "No published reviews found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FIXED: Improved Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          {/* Pagination Info */}
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`flex items-center gap-1 px-3 py-2 rounded border text-sm transition-colors ${currentPage === 1 || loading
                ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {generatePageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`px-3 py-2 rounded text-sm border transition-colors ${currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : loading
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                      }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 py-2 text-gray-500 text-sm">
                    {page}
                  </span>
                )
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`flex items-center gap-1 px-3 py-2 rounded border text-sm transition-colors ${currentPage === totalPages || loading
                ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50"
                : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default UnPublishedReview;