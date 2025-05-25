import PublishedReview from "@/components/modules/admin/review/PublishedReview";

import { getAllReviewAdmin } from "@/services/AdminReview";
import React from "react";

const PublishedReviewPage = async () => {
  const data = await getAllReviewAdmin();
  const reviews = await data.data;

  let content = null;

  if (reviews?.length > 0) {
    content = <PublishedReview reviewData={reviews} />;
  } else {
    content = <p>There are no Data</p>;
  }

  return <>{content}</>;
};

export default PublishedReviewPage;
