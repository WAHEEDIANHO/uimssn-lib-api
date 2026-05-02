import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  BadRequestException,
  HttpStatus, UseGuards, Req, UseInterceptors,
  Patch,
  Delete,
  Put,
  ConflictException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Request, Response } from 'express';
import { UserService } from '@uimssn/base_module/user/user.service';
import { ValidationPipe } from '@uimssn/base_module/utils/validation.pipe';
import { CreateUserDto } from '@uimssn/base_module/user/dto/create-user.dto';
import { UpdateUserDto } from '@uimssn/base_module/user/dto/update-user.dto';
import { Roles } from '../auth/decorator/role.decorator';
import { RoleEnum } from './enums/role.enum';
import { get } from 'http';

@ApiTags("User")
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }



  @ApiBearerAuth()
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Res() res: Response): Promise<Response> {
    const users = await this.userService.findAll();
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Users fetched successfully", users));
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)





  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get("me")
  async me(@Req() req: Request, @Res() res: Response): Promise<Response> {
    let { user }: any = req;
    console.log(user)
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json(res.formatResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", {}));
    }
    user = await this.userService.findByUsername(user.username);
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "Users fetched successfully", user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const user = await this.userService.findById(id);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json(res.formatResponse(HttpStatus.NOT_FOUND, "User not found", {}));
    }
    return res.status(HttpStatus.OK).json(res.formatResponse(HttpStatus.OK, "User found successfully", user));
  }


  @ApiBearerAuth()
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const { user }: any = req;
    if (user?.sub == id) {
      throw new ConflictException('Invalid request')
    }
    return this.userService.remove(id);
  }
}
