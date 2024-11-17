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
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string;
  };
}

export const JoinWorkspaceForm = ({
  initialValues,
}: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      { param: { workspaceId }, json: { code: inviteCode } },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full  border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join workspace</CardTitle>
        <CardDescription>
          You've been invited to join <strong>{initialValues.name}</strong>{" "}
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeperator />
      </div>
      <CardContent className="p-7">
        <div className="flex lg:flex-row gap-x-2 gap-y-2 items-center justify-between">
          <Button
            className="w-full lg:w-fit"
            variant="secondary"
            type="button"
            asChild
            disabled={isPending}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            className="w-full lg:w-fit"
            size="lg"
            type="button"
            onClick={onSubmit}
            disabled={isPending}
          >
            Join the workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
