import { Module } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { AllowedDomain } from './entities/allowed_domain.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AllowedDomain])],
  controllers: [DomainsController],
  providers: [DomainsService],
  exports: [DomainsService]
})
export class DomainsModule {}
