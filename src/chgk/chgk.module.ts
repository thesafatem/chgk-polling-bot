import { Module } from '@nestjs/common';
import { ChgkService } from './chgk.service';
import { ChgkController } from './chgk.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
	providers: [ChgkService],
	controllers: [ChgkController],
	imports: [HttpModule]
})
export class ChgkModule { }
