const numbers = Array.from({ length: 100 }, (_, index) => index + 1);

export default function Home() {
  return (
    <main className="page-shell">
      <div className="reference">
        <header className="reference__header">
          <p className="eyebrow">
            <span className="eyebrow__rule" aria-hidden="true" />
            Number reference
          </p>
          <h1 className="reference__title">Numbers 1–100</h1>
          <p className="reference__intro">A clear, quick chart for finding every number.</p>
        </header>

        <ol className="number-grid" aria-label="Numbers 1 to 100 in ascending order">
          {numbers.map((number) => (
            <li className="number-cell" key={number}>
              {number}
            </li>
          ))}
        </ol>

        <footer className="reference__footer">
          <span>Ascending order</span>
          <span>10 rows · 10 columns</span>
        </footer>
      </div>
    </main>
  );
}
