import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  {
    code: '01 / DISIPLIN HARIAN',
    targetValue: 87500,
    prefix: 'Rp ',
    suffix: ' / hari',
    label: 'Safe-to-Spend Riil',
    desc: 'Batas jajan harian otomatis dihitung dari gaji bersih setelah memotong sewa kost, cicilan tetap, & target tabungan.',
  },
  {
    code: '02 / HUNIAN AMAN',
    targetValue: 25,
    prefix: '',
    suffix: '% Maksimal',
    label: 'Plafon Sewa Kost',
    desc: 'Formula pencegah overbudget hunian: membatasi pengeluaran kost maksimal 25% dari take-home pay bulanan.',
  },
  {
    code: '03 / RASIO FLEKSIBEL',
    targetValue: 100,
    prefix: '',
    suffix: '% Terdistribusi',
    label: 'Alokasi 50/30/20 Adaptif',
    desc: 'Slider adaptif Needs, Wants, & Savings yang dapat disesuaikan dengan profil riil mahasiswa, first-jobber, atau eksekutif.',
  },
  {
    code: '04 / DIAGNOSIS KEUANGAN',
    targetValue: 88,
    prefix: '',
    suffix: ' / 100',
    label: 'Skor Kesehatan Finansial',
    desc: 'Indikator audit instan berbasis rasio tabungan darurat, debt ratio, dan kedisiplinan pengeluaran harian.',
  },
];

const lifestyleTiers = [
  {
    id: 'tier-1',
    badge: 'TIER 01 / ENTRY LEVEL',
    salaryBand: 'Gaji < Rp 3.000.000',
    kost: 'Kost Kamar Mandi Luar / Non-AC (Rp 600rb – Rp 850rb)',
    meal: 'Masak Mandiri & Paket Warteg Sederhana (~Rp 25.000/hari)',
    strategy: 'Prioritas pemangkasan pengeluaran jajan sekunder & amankan dana darurat Rp 1-2 juta pertama.',
    status: 'OPTIMASI SURVIVAL & TABUNGAN AWAL',
  },
  {
    id: 'tier-2',
    badge: 'TIER 02 / FIRST JOBBER',
    salaryBand: 'Gaji Rp 3.000.000 – Rp 6.000.000',
    kost: 'Kost AC Standard Kamar Mandi Dalam (Rp 1.100.000 – Rp 1.500.000)',
    meal: 'Kombinasi Warteg + Makan Kantin Kantor (~Rp 45.000/hari)',
    strategy: 'Disiplin batas harian Safe-to-Spend & konsisten menyisihkan 20% gaji saat tanggal gajian.',
    status: 'KESEIMBANGAN PRODUKTIVITAS & TABUNGAN 20%',
  },
  {
    id: 'tier-3',
    badge: 'TIER 03 / PROFESSIONAL',
    salaryBand: 'Gaji > Rp 6.000.000',
    kost: 'Kost Eksklusif / Co-living / Studio Apartemen (Rp 1.800.000 – Rp 2.500.000)',
    meal: 'Paket Retail Supermarket & Kafe Terukur (~Rp 65.000/hari)',
    strategy: 'Tingkatkan rasio investasi/tabungan hingga 30%+ dan proteksi gaya hidup dari lifestyle inflation.',
    status: 'EKSPANSI ASET & KONTROL GAYA HIDUP',
  },
];

export const LandingPage: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();

  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('01 // HERO');

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Swiss Scroll Progress Ruler along top screen
      gsap.to('.swiss-scroll-ruler-fill', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.1,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100);
            setScrollPercent(pct);
            if (pct < 20) setActiveSection('01 // OVERVIEW');
            else if (pct < 45) setActiveSection('02 // FORMULA');
            else if (pct < 70) setActiveSection('03 // ARSITEKTUR');
            else if (pct < 88) setActiveSection('04 // LIFESTYLE TIERS');
            else setActiveSection('05 // ONBOARDING');
          },
        },
      });

      // 2. Hero Headline & Badges Entrance
      gsap.from('.hero-copy > *', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
      });

      // 3. Hero Preview Panel Entrance (Static in place, no scroll parallax)
      gsap.from('.hero-preview-panel', {
        x: 40,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: 'power3.out',
        clearProps: 'transform',
      });

      // 4. Radar scanner bar animation inside terminal
      gsap.to('.terminal-scan', {
        y: 190,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 5. Kinetic Marquee Scroll-Velocity Coupling
      const marqueeTrack = document.querySelector('.swiss-marquee-track');
      if (marqueeTrack) {
        let currentX = 0;
        const baseSpeed = -1.2;

        const updateMarquee = () => {
          currentX += baseSpeed;
          if (currentX <= -600) currentX = 0;
          gsap.set(marqueeTrack, { x: currentX });
        };

        gsap.ticker.add(updateMarquee);

        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const boost = Math.min(Math.max(velocity / 120, -10), 10);
            currentX -= boost;
          },
        });
      }

      // 6. Metrics Section - Staggered entrance & Animated Number Counters
      gsap.from('.metric', {
        scrollTrigger: {
          trigger: '.metrics',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 35,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
      });

      // Animate numerical counters when metrics scroll into view
      metrics.forEach((m, idx) => {
        const counterEl = document.getElementById(`metric-counter-${idx}`);
        if (counterEl) {
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: m.targetValue,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.metrics',
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              if (m.targetValue > 1000) {
                counterEl.textContent = `${m.prefix}${Math.round(proxy.val).toLocaleString('id-ID')}${m.suffix}`;
              } else {
                counterEl.textContent = `${m.prefix}${Math.round(proxy.val)}${m.suffix}`;
              }
            },
          });
        }
      });

      // 7. Orange Banner Section Reveal
      gsap.from('.orange h2', {
        scrollTrigger: {
          trigger: '.orange',
          start: 'top 82%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.orange-grid p', {
        scrollTrigger: {
          trigger: '.orange-grid',
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.65,
        ease: 'power2.out',
      });

      // 8. Lifestyle Tiers Interactive Scroll Activation
      lifestyleTiers.forEach((tier) => {
        const el = document.getElementById(tier.id);
        if (el) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 70%',
            end: 'bottom 35%',
            toggleClass: { targets: el, className: 'tier-active-highlight' },
          });
        }
      });

      gsap.from('.feature', {
        scrollTrigger: {
          trigger: '.features',
          start: 'top 85%',
        },
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all',
      });

      // 9. CTA Section Reveal
      gsap.from('.cta > *', {
        scrollTrigger: {
          trigger: '.cta',
          start: 'top 88%',
        },
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out',
      });

      // Refresh ScrollTrigger calculations after all styles mount
      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=register');
    }
  };

  const handleDemo = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div ref={root} className="fatrack-landing">
      {/* SWISS SCROLL PROGRESS RULER */}
      <div className="swiss-scroll-ruler">
        <div className="swiss-scroll-ruler-fill" />
      </div>

      {/* SWISS HUD SCROLL TRACKER BADGE */}
      <div className="swiss-scroll-tracker-badge">
        <span className="pulse-dot" />
        <span>{activeSection}</span>
        <b style={{ color: 'var(--orange)' }}>{scrollPercent}%</b>
      </div>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="brand">
          <span className="avatar">FA</span>
          <b>FATRACK</b>
          <i>/</i>
          <span>PERSONAL FINANCE ADVISOR</span>
        </div>
        <nav>
          <a href="#formula">FORMULA</a>
          <a href="#lifestyle">GAYA HIDUP</a>
          <a href="#metrik">SPESIFIKASI</a>
          <a href="#tentang">PRINSIP</a>
        </nav>
        <div className="actions">
          <button className="nav-link" type="button" onClick={() => navigate('/auth?mode=login')}>
            MASUK
          </button>
          <button className="pill dark" type="button" onClick={handleStart}>
            MULAI SEKARANG
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> EDISI 2026 / PERSONAL FINANCE INDONESIA
            </div>
            <h1>
              NAVIGASI GAJI
              <br />
              DAN GAYA HIDUP
              <br />
              DENGAN PRESISI.
            </h1>
            <p className="lead">
              Platform penasihat keuangan personal untuk first-jobber & pekerja muda Indonesia.
              Konversi angka gaji bulanan menjadi batas jajan harian dan rekomendasi gaya hidup nyata (tipe kost & paket belanja retail).
            </p>
            <div className="hero-bottom">
              <div>
                <button className="pill dark" type="button" onClick={handleStart}>
                  BUKA AKUN GRATIS
                </button>
                <button className="outline" type="button" onClick={handleDemo}>
                  COBA DEMO LANGSUNG →
                </button>
              </div>
              <div className="micro">
                <span>TARGET AUDIENCE<strong>FIRST-JOBBER & PEKERJA</strong></span>
                <span>METODOLOGI<strong>SAFE-TO-SPEND + 50/30/20</strong></span>
                <span>INTEGRASI RETAIL<strong>ALFAMART / INDOMARET</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT TERMINAL PREVIEW */}
          <aside className="hero-preview-panel terminal">
            <div className="terminal-head">
              <span className="terminal-pulse">■</span> TELEMETRI KEUANGAN PERSONAL
              <span>ALGORITMA LIVE</span>
            </div>

            <div className="terminal-body">
              <div className="worth terminal-card">
                <span className="terminal-scan" />
                <small>
                  01 / SIMULASI SAFE-TO-SPEND <b className="green">LIMIT AKTIF</b>
                </small>
                <strong>Rp 87.500 <small style={{ fontSize: '14px', fontWeight: 500 }}>/ hari</small></strong>
                <span>FORMULA: (GAJI NETTO − BIAYA TETAP − TABUNGAN) ÷ HARI</span>
              </div>

              <div className="twins terminal-card">
                <div>
                  <small>SIMULASI GAJI BULANAN</small>
                  <b>Rp 5.500.000</b>
                  <span>Siklus: Tgl 25</span>
                </div>
                <div>
                  <small>PLAFON KOST MAKSIMAL</small>
                  <b className="accent">Rp 1.375.000</b>
                  <span>Maks 25% Gaji</span>
                </div>
              </div>

              <div className="allocation terminal-card">
                <small>REKOMENDASI ALOKASI 50/30/20</small>
                <span>
                  Needs (Kost + Makan + Transport) <b>50% · Rp 2.750.000</b>
                  <i><em style={{ width: '50%' }} /></i>
                </span>
                <span>
                  Wants (Jajan Kopi & Lifestyle) <b>30% · Rp 1.650.000</b>
                  <i><em style={{ width: '30%', backgroundColor: 'var(--orange)' }} /></i>
                </span>
                <span>
                  Savings (Dana Darurat & Investasi) <b>20% · Rp 1.100.000</b>
                  <i><em style={{ width: '20%', backgroundColor: '#008547' }} /></i>
                </span>
              </div>
            </div>

            <div className="terminal-foot">
              DISIPLIN FINANSIAL <b>STATUS: ZERO ARITHMETIC DRIFT</b>
            </div>
          </aside>
        </section>

        {/* KINETIC MARQUEE STRIP */}
        <section className="swiss-marquee-section">
          <div className="swiss-marquee-track">
            <span>FATRACK <b className="sep">/</b> PERSONAL FINANCE ADVISOR</span>
            <span><b className="sep">✦</b> SAFE-TO-SPEND FORMULA</span>
            <span><b className="sep">✦</b> ZERO ARITHMETIC DRIFT</span>
            <span><b className="sep">✦</b> 50/30/20 ADAPTIVE RATIO</span>
            <span><b className="sep">✦</b> KOST & MINIMARKET RECOMMENDATION</span>
            <span><b className="sep">✦</b> EDISI INDONESIA 2026</span>
            <span><b className="sep">✦</b> SUPABASE ENCRYPTED</span>
            <span>FATRACK <b className="sep">/</b> PERSONAL FINANCE ADVISOR</span>
            <span><b className="sep">✦</b> SAFE-TO-SPEND FORMULA</span>
            <span><b className="sep">✦</b> ZERO ARITHMETIC DRIFT</span>
          </div>
        </section>

        {/* METRICS SECTION WITH ANIMATED SCROLL COUNTERS */}
        <section id="metrik" className="metrics">
          {metrics.map((m, idx) => (
            <article className="metric" key={m.code}>
              <small>{m.code}</small>
              <strong id={`metric-counter-${idx}`}>
                {m.prefix}0{m.suffix}
              </strong>
              <b style={{ display: 'block', fontSize: '13px', margin: '4px 0', color: '#111' }}>
                {m.label}
              </b>
              <p>{m.desc}</p>
            </article>
          ))}
        </section>

        {/* ORANGE BANNER */}
        <section className="orange reveal">
          <small>PRINSIP 01 / ARSITEKTUR KEUANGAN SWISS DESIGN</small>
          <h2>
            UANG ADALAH ALAT KEBEBASAN,
            <br />
            BUKAN SUMBER KECEMASAN.
          </h2>
          <div className="orange-grid">
            <p>
              <b>01 / DEFINISI BATAS JAJAN HARIAN</b>
              Tidak perlu menebak apakah Anda boleh jajan kopi hari ini. Angka Safe-to-Spend memberi jawaban pasti seketika.
            </p>
            <p>
              <b>02 / VISUALISASI KOST & MAKAN REALISTIS</b>
              Jangan biarkan sewa kost menggerogoti lebih dari 25% gaji Anda. FATrack memetakan batas sewa kost dan biaya makan harian.
            </p>
            <p>
              <b>03 / INTEGRASI SUPABASE & PRIVASI RLS</b>
              Data keuangan Anda dilindungi Row Level Security dan tidak pernah dijual ke pihak ketiga.
            </p>
          </div>
        </section>

        {/* LIFESTYLE RECOMMENDATION TIERS */}
        <section id="lifestyle" className="features">
          <div className="section-head">
            <div>
              <small className="accent">LIFESTYLE MAPPING ENGINE</small>
              <h2>MATRIKS GAYA HIDUP SESUAI KAPASITAS</h2>
            </div>
            <small>STANDAR PENGELUARAN ANAK MUDA DI KOTA BESAR</small>
          </div>

          <div className="feature-grid">
            {lifestyleTiers.map((tier) => (
              <article className="feature reveal" id={tier.id} key={tier.id}>
                <small className="accent">{tier.badge}</small>
                <h3>{tier.salaryBand}</h3>
                <p>{tier.strategy}</p>

                <div className="mini">
                  <b>PLAFON OPERASIONAL BULANAN</b>
                  <span>
                    Hunian: <em>{tier.kost}</em>
                  </span>
                  <span>
                    Konsumsi: <em>{tier.meal}</em>
                  </span>
                </div>

                <footer>
                  STATUS: {tier.status} <a href="#hero" onClick={handleStart}>TERAPKAN →</a>
                </footer>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="formula" className="cta reveal">
          <small className="accent">MULAI LANGKAH DISIPLIN KEUANGAN</small>
          <h2>ATUR GAJI ANDA DENGAN STRUKTUR JELAS.</h2>
          <p className="lead">
            Bergabunglah dengan anak muda Indonesia yang mengontrol arus kas dan gaya hidup dengan kalkulasi riil.
          </p>
          <div style={{ marginTop: '24px' }}>
            <button className="pill dark" type="button" onClick={handleStart}>
              BUAT AKUN SEKARANG
            </button>
            <button className="outline" type="button" onClick={handleDemo} style={{ marginLeft: '12px' }}>
              MASUK KE DEMO MODE
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="tentang" className="site-footer">
        <div>
          <small>01 / IDENTITAS</small>
          <p>FATrack adalah sistem personal finance advisor untuk ekosistem kerja Indonesia.</p>
        </div>
        <div>
          <small>02 / FORMULA DASAR</small>
          <p>Safe-to-Spend Daily Formula<br />50/30/20 Adaptive Allocation<br />25% Max Rent Ratio</p>
        </div>
        <div>
          <small>03 / DATABASE & KEAMANAN</small>
          <p>Supabase Postgres Engine<br />Row Level Security (RLS)<br />Local Storage Failover</p>
        </div>
        <div>
          <small>04 / STATUS SISTEM</small>
          <p className="green">● OPERASIONAL NORMAL</p>
        </div>
      </footer>
    </div>
  );
};
