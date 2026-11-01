// Google titles and share pictures. Nothing here is shown on the page itself:
// the title appears in Google results and the browser tab, the picture when a page is shared
// (Facebook, WhatsApp) and in Google Images.
// Titles can be replaced in the admin (საიტის ტექსტები / კატეგორიები → Google სათაური).
// Service entries are matched by the service URL (id). Pure data — safe in client components.

export const HOME_TITLE = 'ხელოსანი და მუშახელი თბილისში — გადაზიდვა, მტვირთავები';

export function homeDescriptionDefault(s = {}) {
  const base =
    'ხელოსანი, მუშახელი და მტვირთავები თბილისში ერთ ნომერზე: გადაზიდვა, დალაგება, ნარჩენების გატანა, დემონტაჟი, ღობე, გეოდეზია.';
  return s.phone ? `${base} ☎ ${s.phone}` : base;
}

export const SERVICE_DEFAULTS = {
  gadazidva: {
    title: 'გადაზიდვა თბილისში — ავეჯის გადატანა, მტვირთავები',
    image: '/og/gadazidva.png',
  },
  'mushis-momsakhureba': {
    title: 'მუშახელი და მტვირთავები თბილისში — საათობრივად, დღიურად',
    image: '/og/mushis-momsakhureba.png',
  },
  dalageba: {
    title: 'რემონტის შემდგომი დალაგება თბილისში — ბინა, ოფისი',
    image: '/og/dalageba.png',
  },
  'ghobis-gaketeba': {
    title: 'ღობის მოწყობა თბილისში — ბადე, პროფნასტილი, ჭიშკარი',
    image: '/og/ghobis-gaketeba.png',
  },
  'hidrologia-tsylis-modzieba': {
    title: 'წყლის მოძიება ნაკვეთზე — ჭაბურღილის ადგილის დადგენა',
    image: '/og/hidrologia-tsylis-modzieba.png',
  },
  geodezia: {
    title: 'გეოდეზია თბილისში — საკადასტრო აზომვითი ნახაზი, ტოპოგეგმა',
    image: '/og/geodezia.png',
  },
  'demontazhi-da-ngreva': {
    title: 'დემონტაჟი და ნგრევა თბილისში — ტიხრები, ფილა, იატაკი',
    image: '/og/demontazhi-da-ngreva.png',
  },
  'samsheneblo-narchenebis-gatana': {
    title: 'სამშენებლო ნარჩენების გატანა თბილისში — ნაგვის გატანა',
    image: '/og/samsheneblo-narchenebis-gatana.png',
  },
};

export function serviceExtras(c) {
  const d = SERVICE_DEFAULTS[c.id] || {};
  return {
    title: c.seoTitle?.trim() || d.title || `${c.name} თბილისში`,
    image: d.image || null,
  };
}
