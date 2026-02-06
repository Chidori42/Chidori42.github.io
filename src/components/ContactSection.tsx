import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { DotGrid } from './DotGrid';
import emailjs from '@emailjs/browser';
import { Mail, MapPin, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    reset();
    setTimeout(() => setSubmitStatus('idle'), 5000);
  } catch (error) {
    console.error('Failed:', error);
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <section id="contacts" className="py-20 relative">
      <div className="absolute top-20 right-8 opacity-30">
        <DotGrid rows={5} cols={5} />
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-mono mb-4">
          <span className="text-primary">#</span>
          <span className="text-foreground">{t.contacts.title.replace('#', '')}</span>
        </h2>
        <p className="text-muted-foreground font-mono mb-12">{t.contacts.description}</p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Info */}
          <div className={direction === 'rtl' ? 'lg:order-2' : ''}>
            <div className="border border-border bg-card p-6 mb-8">
              <h3 className="text-xl font-mono font-semibold text-primary mb-4">
                {t.contacts.letsTalk}
              </h3>
              <p className="text-muted-foreground font-mono mb-6">
                {t.contacts.letsTalkDesc}
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-sm">Email</p>
                    <p className="text-foreground font-mono">elfagrouch9@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-mono text-sm">Location</p>
                    <p className="text-foreground font-mono">Morocco</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Badge */}
            <div className="border border-primary/50 bg-primary/5 p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-terminal-green animate-pulse" />
                <h4 className="text-foreground font-mono font-semibold">
                  {t.contacts.availableTitle}
                </h4>
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                {t.contacts.availableDesc}
              </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className={direction === 'rtl' ? 'lg:order-1' : ''}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.name}
                </label>
                <input
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
              </div>

              <div>
                <label className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.email}
                </label>
                <input
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
              </div>

              <div>
                <label className="block text-muted-foreground font-mono text-sm mb-2">
                  {t.contacts.form.message}
                </label>
                <textarea
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
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-mono hover-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              </button>

              {submitStatus === 'success' && (
                <p className="text-terminal-green flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Message sent successfully!
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-destructive flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4" />
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
