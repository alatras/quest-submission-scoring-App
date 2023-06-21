import { Test, TestingModule } from '@nestjs/testing';
import { TextModerationService } from './text-moderation.service';

describe('TextModerationService', () => {
  let service: TextModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextModerationService],
    }).compile();

    service = module.get<TextModerationService>(TextModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
