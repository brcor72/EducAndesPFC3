import { IsString, IsNumber, IsArray, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TutorMsgDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class TutorChatDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  courseTitle: string;

  @ApiProperty()
  @IsString()
  courseSlug: string;

  @ApiProperty()
  @IsString()
  lessonTitle: string;

  @ApiProperty()
  @IsString()
  lessonSummary: string;

  @ApiProperty()
  @IsString()
  lessonDetail: string;

  @ApiProperty()
  @IsNumber()
  lessonIndex: number;

  @ApiProperty()
  @IsNumber()
  totalLessons: number;

  @ApiProperty()
  @IsNumber()
  lessonsDone: number;

  @ApiProperty({ enum: ['es', 'qu', 'ay', 'shp'] })
  @IsIn(['es', 'qu', 'ay', 'shp'])
  lang: string;

  @ApiProperty({ enum: ['lesson', 'quiz'] })
  @IsIn(['lesson', 'quiz'])
  mode: string;

  @ApiProperty({ type: [TutorMsgDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TutorMsgDto)
  history: TutorMsgDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quizQuestion?: string;
}
