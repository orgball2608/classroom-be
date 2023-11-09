import {
  Request,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Body,
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: RegisterDto })
  @Post('/register')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: AuthCredentialsDto })
  @ApiOkResponse({
    description: 'Sign up success',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg1OTQ5MzI0LCJleHAiOjE2ODU5NDkzMjd9.JAFScDSW24LJjlLBrfuB2PxG7f7jaw3NVMgrCDmFjoA',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(@Request() req: UserRequest) {
    return this.authService.login(req);
  }

  @Auth()
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'User not found.',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiOkResponse({ description: 'Get user data success', type: UserEntity })
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  async me(@Request() req: UserRequest) {
    return omit(req.user, ['password']);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('/logout')
  async signOut() {
    return this.authService.logout();
  }
}
