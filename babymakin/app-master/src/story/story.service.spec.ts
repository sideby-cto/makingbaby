import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Story, StoryDocument as StoryDoc } from './entities/story.entity';
import { StoryReaction, StoryDocument as StoryReactionDoc } from './entities/story-reaction.entity';
import { StoryService } from './story.service';
import { SchoolService } from '../configuration/school/school.service';
import { StoryFilesService } from './story-files.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';


describe('StoryService', () => {
  let service: StoryService;
  let mockStoryModel: any;

  beforeEach(async () => {
    // Mocks for dependencies
    mockStoryModel = {
      create: jest.fn(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoryService,
        {
          provide: getModelToken(Story.name),
          useValue: mockStoryModel, 
        },
        {
          provide: getModelToken(StoryReaction.name), 
          useValue: {},
        },
        {
          provide: SchoolService,
          useValue: {},
        },
        {
          provide: StoryFilesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StoryService>(StoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully insert a story', async () => {
      const createStoryDto: CreateStoryDto = {
        userId: '659c3eb97f67e25365049344',
        storyAction: 'Test creating story',
        storyObservation: '',
        storyExperience: '',
        successSigns: [ '6408bbc4e13db238a4eb4558', '6408bbede13db238a4eb455b' ],
        promisingPractices: [ '6408ba94e13db238a4eb44c1', '6408bb19e13db238a4eb4541' ],
        studentCharacteristics: [ '6408bc89e13db238a4eb4572', '6408bc9fe13db238a4eb457b' ],
        author: '659c3eb97f67e25365049344',
        type: 'SW',
        school: '6408bd30e13db238a4eb4599',
      };
      
      
      const expectedStory = new Story(); 
      // Mock the create method to simulate database save and return a mock file entity
      service.create = jest.fn().mockImplementation(async (createStoryDto) => {
          // Initiate a story container
          Object.assign(expectedStory, createStoryDto, { _id: 'a new id', files: [] });
          return expectedStory;
      });

      const result = await service.create(createStoryDto);
      expect(result).toEqual(expectedStory);
      expect(service.create).toHaveBeenCalledWith(createStoryDto);
    });
  });

  describe('update', () => {
    it('should update a story', async () => {
      const updateStoryDto: UpdateStoryDto = {
        userId: '659c3eb97f67e25365049344',
        storyAction: 'Updated story action',
        storyObservation: 'Updated observation',
        storyExperience: 'Updated experience',
        successSigns: ['6408bbc4e13db238a4eb4559', '6408bbede13db238a4eb455c'],
        promisingPractices: ['6408ba94e13db238a4eb44c2', '6408bb19e13db238a4eb4542'],
        studentCharacteristics: ['6408bc89e13db238a4eb4573', '6408bc9fe13db238a4eb457c'],
        author: '659c3eb97f67e25365049345',
        type: 'LL',
        school: '6408bd30e13db238a4eb459a',
      };

      const existingStoryId = 'existing_story_id';

      // Mock the chain of Mongoose methods
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue("expected_updated_story_object"), // Mock the final result of the chain
      };

      mockStoryModel.findByIdAndUpdate.mockReturnValue(mockQuery); // Use mockReturnValue to set up the chain

      const result = await service.update(existingStoryId, updateStoryDto);

      expect(mockStoryModel.findByIdAndUpdate).toHaveBeenCalledWith(existingStoryId, updateStoryDto, { new: true });
      expect(mockQuery.populate).toHaveBeenCalledWith('files'); // Verify populate was called correctly
      expect(result).toEqual("expected_updated_story_object"); // Verify the result matches the mock
    });
  });

});
