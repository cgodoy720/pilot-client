import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import type { Project } from './types';

const QUERY_KEY = ['projects'];
const TRASH_KEY = ['projects-trash'];

export interface DeletedProject {
  id: string;
  name: string;
  description: string;
  deleted_at: string;
  deleted_by: string | null;
}

export function useProjects() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    QUERY_KEY,
    async () => {
      const res = await apiService.getProjects();
      return (res.data?.data || res.data || []) as Project[];
    },
    { staleTime: 30_000 }
  );

  const projects: Project[] = data || [];

  const { data: trashData, isLoading: trashLoading } = useQuery(
    TRASH_KEY,
    async () => {
      const res = await apiService.getDeletedProjects();
      return (res.data?.data || res.data || []) as DeletedProject[];
    },
    { staleTime: 30_000 }
  );

  const deletedProjects: DeletedProject[] = trashData || [];

  const createMutation = useMutation(
    (name: string) => apiService.createProject({ name }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEY);
        toast.success('Project created');
      },
      onError: () => { toast.error('Failed to create project'); },
    }
  );

  const deleteMutation = useMutation(
    (projectId: string) => apiService.deleteProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEY);
        queryClient.invalidateQueries(TRASH_KEY);
        toast.success('Project moved to trash');
      },
      onError: () => { toast.error('Failed to delete project'); },
    }
  );

  const restoreMutation = useMutation(
    (projectId: string) => apiService.restoreProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEY);
        queryClient.invalidateQueries(TRASH_KEY);
        toast.success('Project restored');
      },
      onError: () => { toast.error('Failed to restore project'); },
    }
  );

  const purgeMutation = useMutation(
    (projectId: string) => apiService.purgeProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(TRASH_KEY);
        toast.success('Project permanently deleted');
      },
      onError: () => { toast.error('Failed to permanently delete project'); },
    }
  );

  const createProject = (name: string) => createMutation.mutateAsync(name);
  const deleteProject = (projectId: string) => deleteMutation.mutate(projectId);
  const restoreProject = (projectId: string) => restoreMutation.mutate(projectId);
  const purgeProject = (projectId: string) => purgeMutation.mutate(projectId);

  return {
    projects, isLoading, error,
    deletedProjects, trashLoading,
    createProject, deleteProject, restoreProject, purgeProject,
  };
}
