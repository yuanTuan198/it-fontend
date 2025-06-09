import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAchievedTaskMutation,
  useTaskByIdQuery,
  useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const TaskDetails = () => {
  const { user } = useAuth();
  const { taskId, projectId, workspaceId } = useParams<{
    taskId: string;
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const { data, isLoading } = useTaskByIdQuery(taskId!) as {
    data: { task: Task; project: Project };
    isLoading: boolean;
  };
  const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
  const { mutate: achievedTask, isPending: isAchieved } = useAchievedTaskMutation();

  if (isLoading) return <Loader />;
  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Task not found</div>
      </div>
    );
  }

  const { task, project } = data;
  const isUserWatching = task?.watchers?.some(
    (watcher) => watcher._id.toString() === user?._id.toString()
  );

  const handleWatchTask = () => {
    watchTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Task watched"),
        onError: () => toast.error("Failed to watch task"),
      }
    );
  };

  const handleAchievedTask = () => {
    achievedTask(
      { taskId: task._id },
      {
        onSuccess: () => toast.success("Task achieved"),
        onError: () => toast.error("Failed to achieve task"),
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>
          {task.isArchived && (
            <Badge variant="outline" className="ml-2">Lưu trữ</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWatchTask}
            disabled={isWatching}
          >
            {isUserWatching ? (
              <>
                <EyeOff className="mr-2 size-4" />
                Bỏ theo dõi
              </>
            ) : (
              <>
                <Eye className="mr-2 size-4" />
                Theo dõi
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAchievedTask}
            disabled={isAchieved}
          >
            {task.isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card p-6 rounded-xl shadow-sm space-y-6">
            {/* Status & Priority */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <TaskStatusSelector status={task.status} taskId={task._id} />
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                      ? "default"
                      : "outline"
                  }
                  className="capitalize"
                >
                  Ưu tiên: {task.priority}
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {}}
                  className="hidden md:inline-block"
                >
                  Xoá phiếu
                </Button>
              </div>
            </div>

            {/* Title & Time */}
            <div>
              <TaskTitle title={task.title} taskId={task._id} />
              <p className="text-sm text-muted-foreground">
                Đã tạo {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Nội dung</h3>
              <TaskDescription description={task.description || ""} taskId={task._id} />
            </div>

            <TaskAssigneesSelector
              task={task}
              assignees={task.assignees}
              projectMembers={project.members as any}
            />

            <TaskPrioritySelector priority={task.priority} taskId={task._id} />

            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
          </div>

          <CommentSection taskId={task._id} members={project.members as any} />
        </div>

        {/* Right content */}
        <div className="lg:col-span-4 space-y-6">
          <Watchers watchers={task.watchers || []} />
          <TaskActivity resourceId={task._id} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
