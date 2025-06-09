import type { User, Workspace } from "@/types";
import { WorkspaceAvatar } from "./workspace-avatar";
import { Button } from "../ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/provider/auth-context";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
  onCreateProject: () => void;
  onInviteMember: () => void;
}

export const WorkspaceHeader = ({
  workspace,
  members,
  onCreateProject,
  onInviteMember,
}: WorkspaceHeaderProps) => {
    const { user, logout } = useAuth();

  const borderColors = [
  "border-pink-500",
  "border-blue-500",
  "border-green-500",
  "border-yellow-500",
  "border-purple-500"
]
console.log(user?._id == "68468c63640b367b4dabb4ff")
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex md:items-center gap-3">
            {workspace.color && (
              <WorkspaceAvatar color={workspace.color} name={workspace.name} />
            )}

            <h2 className="text-xl md:text-2xl font-semibold">
              {workspace.name}
            </h2>
          </div>

          {
            user?._id == "68468c63640b367b4dabb4ff" ? (
              <div className="flex items-center gap-3 justify-between md:justify-start mb-4 md:mb-0">
            <Button variant={"outline"} onClick={onInviteMember}>
              <UserPlus className="size-4 mr-2" />
              Invite
            </Button>
            <Button onClick={onCreateProject}>
              <Plus className="size-4 mr-2" />
              Tạo nhóm
            </Button>
          </div>
            ): <div></div>
          }

          
        </div>

        {workspace.description && (
          <p className="text-sm md:text-base text-muted-foreground">
            {workspace.description}
          </p>
        )}
      </div>

      {members.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Members</span>

          <div className="flex space-x-2">
  {members.map((member, index) => (
    <Avatar
      key={member._id}
      className={`relative h-8 w-8 rounded-full border-2 ${borderColors[index % borderColors.length]} overflow-hidden`}
      title={member.user.name}
    >
      <AvatarImage
        src={member.user.profilePicture}
        alt={member.user.name}
      />
      <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center">
        {member.user.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ))}
</div>
        </div>
      )}
    </div>
  );
};
