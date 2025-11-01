"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();
  const currentPath = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Biolinks Map", href: "/biolinks" },
    { name: "Weed Map", href: "/weeds" },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded shadow-lg transition-all"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-800 text-white shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "250px" }}
      >
        <div className="p-6 pt-20 flex flex-col h-full">
          <div>
            <h2 className="text-xl font-bold mb-6">Navigation</h2>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 rounded transition-colors ${
                        currentPath === item.href
                          ? "bg-blue-500"
                          : "hover:bg-slate-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Auth section */}
          <div className="mt-auto pt-6 border-t border-slate-700">
            {session ? (
              <div className="space-y-3">
                <div className="px-4 py-2 text-sm">
                  <div className="font-medium">{session.user?.name}</div>
                  <div className="text-slate-400">({session.user?.group})</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-4 rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30" onClick={toggleSidebar} />}
    </>
  );
}
