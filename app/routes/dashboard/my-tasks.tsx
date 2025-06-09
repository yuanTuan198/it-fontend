import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { vi } from "date-fns/locale";

const MyTasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const initialSort = searchParams.get("sort") || "desc";
  const initialSearch = searchParams.get("search") || "";

  const [filter, setFilter] = useState<string>(initialFilter);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSort === "asc" ? "asc" : "desc"
  );
  const [search, setSearch] = useState<string>(initialSearch);

  useEffect(() => {
    setSearchParams({ filter, sort: sortDirection, search }, { replace: true });
  }, [filter, sortDirection, search]);

  const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
    data: Task[];
    isLoading: boolean;
  };

  const filteredTasks = (myTasks || [])
    .filter((task) => {
      if (filter === "all") return true;
      if (filter === "todo") return task.status === "To Do";
      if (filter === "inprogress") return task.status === "In Progress";
      if (filter === "done") return task.status === "Done";
      if (filter === "achieved") return task.isArchived === true;
      if (filter === "high") return task.priority === "High";
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return sortDirection === "asc"
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const groupedTasks = {
    todo: sortedTasks.filter((t) => t.status === "To Do"),
    inprogress: sortedTasks.filter((t) => t.status === "In Progress"),
    done: sortedTasks.filter((t) => t.status === "Done"),
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Danh sách phiếu</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}>{sortDirection === "asc" ? "Cũ nhất" : "Mới nhất"}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><FilterIcon className="w-4 h-4 mr-2" /> Bộ lọc</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Lọc phiếu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["all", "todo", "inprogress", "done", "achieved", "high"].map((key) => (
                <DropdownMenuItem key={key} onClick={() => setFilter(key)}>{key}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Input placeholder="Tìm kiếm phiếu..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Dạng danh sách</TabsTrigger>
          <TabsTrigger value="board">Dạng bảng</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách phiếu</CardTitle>
              <CardDescription>{sortedTasks.length} phiếu được giao</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {sortedTasks.length > 0 ? sortedTasks.map((task) => (
                  <div key={task._id} className="py-4 hover:bg-muted/50">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <Link to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="font-medium hover:text-primary flex items-center">
                          {task.status === "Done" ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <Clock className="w-4 h-4 text-yellow-500 mr-1" />} {task.title}
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={task.status === "Done" ? "default" : "outline"}>{task.status}</Badge>
                          {task.priority && <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>}
                          {task.isArchived && <Badge variant="outline">Archived</Badge>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Nhóm: <span className="font-medium">{task.project.title}</span></div>
                        <div>Bắt đầu: {format(task.updatedAt, "dd/MM/yyyy", { locale: vi })}</div>
                        {task.dueDate && <div>Quá hạn: {format(task.dueDate, "dd/MM/yyyy", { locale: vi })}</div>}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-muted-foreground">Không tìm thấy phiếu</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(groupedTasks).map(([status, tasks]) => (
              <Card key={status} className="overflow-hidden">
                <CardHeader className="bg-muted">
                  <CardTitle className="flex items-center justify-between">
                    {status === "todo" ? "To Do" : status === "inprogress" ? "In Progress" : "Done"}
                    <Badge variant="outline">{tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {tasks.length > 0 ? tasks.map((task) => (
                    <Card key={task._id} className="p-3 hover:shadow-md">
                      <Link to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="block space-y-1">
                        <h3 className="font-medium truncate">{task.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description || "Không có mô tả"}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {task.priority && <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>}
                          {task.dueDate && <span className="text-muted-foreground">{format(task.dueDate, "dd/MM/yyyy", { locale: vi })}</span>}
                        </div>
                      </Link>
                    </Card>
                  )) : <div className="text-center text-sm text-muted-foreground">Không có phiếu</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasks;
