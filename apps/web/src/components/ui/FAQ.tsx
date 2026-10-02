"use client";

import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export function FAQ({ items, className = "" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={`w-full divide-y divide-hairline border-t border-b border-hairline ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const answerId = `faq-answer-${idx}`;
        const questionId = `faq-question-${idx}`;

        return (
          <div key={idx} className="group py-6 sm:py-8 transition-colors">
            <button
              id={questionId}
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="w-full flex items-baseline justify-between gap-6 text-left focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
            >
              <span className="font-serif italic text-2xl sm:text-3xl text-ink group-hover:text-ink/75 transition-colors">
                {item.question}
              </span>

              <span
                className="font-serif text-2xl text-ink font-light select-none transition-transform duration-200"
                aria-hidden="true"
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <div
              id={answerId}
              role="region"
              aria-labelledby={questionId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="max-w-editorial text-sm sm:text-base text-muted leading-relaxed font-sans pr-8">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
