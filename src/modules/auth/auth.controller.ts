import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Body,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { Auth } from '../../decorators/auth.decorator';
import { omit } from 'lodash';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserEntity } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UserRequest } from '@src/interfaces';
import { RefreshTokenGuard } from '@src/guards/refresh-token.guard';
import { ResendConfirmEmailDto } from './dto/resend-confirm-email.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Register sucesssfull',
        },
      },
    },
  })
  @Post('/register')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Login sucesssfull',
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg1OTQ5MzI0LCJleHAiOjE2ODU5NDkzMjd9.JAFScDSW24LJjlLBrfuB2PxG7f7jaw3NVMgrCDmFjoA',
            },
            refreshToken: {
              type: 'string',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg1OTQ5MzI0LCJleHAiOjE2ODU5NDkzMjd9.JAFScDSW24LJjlLBrfuB2PxG7f7jaw3NVMgrCDmFjoA',
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(@Req() req: UserRequest) {
    return this.authService.login(req);
  }

  @Auth()
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiOkResponse({ type: UserEntity })
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  async me(@Req() req: UserRequest) {
    return omit(req.user, [
      'password',
      'status',
      'isEmailConfirmed',
      'resetPasswordToken',
      'resetPasswordExpires',
    ]);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete('/logout')
  async signOut() {
    return this.authService.logout();
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Register sucesssfull',
        },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg1OTQ5MzI0LCJleHAiOjE2ODU5NDkzMjd9.JAFScDSW24LJjlLBrfuB2PxG7f7jaw3NVMgrCDmFjoA',
            },
          },
        },
      },
    },
  })
  @Get('refresh')
  refreshToken(@Req() req: UserRequest) {
    const userId = req.user['id'];
    return this.authService.refreshToken(userId);
  }

  @Get('verify')
  findOne(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('resend-confirm-email')
  @ApiBody({ type: ResendConfirmEmailDto })
  resendConfirmEmail(@Body() resendConfirmEmailDto: ResendConfirmEmailDto) {
    this.authService.resendConfirmEmail(resendConfirmEmailDto);
  }
}
