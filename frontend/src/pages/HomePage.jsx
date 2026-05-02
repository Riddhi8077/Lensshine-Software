import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const HERO_VIDEOS = [
  "https://cdn.coverr.co/videos/coverr-eyeglasses-on-a-table-9921/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-young-woman-putting-on-glasses-9718/1080p.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-adjusting-her-glasses-35761-large.mp4",
];
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function HomePage() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("lensshine-theme") || "dark"
  );

  const setGlobalTheme = (mode) => {
    localStorage.setItem("lensshine-theme", mode);
    setThemeMode(mode);
    window.dispatchEvent(new Event("lensshine-theme-change"));
  };

  const handleVideoError = () => {
    if (videoIndex < HERO_VIDEOS.length - 1) {
      setVideoIndex((prev) => prev + 1);
      return;
    }
    setVideoFailed(true);
  };

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      
      {/* Background */}
      <motion.div className="absolute inset-0" variants={fadeSlideUp}>
        <div className="absolute inset-0 bg-[#07080f]" />
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.045, 1], x: [0, -6, 0], y: [0, -4, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
        <motion.video
          key={HERO_VIDEOS[videoIndex]}
          src={HERO_VIDEOS[videoIndex]}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={handleVideoError}
          className={`w-full h-full object-cover absolute inset-0 ${videoFailed ? "hidden" : "block"}`}
          initial={{ scale: 1.06, opacity: 0.72 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        </motion.div>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(120deg, rgba(212,175,55,0.14) 0%, rgba(9,13,30,0.05) 40%, rgba(212,175,55,0.08) 100%)",
          }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(60% 45% at 50% 42%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.04) 45%, rgba(0,0,0,0) 100%)",
            filter: "blur(1px)",
          }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <motion.div
            className="absolute left-[10%] top-[18%] w-16 h-16 sm:w-24 sm:h-24 border border-[#d4af37]/40 bg-[#d4af37]/[0.04] shadow-[0_0_70px_rgba(212,175,55,0.42)]"
            animate={{ y: [0, -18, 0], x: [0, 14, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-[9%] top-[16%] w-20 h-20 sm:w-28 sm:h-28 rounded-sm blur-xl bg-[#d4af37]/25"
            animate={{ y: [0, -14, 0], x: [0, 12, 0], opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[12%] top-[26%] w-20 h-20 sm:w-28 sm:h-28 border border-white/30 bg-white/[0.02] shadow-[0_0_75px_rgba(255,255,255,0.28)]"
            animate={{ y: [0, 16, 0], x: [0, -10, 0], rotate: [0, -14, 0] }}
            transition={{ duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[10%] top-[24%] w-24 h-24 sm:w-32 sm:h-32 rounded-sm blur-xl bg-white/20"
            animate={{ y: [0, 14, 0], x: [0, -10, 0], opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-[22%] bottom-[18%] w-14 h-14 sm:w-20 sm:h-20 border border-[#d4af37]/40 bg-[#d4af37]/[0.035] shadow-[0_0_60px_rgba(212,175,55,0.36)]"
            animate={{ y: [0, 14, 0], x: [0, 12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 8.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-[20%] bottom-[16%] w-20 h-20 sm:w-28 sm:h-28 rounded-sm blur-xl bg-[#d4af37]/20"
            animate={{ y: [0, 12, 0], x: [0, 10, 0], opacity: [0.35, 0.8, 0.35] }}
            transition={{ duration: 8.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.div
          className={`absolute inset-0 ${themeMode === "light" ? "bg-white/65" : "bg-black/70"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        variants={containerVariants}
      >
        <div className="fixed top-20 right-4 sm:right-6 z-30 flex gap-2">
          <button
            onClick={() => setGlobalTheme("light")}
            className={`px-3 py-1.5 text-xs border rounded flex items-center gap-1 backdrop-blur-sm ${
              themeMode === "light"
                ? "bg-[#d4af37] text-black border-[#d4af37]"
                : "bg-black/35 border-white/20 text-white hover:border-[#d4af37]"
            }`}
          >
            <Sun className="h-3 w-3" /> Light
          </button>
          <button
            onClick={() => setGlobalTheme("dark")}
            className={`px-3 py-1.5 text-xs border rounded flex items-center gap-1 backdrop-blur-sm ${
              themeMode === "dark"
                ? "bg-[#d4af37] text-black border-[#d4af37]"
                : "bg-black/35 border-white/20 text-white hover:border-[#d4af37]"
            }`}
          >
            <Moon className="h-3 w-3" /> Dark
          </button>
        </div>
        
        <motion.p
          className="text-xs tracking-[0.3em] uppercase text-[#d4af37] mb-6"
          variants={fadeSlideUp}
        >
          Premium Optical Management
        </motion.p>

        <motion.h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-light mb-6 ${
            themeMode === "light" ? "text-[#111]" : "text-white"
          }`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          variants={fadeSlideUp}
        >
          Vision{" "}
          <motion.span
            className="text-[#d4af37] font-medium"
            animate={{
              textShadow: [
                "0 0 0px rgba(212,175,55,0)",
                "0 0 10px rgba(212,175,55,0.35)",
                "0 0 0px rgba(212,175,55,0)",
              ],
            }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Redefined
          </motion.span>
        </motion.h1>

        <motion.p
          className={`text-base sm:text-lg mb-12 max-w-lg mx-auto ${
            themeMode === "light" ? "text-black/70" : "text-white/60"
          }`}
          variants={fadeSlideUp}
        >
          Streamline your optical shop operations. Manage customers, orders,
          and prescriptions in one place.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={containerVariants}
        >

          <Link to="/new-customer">
            <motion.button
              className="bg-[#d4af37] text-black px-8 py-3 flex items-center gap-2"
              variants={fadeSlideUp}
              whileHover={{ y: -2, scale: 1.01, boxShadow: "0 8px 22px rgba(212,175,55,0.28)" }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
            >
              New Customer
              <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.8 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          </Link>

          <Link to="/dashboard">
            <motion.button
              className={`border px-8 py-3 flex items-center gap-2 hover:border-[#d4af37] hover:text-[#d4af37] ${
                themeMode === "light"
                  ? "border-black/20 text-[#111]"
                  : "border-white/20 text-white"
              }`}
              variants={fadeSlideUp}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </motion.button>
          </Link>

        </motion.div>
      </motion.div>

      {/* Bottom Fade */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      />
    </motion.div>
  );
}

export default HomePage;