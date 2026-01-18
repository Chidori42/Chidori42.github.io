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

const Index = () => {
  return (
    <div className="min-h-screen bg-background duration-500">
      <Header />
      <SideDecoration />
      <main className='duration-1000'>
        <HeroSection />
        <ProjectsSection />
        <SkillsSection />
        <AboutSection />
        <EducationSection />
        <FunFactsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
