export class ResponseDto<T> {
  message: string;
  statusCode: number;
  data: T | null;
}
