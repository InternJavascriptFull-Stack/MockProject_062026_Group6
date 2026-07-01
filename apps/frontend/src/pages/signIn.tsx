import { Link, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HeartPulse, Mail, Info, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/authUi/card";
import { Input } from "@/components/authUi/input";
import { Label } from "@/components/authUi/label";
import { Button } from "@/components/authUi/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/authUi/tabs";
import { Alert, AlertDescription } from "@/components/authUi/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/authUi/select";

// Form Validation Schema
const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.string().min(1, { message: "Please select a role." }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "nurse@carenest.com",
      password: "password123",
      role: "nurse",
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    console.log("Form Submitted", data);
    // Simulated auth flow
    setTimeout(() => {
      // Mock successful login redirection or state update
      alert(`Logged in as ${data.role} with ${data.email}`);
    }, 500);
  };

  return (
    <Card className="w-full border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-2 pb-6">
      <CardHeader className="flex flex-col items-center space-y-4 pt-6 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-white shadow-sm">
          <HeartPulse size={28} />
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 font-medium px-4">
            Sign in to access the CareNest role-based demo system.
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {/* Tabs */}
        <Tabs defaultValue="signin" className="w-full" onValueChange={(val) => val === 'signup' && navigate(APP_ROUTES.SIGN_UP)}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="signin" className="rounded-lg text-sm font-semibold shadow-sm data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Sign Up
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Password
              </Label>
              <Link to="#" className="text-xs font-semibold text-emerald-500 hover:text-emerald-600">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl border-slate-200 bg-white px-4 tracking-widest"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Select Role
            </Label>
            <Select 
              onValueChange={(value) => setValue("role", value || "nurse", { shouldValidate: true })} 
              defaultValue="nurse"
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-medium text-slate-700">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="nurse">Nurse / RN / LPN</SelectItem>
                <SelectItem value="doctor">Doctor / Physician</SelectItem>
                <SelectItem value="family">Family Member</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs font-medium text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-50/50 text-blue-600 border-blue-100 rounded-xl py-3 px-4">
            <div className="flex gap-3 items-start">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <AlertDescription className="text-xs leading-relaxed font-medium">
                Demo mode: use any email and password. The selected role controls the simulated access level.
              </AlertDescription>
            </div>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-sm font-medium text-slate-500">
              New to CareNest?{" "}
              <Link to={APP_ROUTES.SIGN_UP} className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
