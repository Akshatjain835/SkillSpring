import { ChartNoAxesColumn, SquareLibrary, PlusCircle, LayoutDashboard, Sparkles } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Drawer */}
      <aside className="hidden lg:block w-64 space-y-6 border-r border-slate-200/80 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="space-y-1">
          <div className="px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Instructor Portal
            </span>
          </div>

          <Link
            to="dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
              isActive("/admin/dashboard")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ChartNoAxesColumn size={18} />
            <span>Dashboard Analytics</span>
          </Link>

          <Link
            to="course"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
              isActive("/admin/course")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <SquareLibrary size={18} />
            <span>Manage Courses</span>
          </Link>

          <Link
            to="course/create"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
              isActive("/admin/course/create")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <PlusCircle size={18} />
            <span>Create New Course</span>
          </Link>
        </div>
      </aside>

      {/* Main Outlet View Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;

