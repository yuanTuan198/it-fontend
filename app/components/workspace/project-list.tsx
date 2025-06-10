import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/projetc-card";
import { useAuth } from "@/provider/auth-context";

interface ProjectListProps {
  workspaceId: string;
  projects: Project[];

  onCreateProject: () => void;
}

export const ProjectList = ({
  workspaceId,
  projects,
  onCreateProject,
}: ProjectListProps) => {

  const { user } = useAuth();
  return (
    <div>
      <h3 className="text-xl font-medium mb-4">Group</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          user?._id == "68468c63640b367b4dabb4ff" ? (
            <NoDataFound
            title="Chưa có nhóm"
            description="Tạo nhóm để bắt đầu"
            buttonText="Tạo nhóm"
            buttonAction={onCreateProject}
          />
          ) : <div>Không có trong group nào</div>
          
        ) : (
          projects.map((project) => {
            const projectProgress = 0;

            return (
              <ProjectCard
                key={project._id}
                project={project}
                progress={projectProgress}
                workspaceId={workspaceId}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
