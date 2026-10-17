import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section">
      <div className="wrap narrow" style={{ textAlign: 'center' }}>
        <h1>გვერდი ვერ მოიძებნა</h1>
        <p>შესაძლოა სერვისი წაიშალა ან ბმული შეიცვალა.</p>
        <Link className="btn btn-primary" href="/">მთავარზე დაბრუნება</Link>
      </div>
    </main>
  );
}
