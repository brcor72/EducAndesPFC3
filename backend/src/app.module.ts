import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ForumsModule } from './modules/forums/forums.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { RagModule } from './modules/rag/rag.module';
import { TranslationsModule } from './modules/translations/translations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CoursesModule,
    LessonsModule,
    ProgressModule,
    ForumsModule,
    NotificationsModule,
    DashboardModule,
    AuditModule,
    TutorModule,
    RagModule,
    TranslationsModule,
  ],
  providers: [
    // Aplica globalmente el límite configurado en ThrottlerModule (100/min).
    // Sin este guard global, el rate limiting no se aplicaba a ningún endpoint.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
