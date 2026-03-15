export type NodeType = 'contact' | 'account' | 'opportunity' | 'lead' | 'linkedin';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  val: number;
  color: string;
  meta: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'employment' | 'linkedin_connection' | 'grant_link' | 'primary_contact' | 'account_opportunity';
}

export interface LinkedInContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  organization?: string;
  title?: string;
  connection_date?: string;
}
