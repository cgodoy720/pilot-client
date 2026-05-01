import { useQueries, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export interface BedrockProject {
  id: string;
  name: string;
  description: string;
  owner_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: string;
  owner: string | null;
  owner_ids: string[];
  deadline: string | null;
  startDate: string | null;
  description: string | null;
  updates: string | null;
  links: string[];
  dependsOn: string[];
  sort_order: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  status: string;
  priority: string;
  owner: string | null;
  owner_ids: string[];
  description: string;
  sourceLinks: string[];
  tasks: ProjectTask[];
}

export interface ProjectWorkstream {
  id: string;
  name: string;
  description: string;
  milestones: ProjectMilestone[];
}

export interface ProjectDetail extends BedrockProject {
  workstreams: ProjectWorkstream[];
  contributors: { user_email: string; role: string }[];
}

interface ProjectsResponse {
  success: boolean;
  data: BedrockProject[];
}

interface ProjectDetailResponse {
  success: boolean;
  data: ProjectDetail;
}

async function fetchProjects(): Promise<BedrockProject[]> {
  const { data } = await api.get<ProjectsResponse>("/api/projects");
  return data.data ?? [];
}

async function fetchProjectDetail(id: string): Promise<ProjectDetail> {
  const { data } = await api.get<ProjectDetailResponse>(`/api/projects/${id}`);
  return data.data;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 60_000,
  });
}

export function useProjectDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["project-detail", id],
    queryFn: () => fetchProjectDetail(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/**
 * Fan-out fetch — every project's full tree, in parallel. Used by the
 * global Tasks page to flatten tasks across all projects.
 */
export function useAllProjectDetails() {
  const list = useProjects();
  const ids = (list.data ?? []).map((p) => p.id);
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["project-detail", id],
      queryFn: () => fetchProjectDetail(id),
      staleTime: 60_000,
      enabled: !!id,
    })),
  });
  return {
    isLoading: list.isLoading || queries.some((q) => q.isLoading),
    isError: list.isError || queries.some((q) => q.isError),
    error: list.error ?? queries.find((q) => q.error)?.error ?? null,
    projects: list.data ?? [],
    details: queries.map((q) => q.data).filter((d): d is ProjectDetail => !!d),
  };
}
