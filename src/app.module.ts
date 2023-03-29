import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChgkModule } from './chgk/chgk.module';

@Module({
	imports: [ChgkModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
