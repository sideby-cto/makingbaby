"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrimPipe = void 0;
const common_1 = require("@nestjs/common");
let TrimPipe = class TrimPipe {
    isObj(obj) {
        return typeof obj === 'object' && obj !== null;
    }
    trim(values) {
        Object.keys(values).forEach((key) => {
            if (key !== 'password') {
                if (this.isObj(values[key])) {
                    values[key] = this.trim(values[key]);
                }
                else {
                    if (typeof values[key] === 'string') {
                        values[key] = values[key].trim();
                    }
                }
            }
        });
        return values;
    }
    transform(values, metadata) {
        const { type } = metadata;
        if (this.isObj(values) && type === 'body') {
            return this.trim(values);
        }
        return values;
    }
};
exports.TrimPipe = TrimPipe;
exports.TrimPipe = TrimPipe = __decorate([
    (0, common_1.Injectable)()
], TrimPipe);
//# sourceMappingURL=trim-pipe.js.map