import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { StockModule } from './modules/stock/stock.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { ItemsModule } from './modules/items/items.module';
import { CategoryItemsModule } from './modules/category-items/category-items.module';
import { PartnersModule } from './modules/partners/partners.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { DeliveryNotesModule } from './modules/delivery-notes/delivery-notes.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    StockModule,
    WarehousesModule,
    ItemsModule,
    CategoryItemsModule,
    PartnersModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    SalesOrdersModule,
    DeliveryNotesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

