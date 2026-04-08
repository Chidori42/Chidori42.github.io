import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { SkillsSection } from '@/components/SkillsSection';
import { AboutSection } from '@/components/AboutSection';
import { EducationSection } from '@/components/EducationSection';
import { FunFactsSection } from '@/components/FunFactsSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { SideDecoration } from '@/components/SideDecoration';
import { CustomCursor } from '@/components/CustomCursor';
import { PortfolioAssistant } from '@/components/PortfolioAssistant';
import { motion } from 'framer-motion';
import { pageFade } from '@/lib/motion';

const INTRO_MIN_DURATION_MS = 2200;
const INTRO_EXIT_DURATION_MS = 650;

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    let animationFrameId = 0;
    let hideLoaderTimer = 0;
    let assistantTimer = 0;
    const startTime = performance.now();

    const animateProgress = (now: number) => {
      const elapsed = now - startTime;
      const linear = Math.min(elapsed / INTRO_MIN_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - linear, 3);

      setLoadingProgress(Math.round(eased * 100));

      if (linear < 1) {
        animationFrameId = window.requestAnimationFrame(animateProgress);
        return;
      }

      setIsPageLoading(false);
      hideLoaderTimer = window.setTimeout(() => setShowLoader(false), INTRO_EXIT_DURATION_MS);
      assistantTimer = window.setTimeout(() => setShowAssistant(true), INTRO_EXIT_DURATION_MS + 250);
    };

    animationFrameId = window.requestAnimationFrame(animateProgress);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(hideLoaderTimer);
      window.clearTimeout(assistantTimer);
    };
  }, []);

  return (
    <>
      {showLoader && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          aria-label="Loading portfolio"
          role="status"
          initial={{ opacity: 1 }}
          animate={isPageLoading ? { opacity: 1 } : { opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: INTRO_EXIT_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 intro-loader-backdrop" aria-hidden="true" />

          <motion.div
            className="intro-loader-shell"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="intro-loader-rings" aria-hidden="true">
              <span className="intro-loader-ring intro-loader-ring-outer" />
              <span className="intro-loader-ring intro-loader-ring-middle" />
              <span className="intro-loader-ring intro-loader-ring-inner" />
            </div>

            <div className="intro-loader-copy">
              <p className="intro-loader-label">PORTFOLIO EXPERIENCE</p>
              <p className="intro-loader-subtitle">Preparing a premium experience for you...</p>
            </div>

            <div className="intro-loader-progress-wrap" aria-hidden="true">
              <motion.div
                className="intro-loader-progress"
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
            <p className="intro-loader-percent">{loadingProgress}%</p>
          </motion.div>
        </motion.div>
      )}

      {!isPageLoading && (
        <motion.div className="min-h-screen bg-background duration-500" initial="hidden" animate="visible" variants={pageFade}>
          {!showLoader && <CustomCursor hideDefaultCursor={false} />}
          <Header />
          <SideDecoration />
          <motion.main className="duration-1000" variants={pageFade}>
            <HeroSection />
            <ProjectsSection />
            <SkillsSection />
            <AboutSection />
            <EducationSection />
            <FunFactsSection />
            <ContactSection />
          </motion.main>
          {showAssistant && <PortfolioAssistant />}
          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default Index;
