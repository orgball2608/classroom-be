import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEntity<T> {
  @ApiProperty({ type: String, example: 'Update successfully' })
  message: string;

  @ApiProperty()
  data: T;
}
