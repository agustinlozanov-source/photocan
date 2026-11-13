/** Marcas de tarjeta en versión monocromática, para indicar los medios de pago aceptados. */

export function Visa({ className = "h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" className={className} fill="currentColor" aria-label="Visa" role="img">
      <path d="M18.6 1 14.3 15h-3.4L8.8 3.9c-.1-.6-.3-.8-.8-1.1C7.2 2.4 6 2 4.9 1.8L5 1h5.4c.7 0 1.3.5 1.5 1.3l1.3 7.1L16.6 1h3.4Zm13.3 9.4c0-3.7-5.1-3.9-5.1-5.5 0-.5.5-1 1.6-1.2a7 7 0 0 1 3.7.7l.7-3A10 10 0 0 0 29.3.7c-3.3 0-5.6 1.8-5.6 4.3 0 1.9 1.6 2.9 2.9 3.5 1.3.6 1.7 1 1.7 1.6 0 .9-1 1.3-2 1.3-1.7 0-2.7-.5-3.5-.8l-.6 3c.8.4 2.3.7 3.8.7 3.5 0 5.8-1.7 5.9-4.4ZM40.6 15h3L41 1h-2.8c-.6 0-1.2.4-1.4 1L31.9 15h3.4l.7-1.9h4.2l.4 1.9Zm-3.6-4.5 1.7-4.9 1 4.9H37ZM23.5 1l-2.7 14h-3.3L20.2 1h3.3Z" />
    </svg>
  );
}

export function Mastercard({ className = "h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 22" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-label="Mastercard" role="img">
      <circle cx="12" cy="11" r="9" />
      <circle cx="22" cy="11" r="9" />
    </svg>
  );
}

export function Amex({ className = "h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 22" className={className} aria-label="American Express" role="img">
      <rect x="1" y="1" width="38" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text x="20" y="15" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.5" fill="currentColor">
        AMEX
      </text>
    </svg>
  );
}

export function TarjetasAceptadas({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-black/55 ${className}`}>
      <Visa />
      <Mastercard />
      <Amex />
    </div>
  );
}
