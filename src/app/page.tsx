'use client'
// Starlish Bimbel Landing Page
import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Target, 
  Award, 
  CheckCircle, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Calculator,
  Atom,
  BookText,
  Heart,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

// Section wrapper with animation
function AnimatedSection({ 
  children, 
  className = '', 
  id 
}: { 
  children: React.ReactNode
  className?: string
  id?: string 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// Navbar Component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#tentang', label: 'Tentang Kami' },
    { href: '#program', label: 'Program' },
    { href: '#keunggulan', label: 'Keunggulan' },
    { href: '#galeri', label: 'Galeri' },
    { href: '#testimoni', label: 'Testimoni' },
    { href: '#kontak', label: 'Kontak' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-2">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/logo.png"
                alt="Starlish Bimbel"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className={`font-bold text-lg md:text-xl ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}>
                Starlish
              </span>
              <span className={`font-light text-lg md:text-xl ${isScrolled ? 'text-[#ff8c00]' : 'text-[#ff8c00]'}`}>
                Bimbel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#ff8c00] ${
                  isScrolled ? 'text-gray-700' : 'text-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button Desktop */}
          <div className="hidden lg:block">
            <a
              href="https://wa.me/6285183127242?text=Halo%20Starlish%20Bimbel,%20saya%20ingin%20mendaftar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] text-white font-semibold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Daftar Sekarang
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-[#ff8c00] font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/6285183127242?text=Halo%20Starlish%20Bimbel,%20saya%20ingin%20mendaftar"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] text-white font-semibold py-3 rounded-full mt-4"
              >
                Daftar Sekarang
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8e1] via-[#ffecd2] to-[#fcb69f]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#ffc107]/20 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#ff8c00]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-[#ffc107]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-6"
            >
              <Star className="w-4 h-4 text-[#ffc107] fill-[#ffc107]" />
              <span className="text-sm font-medium text-gray-700">Light Up Your Future</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tempat Anak{' '}
              <span className="text-gradient">Belajar</span>{' '}
              dan{' '}
              <span className="text-gradient">Tumbuh</span>{' '}
              Bersama
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Kelas kecil yang fokus, guru yang peduli, dan sistem belajar yang jelas untuk membantu setiap siswa berkembang dengan nyaman.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="https://wa.me/6285183127242?text=Halo%20Kak%2C%20saya%20ingin%20mendaftar%20di%20Starlish%20Bimbel.%0A%0ANama%3A%20%0AAlamat%3A%20%0AEmail%3A%20%0ANo.%20Telepon%3A%20%0AJenjang%20%28KB%2FTK%2FSD%2FSMP%2FSMA%29%3A%20%0A%0AMohon%20info%20lebih%20lanjut%2C%20terima%20kasih%21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[#ff8c00] to-[#ffc107] hover:from-[#e67e00] hover:to-[#e6ad00] text-white font-semibold px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Ayo Trial dan Daftar Sekarang
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {[
                { icon: Users, text: 'Kelas Kecil & Fokus' },
                { icon: Award, text: 'Guru Berpengalaman' },
                { icon: Target, text: 'Evaluasi Rutin' },
              ].map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <badge.icon className="w-4 h-4 text-[#ff8c00]" />
                  <span className="text-sm font-medium text-gray-700">{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-illustration.png"
                  alt="Siswa belajar di Starlish Bimbel"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">100+</p>
                  <p className="text-xs text-gray-500">Siswa Aktif</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge 2 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#ffc107] to-[#ff8c00] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">4.9/5</p>
                  <p className="text-xs text-gray-500">Rating Orang Tua</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-[#ff8c00] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// About Section
function AboutSection() {
  return (
    <AnimatedSection id="tentang" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Tentang Kami
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Tentang <span className="text-gradient">Starlish Bimbel</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
          >
            Starlish Bimbel adalah lembaga bimbingan belajar yang menyediakan pendampingan akademik mulai dari Calistung TK, SD semua mata pelajaran, SMP (Matematika, Fisika, Kimia, Biologi), hingga SMA jurusan IPA dan IPS. Kami berkomitmen membantu setiap siswa memahami materi secara mendalam, meningkatkan prestasi, dan membangun rasa percaya diri dalam belajar.
          </motion.p>
        </div>

        {/* Visi & Misi Cards */}
        <motion.div
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 md:gap-8"
        >
          {/* Visi */}
          <motion.div
            variants={scaleIn}
            className="group"
          >
            <Card className="h-full bg-gradient-to-br from-[#fff8e1] to-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover">
              <CardContent className="p-6 md:p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Visi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Menjadi lembaga bimbingan belajar terpercaya yang membantu setiap siswa mencapai potensi terbaik mereka melalui pendidikan berkualitas dan pendekatan personal yang hangat.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Misi */}
          <motion.div
            variants={scaleIn}
            className="group"
          >
            <Card className="h-full bg-gradient-to-br from-[#ffecd2] to-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover">
              <CardContent className="p-6 md:p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ffc107] to-[#ff8c00] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Misi</h3>
                <ul className="space-y-3 text-gray-600">
                  {[
                    'Menyediakan kelas kecil dengan perhatian maksimal',
                    'Menghadirkan guru berpengalaman dan peduli',
                    'Menerapkan sistem belajar yang terstruktur',
                    'Memberikan laporan perkembangan berkala'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#ff8c00] mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Programs Section
function ProgramsSection() {
  const programs = [
    {
      icon: BookText,
      title: 'Paket Calistung',
      description: 'Program dasar untuk anak TK dengan metode belajar yang menyenangkan dan interaktif.',
      features: [
        'Pilihan 8x / 12x / 16x per bulan',
        'Durasi 1 jam per pertemuan',
        'Kelas kecil & metode interaktif',
        'Belajar baca, tulis, dan hitung'
      ],
      color: 'from-[#ff8c00] to-[#ffc107]'
    },
    {
      icon: BookOpen,
      title: 'Bimbel SD',
      description: 'Pendampingan lengkap semua mata pelajaran untuk siswa SD dengan pendekatan yang menyenangkan.',
      features: [
        'Semua mata pelajaran',
        'Durasi 1 jam 30 menit',
        'Maksimal 6 anak per kelas',
        'Materi sesuai kurikulum'
      ],
      color: 'from-[#ffc107] to-[#ff8c00]'
    },
    {
      icon: Calculator,
      title: 'Bimbel SMP',
      description: 'Pendalaman materi untuk siswa SMP dengan fokus pada pemahaman konsep dan latihan soal.',
      features: [
        'Matematika, Fisika, Kimia, Biologi',
        'Pendalaman materi mendalam',
        'Evaluasi rutin setiap bab',
        'Persiapan ujian lengkap'
      ],
      color: 'from-[#ff8c00] to-[#ffc107]'
    },
    {
      icon: Atom,
      title: 'Bimbel SMA',
      description: 'Program intensif untuk siswa SMA jurusan IPA dan IPS dengan strategi belajar efektif.',
      features: [
        'Jurusan IPA & IPS',
        'Strategi pengerjaan soal',
        'Evaluasi berkala',
        'Persiapan UTBK & SNBT'
      ],
      color: 'from-[#ffc107] to-[#ff8c00]'
    }
  ]

  return (
    <AnimatedSection id="program" className="py-16 md:py-24 bg-gradient-to-b from-white to-[#fff8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Program & Layanan
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Program <span className="text-gradient">Unggulan</span> Kami
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Pilih program yang sesuai dengan kebutuhan anak Anda
          </motion.p>
        </div>

        {/* Programs Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              variants={scaleIn}
              className="group"
            >
              <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${program.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <program.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {program.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {program.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-[#ff8c00] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Advantages Section
function AdvantagesSection() {
  const advantages = [
    {
      icon: Users,
      title: 'Kelas Kecil & Fokus',
      description: 'Maksimal 6 siswa per kelas untuk perhatian optimal'
    },
    {
      icon: Award,
      title: 'Guru Berpengalaman',
      description: 'Pengajar profesional dengan pengalaman mengajar bertahun-tahun'
    },
    {
      icon: BookOpen,
      title: 'Sistem Belajar Terstruktur',
      description: 'Kurikulum yang jelas dan metode pembelajaran efektif'
    },
    {
      icon: Target,
      title: 'Laporan Perkembangan',
      description: 'Update berkala kepada orang tua tentang progress anak'
    }
  ]

  return (
    <AnimatedSection id="keunggulan" className="py-16 md:py-24 bg-[#fff8e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Mengapa Starlish?
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            <span className="text-gradient">Keunggulan</span> Starlish
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Komitmen kami untuk memberikan yang terbaik untuk masa depan anak Anda
          </motion.p>
        </div>

        {/* Advantages Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {advantages.map((advantage, index) => (
            <motion.div
              key={advantage.title}
              variants={scaleIn}
              className="group text-center"
            >
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover">
                <div className="w-16 h-16 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <advantage.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {advantage.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Gallery Section
function GallerySection() {
  const galleryImages = [
    { src: '/images/gallery-1.png', alt: 'Siswa belajar bersama' },
    { src: '/images/gallery-2.png', alt: 'Guru menjelaskan materi' },
    { src: '/images/gallery-3.png', alt: 'Suasana kelas' },
    { src: '/images/gallery-4.png', alt: 'Aktivitas diskusi' },
    { src: '/images/gallery-5.png', alt: 'Anak menulis dan berhitung' },
    { src: '/images/gallery-6.png', alt: 'Interaksi guru dan murid' },
  ]

  return (
    <AnimatedSection id="galeri" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Galeri
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            <span className="text-gradient">Kegiatan</span> Kelas Kami
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Lihat suasana belajar yang hangat dan menyenangkan di Starlish Bimbel
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg img-zoom"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <p className="text-white font-medium text-sm">{image.alt}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const testimonials = [
    '/images/testimonial-1.jpg',
    '/images/testimonial-2.jpg',
    '/images/testimonial-3.jpg',
    '/images/testimonial-4.jpg',
    '/images/testimonial-5.jpg',
    '/images/testimonial-6.jpg',
  ]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <AnimatedSection id="testimoni" className="py-16 md:py-24 bg-gradient-to-b from-[#fff8e1] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Testimoni
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Kata <span className="text-gradient">Orang Tua</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Testimoni nyata dari orang tua yang sudah mempercayakan anak belajar di Starlish
          </motion.p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Desktop View - Show 3 images */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((image, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group"
              >
                <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
                  <Image
                    src={image}
                    alt={`Testimoni ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile View - Carousel */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative aspect-[9/16] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg bg-white">
                  <Image
                    src={testimonials[currentIndex]}
                    alt={`Testimoni ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Mobile */}
          <div className="flex justify-center gap-4 mt-6 lg:hidden">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="rounded-full border-[#ff8c00] text-[#ff8c00] hover:bg-[#ff8c00] hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-6 bg-[#ff8c00]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="rounded-full border-[#ff8c00] text-[#ff8c00] hover:bg-[#ff8c00] hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

// Contact Section
function ContactSection() {
  return (
    <AnimatedSection id="kontak" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            variants={fadeIn}
            className="inline-block text-[#ff8c00] font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Kontak
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            <span className="text-gradient">Lokasi</span> & Kontak
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Kunjungi kami atau hubungi untuk informasi lebih lanjut
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            variants={fadeInUp}
            className="space-y-6"
          >
            {/* Address */}
            <Card className="bg-gradient-to-br from-[#fff8e1] to-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Alamat</h3>
                    <p className="text-gray-600 text-sm">
                      Ruko Golden 8 Blok J No. 16, Jl. Ki Hajar Dewantara Boulevard Raya, Gading Serpong, Pakulonan Barat, Kec. Kelapa Dua, Kab. Tangerang, Banten 15810
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="bg-gradient-to-br from-[#fff8e1] to-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                    <Link 
                      href="https://wa.me/6285183127242" 
                      className="text-[#ff8c00] hover:text-[#e67e00] font-medium"
                    >
                      0851-8312-7242
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="bg-gradient-to-br from-[#fff8e1] to-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <Link 
                      href="mailto:starlish.course@gmail.com" 
                      className="text-[#ff8c00] hover:text-[#e67e00] font-medium"
                    >
                      starlish.course@gmail.com
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="bg-gradient-to-br from-[#fff8e1] to-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff8c00] to-[#ffc107] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                    <p className="text-gray-600 text-sm">
                      Senin - Jumat: 14:00 - 20:00 WIB<br />
                      Sabtu: 08:00 - 18:00 WIB<br />
                      Minggu: 08:00 - 16:00 WIB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Google Maps */}
          <motion.div
            variants={fadeInUp}
            className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8912!2d106.6164!3d-6.2391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fb9a09d12a3b%3A0x49af4e8e1b5c3d2a!2sGolden%208%20Blok%20J%20No.16%2C%20Jl.%20Ki%20Hajar%20Dewantara%20Boulevard%20Raya%2C%20Gading%20Serpong!5e0!3m2!1sen!2sid!4v1738000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Lokasi Starlish Bimbel - Golden 8 Blok J 16 Gading Serpong"
            />
          </motion.div>
        </div>

        {/* CTA Banner */}
        <motion.div
          variants={fadeInUp}
          className="mt-12 md:mt-16"
        >
          <Card className="bg-gradient-to-r from-[#ff8c00] to-[#ffc107] border-0 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Daftarkan Anak Anda Sekarang!
              </h3>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                Dapatkan sesi trial gratis dan lihat perbedaan belajar di Starlish Bimbel
              </p>
              <a
                href="https://wa.me/6285183127242?text=Halo%20Kak%2C%20saya%20ingin%20mendaftar%20di%20Starlish%20Bimbel.%0A%0ANama%3A%20%0AAlamat%3A%20%0AEmail%3A%20%0ANo.%20Telepon%3A%20%0AJenjang%20%28KB%2FTK%2FSD%2FSMP%2FSMA%29%3A%20%0A%0AMohon%20info%20lebih%20lanjut%2C%20terima%20kasih%21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-[#ff8c00] hover:bg-gray-100 font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Hubungi via WhatsApp
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/images/logo.png"
                alt="Starlish Bimbel"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div>
                <span className="font-bold text-lg">Starlish</span>
                <span className="font-light text-lg text-[#ffc107]"> Bimbel</span>
              </div>
              <p className="text-sm text-gray-400">Light Up Your Future</p>
            </div>
          </div>

          {/* Admin Link */}
          <Link 
            href="/admin/login" 
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Admin Login
          </Link>

          {/* Copyright */}
          <p className="text-sm text-gray-400 text-center md:text-right">
            &copy; 2026 Starlish Bimbel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// WhatsApp Floating Button
function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/6285183127242?text=Halo%20Starlish%20Bimbel,%20saya%20ingin%20bertanya%20tentang%20program%20belajar"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300"
      aria-label="Chat via WhatsApp"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 text-white fill-current"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </motion.a>
  )
}

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <AdvantagesSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
