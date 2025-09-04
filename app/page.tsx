"use client"

import Link from "next/link"
import { Hexagon, BookOpen, ClipboardList, MessageSquare, GraduationCap, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SyntheticV0PageForDeployment() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hexagon className="h-7 w-7 text-cyan-500" />
          <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Campus AI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#roles" className="hover:text-white">Roles</a>
          <a href="#cta" className="hover:text-white">Get Started</a>
        </nav>
        <div className="flex items-center space-x-2">
          <Link href="/signin">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              AI‑powered teaching and learning for modern classrooms
            </h1>
            <p className="mt-4 text-slate-300">
              Campus AI brings together classes, activities, assignments, grades, and messaging in one beautiful dashboard for students, teachers, and admins.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signin">
                <Button className="bg-cyan-600 hover:bg-cyan-700">Sign in to continue</Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  <Sparkles className="h-4 w-4 mr-2" /> Explore features
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-3xl" />
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <DemoCard icon={<BookOpen className="h-4 w-4 text-cyan-500" />} title="Classes" desc="Organize courses and materials" />
                <DemoCard icon={<ClipboardList className="h-4 w-4 text-purple-500" />} title="Assignments" desc="Create and grade faster" />
                <DemoCard icon={<GraduationCap className="h-4 w-4 text-green-500" />} title="Grades" desc="Track progress at a glance" />
                <DemoCard icon={<MessageSquare className="h-4 w-4 text-blue-500" />} title="Messages" desc="Keep everyone aligned" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Everything you need to run your classroom</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature title="Smart Activities" desc="Interactive, AI‑assisted activities and quizzes that adapt to each learner." />
          <Feature title="Frictionless Grading" desc="Auto‑grading suggestions with manual overrides and transparent rubrics." />
          <Feature title="Progress Analytics" desc="Visualize mastery, attendance, and engagement across classes." />
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="container mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Built for every role</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard title="Students" desc="See classes, assignments, and progress in one place." href="/signin" />
          <RoleCard title="Teachers" desc="Plan activities, grade submissions, message classes." href="/signin" />
          <RoleCard title="Admins" desc="Manage users, classes, policies, and system health." href="/signin" />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="container mx-auto px-6 py-16">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold">Get started with Campus AI</h3>
          <p className="text-slate-300 mt-2">Sign in to access student, teacher, or admin dashboards.</p>
          <div className="mt-6">
            <Link href="/signin">
              <Button className="bg-cyan-600 hover:bg-cyan-700">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 text-sm text-slate-400 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-5 w-5 text-cyan-500" />
            <span>Campus AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><Shield className="h-3.5 w-3.5 mr-1" /> Privacy</span>
            <span> 2024</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function DemoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="font-medium">{title}</div>
      </div>
      <p className="text-sm text-slate-400 mt-2">{desc}</p>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-sm text-slate-400 mt-2">{desc}</p>
    </div>
  )
}

function RoleCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5 flex flex-col">
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-sm text-slate-400 mt-2 flex-1">{desc}</p>
      <div className="mt-4">
        <Link href={href}>
          <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 w-full">Sign in</Button>
        </Link>
      </div>
    </div>
  )
}