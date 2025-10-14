import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@uimssn/base_module/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
