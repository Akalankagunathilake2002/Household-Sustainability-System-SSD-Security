import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Recycle,
  Globe,
  Users,
  Quote,
  BadgeCheck,
  Award,
  ShieldCheck,
  Plane,
  Star,
  Leaf,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  TreePine,
  Shield,
  Check,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllActions } from "../services/actionService";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/apiConfig";

const Home = () => {
  const HERO_IMAGES = useMemo(
    () => [
      "https://i.pinimg.com/1200x/ea/42/7a/ea427a16cd68490ef9687dc8fd5487ce.jpg",
      "https://i.pinimg.com/736x/bd/cf/b6/bdcfb6b5440eb13f398e7c324680b861.jpg",
    ],
    []
  );

  const SLIDE_INTERVAL_MS = 4500;
  const [activeIndex, setActiveIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [latestActions, setLatestActions] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoadingContent(true);
        const [actionsData, articlesData] = await Promise.all([
          getAllActions(),
          api.get(API_ENDPOINTS.ARTICLES)
        ]);
        setLatestActions((Array.isArray(actionsData) ? actionsData : []).slice(0, 3));
        setFeaturedArticles((articlesData.data.articles || []).slice(0, 3));
      } catch (error) {
        console.error("Error fetching home highlights:", error);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchHighlights();
  }, []);

  useEffect(() => {
    if (!HERO_IMAGES?.length) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [HERO_IMAGES]);

  const features = [
    {
      icon: <Zap />,
      title: "Energy Tracking",
      desc: "Monitor your electricity and gas usage in real-time.",
      image:
        "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=900&q=80",
    },
    {
      icon: <Recycle />,
      title: "Waste Management",
      desc: "Get smart tips on composting and recycling effectively.",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
    },
    {
      icon: <Globe />,
      title: "Carbon Footprint",
      desc: "Calculate and offset your household emissions.",
      image:
        "https://plus.unsplash.com/premium_photo-1733317270278-772ee47c86d7?q=80&w=2071&auto=format&fit=crop",
    },
    {
      icon: <Users />,
      title: "Community Impact",
      desc: "See how your neighborhood is making a difference.",
      image:
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const stats = [
    { label: "Active Households", value: "12,500+" },
    { label: "CO₂ Reduced", value: "84,200 kg" },
    { label: "Avg. Score Boost", value: "+23%" },
    { label: "Community Challenges", value: "320+" },
  ];

  const testimonials = [
    {
      name: "Nethmi Perera",
      role: "Homeowner • Colombo",
      quote:
        "EcoPulse made it easy to understand my electricity usage. We reduced our bill and feel proud about our CO₂ savings.",
      score: "Saved 18.2 kg CO₂",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      rating: 5,
    },
    {
      name: "Ayaan Silva",
      role: "Apartment Resident • Kandy",
      quote:
        "The recycling tips are super practical. The weekly goals keep my family motivated without feeling forced.",
      score: "Recycling +35%",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      rating: 5,
    },
    {
      name: "Ishani Fernando",
      role: "Community Member • Galle",
      quote:
        "I love the community challenges! Seeing neighbors improve together makes sustainability feel fun, not stressful.",
      score: "Score 92/100",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
      rating: 5,
    },
  ];

  const certificates = [
    {
      icon: <BadgeCheck />,
      title: "Verified Data Insights",
      desc: "Track usage with clear, transparent metrics.",
    },
    {
      icon: <ShieldCheck />,
      title: "Privacy-first Design",
      desc: "Your household data stays protected.",
    },
    {
      icon: <Award />,
      title: "Sustainability Badges",
      desc: "Earn certificates for milestones & challenges.",
    },
  ];

  const steps = [
    {
      icon: <Leaf />,
      title: "Connect your home",
      desc: "Add your usage details and goals in minutes.",
    },
    {
      icon: <TrendingUp />,
      title: "Track & improve",
      desc: "See your footprint, savings, and progress weekly.",
    },
    {
      icon: <Users />,
      title: "Join challenges",
      desc: "Compete with friends & neighborhoods and earn badges.",
    },
  ];

  const trustPoints = [
    "Smart household insights",
    "Low-friction onboarding",
    "Clear weekly progress tracking",
    "Community-powered sustainability goals",
  ];

  const whyChoose = [
    {
      icon: <Shield />,
      title: "Reliable Tracking",
      desc: "Follow your sustainability progress using simple dashboards and measurable indicators.",
    },
    {
      icon: <TreePine />,
      title: "Meaningful Impact",
      desc: "Every action contributes toward lower waste, lower energy usage, and greener living.",
    },
    {
      icon: <Users />,
      title: "Built for Communities",
      desc: "Encourage friendly competition and shared goals across neighborhoods and households.",
    },
    {
      icon: <BarChart3 />,
      title: "Clear Insights",
      desc: "Understand what is improving, what needs attention, and where you can do better.",
    },
  ];

  const faqs = [
    {
      question: "How does EcoPulse help my household?",
      answer:
        "EcoPulse helps you track energy usage, waste habits, and carbon footprint while giving useful insights and community-based motivation.",
    },
    {
      question: "Can I use it even if I am just getting started with sustainability?",
      answer:
        "Yes. The platform is designed for beginners as well as experienced eco-conscious households, with simple steps and progress tracking.",
    },
    {
      question: "Does it support community challenges?",
      answer:
        "Yes. You can participate in shared challenges, compare progress, and encourage better habits together with others.",
    },
    {
      question: "Is my household data safe?",
      answer:
        "Yes. EcoPulse focuses on privacy-first design and keeps household information protected while still providing useful analytics.",
    },
  ];

  return (
    <div className="overflow-x-hidden bg-off-white text-forest-dark">
      <Navbar />

      {/* HERO SECTION - unchanged */}
      <section className="relative min-h-screen pt-[90px]">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={HERO_IMAGES[activeIndex]}
              alt="Hero background"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              draggable={false}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/75 via-forest-dark/45 to-forest-dark/15" />
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-primary-teal/20 blur-[90px]" />
          <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] rounded-full bg-warm-yellow/15 blur-[100px]" />

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === activeIndex
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 min-h-[calc(100vh-90px)] flex items-center py-12 md:py-0">
          <div className="max-w-[720px] w-full">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 border border-white/20 text-white font-semibold text-sm uppercase tracking-wide mb-6 backdrop-blur">
                <Plane size={16} className="text-warm-yellow" />
                Welcome to EcoPulse
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-[3.6rem] leading-[1.1] md:leading-[1.05] mb-5 text-white font-extrabold">
                Live <span className="text-warm-yellow">Greener</span> without
                limits
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-9 leading-relaxed max-w-[640px]">
                Track energy, reduce waste, calculate carbon footprint, and join
                community challenges — all in one smart dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all bg-warm-yellow text-forest-dark shadow-[0_12px_28px_rgba(250,204,21,0.28)] hover:bg-golden-accent hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/15 hover:-translate-y-0.5"
                >
                  View Demo
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-4"
                  >
                    <div className="text-2xl font-extrabold text-white">
                      {s.value}
                    </div>
                    <div className="text-sm text-white/80 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FLOATING STRIP */}
      <section className="relative mt-8 md:-mt-12 z-20">
        <div className="container mx-auto px-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { icon: <Shield />, title: "Trusted Platform", text: "Built for reliable sustainability tracking" },
              { icon: <BarChart3 />, title: "Actionable Insights", text: "See progress in a simple and visual way" },
              { icon: <TreePine />, title: "Eco-first Goals", text: "Turn small actions into long-term impact" },
              { icon: <Users />, title: "Community Driven", text: "Compete, share, and improve together" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-soft-bg text-primary-teal flex items-center justify-center shrink-0">
                  {React.cloneElement(item.icon, { size: 22 })}
                </div>
                <div>
                  <h4 className="font-extrabold text-forest-dark mb-1">{item.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-16 md:py-[130px] bg-gradient-to-b from-[#f8fcfb] to-[#eef8f5]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-14 left-10 w-56 h-56 rounded-full bg-primary-teal/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-warm-yellow/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-[780px] mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-forest-dark font-semibold text-sm mb-5 shadow-sm">
              <Sparkles size={16} className="text-primary-teal" />
              Core Features
            </span>

            <h2 className="text-3xl md:text-[2.8rem] leading-tight font-extrabold mb-4 text-forest-dark">
              Everything you need for a{" "}
              <span className="text-primary-teal">Sustainable Home</span>
            </h2>

            <p className="text-lg text-text-muted leading-relaxed">
              Powerful tools designed to make environmental responsibility easy,
              practical, and rewarding every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-[2rem] bg-white border border-white/60 shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 via-forest-dark/10 to-transparent" />
                  <div className="absolute top-5 left-5 w-14 h-14 bg-white/85 backdrop-blur rounded-2xl text-primary-teal flex items-center justify-center shadow-md">
                    {React.cloneElement(feature.icon, { size: 26 })}
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="mb-3 text-xl font-extrabold text-forest-dark">
                    {feature.title}
                  </h3>

                  <p className="text-text-muted leading-relaxed mb-5">
                    {feature.desc}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-primary-teal font-semibold text-sm">
                      Discover feature
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#eef8f5] text-primary-teal">
                      Smart tool
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS + IMAGE */}
      <section className="relative py-16 md:py-[125px] bg-[#f6fbf9]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-teal/30 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-forest-dark font-semibold text-sm mb-5 shadow-sm">
                <CheckCircle2 size={16} className="text-primary-teal" />
                How it works
              </span>

              <h2 className="text-3xl md:text-[2.6rem] font-extrabold mb-4 text-forest-dark leading-tight">
                Simple steps.{" "}
                <span className="text-primary-teal">Big impact.</span>
              </h2>

              <p className="text-lg text-text-muted mb-10 leading-relaxed max-w-[580px]">
                Start tracking in minutes and improve continuously with a
                cleaner and smarter way to manage your home sustainability.
              </p>

              <div className="space-y-5">
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group flex items-start gap-5 rounded-[1.7rem] bg-white border border-border p-6 shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-teal-soft-bg text-primary-teal flex items-center justify-center shrink-0">
                      {React.cloneElement(s.icon, { size: 24 })}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-primary-teal mb-1">
                        Step 0{i + 1}
                      </div>
                      <h3 className="text-xl font-extrabold text-forest-dark mb-2">
                        {s.title}
                      </h3>
                      <p className="text-text-muted leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
                  <div className="text-2xl font-extrabold text-forest-dark">3 min</div>
                  <p className="text-sm text-text-muted mt-1">average setup time</p>
                </div>
                <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
                  <div className="text-2xl font-extrabold text-forest-dark">92%</div>
                  <p className="text-sm text-text-muted mt-1">users stay engaged weekly</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-primary-teal/15 blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-warm-yellow/15 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80"
                  alt="Sustainable living"
                  className="w-full h-[620px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/55 via-forest-dark/10 to-transparent" />

                <div className="absolute top-6 left-6 rounded-2xl bg-white/80 backdrop-blur-md border border-white/70 p-4 shadow-md max-w-[220px]">
                  <div className="flex items-center gap-2 text-primary-teal mb-2">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-bold">Protected Data</span>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Your home insights stay private and secure.
                  </p>
                </div>

                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/70 p-4">
                    <div className="flex items-center gap-2 text-primary-teal mb-2">
                      <BarChart3 size={18} />
                      <span className="text-sm font-bold">Weekly Progress</span>
                    </div>
                    <div className="text-2xl font-extrabold text-forest-dark">
                      +23%
                    </div>
                    <div className="text-sm text-text-muted">
                      better than last month
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/70 p-4">
                    <div className="flex items-center gap-2 text-primary-teal mb-2">
                      <TreePine size={18} />
                      <span className="text-sm font-bold">Eco Impact</span>
                    </div>
                    <div className="text-2xl font-extrabold text-forest-dark">
                      84,200 kg
                    </div>
                    <div className="text-sm text-text-muted">CO₂ reduced so far</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY SUSTAINCITY */}
      <section className="relative py-16 md:py-[120px] bg-gradient-to-b from-white to-[#f6fbf9]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-[760px] mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-soft-bg text-forest-dark font-semibold text-sm mb-5">
              <Sparkles size={16} className="text-primary-teal" />
              Why EcoPulse
            </span>
            <h2 className="text-3xl md:text-[2.6rem] font-extrabold mb-4 text-forest-dark">
              More than a tracker — a smarter way to{" "}
              <span className="text-primary-teal">live sustainably</span>
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Designed to turn everyday habits into visible progress and long-term impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChoose.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[2rem] bg-white border border-border p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-soft-bg text-primary-teal flex items-center justify-center mb-5">
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <h3 className="text-xl font-extrabold text-forest-dark mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / CERTIFICATES */}
      <section className="relative py-16 md:py-[125px] bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary-teal/7 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-soft-bg text-forest-dark font-semibold text-sm mb-5">
                <Award size={16} className="text-primary-teal" />
                Trust & Recognition
              </span>

              <h2 className="text-3xl md:text-[2.7rem] leading-tight font-extrabold text-forest-dark mb-5">
                Earn <span className="text-primary-teal">Certificates</span> for
                real progress
              </h2>

              <p className="text-lg text-text-muted leading-relaxed mb-8 max-w-[560px]">
                Complete challenges, improve your sustainability score, and
                unlock certificates you can proudly share with your community.
              </p>

              <div className="space-y-3 mb-8">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-3 text-forest-dark">
                    <div className="w-7 h-7 rounded-full bg-teal-soft-bg text-primary-teal flex items-center justify-center">
                      <Check size={16} />
                    </div>
                    <span className="font-medium">{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  "Monthly Eco Badge",
                  "Energy Saver Certificate",
                  "Community Champion",
                ].map((b, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-off-white border border-border text-forest-dark font-semibold shadow-sm"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <div className="rounded-[2rem] overflow-hidden border border-border shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
                <img
                  src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80"
                  alt="Green certificate section"
                  className="w-full h-[250px] object-cover"
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certificates.map((c, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group rounded-[2rem] bg-gradient-to-b from-[#f7fcfa] to-white border border-border p-8 shadow-[0_10px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-soft-bg text-primary-teal flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    {React.cloneElement(c.icon, { size: 24 })}
                  </div>

                  <h3 className="text-xl font-extrabold text-forest-dark mb-3">
                    {c.title}
                  </h3>

                  <p className="text-text-muted leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-16 md:py-[125px] bg-gradient-to-b from-[#eff8f4] to-[#f9fcfb]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-teal/30 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="text-center max-w-[760px] mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-forest-dark font-semibold text-sm mb-5 shadow-sm">
              <Quote size={16} className="text-primary-teal" />
              Testimonials
            </span>

            <h2 className="text-3xl md:text-[2.7rem] font-extrabold mb-4 text-forest-dark">
              Loved by households improving{" "}
              <span className="text-primary-teal">every week</span>
            </h2>

            <p className="text-lg text-text-muted">
              Real feedback from people using EcoPulse to reduce waste and
              emissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group rounded-[2rem] border border-white/60 bg-white/90 backdrop-blur p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden border border-border shadow-sm">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-extrabold text-forest-dark leading-tight text-base">
                      {t.name}
                    </div>
                    <div className="text-sm text-text-muted">{t.role}</div>

                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-warm-yellow fill-warm-yellow"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-teal-soft-bg text-primary-teal flex items-center justify-center">
                    <Quote size={20} />
                  </div>
                </div>

                <p className="text-forest-dark leading-relaxed mb-7 min-h-[120px]">
                  “{t.quote}”
                </p>

                <div className="pt-5 border-t border-border flex items-center justify-between gap-4">
                  <span className="px-4 py-2 rounded-full bg-off-white border border-border text-forest-dark font-semibold text-sm">
                    {t.score}
                  </span>

                  <span className="text-sm text-text-muted">
                    Verified feedback
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY HIGHLIGHTS */}
      <section className="py-[100px] bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm mb-4">
                <Users size={16} /> Community Highlights
              </span>
              <h2 className="text-3xl md:text-[2.6rem] font-extrabold text-forest-dark leading-tight">
                See what the <span className="text-emerald-600">Eco-Community</span> is up to
              </h2>
            </div>
            <Link to="/actions" className="group flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              View All Actions <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingContent ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
              ))
            ) : latestActions.length > 0 ? (
              latestActions.map((action, idx) => (
                <motion.div
                  key={action._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#f9fcfb] rounded-3xl p-6 border border-border/50 hover:shadow-xl transition-all h-full flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      {(action.createdBy?.username || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-forest-dark">{action.createdBy?.username || "User"}</p>
                      <p className="text-xs text-text-muted">{action.category}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{action.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-3 mb-4 flex-1">{action.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <span className="text-emerald-600 font-bold text-sm">Score: {action.totalScore || 0}</span>
                    <div className="flex items-center gap-3 text-text-muted text-xs">
                      <span>❤️ {action.likes?.length || 0}</span>
                      <span>💬 {action.comments?.length || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-text-muted">No recent actions found.</div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLES */}
      <section className="py-[100px] bg-gradient-to-b from-white to-[#f0f9f6]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-teal/10 text-primary-teal font-semibold text-sm mb-4">
                <Leaf size={16} /> Eco Insights
              </span>
              <h2 className="text-[2.6rem] font-extrabold text-forest-dark leading-tight">
                Latest from our <span className="text-primary-teal">Articles Collection</span>
              </h2>
            </div>
            <Link to="/articles" className="group flex items-center gap-2 text-primary-teal font-bold hover:text-teal-700 transition-colors">
              Explore All Articles <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingContent ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
              ))
            ) : featuredArticles.length > 0 ? (
              featuredArticles.map((article, idx) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-border/50 hover:shadow-2xl transition-all flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                    {article.image && (
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-primary-teal uppercase">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-extrabold text-xl mb-3 line-clamp-2 min-h-[56px] group-hover:text-primary-teal transition-colors">{article.title}</h3>
                    <p className="text-sm text-text-muted line-clamp-3 mb-6 flex-1">{article.content.replace(/<[^>]*>?/gm, '')}</p>
                    <Link to={`/articles/${article._id}`} className="inline-flex items-center gap-2 text-primary-teal font-bold text-sm group/btn">
                      Read Article <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-text-muted">No recent articles found.</div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[120px] bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-[760px] mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-soft-bg text-forest-dark font-semibold text-sm mb-5">
              <CheckCircle2 size={16} className="text-primary-teal" />
              Frequently Asked Questions
            </span>
            <h2 className="text-[2.6rem] font-extrabold mb-4 text-forest-dark">
              Everything you may want to know
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              Quick answers about how EcoPulse works and how it supports better living.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-[1.8rem] border border-border bg-[#f9fcfb] shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5"
                >
                  <span className="text-lg font-bold text-forest-dark">{faq.question}</span>
                  <ChevronDown
                    className={`transition-transform ${openFaq === index ? "rotate-180" : ""
                      }`}
                    size={20}
                  />
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-6 text-text-muted leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] bg-[#f7fbf9]">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-forest-dark via-deep-eco to-forest-dark py-20 px-8 md:px-14 rounded-[2.4rem] text-center text-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-white/10">
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
                alt="CTA background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-teal/25 blur-[70px]" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-warm-yellow/20 blur-[70px]" />

            <div className="relative z-10 max-w-[820px] mx-auto">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white font-semibold text-sm mb-6 backdrop-blur">
                <Sparkles size={16} className="text-warm-yellow" />
                Start your green journey today
              </span>

              <h2 className="text-white text-4xl md:text-5xl leading-tight font-extrabold mb-6">
                Ready to make an impact?
              </h2>

              <p className="text-xl mb-10 opacity-90 max-w-[680px] mx-auto leading-relaxed">
                Join thousands of households making the world better—one small
                step at a time.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-lg transition-all bg-warm-yellow text-forest-dark shadow-[0_10px_25px_rgba(250,204,21,0.28)] hover:bg-golden-accent hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(250,204,21,0.40)]"
                >
                  Join the Community <ArrowRight size={20} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-semibold text-lg transition-all bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:-translate-y-0.5"
                >
                  Explore Dashboard
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3 opacity-95">
                {["No credit card", "Cancel anytime", "Fast setup"].map(
                  (x, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold"
                    >
                      {x}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;