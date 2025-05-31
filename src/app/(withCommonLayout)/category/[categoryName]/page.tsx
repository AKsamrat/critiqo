import LatestReviewCard from '@/components/cards/LatestReviewCards';
import { getAllReview } from '@/services/Review';


export default async function CategoryPage({ params }: any) {

  const catParams = await params;

  let reviews: any[] = [];

  try {
    const products = await getAllReview();
    // Defensive: Ensure data is an array
    if (Array.isArray(products?.data)) {
      reviews = products.data;
    }
    console.log("reviews", reviews); // check this is not undefined
    console.log("params", params.categoryName);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
  const filteredReviews = reviews.filter(
    (review) => review?.category?.toLowerCase() === catParams?.categoryName?.toLowerCase()
  );
  console.log("filteredReviews", filteredReviews);

  return (
    <div className="max-w-7xl mx-auto py-6 px-2">
      <h1 className="text-xl font-bold mb-4">Reviews in {catParams?.categoryName}</h1>

      <div className='grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>

        {Array.isArray(filteredReviews) && filteredReviews?.length > 0 ? (
          filteredReviews?.map((product) => (
            <LatestReviewCard key={product?.id} review={product} />
          ))
        ) : (
          <p className="text-gray-600">No reviews found in this category.</p>
        )}
      </div>
    </div>
  );
}
