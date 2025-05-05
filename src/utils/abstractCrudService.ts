import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

// Base CRUD service that provides reusable database operations
export class abstractCrudService {
  constructor(protected readonly repo: Repository<any>) {}

  async findRegister(filters: Partial<any>): Promise<any[] | null> {
    try {
      return await this.repo.find({ where: filters });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error retrieving data: ${error.message}`,
      );
    }
  }

  // Handles both create and update operations based on presence of ID
  async upsertRegister(
    data: Partial<any>,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      let savedRecord: any;

      if ('id' in data && data.id) {
        const existing = await this.repo.findOne({
          where: { id: data.id } as any,
        });

        if (existing) {
          savedRecord = await this.repo.save({ ...existing, ...data });
          return {
            success: true,
            message: 'Record updated successfully',
            data: savedRecord,
          };
        }
      }

      savedRecord = await this.repo.save(data as any);
      return {
        success: true,
        message: 'Record created successfully',
        data: savedRecord,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error during upsert operation: ${error.message}`,
      );
    }
  }

  // Ensures record exists before deletion and handles specific error types
  async deleteRegister(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const record = await this.repo.findOne({ where: { id } as any });

      if (!record) {
        throw new NotFoundException('Record not found');
      }

      await this.repo.remove(record);

      return {
        success: true,
        message: 'Record deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Error during deletion: ${error.message}`,
      );
    }
  }
}
