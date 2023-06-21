import { Test, TestingModule } from '@nestjs/testing';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { TextModerationService } from '../common/text-moderation/text-moderation.service';

describe('QuestController', () => {
  let controller: QuestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestService, TextModerationService],
      controllers: [QuestController],
    }).compile();

    controller = module.get<QuestController>(QuestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
