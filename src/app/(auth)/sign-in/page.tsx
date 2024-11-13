import { getCurrent } from "@/features/auth/actions";
import { SignInCard } from "@/features/auth/components/sign-in-card";
import { redirect } from "next/navigation";

const SingnInPage = async () => {
  const user = await getCurrent();
  if (user) redirect("/");
  return (
    <>
      <SignInCard />
      {/* <SignUpCard /> */}
    </>
  );
};

export default SingnInPage;
