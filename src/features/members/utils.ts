import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query, type Databases } from "node-appwrite";

interface GetMembersProps {
  database: Databases;
  userId: string;
  workspaceId: string;
}

export const getMember = async ({
  database,
  userId,
  workspaceId,
}: GetMembersProps) => {
  const members = await database.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("userId", userId),
    Query.equal("workspaceId", workspaceId),
  ]);
  return members.documents[0];
};
