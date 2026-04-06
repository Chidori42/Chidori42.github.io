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

const Index = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    const introTimer = window.setTimeout(() => setIsPageLoading(false), 1800);
    const timer = window.setTimeout(() => setShowAssistant(true), 1800);
    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(timer);
    };
  }, []);

  if (isPageLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-background/20 to-background" aria-hidden="true" />
        <div className="loader loader-intro" aria-label="Loading portfolio" role="status" />
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-background duration-500" initial="hidden" animate="visible" variants={pageFade}>
      <CustomCursor hideDefaultCursor={false}/>
      <Header />
      <SideDecoration />
      <motion.main className='duration-1000' variants={pageFade}>
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
  );
};

export default Index;
