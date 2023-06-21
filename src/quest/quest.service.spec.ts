import { Test, TestingModule } from '@nestjs/testing';
import { QuestService } from './quest.service';
import { TextModerationService } from '../common/text-moderation/text-moderation.service';
import { QuestDto, OperatorType, ConditionType } from './quest.dto';

describe('QuestService', () => {
  let service: QuestService;
  let textModerationService: TextModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestService,
        {
          provide: TextModerationService,
          useValue: { detectProfaneWords: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<QuestService>(QuestService);
    textModerationService = module.get<TextModerationService>(
      TextModerationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fail if the quest is already completed', async () => {
    const questDto: QuestDto = {
      questId: '4569bee2-8f42-4054-b432-68f6ddbc20b5',
      userId: 'cb413e98-44a4-4bb1-aaa1-0b91ab1707e7',
      submission_text: 'test',
      claimed_at: '2023-01-01T00:00:00Z',
      user_data: {
        completed_quests: ['94e2e33e-07e9-4750-8cea-c033d7706057'],
        nfts: ['0x1'],
        level: 5,
      },
      access_condition: [],
    };

    await service.processQuest(questDto); // first completion attempt
    const response = await service.processQuest(questDto); // second completion attempt

    expect(response.status).toEqual('fail');
    expect(response.score).toEqual(0);
  });

  it('should fail if the user does not meet the conditions', async () => {
    const questDto: QuestDto = {
      questId: '4569bee2-8f42-4054-b432-68f6ddbc20b5',
      userId: 'cb413e98-44a4-4bb1-aaa1-0b91ab1707e7',
      submission_text: 'test',
      claimed_at: '2023-01-01T00:00:00Z',
      user_data: {
        completed_quests: ['94e2e33e-07e9-4750-8cea-c033d7706057'],
        nfts: ['0x1'],
        level: 5,
      },
      access_condition: [
        {
          type: ConditionType.level,
          operator: OperatorType.greaterThan,
          value: '10',
        },
      ],
    };

    const response = await service.processQuest(questDto);

    expect(response.status).toEqual('fail');
    expect(response.score).toEqual(0);
  });

  it('should succeed with a low score if the submission text is valid and not offensive', async () => {
    (textModerationService.detectProfaneWords as jest.Mock).mockResolvedValue(
      false,
    );

    const questDto: QuestDto = {
      questId: '4569bee2-8f42-4054-b432-68f6ddbc20b5',
      userId: 'cb413e98-44a4-4bb1-aaa1-0b91ab1707e7',
      submission_text: 'test',
      claimed_at: '2023-01-01T00:00:00Z',
      user_data: {
        completed_quests: ['94e2e33e-07e9-4750-8cea-c033d7706057'],
        nfts: ['0x1'],
        level: 5,
      },
      access_condition: [],
    };

    const response = await service.processQuest(questDto);

    expect(response.status).toEqual('fail'); // Because the score is less than 5
    expect(response.score).toBeLessThan(5);
  });

  it('should succeed with a high score if the submission text is valid and not offensive', async () => {
    (textModerationService.detectProfaneWords as jest.Mock).mockResolvedValue(
      false,
    );

    const questDto: QuestDto = {
      questId: '4569bee2-8f42-4054-b432-68f6ddbc20b5',
      userId: 'cb413e98-44a4-4bb1-aaa1-0b01ab1707e7',
      submission_text:
        'Aaa mmm Joyful Happy Vibrant Thrilled Euphoric Cheerful Delighted?',
      claimed_at: '2023-01-01T00:00:00Z',
      user_data: {
        completed_quests: ['94e2e33e-07e9-4750-8cea-c033d7706057'],
        nfts: ['0x1'],
        level: 5,
      },
      access_condition: [],
    };

    const response = await service.processQuest(questDto);

    expect(response.status).toEqual('success'); // Because the score is more than or equal to 5
    expect(response.score).toBeGreaterThanOrEqual(5);
  });

  it('should fail if the submission text is offensive', async () => {
    (textModerationService.detectProfaneWords as jest.Mock).mockResolvedValue(
      true,
    );

    const questDto: QuestDto = {
      questId: '4569bee2-8f42-4054-b432-68f6ddbc20b5',
      userId: 'cb413e98-44a4-4bb1-aaa1-0b91ab1707e7',
      submission_text: 'offensive text',
      claimed_at: '2023-01-01T00:00:00Z',
      user_data: {
        completed_quests: ['94e2e33e-07e9-4750-8cea-c033d7706057'],
        nfts: ['0x1'],
        level: 5,
      },
      access_condition: [],
    };

    const response = await service.processQuest(questDto);

    expect(response.status).toEqual('fail');
    expect(response.score).toEqual(0);
  });
});
