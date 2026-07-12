import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service.js";

@Module({
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
