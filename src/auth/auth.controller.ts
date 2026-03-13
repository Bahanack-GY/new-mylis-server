
import { Controller, Request, Post, UseGuards, Body, Get, Patch, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        // SECURITY: In a real app, registration should be protected or only for first user
        // For this prototype, we allow it to seed the initial manager
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return this.authService.getFullProfile(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-badges')
    getMyBadges(@Request() req) {
        return this.authService.getMyBadges(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('first-login-done')
    markFirstLoginDone(@Request() req) {
        return this.authService.markFirstLoginDone(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    updateProfile(@Request() req, @Body() dto: any) {
        return this.authService.updateProfile(req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('change-password')
    async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
        if (!body.currentPassword || !body.newPassword) throw new BadRequestException('currentPassword and newPassword are required');
        if (body.newPassword.length < 6) throw new BadRequestException('New password must be at least 6 characters');
        const valid = await this.usersService.verifyPassword(req.user.userId, body.currentPassword);
        if (!valid) throw new UnauthorizedException('Current password is incorrect');
        await this.usersService.changePassword(req.user.userId, body.newPassword);
        return { message: 'Password changed successfully' };
    }
}
