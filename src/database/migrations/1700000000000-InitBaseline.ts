import { MigrationInterface, QueryRunner } from "typeorm";

export class InitBaseline1700000000000 implements MigrationInterface {
    name = 'InitBaseline1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."profiles_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_healthgoals_enum" AS ENUM('WEIGHT_LOSS', 'WEIGHT_GAIN', 'MAINTENANCE', 'MUSCLE_GAIN', 'GENERAL_HEALTH', 'MANAGE_CONDITION')`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_activitylevel_enum" AS ENUM('LOW', 'MODERATE', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "public"."profiles_plantype_enum" AS ENUM('SINGLE', 'COUPLE', 'FAMILY')`);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "age" integer, "gender" "public"."profiles_gender_enum", "heightCm" double precision, "weightKg" double precision, "householdSize" integer NOT NULL DEFAULT '1', "healthGoals" "public"."profiles_healthgoals_enum" array NOT NULL DEFAULT '{}', "activityLevel" "public"."profiles_activitylevel_enum", "lifestyleInfo" text, "dailySchedule" text, "foodPreferences" text array NOT NULL DEFAULT '{}', "allergies" text array NOT NULL DEFAULT '{}', "medicalConditions" text array NOT NULL DEFAULT '{}', "budgetPerWeek" double precision, "planType" "public"."profiles_plantype_enum" NOT NULL DEFAULT 'SINGLE', "dailyCalorieTarget" integer, "portionSizeMultiplier" double precision NOT NULL DEFAULT '1', "estimatedWeeklyGroceryCost" double precision, "isHighRisk" boolean NOT NULL DEFAULT false, "onboardingCompletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_315ecd98bd1a42dcf2ec4e2e98" UNIQUE ("userId"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."custom_meal_requests_status_enum" AS ENUM('PENDING', 'IN_REVIEW', 'DELIVERED')`);
        await queryRunner.query(`CREATE TABLE "custom_meal_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "dietitianId" uuid, "status" "public"."custom_meal_requests_status_enum" NOT NULL DEFAULT 'PENDING', "details" text NOT NULL, "resultingMealPlanId" uuid, "deliveredAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_0843498f64657acc4164ff48fe" UNIQUE ("resultingMealPlanId"), CONSTRAINT "PK_c445447c827d14314dc60fb5fe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."meal_plans_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "meal_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "dietitianId" uuid, "weekStartDate" date NOT NULL, "status" "public"."meal_plans_status_enum" NOT NULL DEFAULT 'DRAFT', "needsReview" boolean NOT NULL DEFAULT false, "conditionTags" text array NOT NULL DEFAULT '{}', "notes" text, "publishedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6270d3206d074e2a2520f8d0a0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."meal_plan_entries_slot_enum" AS ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')`);
        await queryRunner.query(`CREATE TABLE "meal_plan_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mealPlanId" uuid NOT NULL, "mealId" uuid NOT NULL, "dayOfWeek" integer NOT NULL, "slot" "public"."meal_plan_entries_slot_enum" NOT NULL, "isCompleted" boolean NOT NULL DEFAULT false, "completedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e59db9288416144db4d7bc8579c" UNIQUE ("mealPlanId", "dayOfWeek", "slot"), CONSTRAINT "PK_8384d591c94bb96697f81749b09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."meals_tags_enum" AS ENUM('VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'LOW_CARB', 'DIABETIC_FRIENDLY', 'HEART_HEALTHY', 'LOW_SODIUM', 'HIGH_PROTEIN', 'NUT_FREE')`);
        await queryRunner.query(`CREATE TYPE "public"."meals_defaultslot_enum" AS ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')`);
        await queryRunner.query(`CREATE TABLE "meals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "ingredients" jsonb NOT NULL DEFAULT '[]', "prepSteps" text array NOT NULL DEFAULT '{}', "calories" integer NOT NULL DEFAULT '0', "proteinG" double precision NOT NULL DEFAULT '0', "carbsG" double precision NOT NULL DEFAULT '0', "fatG" double precision NOT NULL DEFAULT '0', "tags" "public"."meals_tags_enum" array NOT NULL DEFAULT '{}', "defaultSlot" "public"."meals_defaultslot_enum" NOT NULL DEFAULT 'LUNCH', "costEstimatePerServing" double precision NOT NULL DEFAULT '0', "createdById" uuid, "isPublished" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "progress_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "date" date NOT NULL, "weightKg" double precision, "caloriesConsumed" integer, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_88ff3a75981d628893a14a0215b" UNIQUE ("userId", "date"), CONSTRAINT "PK_2eac5639de69c25ae31c5449118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shopping_list_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shoppingListId" uuid NOT NULL, "name" character varying NOT NULL, "category" character varying NOT NULL DEFAULT 'Other', "quantity" double precision NOT NULL, "unit" character varying NOT NULL, "isChecked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_043c112c02fdc1c39fbd619fadb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shopping_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "mealPlanId" uuid NOT NULL, "generatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9289ace7dd5e768d65290f3f9de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('PATIENT', 'DIETITIAN', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'PATIENT', "isVerified" boolean NOT NULL DEFAULT false, "verificationToken" character varying, "refreshTokenHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" ADD CONSTRAINT "FK_6275c616b1e2cadf48bf6ab7a2a" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" ADD CONSTRAINT "FK_145af0e3d5b66803826a369dcca" FOREIGN KEY ("dietitianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" ADD CONSTRAINT "FK_0843498f64657acc4164ff48fe6" FOREIGN KEY ("resultingMealPlanId") REFERENCES "meal_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_0ecd9a18e96ee4250df102abccd" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_629523721be05773c614e6e44e8" FOREIGN KEY ("dietitianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "FK_04054fc6ab06c6e4808a0f12a4e" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "FK_524b085da93decd945e8e0364c3" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_1e5718c737b6fe4c5369646fd98" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_logs" ADD CONSTRAINT "FK_92b6044d361009434bf61ed1b48" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopping_list_items" ADD CONSTRAINT "FK_268e82a2d60e718cbaf8354a0f8" FOREIGN KEY ("shoppingListId") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopping_lists" ADD CONSTRAINT "FK_5b9bb541ecf94396d2078d96df8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shopping_lists" ADD CONSTRAINT "FK_02e874eab565a8c91f4623ec43e" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shopping_lists" DROP CONSTRAINT "FK_02e874eab565a8c91f4623ec43e"`);
        await queryRunner.query(`ALTER TABLE "shopping_lists" DROP CONSTRAINT "FK_5b9bb541ecf94396d2078d96df8"`);
        await queryRunner.query(`ALTER TABLE "shopping_list_items" DROP CONSTRAINT "FK_268e82a2d60e718cbaf8354a0f8"`);
        await queryRunner.query(`ALTER TABLE "progress_logs" DROP CONSTRAINT "FK_92b6044d361009434bf61ed1b48"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_1e5718c737b6fe4c5369646fd98"`);
        await queryRunner.query(`ALTER TABLE "meal_plan_entries" DROP CONSTRAINT "FK_524b085da93decd945e8e0364c3"`);
        await queryRunner.query(`ALTER TABLE "meal_plan_entries" DROP CONSTRAINT "FK_04054fc6ab06c6e4808a0f12a4e"`);
        await queryRunner.query(`ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_629523721be05773c614e6e44e8"`);
        await queryRunner.query(`ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_0ecd9a18e96ee4250df102abccd"`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" DROP CONSTRAINT "FK_0843498f64657acc4164ff48fe6"`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" DROP CONSTRAINT "FK_145af0e3d5b66803826a369dcca"`);
        await queryRunner.query(`ALTER TABLE "custom_meal_requests" DROP CONSTRAINT "FK_6275c616b1e2cadf48bf6ab7a2a"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_315ecd98bd1a42dcf2ec4e2e985"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "shopping_lists"`);
        await queryRunner.query(`DROP TABLE "shopping_list_items"`);
        await queryRunner.query(`DROP TABLE "progress_logs"`);
        await queryRunner.query(`DROP TABLE "meals"`);
        await queryRunner.query(`DROP TYPE "public"."meals_defaultslot_enum"`);
        await queryRunner.query(`DROP TYPE "public"."meals_tags_enum"`);
        await queryRunner.query(`DROP TABLE "meal_plan_entries"`);
        await queryRunner.query(`DROP TYPE "public"."meal_plan_entries_slot_enum"`);
        await queryRunner.query(`DROP TABLE "meal_plans"`);
        await queryRunner.query(`DROP TYPE "public"."meal_plans_status_enum"`);
        await queryRunner.query(`DROP TABLE "custom_meal_requests"`);
        await queryRunner.query(`DROP TYPE "public"."custom_meal_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_plantype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_activitylevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_healthgoals_enum"`);
        await queryRunner.query(`DROP TYPE "public"."profiles_gender_enum"`);
    }

}
