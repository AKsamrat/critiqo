// app/category/[categoryName]/page.tsx

import LatestReviewCard from '@/components/cards/LatestReviewCards';
import { getAllReview } from '@/services/Review';



interface Props {
  params: {
    categoryName: string;
  };
}

export default async function CategoryPage({ params }: Props) {
  const products = await getAllReview();
  const reviews: any[] = products.data;

  const filteredReviews = reviews.filter(
    (review) => review.category === params.categoryName
  );

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-xl font-bold mb-4">Reviews in {params.categoryName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((product) => (
            <LatestReviewCard key={product.id} review={product}></LatestReviewCard>
          ))
        ) : (
          <p>No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
