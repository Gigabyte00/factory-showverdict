import { Metadata } from 'next';
import { getSiteConfig } from '@/lib/site-config';
import { Mail, Clock, Send } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    title: `Contact Us`,
    description: `Get in touch with ${site.name}. Questions, review requests, or feedback? We respond within 48 hours.`,
    alternates: { canonical: `https://${site.domain}/contact` },
  };
}

export default function ContactPage() {
  const site = getSiteConfig();

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              Have a question or want to suggest something for review? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
              <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm">hello@{site.domain}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
              <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Response Time</h3>
              <p className="text-muted-foreground text-sm">We respond within 48 hours</p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm text-center">
              <div className="inline-flex p-3 bg-purple-100 rounded-full mb-4">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Feedback Welcome</h3>
              <p className="text-muted-foreground text-sm">Help us improve our content</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
