export class Helper {
  static customFileName(req: any, file: any, cb: any) {
    let fileExtension = '';

    switch (file.mimetype) {
      case 'image/jpeg':
      case 'image/jpg':
        fileExtension = 'jpg';
        break;
      case 'image/png':
        fileExtension = 'png';
        break;
      case 'image/svg+xml':
        fileExtension = 'svg';
        break;
      case 'application/pdf':
        fileExtension = 'pdf';
        break;
      case 'text/plain':
        fileExtension = 'txt';
        break;
        
      // Microsoft Office MIME types
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        fileExtension = 'docx';
        break;
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        fileExtension = 'pptx';
        break;
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        fileExtension = 'xlsx';
        break;

      default:
        fileExtension = '';
    }

    // assign unique name for every file
    const originalName = file.originalname.split('.')[0];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, originalName + '-' + uniqueSuffix + (fileExtension ? '.' + fileExtension : ''));
  }

  static destinationPath(req: any, file: any, cb: any) {
    cb(null, 'uploads/');
  }
}

export const serverUrl = (req: any) => `${req.protocol}://${req.get('host')}`;
