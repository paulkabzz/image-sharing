import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import {  useSignInAccount } from "@/lib/react-query/queriesAndMutations";
import { SigninValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Queries
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // Handler
  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const isLoggedIn = await checkAuthUser();
  
      // Check if user is already logged in
      if (isLoggedIn) {
        toast({ title: "You're already logged in." });
        return navigate("/");  // Redirect to dashboard or home
      }
  
      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });
  
      if (!session) {
        return toast({ title: "Something went wrong. Please try again." });
      }
  
      const userLoggedIn = await checkAuthUser();

      if (userLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Login failed. Please try again." });
        return false;
      }
    } catch (error) {
      console.log({ error });
      toast({ title: "Login failed. Please try again." });
    }
  };
  
  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.png" width={250} height={250} alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 !text-[#131313]">
          Log in to your account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2 !text-[14px]">
          Welcome back! Please enter your details.
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary !text-[12px]">
            {isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader isDark={false} /> Loading...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-small-regular text-center mt-2 !text-[#131313] !text-[14px]">
            Don't have an account?
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;