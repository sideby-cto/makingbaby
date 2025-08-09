"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient = new client_ses_1.SESClient({ region: "us-east-1" });
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
    }
    async sendMail(options) {
        const command = new client_ses_1.SendEmailCommand({
            Destination: {
                CcAddresses: [],
                ToAddresses: [
                    this.configService.get('EMAIL_TEST_ADDRESS') || options.to,
                ],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: options.message.html,
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: options.message.text,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: options.subject,
                },
            },
            Source: options.from,
        });
        if (this.configService.get('EMAIL_SENDING_ON') !== 'true') {
            console.log('Not sending email.');
            console.log('Subject: ' + options.subject);
            console.log('To: ' + options.to);
            console.log('Message: ' + options.message.text);
            return;
        }
        try {
            return await sesClient.send(command);
        }
        catch (e) {
            console.error('Failed to send email.');
            console.error(e);
            return e;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email-service.js.map