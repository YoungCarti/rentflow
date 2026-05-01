"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["rent", "tenants", "payments", "maintenance"];

export default function RotatingAuthHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <p className="text-2xl font-semibold leading-9 tracking-tight text-white">
      Track{" "}
      <span className="relative inline-grid align-baseline">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block text-cyan-200"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>{" "}
      from one focused workspace.
    </p>
  );
}
