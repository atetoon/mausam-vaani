
function MostPollutedCities() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] px-5 py-7 text-[#14243a] md:px-7 lg:px-8">
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight text-[#10233d]">
          Most Polluted Cities
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Compare air pollution levels across Indian cities.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">
          City pollution rankings
        </h2>

        <div className="flex min-h-80 flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-slate-500">
            City rankings are not available yet.
          </p>
          <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
            Rankings will be generated from valid monitoring station
            data using a clearly defined comparison method.
          </p>
        </div>
      </section>
    </div>
  );
}

export default MostPollutedCities;
