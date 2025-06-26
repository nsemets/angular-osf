import { BlockType, FieldType } from '../enums';
import { PageSchema, Question } from '../models';
import { SchemaBlocksResponseJsonApi } from '../models/schema-blocks-json-api.model';

export class PageSchemaMapper {
  static fromSchemaBlocksResponse(response: SchemaBlocksResponseJsonApi): PageSchema[] {
    console.log('PageSchemaMapper.fromSchemaBlocksResponse', response);
    const pages: PageSchema[] = [];
    let currentPage!: PageSchema;
    let currentQuestion: Question | null = null;
    response.data.map((item) => {
      console.log('Processing item:', item);
      switch (item.attributes.block_type) {
        case BlockType.PageHeading:
          currentPage = {
            id: item.id,
            title: item.attributes.display_text,
            questions: [],
          };
          currentQuestion = null;
          pages.push(currentPage);
          break;

        case BlockType.Paragraph:
          if (!currentQuestion) {
            currentPage.description = item.attributes.display_text;
          } else {
            currentQuestion.paragraphText = item.attributes.display_text;
          }
          break;

        case BlockType.SubsectionHeading:
          currentQuestion = {
            id: item.id,
            displayText: item.attributes.display_text,
            helpText: item.attributes.help_text,
            exampleText: item.attributes.example_text,
            required: item.attributes.required,
            groupKey: item.attributes.schema_block_group_key,
            responseKey: item.attributes.registration_response_key || undefined,
          };
          currentPage.questions?.push(currentQuestion);
          break;

        case BlockType.QuestionLabel:
          console.log('QuestionLabel:');
          currentQuestion = {
            id: item.id,
            displayText: item.attributes.display_text,
            helpText: item.attributes.help_text,
            exampleText: item.attributes.example_text,
            required: item.attributes.required,
            groupKey: item.attributes.schema_block_group_key,
            responseKey: item.attributes.registration_response_key || undefined,
          };
          currentPage.questions?.push(currentQuestion);
          break;

        case BlockType.SelectInputOption:
          if (currentQuestion) {
            currentQuestion.fieldType = FieldType.Radio;
            currentQuestion.options = currentQuestion?.options || [];
            currentQuestion?.options.push(item.attributes.display_text);
          }
          break;
        case BlockType.LongTextInput:
          if (currentQuestion) {
            currentQuestion.fieldType = FieldType.TextArea;
            currentQuestion.exampleText = item.attributes.example_text;
            currentQuestion.helpText = item.attributes.help_text;
          }
          break;
        default:
          console.warn(`Unexpected block type: ${item.attributes.block_type}`);
          return;
      }
    });

    return pages;
  }
}
