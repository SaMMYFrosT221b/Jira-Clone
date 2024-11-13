import Image from "next/image";
import Link from "next/link";
import { DottedSeperator } from "./dotted-seperator";
import { Navigation } from "./navigations";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/">
        <Image src="/logo.svg" alt="Logo" width={164} height={48} />
      </Link>
      <DottedSeperator className="my-2" />
      <WorkspaceSwitcher />
      <DottedSeperator className="my-2" />
      <Navigation />
    </aside>
  );
};
