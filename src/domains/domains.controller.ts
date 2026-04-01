import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/enums/user-role';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createDomainDto: CreateDomainDto) {
    console.log("đây là domain:")
    console.log(createDomainDto);
    return this.domainsService.addDomain(createDomainDto);
  }

  @Get()
  findAll() {
    return this.domainsService.getAllActiveDomains();
  }

 
}
