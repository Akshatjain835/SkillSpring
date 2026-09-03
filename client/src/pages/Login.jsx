import { Loader2, School, Eye, EyeOff, Lock, Mail, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Login");
  const [registerUser, { isLoading: registerIsLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginIsLoading }] = useLoginUserMutation();

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;

    if (!inputData.email || !inputData.password || (type === "signup" && !inputData.name)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const response = await action(inputData).unwrap();
      toast.success(response.message || `${type === "signup" ? "Account created" : "Welcome back"}!`);

      if (type === "signup") {
        setLoginInput((prev) => ({ ...prev, email: signupInput.email }));
        setSignupInput({ name: "", email: "", password: "" });
        setActiveTab("Login");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.data?.message || `${type} failed. Please check your credentials.`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <School size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to E-Learning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of learners and advance your skills today.
          </p>
        </div>

        {/* Form Container Card */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid grid-cols-2 w-full p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
                <TabsTrigger value="Login" className="rounded-xl text-xs font-bold">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="Signup" className="rounded-xl text-xs font-bold">
                  Create Account
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Login Tab */}
            <TabsContent value="Login" className="m-0">
              <form onSubmit={(e) => { e.preventDefault(); handleRegistration("login"); }}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Sign In</CardTitle>
                  <CardDescription className="text-xs">
                    Enter your email and password to access your courses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        value={loginInput.email}
                        onChange={(e) => changeInputHandler(e, "login")}
                        placeholder="name@example.com"
                        className="pl-9 rounded-xl border-slate-200 text-xs h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginInput.password}
                        onChange={(e) => changeInputHandler(e, "login")}
                        placeholder="••••••••"
                        className="pl-9 pr-9 rounded-xl border-slate-200 text-xs h-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 px-6">
                  <Button
                    type="submit"
                    disabled={loginIsLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 font-bold shadow-md shadow-blue-500/25"
                  >
                    {loginIsLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="Signup" className="m-0">
              <form onSubmit={(e) => { e.preventDefault(); handleRegistration("signup"); }}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold">Create Account</CardTitle>
                  <CardDescription className="text-xs">
                    Fill in your details below to get started with E-Learning.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        name="name"
                        value={signupInput.name}
                        onChange={(e) => changeInputHandler(e, "signup")}
                        placeholder="Akshat"
                        className="pl-9 rounded-xl border-slate-200 text-xs h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        value={signupInput.email}
                        onChange={(e) => changeInputHandler(e, "signup")}
                        placeholder="name@example.com"
                        className="pl-9 rounded-xl border-slate-200 text-xs h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={signupInput.password}
                        onChange={(e) => changeInputHandler(e, "signup")}
                        placeholder="At least 6 characters"
                        className="pl-9 pr-9 rounded-xl border-slate-200 text-xs h-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 px-6">
                  <Button
                    type="submit"
                    disabled={registerIsLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-10 font-bold shadow-md shadow-blue-500/25"
                  >
                    {registerIsLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;

