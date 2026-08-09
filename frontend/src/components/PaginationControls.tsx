import React from "react";
import type { PaginationMeta } from "../types/pagination";

interface PaginationControlsProps {
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const { page, limit, total, totalPages } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        marginTop: "16px",
        background: "var(--card-bg, #1a1f2c)",
        borderRadius: "8px",
        border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
        fontSize: "14px",
      }}
    >
      <div style={{ opacity: 0.8 }}>
        Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{" "}
        <strong>{total}</strong> entries
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onLimitChange && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.7 }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                background: "var(--input-bg, #0f131d)",
                color: "inherit",
                border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
              background: page <= 1 ? "transparent" : "var(--button-bg, #2a324b)",
              color: "inherit",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            Previous
          </button>

          <span style={{ padding: "0 6px", fontWeight: "600" }}>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
              background: page >= totalPages ? "transparent" : "var(--button-bg, #2a324b)",
              color: "inherit",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
