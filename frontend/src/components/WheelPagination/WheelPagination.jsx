import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./WheelPagination.module.css";

export default function WheelPagination({
  totalPages = 10,
  visibleCount = 5,
  className = "",
  onChange,
}) {
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (onChange) onChange(active);
  }, [active, onChange]);

  const prevPage = () => setActive((p) => Math.max(p - 1, 0));
  const nextPage = () => setActive((p) => Math.min(p + 1, totalPages - 1));

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) setActive((p) => Math.max(p - 1, 0));
      else if (e.deltaY > 0) setActive((p) => Math.min(p + 1, totalPages - 1));
    };

    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [totalPages]);

  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(visibleCount / 2);
    let start = active - half;
    let end = active + half;

    if (start < 0) {
      end += -start;
      start = 0;
    }
    if (end > totalPages - 1) {
      start -= end - (totalPages - 1);
      end = totalPages - 1;
      if (start < 0) start = 0;
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null; // No paginar si solo hay 1 página

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
    >
      <button
        onClick={prevPage}
        disabled={active === 0}
        className={styles.navButton}
      >
        <ChevronLeft size={20} />
      </button>

      <div className={styles.carousel}>
        {visiblePages.map((p) => (
          <motion.div
            key={p}
            layout
            animate={{ scale: active === p ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={active === p ? styles.pageDotActive : styles.pageDot}
            onClick={() => setActive(p)}
          >
            {p + 1}
          </motion.div>
        ))}
      </div>

      <button
        onClick={nextPage}
        disabled={active === totalPages - 1}
        className={styles.navButton}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
