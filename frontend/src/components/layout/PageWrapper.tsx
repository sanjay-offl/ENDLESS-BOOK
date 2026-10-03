import React from "react";
import { motion, Variants } from "framer-motion";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
};

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function PageWrapper({
  children,
  className = "",
  style,
}: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`page-wrapper ${className}`}
      style={{
        paddingTop: "var(--header-height)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
