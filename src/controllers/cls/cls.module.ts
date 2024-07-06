import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

/**
 * CLS custom module. It just configure nestjs-cls module
 */
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
})
export class CustomClsModule {}
