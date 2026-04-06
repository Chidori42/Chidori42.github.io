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
      <PortfolioAssistant />
      <Footer />
    </motion.div>
  );
};

export default Index;
