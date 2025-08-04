'use client';

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center ">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="text-sm text-gray-500">Welcome, Jhay (Admin)</div>
    </header>
  );
}
