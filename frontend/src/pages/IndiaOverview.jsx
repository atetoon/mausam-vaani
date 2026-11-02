
function IndiaOverview() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] px-5 py-7 text-[#14243a] md:px-7 lg:px-8">
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight text-[#10233d]">
          India Overview
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          National air quality overview across Indian cities.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">
          India-wide air quality map
        </h2>

        <div className="flex min-h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500">
            India air quality overview is under development.
          </p>
          <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
            City-level monitoring data will be displayed here once
            the national data integration is implemented.
          </p>
        </div>
      </section>
    </div>
  );
}

export default IndiaOverview;
