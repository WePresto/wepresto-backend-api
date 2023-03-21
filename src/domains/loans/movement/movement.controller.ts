import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'nestjs-basic-acl-sdk';

import { MovementService } from './services/movement.service';

import { CreatePaymentMovementInput } from './dto/create-payment-movement-input.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  /* CREATE RELATED ENDPOINTS */

  @Public()
  @Post('payment')
  createPayment(@Body() input: CreatePaymentMovementInput) {
    return this.movementService.createService.createPayment(input);
  }

  @Public()
  @Post('late-payment-interest')
  createLatePaymentInterest() {
    return this.movementService.createService.createLatePaymentInterest();
  }

  /* CREATE RELATED ENDPOINTS */
}
