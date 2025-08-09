import { Test, TestingModule } from '@nestjs/testing';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { StoryFilesService } from './story-files.service';
import { FileUploadService } from './file-upload-service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Readable } from 'stream';

describe('StoryController', () => {
  let controller: StoryController;
  let storyService: StoryService;
  let storyFilesService: StoryFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoryController],
      providers: [
        {
          // Mock implementation for StoryService
          provide: StoryService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          // Mock implementation for StoryFilesService
          provide: StoryFilesService,
          useValue: {
            uploadFilesAndGetUrls: jest.fn(),
            saveFileUrlsToDatabase: jest.fn(),
            deleteFilesForStory: jest.fn(),
          },
        },
        {
          // Mock implementation for FileUploadService
          provide: FileUploadService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoryController>(StoryController);
    storyService = module.get<StoryService>(StoryService);
    storyFilesService = module.get<StoryFilesService>(StoryFilesService);
  });

  // Test controller definition
  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(storyService).toBeDefined();
    expect(storyFilesService).toBeDefined();
  });
  
  // Test API Post - create
  describe('update', () => {
    it('should create a story and return the newly created story', async () => {
      // Mock story DTO
      const mockCreateStoryDto: CreateStoryDto = {
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

      // Mock file uploads
      const mockFile: Express.Multer.File = {
        originalname: 'testfile.jpg',
        mimetype: 'image/jpeg',
        size: 500,
        buffer: Buffer.from('test', 'utf-8'),
        fieldname: 'testfile',
        encoding: '7bit',
        destination: './uploads',
        filename: 'testfile.jpg',
        path: './uploads/testfile.jpg',
        stream: new Readable(),
      };  

      // Put the mockFile in array to match with its data type set in story   
      const mockFiles: Express.Multer.File[] = [mockFile];
      
      const mockSavedFiles = [
        {
          _id: 'fileid123',
          url: 'https://example.com/testfile.jpg',
        },
      ];
      
      const mockCreatedStory = {
        ...mockCreateStoryDto,
        files: mockSavedFiles.map(file => file._id),
      };

      // Mock implementations
      (storyFilesService.uploadFilesAndGetUrls as jest.Mock).mockResolvedValue(mockSavedFiles.map(file => file.url));
      (storyFilesService.saveFileUrlsToDatabase as jest.Mock).mockResolvedValue(mockSavedFiles);
      (storyService.create as jest.Mock).mockResolvedValue(mockCreatedStory);

      const result = await controller.create(mockCreateStoryDto, mockFiles);

      expect(storyFilesService.uploadFilesAndGetUrls).toHaveBeenCalledWith(mockFiles);
      expect(storyFilesService.saveFileUrlsToDatabase).toHaveBeenCalled();
      expect(storyService.create).toHaveBeenCalledWith({
        ...mockCreateStoryDto,
        files: mockSavedFiles.map(file => file._id),
      });
      expect(result).toEqual(mockCreatedStory);
    });
  });

  // Test API Patch - 'update' method
  describe('update', () => {
    it('should update a story and return the updated story', async () => {
      const mockUpdateStoryDto: UpdateStoryDto = {
        userId: '659c3eb97f67e25365049344',
        storyAction: 'Test creating story for the Data Transfer Object in backend',
        storyObservation: '',
        storyExperience: '',
        author: '659c3eb97f67e25365049344',
        successSigns: [ '6408bbc4e13db238a4eb4558', '6408bbede13db238a4eb455b' ],
        promisingPractices: [ '6408ba94e13db238a4eb44c1', '6408bb19e13db238a4eb4541' ],
        studentCharacteristics: [ '6408bc89e13db238a4eb4572', '6408bc9fe13db238a4eb457b' ],
        type: 'SW',
        school: '6408bd30e13db238a4eb4599'
      };

      // Mock file upload for update
      const mockUpdateFile: Express.Multer.File = {
        originalname: 'updated_testfile.jpg',
        mimetype: 'image/jpeg',
        size: 512,
        buffer: Buffer.from('updated test content', 'utf-8'),
        fieldname: 'testfile',
        encoding: '7bit',
        destination: './uploads',
        filename: 'testfile.jpg',
        path: './uploads/testfile.jpg',
        stream: new Readable(),
      };  
  
      const mockUpdatedFiles: Express.Multer.File[] = [mockUpdateFile];

      // Assuming the story previously had one existing file ID
      const mockOldFileIds = ['old_file_id_1'];

      // New file URLs after uploading the updated files
      const mockNewFileUrls = ['https://example.com/updated_testfile.jpg'];

      // Mock response for saving new file URLs
      const mockNewSavedFiles = [
        { _id: 'new_updated_file_id', url: 'https://example.com/updated_testfile.jpg' },
      ];
  
      const mockUpdatedStory = {
        ...mockUpdateStoryDto,
        files: mockUpdatedFiles.map(file => 'updated_file_id'),
      };
  
      // Mock the necessary service calls
      (storyService.findOne as jest.Mock).mockResolvedValue({ files: mockOldFileIds }); // Locate existing file
      (storyFilesService.deleteFilesForStory as jest.Mock).mockResolvedValue(undefined); // Simulate successful deletion
      (storyFilesService.uploadFilesAndGetUrls as jest.Mock).mockResolvedValue(mockNewFileUrls);
      (storyFilesService.saveFileUrlsToDatabase as jest.Mock).mockResolvedValue(mockNewSavedFiles);
      (storyService.update as jest.Mock).mockResolvedValue(mockUpdatedStory);
  
      const result = await controller.update('story_id', mockUpdateStoryDto, mockUpdatedFiles);
  
      // Check that old files were requested to be deleted
      expect(storyFilesService.deleteFilesForStory).toHaveBeenCalledWith(mockOldFileIds);

      // Check the process of uploading new files and saving their URLs
      expect(storyFilesService.uploadFilesAndGetUrls).toHaveBeenCalledWith(mockUpdatedFiles);
      expect(storyFilesService.saveFileUrlsToDatabase).toHaveBeenCalledWith(mockNewFileUrls);

      // Verify the story update operation with new file IDs
      expect(storyService.update).toHaveBeenCalledWith('story_id', {
        ...mockUpdateStoryDto,
        files: mockNewSavedFiles.map(file => file._id),
      });

      expect(result).toEqual(mockUpdatedStory);
    });
  });

});
