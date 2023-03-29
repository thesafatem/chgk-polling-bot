import { Test, TestingModule } from '@nestjs/testing';
import { ChgkController } from './chgk.controller';

describe('ChgkController', () => {
	let controller: ChgkController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChgkController],
		}).compile();

		controller = module.get<ChgkController>(ChgkController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
