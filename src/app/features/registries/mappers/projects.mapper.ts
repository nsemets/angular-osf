import { Project } from '../models';
import { ProjectsResponseJsonApi } from '../models/projects-json-api.model';

export class ProjectsMapper {
  static fromProjectsResponse(response: ProjectsResponseJsonApi): Project[] {
    return response.data.map((item) => ({
      id: item.id,
      title: item.attributes.title,
    }));
  }
}
