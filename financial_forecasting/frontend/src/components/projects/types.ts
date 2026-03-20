export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold';
export type MilestoneStatus = 'On Track' | 'At Risk' | 'Needs Attention' | 'Completed';
export type MilestonePriority = 'Now' | 'Later' | 'On-going';
export type ViewType = 'list' | 'board' | 'timeline' | 'executive';
export type GanttZoom = 'day' | 'week' | 'month';

export interface ProjectTask {
  id: string;
  title: string;
  status: TaskStatus;
  owner: string;
  startDate?: string | null;
  deadline?: string | null;
  description?: string;
  updates?: string;
  links?: string[];
  dependsOn?: string[];
  sortOrder?: number;
}

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  priority: MilestonePriority;
  owner: string;
  description?: string;
  sourceLinks?: string[];
  tasks: ProjectTask[];
}

export interface Workstream {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
}

// Flat task with parent context — used by Kanban and Gantt
export interface FlatTask extends ProjectTask {
  workstreamId: string;
  workstreamName: string;
  milestoneId: string;
  milestoneTitle: string;
  milestonePriority: MilestonePriority;
  milestoneStatus: MilestoneStatus;
}

// Gantt row types
export interface GanttRow {
  type: 'workstream' | 'milestone' | 'task';
  id: string;
  label: string;
  indent: number;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  progress: number;
  dependsOn: string[];
  isCollapsed?: boolean;
  owner?: string;
  milestonePriority?: MilestonePriority;
}

// Mutation callbacks — every view receives these, keeps view components pure
export interface ProjectMutations {
  updateTaskStatus: (taskId: string, status: string) => void;
  updateTaskDates: (taskId: string, startDate: string | null, deadline: string | null) => void;
  updateTask: (taskId: string, data: Record<string, any>) => void;
  updateMilestoneStatus: (milestoneId: string, status: string) => void;
  addTask: (milestoneId: string, title: string) => void;
  addMilestone: (workstreamId: string, title: string) => void;
  deleteTask: (taskId: string) => void;
  deleteMilestone: (milestoneId: string) => void;
}

export interface FilterState {
  workstreams: string[];
  owners: string[];
}
