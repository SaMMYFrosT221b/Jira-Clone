"use client";
import { DottedSeperator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "../schemas";
import { useSignUp } from "../api/use-signup";

export const SignUpCard = () => {
  const { mutate, isPending } = useSignUp();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof signUpSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex justify-center items-center text-center p-7">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
      </CardHeader>
      <CardDescription className="text-center mb-2">
        By signing up you agree to our{" "}
        <Link href="/privacy">
          <span className="text-blue-700">Privacy Policy</span>
        </Link>{" "}
        and{" "}
        <Link href="/terms">
          <span className="text-blue-700">Terms of Service</span>
        </Link>
      </CardDescription>
      <div className=" px-7">
        <DottedSeperator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="text"
                      placeholder="Enter your name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="email"
                      placeholder="Enter your email address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="password"
                      placeholder="Enter your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" size="lg" disabled={isPending}>
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <div>
        <DottedSeperator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          <FcGoogle className="mr-2 size-5" />
          Login with Google
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          <FaGithub className="mr-2 size-5" />
          Login with Github
        </Button>
      </CardContent>
      <div className="px-7">
        <DottedSeperator />
      </div>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
          Already have an account?
          <Link href="/sign-in">
            <span className="text-blue-700"> Sign In</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
