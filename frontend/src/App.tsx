import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AuthPage, type AuthMode } from './pages/AuthPage';
import { Terminal } from './components/Terminal';
import { Dashboard } from './pages/Dashboard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles/index.css';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  ['01 / ASET TERPANTAU', 'Rp 48.2 Miliar', 'Total likuiditas yang dikelola lebih dari 1.200 portofolio institusi & individu di Kontor.'],
  ['02 / AKURASI REKONSILIASI', '99.98%', 'Presisi matematis neraca tanpa margin error pada multi-rekening perbankan.'],
  ['03 / WAKTU PENCATATAN HARIAN', '< 45 Detik', 'Input ergonomis keyboard-centric mempercepat alokasi kas harian.'],
  ['04 / ZERO CLOUD LATENCY', '0.00 ms', 'Penyimpanan lokal. Bekerja tanpa internet dengan respons instan.'],
];

const features = [
  ['01 / MODUL KAS', 'PENCATATAN KAS & ALOKASI', 'Input transaksi secepat kilat dengan pintasan keyboard terstruktur. Pengelompokan multi-tier mencegah kebocoran modal.'],
  ['02 / ANALISIS RISIKO', 'RUNWAY & RISK FORECASTING', 'Simulasi stres-skenario pasar dan uji ketahanan modal terhadap pembekuan arus kas masuk.'],
  ['03 / KRIPTOGRAFI MANDIRI', 'PRIVASI TOTAL & ENKRIPSI LOKAL', 'Arsitektur Zero-Knowledge Proof. Seluruh catatan keuangan dienkripsi lokal di memori perangkat.'],
];

const cashflowMatrix = [
  ['EKSPANSI MODAL & INVESTASI', '50.0%', 'Rp 32.500.000', '+2.4% SESUAI TARGET'],
  ['BIAYA HIDUP POKOK (OPERASIONAL)', '25.0%', 'Rp 16.250.000', '0.0% EFISIENSI OPTIMAL'],
  ['DANA TAKTIS & PELUANG', '15.0%', 'Rp 9.750.000', '+1.0% TERJAGA'],
  ['DISCRETIONARY & PENGEMBANGAN DIRI', '10.0%', 'Rp 6.500.000', '-3.4% DIBAWAH BUDGET'],
];

export function App() {
  const root = useRef<HTMLDivElement>(null);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [dashboard, setDashboard] = useState(() => window.location.pathname === '/dashboard');

  useEffect(() => {
    window.history.replaceState(null, '', dashboard ? '/dashboard' : '/');
  }, [dashboard]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
      gsap.from('.terminal', { x: 40, opacity: 0, duration: 1, delay: 0.25, ease: 'power3.out' });
      gsap.from('.terminal-card', { y: 18, opacity: 0, duration: 0.7, delay: 0.7, stagger: 0.12, ease: 'power2.out' });
      gsap.to('.terminal-pulse', { opacity: 0.35, scale: 1.25, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.terminal-scan', { y: '100%', duration: 2.8, repeat: -1, ease: 'none' });
      gsap.fromTo(
        '.allocation em',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.1, delay: 1.1, stagger: 0.15, ease: 'power2.out' }
      );
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.from(el, { y: 35, opacity: 0, duration: 0.75, scrollTrigger: { trigger: el, start: 'top 82%' } });
      });
      gsap.from('.metric', { y: 20, opacity: 0, stagger: 0.12, duration: 0.6, scrollTrigger: { trigger: '.metrics', start: 'top 80%' } });
    }, root);

    return () => ctx.revert();
  }, []);

  if (dashboard) {
    return <Dashboard onLogout={() => setDashboard(false)} />;
  }

  if (authMode) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthenticated={() => {
          setAuthMode(null);
          setDashboard(true);
        }}
      />
    );
  }

  return (
    <div ref={root}>
      <header className="topbar">
        <div className="brand">
          <span className="avatar">K</span>
          <b>KONTOR</b>
          <i>/</i>
          <span>CAPITAL TRACKER</span>
        </div>
        <nav>
          <a className="active" href="#princip">PRINSIP</a>
          <a href="#fitur">FITUR</a>
          <a href="#matrix">METRIK</a>
          <a href="#footer">DOKUMENTASI</a>
        </nav>
        <div className="actions">
          <button className="nav-link" type="button" onClick={() => setAuthMode('login')}>
            MASUK
          </button>
          <button className="pill dark" type="button" onClick={() => setAuthMode('register')}>
            MULAI SEKARANG
          </button>
        </div>
      </header>

      <main>
        <section id="princip" className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> EDISI 2025.1 / PROTOKOL AKURASI TINGGI
            </div>
            <h1>KONTROL TOTAL ATAS ARUS KEUANGAN DAN ALOKASI MODAL.</h1>
            <p className="lead">
              Sistem pelacak kekayaan dan likuiditas dengan disiplin tipografi Swiss. Dirancang untuk kepastian finansial absolut tanpa distraksi visual.
            </p>
            <div className="hero-bottom">
              <div>
                <button className="pill dark" type="button" onClick={() => setAuthMode('register')}>
                  BUKA AKUN GRATIS
                </button>
                <a className="outline" href="#fitur">PELAJARI PROTOKOL →</a>
              </div>
              <div className="micro">
                <span>BASE CURRENCY<strong>IDR (Rupiah)</strong></span>
                <span>DATA INTEGRITY<strong className="green">99.98% AUDITED</strong></span>
                <span>SYNC ARCHITECTURE<strong>LOCAL FIRST / E2E</strong></span>
              </div>
            </div>
          </div>
          <Terminal />
        </section>

        <section className="metrics">
          {metrics.map(([label, value, text]) => (
            <article className="metric" key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="orange reveal">
          <small>PARADIGMA DESAIN 02 / ARSITEKTUR KONTOR</small>
          <h2>
            TIDAK ADA ASUMSI.
            <br />
            HANYA PRESISI MATEMATIKA.
          </h2>
          <div className="orange-grid">
            <p>
              <b>01 / KONVERSI VALAS REAL-TIME</b>
              Kalkulasi instan paritas tukar IDR, CHF, EUR, USD, dan SGD menggunakan mid-market rate.
            </p>
            <p>
              <b>02 / PORTFOLIO REBALANCING</b>
              Peringatan saat deviasi alokasi aset modal melebihi ambang batas risiko.
            </p>
            <p>
              <b>03 / PENGAWASAN LIQUID RUNWAY</b>
              Visualisasi ketahanan modal dalam satuan bulan operasional.
            </p>
          </div>
        </section>

        <section id="fitur" className="features">
          <div className="section-head">
            <div>
              <small>PILAR TEKNOLOGI</small>
              <h2>SPESIFIKASI OPERASIONAL LEDGER</h2>
            </div>
            <small>STANDAR REKAYASA DIE NEUE GRAPHIK</small>
          </div>
          <div className="feature-grid">
            {features.map(([tag, title, text], i) => (
              <article className="feature reveal" key={tag}>
                <small className="accent">{tag}</small>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="mini">
                  <b>{i === 0 ? 'LEDGER AKTUAL' : i === 1 ? 'UJI KETAHANAN RUNWAY' : 'PARAMETRI KEAMANAN SISTEM'}</b>
                  {i === 0 ? (
                    <>
                      <span>Dividen Ekuitas Global <em>+42.500.000</em></span>
                      <span>Sewa Kantor Operasional <em className="red">-18.000.000</em></span>
                      <span>Alokasi Surat Utang Negara <em className="red">-50.000.000</em></span>
                    </>
                  ) : i === 1 ? (
                    <>
                      <span>SKENARIO A: NORMAL <em>28.4 BLN</em></span>
                      <div className="bar"><i style={{ width: '100%' }} /></div>
                      <span>SKENARIO B: SHOCK <em>21.0 BLN</em></span>
                      <div className="bar"><i className="orange-bar" style={{ width: '74%' }} /></div>
                    </>
                  ) : (
                    <>
                      <span>Server-side Data Scraping <em>0% DITIADAKAN</em></span>
                      <span>Hardware Key Support <em className="green">AKTIF</em></span>
                      <span>Klien Open-Audit Standard <em className="green">TERVERIFIKASI</em></span>
                    </>
                  )}
                </div>
                <footer>
                  METRIC: {i === 0 ? 'LATENCY < 8ms' : i === 1 ? 'MONTE CARLO 10K' : 'KUDELSKI SECURITY'}{' '}
                  <a href="#footer">DETAIL →</a>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section id="matrix" className="matrix reveal">
          <small>MATRIKS DISTRIBUSI BULANAN</small>
          <h2>CASHFLOW ALLOCATION MATRIX</h2>
          <p>
            Prinsip alokasi berbasis presisi yang memodifikasi model tradisional menjadi kerangka akumulasi modal mandiri.
          </p>
          <table>
            <thead>
              <tr>
                <th>STRUKTUR ALOKASI</th>
                <th>TARGET RASIO</th>
                <th>NOMINAL BULANAN</th>
                <th>STATUS DEV</th>
              </tr>
            </thead>
            <tbody>
              {cashflowMatrix.map(([cat, ratio, nom, dev]) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  <td>{ratio}</td>
                  <td>{nom}</td>
                  <td className={dev.startsWith('-') ? 'red' : ''}>{dev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="cta reveal">
          <small className="accent">MULAI PENYELARASAN MODAL</small>
          <h2>SIAPKAN STRUKTUR KEUANGAN ANDA HARI INI.</h2>
          <p className="lead">Bergabunglah dengan standar pencatatan aset institusional tanpa kompromi.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              ALAMAT EMAIL RESMI
              <input type="email" placeholder="nama@perusahaan.ch / .id" required />
            </label>
            <button className="pill dark">MULAI UJI COBA 30 HARI</button>
          </form>
        </section>
      </main>

      <footer id="footer" className="site-footer">
        <div>
          <small>01 / MANIFESTO</small>
          <p>Kontor merealisasikan filosofi International Typographic Style ke dalam sistem navigasi finansial berakurasi tinggi.</p>
        </div>
        <div>
          <small>02 / ARSITEKTUR LEDGER</small>
          <p>
            CHF / IDR 17.924,10<br />
            EUR / IDR 16.890,45<br />
            USD / IDR 15.845,00
          </p>
        </div>
        <div>
          <small>03 / DIREKTORI SISTEM</small>
          <p>
            Spesifikasi Algoritma<br />
            Kerapatan Telemetri<br />
            Protokol Integrasi Perbankan
          </p>
        </div>
        <div>
          <small>04 / JAMINAN HUKUM</small>
          <p>STATUS: SISTEM OPERASIONAL NORMAL</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
