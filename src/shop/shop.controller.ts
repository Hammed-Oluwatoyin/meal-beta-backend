import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, Roles } from '../common/decorators';
import { Role } from '../common/enums';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { AddShoppingItemDto, UpdateShoppingItemDto } from './dto';
import { ShopService } from './shop.service';
import { renderShoppingListPdf } from './shopping-list-pdf.util';

@ApiTags('shop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('generate/:mealPlanId')
  generate(
    @Param('mealPlanId') mealPlanId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.generateFromPlan(mealPlanId, userId);
  }

  @Get('me')
  findMine(@CurrentUser('id') userId: string) {
    return this.shopService.findForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.shopService.findOne(id, userId);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const list = await this.shopService.findOne(id, userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shopping-list-${id}.pdf"`,
    );
    const doc = renderShoppingListPdf(list);
    doc.pipe(res);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() dto: AddShoppingItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.addItem(id, dto, userId);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateShoppingItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.updateItem(id, itemId, dto, userId);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.removeItem(id, itemId, userId);
  }
}
