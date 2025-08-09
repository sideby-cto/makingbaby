import { Test, TestingModule } from '@nestjs/testing';
import { StoryFilesService } from './story-files.service';
import { getModelToken } from '@nestjs/mongoose';
import { StoryFile } from './entities/story-file.entity';
import { FileUploadService } from './file-upload-service';
import { Readable } from 'stream';

beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000); // Mock Date.now() to return a fixed timestamp
    process.env.S3_BUCKET = 'test'; // Mock S3 bucket name
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('StoryFilesService', () => {
    let service: StoryFilesService;
    let mockFileModel: any;
    let mockFileUploadService: any;
    const mockStoryInstance = {
        _id: 'someId',
        userId: '659c3eb97f67e25365049344',
        storyAction: 'Test creating story',
        storyObservation: '',
        storyExperience: '',
        successSigns: ['6408bbc4e13db238a4eb4558', '6408bbede13db238a4eb455b'],
        promisingPractices: ['6408ba94e13db238a4eb44c1', '6408bb19e13db238a4eb4541'],
        studentCharacteristics: ['6408bc89e13db238a4eb4572', '6408bc9fe13db238a4eb457b'],
        author: '659c3eb97f67e25365049344',
        type: 'SW',
        school: '6408bd30e13db238a4eb4599',
        files: [],
    };
    
    beforeEach(async () => {

        mockFileModel = {
            create: jest.fn(),
            where: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            findByIdAndDelete: jest.fn(),
            save: jest.fn().mockResolvedValue(mockStoryInstance),
        };

        mockFileUploadService = {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoryFilesService,
                {
                    provide: getModelToken(StoryFile.name),
                    useValue: mockFileModel,
                },
                {
                    provide: FileUploadService,
                    useValue: mockFileUploadService,
                },
            ],
        }).compile();

        service = module.get<StoryFilesService>(StoryFilesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Test uploadFilesAndGetUrls function', () => {
        it('should upload files and return their URLs', async () => {
            // Mock Express.Multer.File objects array
            const mockFiles: Express.Multer.File[] = [{
                originalname: 'testfile.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
                buffer: Buffer.from('test buffer', 'utf-8'),
                fieldname: 'file',
                encoding: '7bit',
                destination: './uploads',
                filename: 'testfile.jpg',
                path: './uploads/testfile.jpg',
                stream: new Readable(),
            }];

            const expectedUrls = ['https://test.s3.amazonaws.com/1234567890000_testfile.jpg'];
            mockFileUploadService.uploadFile.mockResolvedValueOnce();

            const result = await service.uploadFilesAndGetUrls(mockFiles);

            expect(result).toEqual(expectedUrls);
            expect(mockFileUploadService.uploadFile).toHaveBeenCalled();
        });
    });

    describe('Test saveFileUrlsToDatabase function', () => {
        it('should save file URLs to the database', async () => {
              
            const fileUrls = ['https://example.s3.amazonaws.com/testfile.jpg'];
            const expectedSavedFiles = [{ _id: 'fileid123', url: 'https://example.s3.amazonaws.com/testfile.jpg' }];

            // Mock the create method to simulate database save and return a mock file entity
            service.create = jest.fn().mockImplementation(async (createStoryFileDto) => {
                return { _id: 'fileid123', ...createStoryFileDto };
            });

            const result = await service.saveFileUrlsToDatabase(fileUrls);
            expect(result).toEqual(expectedSavedFiles);
            expect(service.create).toHaveBeenCalled();
        });
    });

    describe('Test deleteFilesForStory function', () => {
        it('should delete files for a story', async () => {
            const fileIds = ['fileid123'];
            mockFileModel.exec.mockResolvedValue([{ url: 'https://example.com/testfile.jpg' }]);
            mockFileModel.findByIdAndDelete.mockResolvedValue({});

            await service.deleteFilesForStory(fileIds);
            expect(mockFileModel.findByIdAndDelete).toHaveBeenCalled();
            expect(mockFileUploadService.deleteFile).toHaveBeenCalled();
        });
    });
});
