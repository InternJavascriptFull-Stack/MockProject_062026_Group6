import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const facilities = await this.prisma.facility.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });
    
    // Serialize BigInt if addressId is present
    return JSON.parse(
      JSON.stringify(facilities, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}
