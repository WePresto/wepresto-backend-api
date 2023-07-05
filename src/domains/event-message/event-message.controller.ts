import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionName } from 'nestjs-basic-acl-sdk';
import { Controller, Delete, UsePipes, ValidationPipe } from '@nestjs/common';

import { EventMessageService } from './event-message.service';

@ApiTags('event-messages')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('event-messages')
export class EventMessageController {
  constructor(private readonly eventMessageService: EventMessageService) {}

  /* DELETE RELATED ENDPOINTS */

  @ApiOperation({
    summary: 'Clear old messages',
  })
  @PermissionName('event-messages:clearOldMessages')
  @Delete()
  clearOldMessages() {
    return this.eventMessageService.clearOldMessages();
  }

  /* DELETE RELATED ENDPOINTS */
}
