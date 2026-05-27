import { ToOneRel } from '../common/json-api/relationships.model';

export interface IncludedAddonData {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, ToOneRel>;
}
