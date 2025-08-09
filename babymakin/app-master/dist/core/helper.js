"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverUrl = exports.Helper = void 0;
class Helper {
    static customFileName(req, file, cb) {
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
        const originalName = file.originalname.split('.')[0];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, originalName + '-' + uniqueSuffix + (fileExtension ? '.' + fileExtension : ''));
    }
    static destinationPath(req, file, cb) {
        cb(null, 'uploads/');
    }
}
exports.Helper = Helper;
const serverUrl = (req) => `${req.protocol}://${req.get('host')}`;
exports.serverUrl = serverUrl;
//# sourceMappingURL=helper.js.map