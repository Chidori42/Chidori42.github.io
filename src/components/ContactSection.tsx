import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import emailjs from '@emailjs/browser';
import { Mail, MapPin, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { sectionTitle, staggerContainer, staggerItem } from '@/lib/motion';
import { trackAnalyticsEvent } from '@/lib/analytics';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactSection = () => {
 const { t, direction } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });


const onSubmit = async (data: ContactFormData) => {
  setIsSubmitting(true);
  trackAnalyticsEvent('contact_form_submit_attempt', {
    has_name: Boolean(data.name.trim()),
    has_email: Boolean(data.email.trim()),
    message_length: data.message.trim().length,
  });

  try {
    await emailjs.send(
      'service_qysmzrp', 
      'template_by6gvwi', 
      {
        name: data.name,
        form_email: data.email,
        message: data.message,
        to_email: 'elfagrouch9@gmail.com',
      },
      'jwQ412fY7boTSNPQH'
    );

    setSubmitStatus('success');
    trackAnalyticsEvent('contact_form_submit_success');
    reset();
    setTimeout(() => setSubmitStatus('idle'), 5000);
  } catch {
    setSubmitStatus('error');
    trackAnalyticsEvent('contact_form_submit_error');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <section id="contacts" className="py-20 relative">
      <motion.div className="absolute top-20 right-8 opacity-30" animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <DotGrid rows={5} cols={5} />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl font-mono mb-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={sectionTitle}>
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.contacts.title.replace('#', '')}</span>
        </motion.h2>
        <motion.p className="text-muted-foreground font-mono mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }}>{t.contacts.description}</motion.p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Info */}
          <motion.div className={direction === 'rtl' ? 'lg:order-2' : ''} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
            <motion.div className="border border-border bg-card p-6 mb-8" variants={staggerItem} whileHover={{ y: -4 }}>
              <motion.h3 className="text-xl font-mono font-semibold text-primary mb-4" variants={staggerItem}>
                {t.contacts.letsTalk}
              </motion.h3>
              <motion.p className="text-muted-foreground font-mono mb-6" variants={staggerItem}>
                {t.contacts.letsTalkDesc}
              </motion.p>

              {/* Contact Info */}
              <div className="space-y-4">
                <motion.div className="flex items-center gap-4" variants={staggerItem} whileHover={{ x: 4 }}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-sm">Email</p>
                    <p className="text-foreground font-mono">elfagrouch9@gmail.com</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-center gap-4" variants={staggerItem} whileHover={{ x: 4 }}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-sm">Location</p>
                    <p className="text-foreground font-mono">Morocco</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Available Badge */}
            <motion.div className="border border-primary/50 bg-primary/5 p-6" variants={staggerItem} whileHover={{ y: -4 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-terminal-green animate-pulse" />
                <h4 className="text-foreground font-mono font-semibold">
                  {t.contacts.availableTitle}
                </h4>
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                {t.contacts.availableDesc}
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div className={direction === 'rtl' ? 'lg:order-1' : ''} initial={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
            <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
              <motion.div variants={staggerItem}>
                <label htmlFor="contact-name" className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.name}
                </label>
                <input
                  id="contact-name"
                  {...register('name')}
                  className="w-full px-4 py-3 bg-card border border-border font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  dir={direction}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={staggerItem}>
                <label htmlFor="contact-email" className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.email}
                </label>
                <input
                  id="contact-email"
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-card border border-border font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={staggerItem}>
                <label htmlFor="contact-message" className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.message}
                </label>
                <textarea
                  id="contact-message"
                  {...register('message')}
                  rows={6}
                  className="w-full px-4 py-3 bg-card border border-border font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  dir={direction}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.message.message}
                  </p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-mono hover-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t.contacts.form.send}
                  </>
                )}
              </motion.button>

              {submitStatus === 'success' && (
                <motion.p className="text-terminal-green flex items-center gap-2 font-mono" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <CheckCircle2 className="w-4 h-4" />
                  Message sent successfully!
                </motion.p>
              )}
              {submitStatus === 'error' && (
                <motion.p className="text-destructive flex items-center gap-2 font-mono" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle className="w-4 h-4" />
                  Failed to send message. Please try again.
                </motion.p>
              )}
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
