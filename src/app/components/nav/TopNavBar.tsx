import Link from "next/link";
import TopNavBarRight from "./TopNavBarRight";

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
      <TopNavBarRight />
    </div>
  );
};

export default TopNavBar;