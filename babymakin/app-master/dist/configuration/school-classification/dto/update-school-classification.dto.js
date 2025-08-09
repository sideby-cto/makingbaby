"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSchoolClassificationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_school_classification_dto_1 = require("./create-school-classification.dto");
class UpdateSchoolClassificationDto extends (0, mapped_types_1.PartialType)(create_school_classification_dto_1.CreateSchoolClassificationDto) {
}
exports.UpdateSchoolClassificationDto = UpdateSchoolClassificationDto;
//# sourceMappingURL=update-school-classification.dto.js.map