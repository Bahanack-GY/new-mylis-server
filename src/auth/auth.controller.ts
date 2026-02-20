
import { Controller, Request, Post, UseGuards, Body, Get, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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
}
