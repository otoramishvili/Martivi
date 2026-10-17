'use client';

// Picks a service in the order form and scrolls to it.
export default function OrderButton({ value }) {
  return (
    <button
      className="btn btn-small"
      onClick={() => window.dispatchEvent(new CustomEvent('pick-service', { detail: value }))}
    >
      შეკვეთა
    </button>
  );
}
