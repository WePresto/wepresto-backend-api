import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PermissionName, Public } from 'nestjs-basic-acl-sdk';

import { UserService } from './services/user.service';

import { CreateLenderInput } from './dto/create-lender-input.dto';
import { CreateBorrowerInput } from './dto/create-borrower-input.dto';
import { GetOneUserInput } from './dto/get-one-user-input.dto';
import { ChangeUserEmailInput } from './dto/change-user-email-input.dto';
import { ChangeUserPhoneInput } from './dto/change-user-phone-input.dto';
import { ChangeUserAddressInput } from './dto/change-user-address-input.dto';
import { SendUserResetPasswordEmail } from './dto/send-user-reset-password-email-input.dto';
import { ChangeUserPasswordInput } from './dto/change-user-password-input.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Create a new lender',
  })
  @Public()
  @Post('lender')
  createLender(@Body() input: CreateLenderInput) {
    return this.userService.createService.createLender(input);
  }

  @ApiOperation({
    summary: 'Create a new borrower',
  })
  @Public()
  @Post('borrower')
  createBorrower(@Body() input: CreateBorrowerInput) {
    return this.userService.createService.createBorrower(input);
  }

  @Public()
  @Get('document-types')
  getDocumentTypes() {
    return this.userService.readService.getDocumentTypes();
  }

  @PermissionName('users:getOne')
  @Get(':authUid')
  getOne(@Param() input: GetOneUserInput) {
    return this.userService.readService.getOne(input);
  }

  @PermissionName('users:deleteBorrower')
  @Delete('borrower')
  deleteBorrower(@Query() input: GetOneUserInput) {
    return this.userService.deleteService.deleteBorrower(input);
  }

  @PermissionName('user:changeEmail')
  @Patch('email')
  changeEmail(@Body() input: ChangeUserEmailInput) {
    return this.userService.updateService.changeEmail(input);
  }

  @PermissionName('users:changePhone')
  @Patch('phone')
  changePhone(@Body() input: ChangeUserPhoneInput) {
    return this.userService.updateService.changePhone(input);
  }

  @PermissionName('users:changeAddress')
  @Patch('address')
  changeAddress(@Body() input: ChangeUserAddressInput) {
    return this.userService.updateService.changeAddress(input);
  }

  @Public()
  @Post('reset-password-email')
  sendResetPasswordEmail(@Body() input: SendUserResetPasswordEmail) {
    return this.userService.updateService.sendResetPasswordEmail(input);
  }

  @PermissionName('users:changePassword')
  @Patch('/password')
  changePassword(@Body() input: ChangeUserPasswordInput) {
    return this.userService.updateService.changePassword(input);
  }
}
