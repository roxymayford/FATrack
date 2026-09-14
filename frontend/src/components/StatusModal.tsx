type StatusModalProps = {
  kind: 'loading' | 'not-found';
  onClose?: () => void;
};

export function StatusModal({ kind, onClose }: StatusModalProps) {
  const loading = kind === 'loading';

  return (
    <div
      className={`status-modal ${loading ? 'status-modal--loading' : 'status-modal--error'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-title"
      aria-busy={loading}
    >
      <div className="status-modal__backdrop" onClick={onClose} />
      <section className="status-modal__content">
        {loading ? (
          <>
            <span className="status-modal__spinner" aria-hidden="true" />
            <small>MEMUAT PROTOKOL</small>
            <h2 id="status-title">MENYIAPKAN AKSES.</h2>
            <p>Menghubungkan kredensial Anda dengan layanan Kontor.</p>
          </>
        ) : (
          <>
            <small className="accent">ERROR 404</small>
            <h2 id="status-title">LAYANAN TIDAK DITEMUKAN.</h2>
            <p>Endpoint autentikasi belum tersedia. Coba lagi setelah backend dikonfigurasi.</p>
            <button className="pill dark" type="button" onClick={onClose}>
              KEMBALI
            </button>
          </>
        )}
      </section>
    </div>
  );
}
