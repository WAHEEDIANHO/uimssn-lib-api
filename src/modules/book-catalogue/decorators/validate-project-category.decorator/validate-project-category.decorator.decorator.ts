import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { BookCatalogueCategoriesEnum } from '@uimssn/modules/book-catalogue/enums/book-catalogue-categories..enum';

export function ValidateProjectCategory(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateProjectCategory',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: BookCatalogueCategoriesEnum[], args: ValidationArguments) {
          if (!Array.isArray(value)) return true;

          const hasProject = value.includes(BookCatalogueCategoriesEnum.FINAL_YEAR_PROJECT);
          if (hasProject && value.length > 1) {
            return false;
          }
          return true;
        },
        defaultMessage() {
          return 'When Final Year Project is selected, no other categories can be selected';
        },
      },
    });
  };
}
