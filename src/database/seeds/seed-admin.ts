import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/enums/user-role.enum';

const MIN_PASSWORD_LENGTH = 12;

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email) throw new Error('ADMIN_EMAIL is missing');

  if (!password) throw new Error('ADMIN_PASSWORD is missing');

  if (password.length < MIN_PASSWORD_LENGTH)
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);

    if (await usersService.existsByEmail(email)) {
      console.log(`Admin account already exists: ${email}`);
      return;
    }

    const admin = await usersService.create(
      { email, password },
      UserRole.ADMIN,
    );
    console.log(`Admin account created: ${admin.id} (${email})`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
