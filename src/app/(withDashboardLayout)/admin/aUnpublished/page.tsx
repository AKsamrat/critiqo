
import UnpublishedReview from "@/components/modules/admin/review/UnpublishedReview";
import { getAllReviewAdmin } from "@/services/AdminReview";
import React from "react";

const UnPublishedReviewPage = async () => {
  const data = await getAllReviewAdmin();
  const reviews = await data.data;

  let content = null;

  if (reviews?.length > 0) {
    content = <UnpublishedReview reviewData={reviews} />;
  } else {
    content = <p>There are no Data</p>;
  }

  return <>{content}</>;
};

export default UnPublishedReviewPage;
