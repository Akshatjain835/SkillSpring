import { Menu, School } from "lucide-react";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

function Navbar() {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  //const role = "instructor";
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Logout Successfully!");
      navigate("/login");
    }
  }, [isSuccess]);
  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 fixed top-0 left-0 right-0 duration-300 z-10">
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden justify-between items-center gap-10 h-full md:flex ">
        <div className="flex items-center gap-2">
          <School size={30} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">
              E-Learning
            </h1>
          </Link>
        </div>
        {/* User Icon and dark mode icon */}
        <div className="flex items-center cursor-pointer gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to="my-learning">My Learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {" "}
                    <Link to="profile">Edit Profile</Link>{" "}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuItem onClick={logoutHandler}>
                  Log out
                </DropdownMenuItem>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login / SignUp
              </Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      {/* Mobile Device */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">E-Learning</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="rounded-full hover:bg-gray-300"
              variant="outline"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col ">
            <SheetHeader className="flex flex-row justify-between items-center mt-2">
              <SheetTitle>
                <Link to="/">E-Learning</Link>
              </SheetTitle>
              <DarkMode />
            </SheetHeader>
            <Separator className="mr-2" />
            <nav className="flex flex-col space-y-4">
              <Link to="/my-learning">My Learning</Link>
              <Link to="/profile">Edit Profile</Link>
              <p>Logout</p>
            </nav>
            {user?.role === "instructor" && (
              <SheetFooter>
                <SheetClose asChild>
                  <Button
                    type="submit"
                    onClick={() => navigate(`/admin/dashboard`)}
                  >
                    Dashboard
                  </Button>
                </SheetClose>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default Navbar;
