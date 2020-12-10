import { Module } from '@nestjs/common';

import { AllController } from './all.controller';
import { AllService } from './all.service';


@Module({
  imports: [],
  providers: [ AllService ],
  controllers: [ AllController ]
})

export class AllModule {}
