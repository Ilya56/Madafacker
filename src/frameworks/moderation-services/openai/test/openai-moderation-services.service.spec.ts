import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenaiModerationService } from '../openai-moderation-services.service';

const moderationsCreateMock = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      moderations: {
        create: moderationsCreateMock,
      },
    })),
  };
});

describe('OpenaiModerationService', () => {
  let service: OpenaiModerationService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    moderationsCreateMock.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenaiModerationService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<OpenaiModerationService>(OpenaiModerationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('moderate', () => {
    it('should call OpenAI moderation API with provided text and map response', async () => {
      (configService.get as jest.Mock).mockReturnValue('API_KEY_PLACEHOLDER');

      moderationsCreateMock.mockResolvedValue({
        results: [
          {
            flagged: true,
            category_scores: {
              hate: 0.1,
              violence: 0.2,
            },
          },
        ],
      });

      const result = await service.moderate('some text');

      expect(moderationsCreateMock).toHaveBeenCalledWith({ input: 'some text' });
      expect(result).toEqual({
        flagged: true,
        categoryScores: {
          hate: 0.1,
          violence: 0.2,
        },
      });
    });

    it('should throw if provider returns invalid response shape (no results)', async () => {
      moderationsCreateMock.mockResolvedValue({});

      await expect(service.moderate('some text')).rejects.toThrow('Invalid moderation provider response');
    });

    it('should throw if provider returns invalid response shape (missing category_scores)', async () => {
      moderationsCreateMock.mockResolvedValue({
        results: [
          {
            flagged: false,
          },
        ],
      });

      await expect(service.moderate('some text')).rejects.toThrow('Invalid moderation provider response');
    });

    it('should throw if provider returns invalid response shape (flagged is not boolean)', async () => {
      moderationsCreateMock.mockResolvedValue({
        results: [
          {
            flagged: 'yes',
            category_scores: {},
          },
        ],
      });

      await expect(service.moderate('some text')).rejects.toThrow('Invalid moderation provider response');
    });
  });
});
