import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ParfumsLoading() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <Header />
      <section className="border-b border-brand-black/5 px-6 pb-16 pt-36 md:px-12 md:pt-40">
        <div className="mx-auto max-w-screen-2xl space-y-6">
          <div className="h-3 w-32 animate-pulse rounded-full bg-brand-gold/25" />
          <div className="h-14 max-w-md animate-pulse rounded-lg bg-brand-black/10 md:h-20" />
          <div className="flex flex-wrap gap-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-brand-black/5" />
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-5">
              <div className="aspect-[3/4] animate-pulse rounded-sm bg-brand-black/5" />
              <div className="mx-auto h-2 w-1/4 animate-pulse rounded-full bg-brand-black/5" />
              <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-brand-black/5" />
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
