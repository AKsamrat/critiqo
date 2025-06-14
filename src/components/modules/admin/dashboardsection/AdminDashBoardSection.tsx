import {
  Star,
  Crown,
  DollarSign,
  Eye,
  Vote,
  DollarSignIcon,
} from "lucide-react";
import HandleLikeUnLineDelete from "../review/HandleLikeUnlineDelete";
import { getAllReviewAdmin } from "@/services/AdminReview";
import { TAdminReview } from "@/types/adminreview";
import { TReview } from "@/types/review";
import { getTotalEarning } from "@/services/Payment";
import DashboardCharts from "./DashboardCharts";

const AdminDashBoardPage = async () => {
  const data = await getAllReviewAdmin();
  const earningRes = await getTotalEarning();
  const totalEarning = earningRes?.data ?? 0;
  const reviewData = data?.data;

  const reviewCounts = reviewData?.reduce(
    (
      acc: { published: number; pending: number; unpublished: number },
      review: TAdminReview
    ) => {
      if (review.status === "PUBLISHED") acc.published += 1;
      else if (review.status === "DRAFT") acc.pending += 1;
      else acc.unpublished += 1;
      return acc;
    },
    { published: 0, pending: 0, unpublished: 0 }
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2  gap-6 mb-6">
            <div className=" flex flex-col">
              <div className="grid grid-cols-2 gap-4">

                {/* Total Reviews */}
                <div className="bg-blue-50 rounded-lg shadow p-6 h-48">
                  <div className="flex flex-col lg:flex-row items-center justify-between mb-4">
                    <h3 className="text-gray-600 text-sm font-medium">
                      Total Reviews
                    </h3>
                    <div className="bg-blue-100 hidden md:flex rounded-full p-2">
                      <Star size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-2xl text-center font-bold text-gray-800">
                      {reviewData?.length}
                    </p>
                  </div>
                  <div className="flex flex-col lg:flex-row mt-4 pt-1 lg:pt-4 border-t border-blue-200 justify-between">
                    <div className="flex flex-row lg:flex-col items-center">
                      <span className="text-xs text-gray-500 pr-1">Published</span>
                      <span className="text-sm font-medium text-green-600">
                        {reviewCounts?.published}
                      </span>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center">
                      <span className="text-xs text-gray-500 pr-1">Pending</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {reviewCounts?.pending}
                      </span>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center">
                      <span className="text-xs text-gray-500 pr-1">Unpublished</span>
                      <span className="text-sm font-medium text-red-600">
                        {reviewCounts?.unpublished}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Premium Review Earnings */}
                <div className="bg-green-50 rounded-lg shadow p-6 h-48">
                  <div className="flex flex-col lg:flex-row items-center justify-between mb-4">
                    <h3 className="text-gray-600 text-sm font-medium">
                      Premium Review Earnings
                    </h3>
                    <div className="bg-green-100 rounded-full p-2">
                      <DollarSignIcon size={20} className="text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-gray-800">
                      ${Number(totalEarning).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="mt-6">
                <DashboardCharts
                  reviewCounts={reviewCounts}
                  totalEarning={totalEarning}
                  totalReviews={reviewData?.length || 0}
                />
              </div>
            </div>

            {/* Top Premium Reviews */}
            <div className="bg-purple-50 rounded-lg shadow p-6 ">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Top Premium Reviews
                </h3>
                <div className="bg-purple-100 rounded-full p-2">
                  <Crown size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="space-y-4">
                {reviewData
                  ?.filter((review: TAdminReview) => review.isPremium)
                  .map((review: TAdminReview, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-purple-200 pb-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 truncate">
                          {review.title}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            <Star
                              size={14}
                              className="text-yellow-500 fill-current"
                            />
                            <span className="ml-1 text-xs text-gray-600">
                              {review.rating}
                            </span>
                          </div>
                          <span className="mx-2 text-gray-300">|</span>
                          <div className="flex items-center">
                            <DollarSign size={14} className="text-green-500" />
                            <span className="ml-1 text-xs text-gray-600">
                              ${review.premiumPrice}
                            </span>
                          </div>
                          <span className="mx-2 text-gray-300">|</span>
                          <div className="flex items-center">
                            <Eye size={14} className="text-blue-500" />
                            <span className="ml-1 text-xs text-gray-600">
                              {review.votes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 mt-2">
                  View All Premium Reviews
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-50 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-100">
              <h3 className="font-medium text-gray-700">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {reviewData?.map((item: TReview, index: number) => (
                <div
                  key={index}
                  className="px-6 py-4 flex items-center justify-between bg-slate-25 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      {item.isPremium === false && (
                        <Star size={16} className="text-blue-500 mr-2" />
                      )}

                      {item.isPremium === true && (
                        <Crown size={16} className="text-purple-500 mr-2" />
                      )}
                      <p className="font-medium text-gray-800">{item.title}</p>
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500">By {item.author}</p>
                      {item.rating && (
                        <>
                          <span className="mx-2 text-gray-300">|</span>
                          <div className="flex items-center">
                            <Star
                              size={14}
                              className="text-yellow-500 fill-current"
                            />
                            <span className="ml-1 text-xs text-gray-600">
                              {item.rating}
                            </span>
                          </div>

                          <span className="mx-2 text-gray-300">|</span>
                          <div className="flex items-center">
                            <Vote
                              size={14}
                              className="text-yellow-500 fill-current"
                            />
                            <span className="ml-1 text-xs text-gray-600">
                              {item.votes}
                            </span>
                          </div>
                        </>
                      )}
                      <span className="mx-2 text-gray-300">|</span>
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const createdDate = new Date(item.createdAt);
                          const now = new Date();
                          const diffTime = Math.abs(
                            now.getTime() - createdDate.getTime()
                          );
                          const diffDays = Math.floor(
                            diffTime / (1000 * 60 * 60 * 24)
                          );

                          if (diffDays === 0) return "Today";
                          if (diffDays === 1) return "1 day ago";
                          return `${diffDays} days ago`;
                        })()}
                      </p>
                    </div>
                  </div>
                  <HandleLikeUnLineDelete id={item.id} />
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-slate-100 text-right">
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                View All Activity
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashBoardPage;