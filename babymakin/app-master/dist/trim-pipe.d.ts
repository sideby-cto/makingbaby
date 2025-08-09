import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class TrimPipe implements PipeTransform {
    private isObj;
    private trim;
    transform(values: any, metadata: ArgumentMetadata): any;
}
