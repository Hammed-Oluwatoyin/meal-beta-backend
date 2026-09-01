import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums';
import { User } from '../database/entities';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async listPatients() {
    const patients = await this.usersRepository.find({
      where: { role: Role.PATIENT },
      relations: { profile: true },
      order: { createdAt: 'DESC' },
    });
    return patients.map((patient) => AuthService.sanitize(patient));
  }

  async getPatientDetail(id: string) {
    const patient = await this.usersRepository.findOne({
      where: { id, role: Role.PATIENT },
      relations: { profile: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return AuthService.sanitize(patient);
  }
}
