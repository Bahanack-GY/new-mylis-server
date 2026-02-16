import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Roles('MANAGER', 'HEAD_OF_DEPARTMENT', 'EMPLOYEE')
@Controller('chat')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
    ) {}

    @Get('channels')
    getChannels(@Request() req) {
        return this.chatService.getChannelsForUser(req.user.userId);
    }

    @Get('channels/:id/messages')
    getMessages(
        @Param('id') channelId: string,
        @Query('before') before?: string,
        @Query('limit') limit?: string,
    ) {
        return this.chatService.getMessages(
            channelId,
            before,
            limit ? parseInt(limit, 10) : 50,
        );
    }

    @Get('channels/:id/members')
    getMembers(@Param('id') channelId: string) {
        return this.chatService.getChannelMembers(channelId);
    }

    @Post('channels/direct/:userId')
    async createDM(
        @Param('userId') targetUserId: string,
        @Request() req,
    ) {
        const { channel, created } = await this.chatService.getOrCreateDM(
            req.user.userId,
            targetUserId,
        );

        if (created) {
            // Join both users to the new channel room via WebSocket
            this.chatGateway.joinUserToChannel(req.user.userId, channel.id);
            this.chatGateway.joinUserToChannel(targetUserId, channel.id);
        }

        // Return channel info with proper formatting
        const channels = await this.chatService.getChannelsForUser(req.user.userId);
        return channels.find(c => c.id === channel.id) || channel;
    }

    @Patch('channels/:id/read')
    markAsRead(
        @Param('id') channelId: string,
        @Request() req,
    ) {
        return this.chatService.markAsRead(channelId, req.user.userId);
    }

    @Get('users')
    getUsers(@Request() req) {
        return this.chatService.getUsers(req.user.userId);
    }
}
