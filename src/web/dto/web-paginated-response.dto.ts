import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/dto/paginated-response.dto";
import { WebDataResponseDto } from "./web-data-response.dto.";

export class WebPaginatedResponseDto extends PaginatedResponseDto<WebDataResponseDto> {
    @ApiProperty({ type: [WebDataResponseDto] })
    declare data: WebDataResponseDto[];
  }
  