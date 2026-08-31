import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

type DriverErrorWithCode = Error & { code?: string };

export function isUniqueViolation(
  error: unknown,
): error is QueryFailedError<DriverErrorWithCode> {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as DriverErrorWithCode).code === PG_UNIQUE_VIOLATION
  );
}

export function isForeignKeyViolation(
  error: unknown,
): error is QueryFailedError<DriverErrorWithCode> {
  return (
    error instanceof QueryFailedError &&
    (error.driverError as DriverErrorWithCode).code === PG_FOREIGN_KEY_VIOLATION
  );
}
