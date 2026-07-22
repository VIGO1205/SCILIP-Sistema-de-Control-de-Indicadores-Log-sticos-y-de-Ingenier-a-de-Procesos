import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req: { user: any }, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('unread')
  async getUnreadCount(@Request() req: { user: any }) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: { user: any }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: { user: any }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: { user: any }) {
    return this.notificationsService.deleteNotification(id, req.user.id);
  }
}
