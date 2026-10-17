import { telHref, waHref } from '@/lib/format';

// Footer removed. Only the fixed call / WhatsApp bar for phones remains.
export default function Footer({ content }) {
  const s = content.settings;
  return (
    <div className="mobile-bar">
      <a href={telHref(s.phone)}>📞 დარეკე</a>
      <a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
    </div>
  );
}
