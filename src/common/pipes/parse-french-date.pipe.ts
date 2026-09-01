import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const FR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

@Injectable()
export class ParseFrenchDatePipe implements PipeTransform<
  string | undefined,
  Date | undefined
> {
  transform(value: string) {
    if (value === undefined) return undefined;

    const match = FR_DATE.exec(value);

    if (!match)
      throw new BadRequestException('Date must be in DD/MM/YYYY format');

    const [, dd, mm, yyyy] = match;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

    if (
      date.getFullYear() !== Number(yyyy) ||
      date.getMonth() !== Number(mm) - 1 ||
      date.getDate() !== Number(dd)
    ) {
      throw new BadRequestException('Invalid calendar date');
    }

    return date;
  }
}
