export default function Home() {
  return (
    <div className="flex flex-1 bg-blue-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <div className="rounded-2xl border border-blue-100 bg-white p-6">
          <h1 className="text-2xl font-bold tracking-tight text-blue-800">
            Dhandha: Wholesale + Retail ka smart network
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-700">
            Products browse karo, order request bhejo, aur trusted wholesalers/retailers
            se connect ho jao — sab ek hi app mein.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="/market"
              className="rounded-2xl bg-blue-600 px-5 py-4 text-center text-base font-semibold text-white hover:bg-blue-700"
            >
              Market khol do
            </a>
            <a
              href="/network"
              className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center text-base font-semibold text-blue-700 hover:bg-blue-50"
            >
              Network dekho
            </a>
            <a
              href="/register"
              className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center text-base font-semibold text-blue-700 hover:bg-blue-50"
            >
              Naya account banao
            </a>
            <a
              href="/login"
              className="rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center text-base font-semibold text-blue-700 hover:bg-blue-50"
            >
              Login
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <div className="text-sm font-semibold text-blue-700">Marketplace</div>
            <div className="mt-1 text-sm text-slate-700">
              Product cards, search, category filter, order requests.
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <div className="text-sm font-semibold text-blue-700">Business Network</div>
            <div className="mt-1 text-sm text-slate-700">
              Profiles, connect request, messaging.
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <div className="text-sm font-semibold text-blue-700">Deals Board</div>
            <div className="mt-1 text-sm text-slate-700">
              Bulk requirement ya offer post karo.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
