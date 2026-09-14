const assetAllocations = [
  { name: 'Surat Berharga Negara (SBN/FR)', percentage: '45%' },
  { name: 'Pasar Modal & Indeks Global', percentage: '32.5%' },
  { name: 'Kas & Deposito Terproteksi', percentage: '22.5%' },
];

export function Terminal() {
  return (
    <aside className="terminal">
      <div className="terminal-head">
        <span className="terminal-pulse">■</span> CONSOLE / TELEMETRI MODAL
        <span>LIVE_SOCKET: 128.4 FPS</span>
      </div>

      <div className="terminal-body">
        <div className="worth terminal-card">
          <span className="terminal-scan" />
          <small>
            01 / TOTAL KEKAYAAN BERSIH <b className="green">+14.2% MoM</b>
          </small>
          <strong>Rp 1.482.000.000</strong>
          <span>VALUASI AUDIT PER 31 JAN 2025 100% TERVERIFIKASI</span>
        </div>

        <div className="twins terminal-card">
          <div>
            <small>CADANGAN LIKUID</small>
            <b>Rp 412.500.000</b>
            <span>Rasio Kas: 27.8%</span>
          </div>
          <div>
            <small>RUNWAY OPERASIONAL</small>
            <b className="accent">28.4 Bulan</b>
            <span>Burn: Rp 14.5M / bln</span>
          </div>
        </div>

        <div className="allocation terminal-card">
          <small>DISTRIBUSI KELAS ASET</small>
          {assetAllocations.map((item) => (
            <span key={item.name}>
              {item.name}
              <b>{item.percentage}</b>
              <i>
                <em style={{ width: item.percentage }} />
              </i>
            </span>
          ))}
        </div>
      </div>

      <div className="terminal-foot">
        ENKRIPSI BLAKE3 256-BIT <b>STATUS: REAL-TIME LEDGER ACTIVE</b>
      </div>
    </aside>
  );
}
