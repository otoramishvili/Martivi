# ოსტატი — ხელოსნების საიტი (Next.js, ბაზის გარეშე)

მთელი კონტენტი — ტექსტები, კატეგორიები, ქვეკატეგორიები, ფასები, FAQ — ინახება ერთ ფაილში:
**`data/content.json`**. ადმინ პანელი (`/admin`) ამ ფაილს არედაქტირებს. მონაცემთა ბაზა არ არის.

## გაშვება

```bash
npm install
npm run dev          # http://localhost:3000   ადმინი: http://localhost:3000/admin
```

ადმინის პაროლი: `.env.local` → `ADMIN_PASSWORD` (ნაგულისხმევი: `admin123` — **შეცვალე!**).

პროდაქშენისთვის:

```bash
npm run build
npm start
```

## სტრუქტურა

```
app/page.js                    მთავარი გვერდი
app/services/[id]/page.js      კატეგორიის გვერდი  →  /services/santeqnika
app/admin/page.js              ადმინ პანელი       →  /admin
app/api/admin/*                შესვლა / გასვლა / კონტენტის წაკითხვა-შენახვა
components/                    Header, Footer, ძიება, შეკვეთის ფორმა, ადმინი
lib/content.js                 content.json-ის წაკითხვა/ჩაწერა (+ ავტომატური ასლები)
lib/format.js                  დამხმარე ფუნქციები (ფასის ფორმატი, tel:, WhatsApp)
data/content.json              მთელი კონტენტი
data/backups/                  ბოლო 20 ვერსია, ყოველ შენახვაზე ავტომატურად
```

## Vercel-ზე განთავსება (ადმინი მუშაობს ცოცხალ საიტზე)

Vercel-ზე ფაილები მხოლოდ წასაკითხია, ამიტომ ადმინის ცვლილებები ინახება **Vercel Blob**-ში
(ფაილური საცავი — არა მონაცემთა ბაზა). ლოკალურად ყველაფერი ისევ `data/content.json`-ში ინახება.

1. GitHub რეპო შემოიტანე Vercel-ში (Framework: **Next.js**, Build/Output/Install — override გამორთული).
2. **Settings → Environment Variables** → დაამატე `ADMIN_PASSWORD`.
3. **Storage** ტაბი → **Create Storage** → **Blob** (Private ან Public — ორივე მუშაობს) → **Connect** ამ პროექტზე.
   Vercel ავტომატურად დაამატებს `BLOB_STORE_ID`-ს (ან ძველ საცავებზე `BLOB_READ_WRITE_TOKEN`-ს).
4. **Redeploy**.

პირველ ჯერზე საიტი იყენებს რეპოში არსებულ `data/content.json`-ს. ადმინში პირველი
„შენახვის“ შემდეგ კონტენტი Blob-ში ინახება და ცვლილებები მაშინვე ჩანს საიტზე.
Blob-ში ინახება უახლესი ვერსია + 5 წინა (სარეზერვო ასლები), შეკუმშული სახით — თითო ~18 KB, ჯამში ~110 KB.

> ⚠️ Blob-ში შენახვის შემდეგ `data/content.json`-ის შეცვლა და push **აღარ** შეცვლის საიტს —
> კონტენტი ადმინიდან შეცვალე. (ან ადმინში „⬆ იმპორტი“ → ატვირთე ფაილი → შენახვა.)

სხვა ჰოსტინგი (VPS, Railway/Render მუდმივი დისკით) — Blob არ სჭირდება, ფაილში ჩაწერა პირდაპირ მუშაობს.

## შეკვეთის ფორმა

„გაგზავნა“ ხსნის WhatsApp-ს უკვე შევსებული შეტყობინებით ადმინში მითითებულ ნომერზე — სერვერი არ სჭირდება.

> ყველა ტექსტი, ნომერი, ფასი და შეფასება სადემონსტრაციოა — ჩაანაცვლე რეალურით გაშვებამდე.

## SEO (Google)

SEO არ ცვლის საიტის გარეგნობას ან ტექსტებს — ყველაფერი ის, რასაც Google კითხულობს.

- **მისამართი**: canonical ბმულები, sitemap და Google-ის მონაცემები მიუთითებს `https://martivi.org`-ზე.
  `martivi-two.vercel.app` და `www.martivi.org` ავტომატურად გადამისამართდება `martivi.org`-ზე (middleware.js).
  სხვა დომენზე გადასვლისას Vercel-ში დაამატე `NEXT_PUBLIC_SITE_URL`.
- **სათაურები და აღწერები** — `lib/seo-defaults.js` (მთავარი გვერდი და თითოეული სერვისი).
  ადმინში შეიძლება შეიცვალოს: „საიტის ტექსტები“ ან „კატეგორიები“ → Google სათაური / აღწერა (ცარიელი = ავტომატური).
- **სურათები**: `public/og/<სერვისი>.png` — გაზიარების სურათები (Facebook, WhatsApp, Google Images),
  `public/logo-square.png` — ლოგო Google-ისთვის, `app/favicon.ico` — ხატულა ძიების შედეგებში.
- **სტრუქტურირებული მონაცემები (JSON-LD)**: ბიზნესი, სერვისები, FAQ (მთავარ გვერდზე), breadcrumbs, ლოგო.
- **/sitemap.xml** (სურათებით) და **/robots.txt** — ავტომატურად; ადმინი და API დახურულია ინდექსაციისთვის.
- Google Search Console-ის კოდი (არასავალდებულო, თუ DNS-ით დაადასტურებ): Vercel → Environment Variables →
  `GOOGLE_SITE_VERIFICATION`.
