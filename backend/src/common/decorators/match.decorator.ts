import {
	Validate,
	type ValidationArguments,
	type ValidationOptions,
	ValidatorConstraint,
	type ValidatorConstraintInterface
} from 'class-validator';

@ValidatorConstraint({
	name: 'Match',
	async: false
})
export class MatchConstraint implements ValidatorConstraintInterface {
	public validate(value: unknown, args: ValidationArguments): boolean {
		const relatedProperty: unknown = args.constraints[0];

		if (typeof relatedProperty !== 'string') {
			return false;
		}

		if (value === undefined || value === null) {
			return false;
		}

		const object = args.object as Record<string, unknown>;

		const relatedValue = object[relatedProperty];

		return value === relatedValue;
	}

	public defaultMessage(args: ValidationArguments): string {
		const relatedProperty: unknown = args.constraints[0];

		return `Поле ${args.property} должно совпадать с полем ${String(relatedProperty)}`;
	}
}

export function Match(property: string, options?: ValidationOptions): PropertyDecorator {
	return Validate(MatchConstraint, [property], options);
}
