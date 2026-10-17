'use client';
import { useEffect, useRef, useState } from 'react';
import { telHref, waHref } from '@/lib/format';

export default function ContactSection({ content, eyebrow = 'კონტაქტი' }) {
  const s = content.settings;
  const [service, setService] = useState('');
  const sectionRef = useRef(null);

  useEffect(() => {
    const onPick = (e) => {
      setService(e.detail);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    window.addEventListener('pick-service', onPick);
    return () => window.removeEventListener('pick-service', onPick);
  }, []);

  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text =
      'გამარჯობა! შეკვეთა საიტიდან:\n' +
      `სახელი: ${f.get('name')}\nტელეფონი: ${f.get('phone')}\n` +
      `სერვისი: ${f.get('service') || '-'}\nუბანი: ${f.get('area') || '-'}\n` +
      `აღწერა: ${f.get('msg') || '-'}`;
    window.open(`${waHref(s.whatsapp)}?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <section id="contact" className="section contact" ref={sectionRef}>
      <div className="wrap contact-in">
        <div>
          <span className="eyebrow light">{eyebrow}</span>
          <h2>{s.formTitle}</h2>
          <p>{s.formText}</p>
          <ul className="contact-list">
            <li><span>ტელეფონი</span><a href={telHref(s.phone)}>{s.phone}</a></li>
            <li><span>WhatsApp</span><a href={waHref(s.whatsapp)} target="_blank" rel="noopener noreferrer">მოგვწერე</a></li>
            <li><span>ელფოსტა</span><a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li><span>სამუშაო საათები</span><b>{s.hours}</b></li>
          </ul>
        </div>
        <form className="form" onSubmit={submit}>
          <label>სახელი<input name="name" required /></label>
          <label>ტელეფონი<input name="phone" type="tel" required /></label>
          <label>
            სერვისი
            <select name="service" value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">აირჩიე</option>
              {content.categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {c.subs.map((sub, i) => {
                    const v = `${c.name} — ${sub.name}`;
                    return <option key={i} value={v}>{v}</option>;
                  })}
                </optgroup>
              ))}
              <option value="რამდენიმე სამუშაო ერთად">რამდენიმე სამუშაო ერთად</option>
            </select>
          </label>
          <label>
            უბანი
            <select name="area" defaultValue="">
              <option value="">აირჩიე</option>
              {content.areas.map((a) => <option key={a} value={a}>{a}</option>)}
              <option value="სხვა">სხვა</option>
            </select>
          </label>
          <label>
            აღწერა
            <textarea name="msg" rows={3} placeholder="რა უნდა გაკეთდეს? ფოტოს WhatsApp-ში მიაყოლებ." />
          </label>
          <button className="btn btn-primary btn-lg" type="submit">გაგზავნა WhatsApp-ით</button>
        </form>
      </div>
    </section>
  );
}
