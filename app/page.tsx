'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileText, Search, Tag } from 'lucide-react';

import { useAuth } from '@/lib/providers/auth-provider';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const features = [
    {
      title: 'Markdown Support',
      description:
        'Write notes in markdown format for enhanced formatting options.',
      icon: <FileText className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Tag Organization',
      description:
        'Categorize your notes with tags for better organization and quick access.',
      icon: <Tag className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Powerful Search',
      description:
        'Quickly find your notes with our fast and efficient search functionality.',
      icon: <Search className="h-10 w-10 text-primary" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Capture Your Thoughts with NoteCraft
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  A sleek, high-performance note-taking application designed for developers and creators.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => router.push(user ? '/dashboard' : '/login')}
                  className="h-12 px-8"
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="h-12 px-8"
                >
                  {user ? 'New Note' : 'Sign Up'}
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything You Need
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  NoteCraft comes packed with all the tools you need to capture, organize, and access your notes.
                </p>
              </div>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm"
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Join thousands of users who have already transformed their note-taking experience.
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm space-y-2"
              >
                <div className="flex flex-col md:flex-row gap-2 justify-center">
                  <Button
                    size="lg"
                    onClick={() => router.push(user ? '/dashboard' : '/login')}
                    className="h-12 px-8"
                  >
                    {user ? 'Go to Dashboard' : 'Get Started for Free'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No credit card required.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  What Our Users Say
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Hear from our community about how NoteCraft has improved their productivity.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-lg border p-6 shadow-sm"
              >
                <div className="flex items-start">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      "NoteCraft has completely transformed how I organize my development notes. The markdown support and tagging system are game-changers."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Alex Chen</div>
                      <div className="text-sm text-muted-foreground">
                        Software Engineer
                      </div>
                    </div>
                  </div>
                </div>
              </motion.blockquote>
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg border p-6 shadow-sm"
              >
                <div className="flex items-start">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      "I've tried many note-taking apps, but NoteCraft's simplicity and powerful features make it stand out. It's become an essential tool in my workflow."
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">
                        UX Designer
                      </div>
                    </div>
                  </div>
                </div>
              </motion.blockquote>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} NoteCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link 
              href="/terms" 
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms
            </Link>
            <Link 
              href="/privacy" 
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}