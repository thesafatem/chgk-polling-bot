import { Module } from '@nestjs/common';
import { ChgkService } from './chgk.service';
import { HttpModule } from '@nestjs/axios';

@Module({
	providers: [ChgkService],
	imports: [HttpModule],
	exports: [ChgkService],
})
export class ChgkModule {}
