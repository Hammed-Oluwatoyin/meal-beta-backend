import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { entities } from './database/entities-list';
import { UsersModule } from './users/users.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { MealsModule } from './meals/meals.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { ShopModule } from './shop/shop.module';
import { ProgressModule } from './progress/progress.module';
import { CustomRequestsModule } from './custom-requests/custom-requests.module';
import { DietitianModule } from './dietitian/dietitian.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities,
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    OnboardingModule,
    MealsModule,
    MealPlansModule,
    ShopModule,
    ProgressModule,
    CustomRequestsModule,
    DietitianModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
