import { type ReactNode, useState } from "react";
import type { Project } from "../types/api";
import { ProjectList } from "./project-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const DEFAULT_TITLE = "Projects";

type AppShellProps = {
  projects: Project[];
  selectedProjectId: string | null;
  isProjectsLoading: boolean;
  onSelectProject: (projectId: string) => void;
  onLogout: () => void | Promise<void>;
  userEmail?: string | null;
  userName?: string | null;
  children: ReactNode;
};

export function AppShell({
  projects,
  selectedProjectId,
  isProjectsLoading,
  onSelectProject,
  onLogout,
  userEmail,
  userName,
  children,
}: AppShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  const initials = getInitials(userName, userEmail);

  const handleSelectProject = (projectId: string) => {
    onSelectProject(projectId);
    setSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Motion</span>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <span className="hidden text-xs text-muted-foreground md:inline">
              Task Management
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 lg:hidden"
                  aria-label="Select project"
                >
                  <span className="max-w-[140px] truncate">
                    {selectedProject?.name || DEFAULT_TITLE}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Projects</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProjectList
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    isLoading={isProjectsLoading}
                    onSelectProject={handleSelectProject}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 cursor-pointer select-none">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {userName || userEmail || "Signed in"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onLogout();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-h-0 w-full max-w-[1440px] gap-3 px-3 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <ProjectList
            projects={projects}
            selectedProjectId={selectedProjectId}
            isLoading={isProjectsLoading}
            onSelectProject={handleSelectProject}
          />
        </aside>
        <main className="contents">{children}</main>
      </div>
    </div>
  );
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim();
  if (source) {
    const parts = source.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    const combined = `${first}${last}`.trim();
    return combined ? combined.toUpperCase() : "U";
  }

  if (email) {
    const handle = email.split("@")[0] ?? "";
    const segments = handle.split(/[._-]+/).filter(Boolean);
    const first = segments[0]?.[0] ?? handle[0] ?? "";
    const last =
      segments.length > 1
        ? (segments[segments.length - 1]?.[0] ?? "")
        : (handle[1] ?? "");
    const combined = `${first}${last}`.trim();
    return combined ? combined.toUpperCase() : "U";
  }

  return "U";
}
