import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    };
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);


  const handleTaskClick = (taskId: string) => {
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
    );
  };

  return (
    <div className="space-y-8">
          <BackButton />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {projectProgress}%
            </span>
          </div>

          <Button onClick={() => setIsCreateTask(true)}>Tạo phiếu</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>
                Mới
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                onClick={() => setTaskFilter("In Progress")}
              >
                Đang tiến hành
              </TabsTrigger>
              <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>
                Hoàn thành
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center text-sm gap-2">
              <Badge variant="outline" className="bg-background">
                {tasks.filter((task) => task.status === "To Do").length} Mới
              </Badge>
              <Badge variant="outline" className="bg-background">
                {tasks.filter((task) => task.status === "In Progress").length} Đang tiến hành
              </Badge>
              <Badge variant="outline" className="bg-background">
                {tasks.filter((task) => task.status === "Done").length} Hoàn thành
              </Badge>
            </div>
          </div>

          <TabsContent value="all" className="m-0 space-y-8">
            <TaskColumn
              title="Tất cả"
              tasks={tasks}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <TaskColumn
              title="Mới"
              tasks={tasks.filter((task) => task.status === "To Do")}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <TaskColumn
              title="Đang tiến hành"
              tasks={tasks.filter((task) => task.status === "In Progress")}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <TaskColumn
              title="Hoàn thành"
              tasks={tasks.filter((task) => task.status === "Done")}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />
    </div>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const TaskColumn = ({ title, tasks, onTaskClick }: TaskColumnProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-medium">{title}</h1>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Chưa có phiếu công việc
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:translate-y-1"
    >
      {/* <CardHeader>
        <div className="flex items-center justify-between">
         

          <div className="flex gap-1">
            {task.status !== "To Do" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("mark as to do");
                }}
                title="Mark as To Do"
              >
                <AlertCircle className="size-4" />
                <span className="sr-only">Mark as To Do</span>
              </Button>
            )}
            {task.status !== "In Progress" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("mark as in progress");
                }}
                title="Mark as In Progress"
              >
                <Clock className="size-4" />
                <span className="sr-only">Mark as In Progress</span>
              </Button>
            )}
            {task.status !== "Done" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("mark as done");
                }}
                title="Mark as Done"
              >
                <CheckCircle className="size-4" />
                <span className="sr-only">Mark as Done</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader> */}

      <CardContent>
                      <Link to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="block space-y-1">
                        <h3 className="font-medium truncate">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description || "Không có mô tả"}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge
                            className={
                              task.status === "Done"
                                ? "bg-cyan-600 text-white"
                                : task.status === "In Progress"
                                ? "bg-teal-600 text-white"
                                : "bg-green-500 text-white"
                            }
                          >
                            {task.status === "Done"
                              ? "Hoàn thành"
                              : task.status === "In Progress"
                              ? "Đang tiến hành"
                              : "Mới"}
                          </Badge>
                          {task.priority && (
                            <Badge
                              className={
                                task.priority === "High"
                                  ? "bg-red-500 text-white"
                                  : task.priority === "Medium"
                                  ? "bg-yellow-400 text-black"
                                  : "bg-teal-500 text-white"
                              }
                            >
                              {task.priority === "High"
                                ? "Cao"
                                : task.priority === "Medium"
                                ? "Trung bình"
                                : "Thấp"}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <span className="text-muted-foreground"> {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: vi })}</span>
                          )}
                        </div>
                              {/* <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden"
                    title={member.name}
                  >
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}

                {task.assignees.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    + {task.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div> */}
                      </Link>
      </CardContent>
    </Card>
  );
};