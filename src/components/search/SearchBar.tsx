"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="hidden md:flex items-stretch border border-[#DDDDDD] rounded-full
                    shadow-sm hover:shadow-md transition-shadow cursor-pointer divide-x divide-[#DDDDDD]
                    flex-1 max-w-md">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Search destinations"
        className="flex-1 px-4 py-2 rounded-l-full focus:outline-none text-sm"
      />
      <button
        type="submit"
        className="p-2 bg-[#FF385C] text-white rounded-full hover:bg-[#E31C5F] transition-colors flex-shrink-0 m-1"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
