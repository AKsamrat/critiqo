"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown } from "lucide-react";
import img1 from "../../../assets/faq2.png";

const faqs = [
  {
    question: "How do I submit a review?",
    answer:
      "You can submit a review by signing up, finding the product or service, and clicking the 'Write a Review' button.",
  },
  {
    question: "Are the reviews verified?",
    answer:
      "We use a mix of automated tools and manual checks to verify that reviews are authentic and not spam.",
  },
  {
    question: "Can I edit or delete my review?",
    answer:
      "Yes, log into your account, go to your profile, and you'll see options to edit or delete your reviews.",
  },
  {
    question: "Is there a rating system?",
    answer:
      "Yes, users rate items from 1 to 5 stars and can also leave a written comment for more detail.",
  },
  {
    question: "Do you accept paid reviews?",
    answer:
      "No, we do not allow paid or sponsored reviews. All opinions must be honest and unbiased.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="max-w-7xl mx-auto px-1.5 py-12 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* FAQ Section */}
        <div>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Frequently Asked Questions
          </h2>

          {!Array.isArray(faqs) || faqs.length === 0 ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>No FAQs available or data is invalid.</p>
            </div>
          ) : (
            faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-4 border-b border-gray-200 pb-4 transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-800 hover:text-indigo-600 transition"
                >
                  {faq.question}
                  <ChevronDown
                    className={`h-5 w-5 transform transition-transform duration-300 ${openIndex === index ? "rotate-180 text-indigo-600" : ""
                      }`}
                  />
                </button>

                {openIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-gray-600 text-base"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Animated Image Section */}
        <motion.div
          initial={{ x: 10 }}
          animate={{ x: -10 }}
          whileHover={{ x: 0 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.8,
            ease: "easeInOut",
          }}
          className="flex justify-center"
        >
          <Image
            src={img1}
            alt="FAQ illustration"
            width={420}
            height={500}
            className="rounded-xl object-contain "
          />
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
