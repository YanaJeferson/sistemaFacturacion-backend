import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entitie/user.entities';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
      ) {} 

    async register(userRegisterDto) {
        const existingUser = await this.userRepository.findOne({
          where: { email: userRegisterDto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(userRegisterDto.password,10);
        
        const newUser = this.userRepository.create({
          ...userRegisterDto,
          password: hashedPassword
        });
        
        return this.userRepository.save(newUser);
      }
      
      async findAll(): Promise<User[]> {
        return this.userRepository.find();
      }
}
