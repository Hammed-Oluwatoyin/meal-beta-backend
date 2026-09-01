import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { RequestStatus } from '../common/enums';
import { CustomMealRequest, User } from '../database/entities';
import { MealPlansService } from '../meal-plans/meal-plans.service';
import { DeliverRequestDto } from './dto/deliver-request.dto';
import { SubmitRequestDto } from './dto/submit-request.dto';

@Injectable()
export class CustomRequestsService {
  constructor(
    @InjectRepository(CustomMealRequest)
    private readonly requestsRepository: Repository<CustomMealRequest>,
    private readonly mealPlansService: MealPlansService,
  ) {}

  private async findOneRaw(id: string): Promise<CustomMealRequest> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: { resultingMealPlan: true },
    });
    if (!request) {
      throw new NotFoundException('Custom meal request not found');
    }
    return request;
  }

  async submit(
    patientId: string,
    dto: SubmitRequestDto,
  ): Promise<CustomMealRequest> {
    const request = this.requestsRepository.create({
      patientId,
      details: dto.details,
      status: RequestStatus.PENDING,
    });
    return this.requestsRepository.save(request);
  }

  async findMine(patientId: string): Promise<CustomMealRequest[]> {
    return this.requestsRepository.find({
      where: { patientId },
      relations: { resultingMealPlan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findQueue(status?: RequestStatus): Promise<CustomMealRequest[]> {
    const requests = await this.requestsRepository.find({
      where: status ? { status } : {},
      relations: { patient: true, dietitian: true },
      order: { createdAt: 'ASC' },
    });
    return requests.map((request) => ({
      ...request,
      patient: request.patient
        ? (AuthService.sanitize(request.patient) as User)
        : request.patient,
      dietitian: request.dietitian
        ? (AuthService.sanitize(request.dietitian) as User)
        : request.dietitian,
    }));
  }

  async findOne(
    id: string,
    userId: string,
    isDietitian: boolean,
  ): Promise<CustomMealRequest> {
    const request = await this.findOneRaw(id);
    if (!isDietitian && request.patientId !== userId) {
      throw new ForbiddenException("Cannot access another patient's request");
    }
    return request;
  }

  async claim(id: string, dietitianId: string): Promise<CustomMealRequest> {
    const request = await this.findOneRaw(id);
    request.dietitianId = dietitianId;
    request.status = RequestStatus.IN_REVIEW;
    return this.requestsRepository.save(request);
  }

  async deliver(
    id: string,
    dietitianId: string,
    dto: DeliverRequestDto,
  ): Promise<CustomMealRequest> {
    const request = await this.findOneRaw(id);
    if (request.dietitianId && request.dietitianId !== dietitianId) {
      throw new ForbiddenException(
        'This request is already claimed by another dietitian',
      );
    }

    const plan = await this.mealPlansService.create(
      { patientId: request.patientId, weekStartDate: dto.weekStartDate },
      dietitianId,
    );
    for (const entry of dto.entries) {
      await this.mealPlansService.addEntry(plan.id, entry);
    }
    await this.mealPlansService.publish(plan.id);

    request.dietitianId = dietitianId;
    request.status = RequestStatus.DELIVERED;
    request.resultingMealPlanId = plan.id;
    request.deliveredAt = new Date();
    return this.requestsRepository.save(request);
  }
}
