export default interface ISchemaBaseComponent {
  setValues(values: Array<IPartValue>);
  validate(options: IValidationOptions): IValidationError;
  getValuesForValidate(): any | Array<any>;
  getAddedValues(): Array<IPartValue>;
  getEditedValues(baseValues: Array<IPartValue>): Array<IPartValue>;
  getDeletedValues(baseValues: Array<IPartValue>): Array<IPartValue>;
}

export interface IPartValue {
  id?: number;
  value: any;
}

export type AnswerDataType = "float" | "int";

export interface IValidationOptions {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  dataType?: AnswerDataType;
  required?: boolean;
  regex?: string;
}

export interface IValidationError {
  part: number;
  title: string;
  errors: Array<IValidationErrorPart>;
}

export type ValidationErrorType =
  | "required"
  | "regex"
  | "range"
  | "type"
  | "length";

export interface IValidationErrorPart {
  type: ValidationErrorType;
  params?: Array<any>;
}
