
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Wind,
  Calculator,
  BookOpen,
  CircleHelp,
  CloudSun,
  Search,
  MapPin,
} from "lucide-react";

const cities = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai"];

function Sidebar({ selectedCity, setSelectedCity }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "India Overview", icon: Map, path: "/india" },
    { label: "Most Polluted Cities", icon: TrendingUp, path: "/most-polluted" },
  ];

  const resources = [
    { label: "AQI Calculator", icon: Calculator },
    { label: "Blogs", icon: BookOpen },
    { label: "FAQ", icon: CircleHelp },
  ];

  const linkClass = (active) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${
      active
        ? "bg-blue-50 font-semibold text-blue-600"
        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
    }`;

  function handleSearch(event) {
    event.preventDefault();

    const city = search.trim();
    if (!city) return;

    setSelectedCity(city);
    navigate("/");
    setSearch("");
  }

  function handleCityClick(city) {
    setSelectedCity(city);
    navigate("/");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[226px] flex-col border-r border-slate-200 bg-white px-[18px] py-7 md:flex">
      <div className="mb-9 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <CloudSun size={24} />
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-wide text-slate-800">
            MAUSAM VAANI
          </h2>
          <p className="mt-1 text-[9px] tracking-[1.5px] text-slate-400">
            INDIA WEATHER & AIR
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="mb-8 flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-3 focus-within:border-blue-400"
      >
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search any city..."
          className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />
      </form>

      <section className="mb-7">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-widest text-slate-400">
          MENU
        </p>

        {navigation.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `${linkClass(isActive)} mb-1`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </section>

      <section className="mb-7">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-widest text-slate-400">
          POPULAR CITIES
        </p>

        {cities.map((city) => (
          <button
            key={city}
            onClick={() => handleCityClick(city)}
            className={`${linkClass(selectedCity === city)} mb-1`}
          >
            <MapPin size={15} />
            {city}
          </button>
        ))}
      </section>

      <section>
        <p className="mb-3 px-3 text-[10px] font-bold tracking-widest text-slate-400">
          RESOURCES
        </p>

        {resources.map(({ label, icon: Icon }) => (
          <button key={label} className={`${linkClass(false)} mb-1`}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </section>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 px-2 pt-5 text-[10px] text-slate-400">
        <Wind size={16} />
        Monitoring India's environment
      </div>
    </aside>
  );
}

export default Sidebar;
