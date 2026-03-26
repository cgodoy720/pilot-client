import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import type { Project } from './types';

const QUERY_KEY = ['projects'];

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
        toast.success('Project deleted');
      },
      onError: () => { toast.error('Failed to delete project'); },
    }
  );

  const createProject = (name: string) => createMutation.mutateAsync(name);
  const deleteProject = (projectId: string) => deleteMutation.mutate(projectId);

  return { projects, isLoading, error, createProject, deleteProject };
}
