import { Link } from "@tanstack/react-router";
import { Icon } from "./Icon";

export function PublicNav() {
  return (
    <nav className="bg-navy text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="diversity_3" className="text-navy" />
          </div>
          <span className="font-bold text-lg tracking-tight">First Friend</span>
        </Link>
        <div className="hidden md:flex gap-7 text-sm">
          <a href="/#how" className="opacity-80 hover:text-primary transition">How it works</a>
          <a href="/#mission" className="opacity-80 hover:text-primary transition">Our mission</a>
          <a href="/#community" className="opacity-80 hover:text-primary transition">Community</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm opacity-80 hover:text-primary transition">Login</Link>
          <Link
            to="/signup/new-student"
            className="bg-primary text-navy px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-95 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
