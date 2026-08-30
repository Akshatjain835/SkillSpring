import { Menu, School, BookOpen, User, LogOut, LayoutDashboard, Compass } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

function Navbar() {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Logged out successfully!");
      navigate("/login");
    }
  }, [isSuccess, data, navigate]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center h-full px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 dark:bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <School size={24} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            E-Learning
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/course/search"
            className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5 ${
              isActive("/course/search") ? "text-blue-600 font-semibold" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            <Compass size={16} />
            Explore Courses
          </Link>
          {user && (
            <Link
              to="/my-learning"
              className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5 ${
                isActive("/my-learning") ? "text-blue-600 font-semibold" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <BookOpen size={16} />
              My Learning
            </Link>
          )}
        </div>

        {/* User Menu & Controls */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border-2 border-blue-500/30">
                    <AvatarImage
                      src={user?.photoUrl || "https://github.com/shadcn.png"}
                      alt={user?.name || "User Avatar"}
                    />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "EL"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 mt-2 p-2 shadow-xl rounded-xl border border-slate-200/80 dark:border-slate-800/80" align="end">
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <span className="inline-flex items-center w-max mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                      {user?.role || "Student"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5">
                    <Link to="/my-learning" className="flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-500" />
                      My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5">
                    <Link to="/profile" className="flex items-center gap-2">
                      <User size={16} className="text-indigo-500" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "instructor" && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer my-0.5">
                      <Link to="/admin/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard size={16} className="text-emerald-500" />
                        Instructor Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 my-0.5 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 rounded-xl transition-all duration-300"
              >
                Sign In
              </Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <School size={26} className="text-blue-600" />
          <span className="font-extrabold text-xl text-slate-900 dark:text-white">
            E-Learning
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <DarkMode />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-xl">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col p-6 w-80">
              <SheetHeader className="text-left border-b pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <School className="text-blue-600" size={24} />
                  <span className="font-bold text-xl">E-Learning</span>
                </SheetTitle>
              </SheetHeader>

              {user && (
                <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
                  <Avatar className="h-10 w-10 border border-blue-500/30">
                    <AvatarImage src={user?.photoUrl} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col space-y-2 my-4 flex-1">
                <SheetClose asChild>
                  <Link
                    to="/course/search"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Compass size={18} className="text-blue-500" />
                    Explore Courses
                  </Link>
                </SheetClose>
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link
                        to="/my-learning"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <BookOpen size={18} className="text-indigo-500" />
                        My Learning
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User size={18} className="text-purple-500" />
                        Profile Settings
                      </Link>
                    </SheetClose>
                    {user?.role === "instructor" && (
                      <SheetClose asChild>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <LayoutDashboard size={18} className="text-emerald-500" />
                          Instructor Dashboard
                        </Link>
                      </SheetClose>
                    )}
                  </>
                )}
              </nav>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                {user ? (
                  <Button
                    onClick={logoutHandler}
                    variant="destructive"
                    className="w-full justify-center gap-2 rounded-xl"
                  >
                    <LogOut size={16} />
                    Log Out
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 text-white rounded-xl"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


