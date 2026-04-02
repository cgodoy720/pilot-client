import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import type { Project } from './types';

/** Extract backend error detail or fall back to a default message. */
function errMsg(err: unknown, fallback: string): string {
  const detail = (err as any)?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}

const QUERY_KEY = ['projects'];
const TRASH_KEY = ['projects-trash'];

export interface DeletedProject {
  id: string;
  name: string;
  description: string;
  owner_email?: string | null;
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
      onError: (err) => { toast.error(errMsg(err, 'Failed to delete project')); },
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
      onError: (err) => { toast.error(errMsg(err, 'Failed to restore project')); },
    }
  );

  const purgeMutation = useMutation(
    (projectId: string) => apiService.purgeProject(projectId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(TRASH_KEY);
        toast.success('Project permanently deleted');
      },
      onError: (err) => { toast.error(errMsg(err, 'Failed to permanently delete project')); },
    }
  );

  const addContributorMutation = useMutation(
    ({ projectId, userEmail }: { projectId: string; userEmail: string }) =>
      apiService.addProjectContributor(projectId, { user_email: userEmail }),
    {
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries(['project', projectId]);
        toast.success('Contributor added');
      },
      onError: (err) => { toast.error(errMsg(err, 'Failed to add contributor')); },
    }
  );

  const removeContributorMutation = useMutation(
    ({ projectId, userEmail }: { projectId: string; userEmail: string }) =>
      apiService.removeProjectContributor(projectId, userEmail),
    {
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries(['project', projectId]);
        toast.success('Contributor removed');
      },
      onError: (err) => { toast.error(errMsg(err, 'Failed to remove contributor')); },
    }
  );

  const transferOwnershipMutation = useMutation(
    ({ projectId, newOwnerEmail }: { projectId: string; newOwnerEmail: string }) =>
      apiService.transferProjectOwnership(projectId, { new_owner_email: newOwnerEmail }),
    {
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries(['project', projectId]);
        queryClient.invalidateQueries(QUERY_KEY);
        toast.success('Ownership transferred');
      },
      onError: (err) => { toast.error(errMsg(err, 'Failed to transfer ownership')); },
    }
  );

  const createProject = (name: string) => createMutation.mutateAsync(name);
  const deleteProject = (projectId: string) => deleteMutation.mutate(projectId);
  const restoreProject = (projectId: string) => restoreMutation.mutate(projectId);
  const purgeProject = (projectId: string) => purgeMutation.mutate(projectId);
  const addContributor = (projectId: string, userEmail: string) =>
    addContributorMutation.mutate({ projectId, userEmail });
  const removeContributor = (projectId: string, userEmail: string) =>
    removeContributorMutation.mutate({ projectId, userEmail });
  const transferOwnership = (projectId: string, newOwnerEmail: string) =>
    transferOwnershipMutation.mutate({ projectId, newOwnerEmail });

  return {
    projects, isLoading, error,
    deletedProjects, trashLoading,
    createProject, deleteProject, restoreProject, purgeProject,
    addContributor, removeContributor, transferOwnership,
  };
}
