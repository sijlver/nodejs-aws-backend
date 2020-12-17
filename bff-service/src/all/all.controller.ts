import { Controller, All, Request } from '@nestjs/common';

import { AllService } from './all.service';

@Controller()
export class AllController {
  constructor(private readonly allService: AllService) {}

  @All()
  getAllResources(@Request() req) {
    return this.allService.getAllResources(req);
  }
}
