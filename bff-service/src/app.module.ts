import { Module } from '@nestjs/common';

import { AllModule } from './all/all.module';

@Module({
  imports: [AllModule],
  controllers: [],
  providers: [],
})

export class AppModule {}
