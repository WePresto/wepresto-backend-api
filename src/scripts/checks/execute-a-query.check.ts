import { NestFactory } from '@nestjs/core';

import { AppModule } from '../../app.module';
import { RetoolService } from '../../domains/retool/retool.service';

(async () => {
  // create the app context
  const app = await NestFactory.createApplicationContext(AppModule);

  // get the service
  const retoolService = app.get(RetoolService);

  await retoolService.getLoans();
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    process.exit(0);
  });
