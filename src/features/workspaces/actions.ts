"use server";

import { cookies } from "next/headers";
import { Databases, Client, Query, Account } from "node-appwrite";
import { AUTH_COOKIE } from "@/features/auth/constants";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

export const getWorkspaces = async () => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const cookieStore = await cookies();

    const session = cookieStore.get(AUTH_COOKIE);
    if (!session) return { documents: [], total: 0 };

    client.setSession(session.value);

    const database = new Databases(client);
    const account = new Account(client);
    const user = await account.get();

    const members = await database.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);
    if (members.total === 0) {
      return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);
    const workspaces = await database.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );
    return workspaces;
  } catch (err) {
    return { documents: [], total: 0 };
  }
};