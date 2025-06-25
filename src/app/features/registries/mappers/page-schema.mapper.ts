import { BlockType } from '../enums';
import { PageSchema, Question } from '../models';
import { SchemaBlocksResponseJsonApi } from '../models/schema-blocks-json-api.model';

export class PageSchemaMapper {
  static fromSchemaBlocksResponse(response: SchemaBlocksResponseJsonApi): PageSchema[] {
    console.log('PageSchemaMapper.fromSchemaBlocksResponse', response);
    const pages: PageSchema[] = [];
    let currentPage!: PageSchema;
    let currentQuestion!: Question;
    response.data.map((item) => {
      console.log('Processing item:', item);
      switch (item.attributes.block_type) {
        case BlockType.PageHeading:
          currentPage = {
            id: item.id,
            title: item.attributes.display_text,
            questions: [],
          };
          pages.push(currentPage);
          break;

        case BlockType.QuestionLabel:
          console.log('QuestionLabel:');
          currentQuestion = {
            id: item.id,
            title: item.attributes.display_text,
            description: item.attributes.help_text,
            type: item.attributes.registration_response_key as Question['type'],
            required: item.attributes.required,
            groupKey: item.attributes.schema_block_group_key,
            responseKey: item.attributes.registration_response_key || undefined,
          };
          currentPage.questions?.push(currentQuestion);
          break;
        case BlockType.SelectInputOption:
          console.log('SelectInputOption:', item);
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push(item.attributes.display_text);

          break;
        default:
          console.warn(`Unexpected block type: ${item.attributes.block_type}`);
          return;
      }
    });

    return pages;
  }
}
