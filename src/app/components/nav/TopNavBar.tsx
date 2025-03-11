import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/20/solid";

const TopNavBar = () => {
  return (
    <div className="sticky top-0 left-0 w-full navbar bg-base-100 shadow-sm z-50">
      {/* Left Side */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl md:text-2xl">
          <span className="block sm:hidden">TSP</span>
          <span className="hidden sm:block">The Scrum Poker</span>
        </Link>
      </div>

      {/* Right Side */}
      <div className="hidden sm:flex gap-2">
        <Link href="/" className="btn bg-primary btn-ghost">Sign Up</Link>
        <Link href="/" className="btn btn-ghost">Login</Link>
        {/* <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
            <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
        </div>
        <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
            <a className="justify-between">
                Profile
                <span className="badge">New</span>
            </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Logout</a></li>
        </ul>
        </div> */}
      </div>

      {/* Mobile Menu */}
      <div className="sm:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <button className="btn btn-square btn-ghost">
                <Bars3Icon className="h-6 w-6" />
            </button>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-40 p-2 shadow"
          >
            <li>
              <Link href="/">Sign Up</Link>
            </li>
            <li>
              <Link href="/">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;