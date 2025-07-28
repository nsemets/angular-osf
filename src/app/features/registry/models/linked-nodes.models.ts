export interface LinkedNode {
  id: string;
  title: string;
  description: string;
  category: string;
  dateCreated: string;
  dateModified: string;
  tags: string[];
  isPublic: boolean;
  contributorsCount?: number;
  htmlUrl: string;
  apiUrl: string;
}

export interface LinkedRegistration {
  id: string;
  title: string;
  description: string;
  category: string;
  dateCreated: string;
  dateModified: string;
  dateRegistered?: string;
  tags: string[];
  isPublic: boolean;
  contributorsCount?: number;
  htmlUrl: string;
  apiUrl: string;
}
