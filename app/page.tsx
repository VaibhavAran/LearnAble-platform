"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, BarChart3, Sparkles, Shield, Users } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">

      {/* ================= HEADER ================= */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="LearnAble Logo"
              width={42}
              height={42}
              priority
            />
            <span className="text-2xl font-bold text-gray-900">
              Learn<span className="text-indigo-600">Able</span>
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/auth")}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <div>
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Game-Based Learning Assessment
            </span>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight">
              Understand How Your Child{" "}
              <span className="text-indigo-600">Learns</span>,<br />
              Not Just What They Learn
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
              LearnAble uses scientifically designed, age-appropriate games to
              identify learning patterns, attention, memory, and cognitive
              strengths in children aged 1–10. Get personalized insights to support their growth.
            </p>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                Expert-Backed
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/auth")}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition"
              >
                Start Free Assessment
                <ArrowRight />
              </button>

              <button
                onClick={() => router.push("/auth")}
                className="px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Login
              </button>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50" />

            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border">
              <div className="grid grid-cols-1 gap-6">

                <FeatureCard
                  icon={<Brain className="text-indigo-600" size={28} />}
                  title="Cognitive Insights"
                  desc="Understand attention, memory, and processing abilities clearly."
                />

                <FeatureCard
                  icon={<BarChart3 className="text-purple-600" size={28} />}
                  title="Actionable Reports"
                  desc="Detailed, parent-friendly reports with strengths and focus areas."
                />

                <FeatureCard
                  icon={<Sparkles className="text-pink-600" size={28} />}
                  title="Child-Friendly Games"
                  desc="Fun, pressure-free games designed by learning experts."
                />

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-4">
          <span>
            © {new Date().getFullYear()} LearnAble. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= FEATURE CARD ================= */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}