import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { object, z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, projectId, assigneeId, status, search, dueDate } =
        c.req.valid("query");
      const member = getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member)
        return c.json({ error: "You are not a member of this workspace" }, 403);
      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];
      if (projectId) query.push(Query.equal("projectId", projectId));
      if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
      if (status) query.push(Query.equal("status", status));
      if (dueDate) query.push(Query.equal("dueDate", dueDate));
      if (search) query.push(Query.search("name", search));

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length ? [Query.contains("$id", projectIds)] : []
      );

      const members = await databases.listDocuments<Project>(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length ? [Query.contains("$id", assigneeIds)] : []
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );
        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({ data: { ...tasks, documents: populatedTasks } });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      console.log("create task");
      const user = c.get("user");
      const databases = c.get("databases");
      const { name, status, workspaceId, projectId, dueDate, assigneeId } =
        c.req.valid("json");
      const member = getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member)
        return c.json({ error: "You are not a member of this workspace" }, 403);
      const highestPositionTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );
      const newPosition = highestPositionTasks.documents.length
        ? highestPositionTasks.documents[0].position + 1000
        : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition,
        }
      );

      return c.json({ data: task });
    }
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );
    const member = getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });

    if (!member)
      return c.json({ error: "You are not a member of this workspace" }, 403);

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);
    return c.json({ data: { $id: task.$id } });
  })
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const { taskId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");

      const { name, status, description, projectId, dueDate, assigneeId } =
        c.req.valid("json");

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const member = getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });
      if (!member)
        return c.json({ error: "You are not a member of this workspace" }, 403);

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        }
      );

      return c.json({ data: task });
    }
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");

    const { users } = await createAdminClient();
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId
    );
    const currentMember = getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });

    if (!currentMember)
      return c.json({ error: "You are not a member of this workspace" }, 403);

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId
    );

    const member = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      task.assigneeId
    );

    const user = await users.get(member.userId);

    const assignee = {
      ...member,
      name: user.name,
      email: user.email,
    };

    return c.json({ data: { ...task, project, assignee } });
  });

export default app;
