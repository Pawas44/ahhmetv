'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Video, Shield, Zap, Globe, Users, MessageCircle, Star, ChevronDown,
  Sparkles, Lock, ArrowRight, Wifi, Filter
} from 'lucide-react';
import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';

const stats = [
  { label: 'Active Users', value: '2M+', icon: Users },
  { label: 'Countries', value: '190+', icon: Globe },
  { label: 'Video Calls Daily', value: '500K+', icon: Video },
  { label: 'User Rating', value: '4.9★', icon: Star },
];

const features = [
  {
    icon: Video,
    title: 'HD Video Chat',
    description: 'Crystal clear video with echo cancellation and noise suppression for the best conversation experience.',
  },
  {
    icon: Zap,
    title: 'Instant Matching',
    description: 'Get matched with someone new in seconds. Our smart algorithm finds the perfect conversation partner.',
  },
  {
    icon: Filter,
    title: 'Smart Filters',
    description: 'Filter by interests, country, language, and more to find people you truly connect with.',
  },
  {
    icon: Shield,
    title: 'AI Moderation',
    description: 'Advanced AI keeps the platform safe with real-time content moderation and toxic behavior detection.',
  },
  {
    icon: MessageCircle,
    title: 'Text & Media Chat',
    description: 'Send messages, emojis, GIFs, and images during your video call for a richer experience.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'End-to-end encryption, anonymous matching, and complete control over your personal data.',
  },
];

const howItWorks = [
  { step: '01', title: 'Create Account', description: 'Sign up instantly with Google, Discord, GitHub, or email. Or jump in as a guest.' },
  { step: '02', title: 'Set Your Filters', description: 'Choose your interests, preferred languages, and other filters to find the right match.' },
  { step: '03', title: 'Start Chatting', description: 'Hit the Start button and get matched with someone new in seconds. Skip anytime.' },
  { step: '04', title: 'Make Friends', description: 'Found someone interesting? Send a friend request and stay connected.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Student', content: 'AHHHMETV helped me practice my Spanish with native speakers. The matching filters are incredible!', rating: 5 },
  { name: 'James L.', role: 'Digital Nomad', content: 'I\'ve made friends from 20+ countries. The video quality is amazing and the platform feels truly safe.', rating: 5 },
  { name: 'Yuki T.', role: 'Content Creator', content: 'The best random chat platform out there. Clean UI, fast matching, and the premium features are worth it.', rating: 5 },
];

const faqItems = [
  { question: 'Is AHHHMETV free to use?', answer: 'Yes! AHHHMETV is completely free to use with core features including video chat, text messaging, and basic matching. Premium users get additional features like advanced filters and priority matching.' },
  { question: 'How does the matching system work?', answer: 'Our smart matching algorithm considers your interests, language preferences, and location to find the best conversation partners. You can also use filters to narrow down your matches.' },
  { question: 'Is my privacy protected?', answer: 'Absolutely. We use end-to-end encryption for video calls, never store your video data, and give you complete control over your personal information. You can also chat anonymously as a guest.' },
  { question: 'What makes AHHHMETV different?', answer: 'AHHHMETV combines cutting-edge AI moderation, a premium user experience, smart matching algorithms, and a strong focus on safety to create the best random video chat platform available.' },
  { question: 'Can I use AHHHMETV on mobile?', answer: 'Yes! AHHHMETV is fully responsive and works beautifully on desktop, tablet, and mobile devices. No app download required.' },
  { question: 'How do I report inappropriate behavior?', answer: 'You can report or block any user with one click during a chat. Our AI moderation system also automatically detects and prevents inappropriate content in real-time.' },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { onlineCount } = useChatStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary-light">
              <Sparkles className="w-4 h-4" />
              The Next Generation Video Chat Platform
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Meet New People{' '}
            <span className="gradient-text">Instantly</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 text-balance">
            Connect with people from around the world through instant HD video chat.
            Make friends, explore cultures, and have spontaneous conversations.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
              <Video className="w-5 h-5" />
              Start Chatting
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              Learn More
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-dark">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-success" /> AI Moderated</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-accent" /> Encrypted</span>
            <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4 text-primary-light" /> HD Quality</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-white/5 bg-background-secondary/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center glass-card hover:shadow-glow-sm transition-shadow duration-500">
                <stat.icon className="w-8 h-8 text-primary-light mx-auto mb-3" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span variants={itemVariants} className="text-sm text-primary-light font-medium uppercase tracking-wider">Features</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Everything You Need to <span className="gradient-text">Connect</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-muted max-w-2xl mx-auto">
              A premium experience built with cutting-edge technology for seamless, safe, and fun conversations.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card group hover:border-primary/30 hover:shadow-glow-sm transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-glow-purple group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-background-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span variants={itemVariants} className="text-sm text-accent-light font-medium uppercase tracking-wider">How It Works</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Start Chatting in <span className="gradient-text">Seconds</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {howItWorks.map((item, i) => (
              <motion.div key={item.step} variants={itemVariants} className="relative">
                <div className="glass-card text-center group hover:border-accent/30 transition-all duration-500">
                  <div className="text-5xl font-black gradient-text opacity-20 mb-2">{item.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span variants={itemVariants} className="text-sm text-primary-light font-medium uppercase tracking-wider">Testimonials</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Loved by <span className="gradient-text">Millions</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted mb-4 text-sm leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-dark">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-background-secondary/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span variants={itemVariants} className="text-sm text-accent-light font-medium uppercase tracking-wider">FAQ</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {faqItems.map((faq, i) => (
              <motion.div key={i} variants={itemVariants} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 text-sm text-muted leading-relaxed">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
