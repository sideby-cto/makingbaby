"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDistrictDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_district_dto_1 = require("./create-district.dto");
class UpdateDistrictDto extends (0, mapped_types_1.PartialType)(create_district_dto_1.CreateDistrictDto) {
}
exports.UpdateDistrictDto = UpdateDistrictDto;
//# sourceMappingURL=update-district.dto.js.map