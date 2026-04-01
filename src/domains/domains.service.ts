import { Inject, Injectable } from '@nestjs/common';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AllowedDomain } from './entities/allowed_domain.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(AllowedDomain)
    private domainRepo: Repository<AllowedDomain>,

    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache // inject redis
  ){}

  async addDomain(createDomainDto: CreateDomainDto) {
    // lưu vào trong postgress
    const newDomain  = await this.domainRepo.save(createDomainDto);

    const allActiveDomains = await this.domainRepo.find({where:{isActive:true}});
    const domains = allActiveDomains.map(d => d.domain);
    await this.cacheManager.set("Allowed_Domain",domains,0);
    return newDomain;
  }

  // hàm này để lấy dữ liệu nạp vào redis
  async getAllActiveDomains() {
    const domains = await this.domainRepo.find({where:{isActive:true}});

    return domains.map(domains => domains.domain);
  }

}
