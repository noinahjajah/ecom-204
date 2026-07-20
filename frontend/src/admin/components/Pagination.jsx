import React from "react";

function getPageNumbers(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }
  return pages;
}

export default function Pagination({ page, totalPages, setPage }) {
  const numbers = getPageNumbers(page, totalPages);

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button
        className="admin-mini-btn"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        ‹
      </button>
      {numbers.map((n, i) =>
        n === "..." ? (
          <span key={i} style={{ padding: "6px 8px", opacity: 0.5 }}>
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            className="admin-mini-btn"
            onClick={() => setPage(n)}
            style={{
              fontWeight: 800,
              border:
                n === page
                  ? "1px solid #b8975a"
                  : "1px solid rgba(92,85,73,0.18)",
              background:
                n === page ? "rgba(184,151,90,0.12)" : "transparent",
            }}
          >
            {n}
          </button>
        )
      )}
      <button
        className="admin-mini-btn"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        ›
      </button>
    </div>
  );
}

