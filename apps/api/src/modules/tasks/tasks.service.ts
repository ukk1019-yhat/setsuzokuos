import { db } from '../../storage/db';
import {
  CreateTaskInput,
  UpdateTaskInput,
  CreateSubtaskInput,
  CreateTaskCommentInput,
  TaskStatus,
  TaskDto,
} from '@setsuzoku/shared';

export class TasksService {
  private async formatTask(task: any): Promise<TaskDto> {
    const assignee = task.assignedToId ? await db.findUserById(task.assignedToId) : null;
    const subtasks = await db.getSubtasks(task.id);
    const comments = await db.getTaskComments(task.id);

    const formattedComments = await Promise.all(
      comments.map(async (c) => {
        const user = await db.findUserById(c.userId);
        return {
          id: c.id,
          taskId: c.taskId,
          userId: c.userId,
          userName: user?.fullName || 'Colleague',
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        };
      })
    );

    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: assignee
        ? {
            id: assignee.id,
            fullName: assignee.fullName,
            email: assignee.email,
          }
        : null,
      subtasks: subtasks.map((s) => ({
        id: s.id,
        taskId: s.taskId,
        title: s.title,
        isCompleted: s.isCompleted,
        completedAt: s.completedAt ? s.completedAt.toISOString() : null,
      })),
      comments: formattedComments,
    };
  }

  public async getTasks(
    organizationId: string,
    filters?: { projectId?: string; assignedToId?: string; status?: TaskStatus }
  ): Promise<TaskDto[]> {
    const list = await db.getTasks(organizationId, filters);
    return Promise.all(list.map((t) => this.formatTask(t)));
  }

  public async getTaskById(organizationId: string, id: string): Promise<TaskDto> {
    const task = await db.findTaskById(id);
    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const proj = await db.findProjectById(task.projectId);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Task not found in this organization');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    return this.formatTask(task);
  }

  public async createTask(
    organizationId: string,
    input: CreateTaskInput,
    userId: string
  ): Promise<TaskDto> {
    const proj = await db.findProjectById(input.projectId);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    const task = await db.createTask({
      projectId: input.projectId,
      milestoneId: input.milestoneId,
      assignedToId: input.assignedToId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'TASK_CREATED',
      resource: 'Task',
      resourceId: task.id,
      diff: input,
    });

    return this.formatTask(task);
  }

  public async updateTask(
    organizationId: string,
    id: string,
    input: UpdateTaskInput,
    userId: string
  ): Promise<TaskDto> {
    const task = await db.findTaskById(id);
    if (!task) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const proj = await db.findProjectById(task.projectId);
    if (!proj || proj.organizationId !== organizationId) {
      const err: any = new Error('Task not found');
      err.statusCode = 404;
      err.code = 'TASK_NOT_FOUND';
      throw err;
    }

    const updated = await db.updateTask(id, {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });

    await db.logAudit({
      organizationId,
      userId,
      action: 'TASK_UPDATED',
      resource: 'Task',
      resourceId: id,
      diff: { before: task, after: updated },
    });

    return this.formatTask(updated);
  }

  public async addSubtask(taskId: string, input: CreateSubtaskInput) {
    const task = await db.findTaskById(taskId);
    if (!task) throw new Error('Task not found');
    return db.addSubtask(taskId, input.title);
  }

  public async toggleSubtask(subtaskId: string) {
    return db.toggleSubtask(subtaskId);
  }

  public async addComment(taskId: string, userId: string, input: CreateTaskCommentInput) {
    const task = await db.findTaskById(taskId);
    if (!task) throw new Error('Task not found');
    return db.addTaskComment({
      taskId,
      userId,
      content: input.content,
    });
  }
}

export const tasksService = new TasksService();

