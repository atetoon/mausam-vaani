
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

function MainLayout() {
  const [selectedCity, setSelectedCity] = useState("Noida");

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />

      <main className="min-h-screen md:ml-[226px]">
        <Outlet context={{ selectedCity, setSelectedCity }} />
      </main>
    </div>
  );
}

export default MainLayout;
