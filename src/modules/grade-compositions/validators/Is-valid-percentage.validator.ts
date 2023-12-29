import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsValidPercentage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPercentage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'number' &&
            value % 10 === 0 &&
            value > 0 &&
            value <= 100
          );
        },
        defaultMessage() {
          return 'Scale must be a number divisible by 10 and between 0 and 100';
        },
      },
    });
  };
}
