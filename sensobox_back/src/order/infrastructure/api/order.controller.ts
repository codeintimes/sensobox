import { Controller, Post, Get, Res, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from './roles.guard';
// import { Roles } from '../decorators/roles.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OrderDto } from '../../application/dto/order.dto'; // Asegúrate de que el DTO esté actualizado para reflejar la entidad Order
import { OrderUpdateDto } from '../../application/dto/order-update.dto';
import { OpiInitialDTO } from '../../application/dto/opi-initial.dto'; // Asegúrate de que el DTO esté actualizado para reflejar la entidad Order
import { OpiFinalDTO } from '../../application/dto/opi-final.dto'; // Asegúrate de que el DTO esté actualizado para reflejar la entidad Order
import { CreateOrderCommand } from '../../application/commands/create-order.command';
import { GetAllOrdersQuery } from '../../application/queries/get-all-orders.query';
import { GetOrderByIdQuery } from '../../application/queries/get-order-by-id.query';
import { UpdateOrderCommand } from '../../application/commands/update-order.command';
import { DeleteOrderCommand } from '../../application/commands/delete-order.command';
import { UpdateOpiInitialCommand } from '../../application/commands/update-opi-initial.command';
import { UpdateOpiFinalCommand } from '../../application/commands/update-opi-final.command';
import { OrderStatsDTO } from '../../application/dto/order-stats.dto';
import { GetOrderStatsQuery } from '../../application/queries/get-order-stats.query';
import { OrderProcessingStatsDTO } from '../../application/dto/order-processing-stats.dto';
import { GetOrderProcessingStatsQuery } from '../../application/queries/get-order-processing-stats.query';
import { OrderStatisticsDTO } from '../../application/dto/order-statistics.dto'; // Path to DTO might need adjustment based on your project structure
import { GetOrderStatsLastMonthQuery } from '../../application/queries/get-order-stats-last-month.query';
import { GetOrderStatsLastYearQuery } from '../../application/queries/get-order-stats-last-year.query';
import { GetPendingOrdersFromQuery } from '../../application/queries/get-pending-orders.query';
import { GetWeeklyOrderGraphQuery } from '../../application/queries/get-order-weekly-graph.query';
import { GeneratePdfCommand } from '../../application/commands/generate-pdf.command';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { CalculateEcoEmissionsQuery } from '../../application/queries/get-eco-emissions.query'; // Asegúrate de importar la consulta correcta
import { UpdateMaterialInfoCommand } from '../../application/commands/update-material-info.command'; // Importa el comando correspondiente
import { UpdateQuantityProcessedCommand } from '../../application/commands/update-quantity-processed.command';
import { GetAllOrdersTechnicianQuery } from '../../application/queries/get-all-orders-technician.query';
import { GetOrdersByCompanyNameQuery } from '../../application/queries/get-orders-by-company-name.query';



@ApiTags('orders')
@Controller('orders')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrderController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

  @Get()
  @ApiOperation({ summary: 'Get all Orders' })
  // @Roles('admin')
  async getAll() {
    return this.queryBus.execute(new GetAllOrdersQuery());
  }

  @Get('technician')
  @ApiOperation({ summary: 'Get all Orders for a technician' })
  async getAllForTechnician(
    @Query('technician') name: string,
    @Query('companyName') companyName: string
  ) {
    return await this.queryBus.execute(new GetAllOrdersTechnicianQuery({ name, companyName }));
  }

  @Get('company')
  @ApiOperation({ summary: 'Get all Orders for a specific company' })
  async getAllForCompany(
    @Query('companyName') companyName: string,
    @Query('clientName') clientName: string
  ) {
    //console.log("Entra en company endpoint con companyName:", companyName, "y clientName:", clientName);
    return this.queryBus.execute(new GetOrdersByCompanyNameQuery(companyName, clientName));
  }

  @Get('eco-emissions')
  @ApiOperation({ summary: 'Get eco emissions for orders' })
  async getEcoEmissions(@Query('companyName') companyName?: string): Promise<any[]> {
    //console.log("Entra en eco-emissions endpoint");
    return this.queryBus.execute(new CalculateEcoEmissionsQuery(companyName));
  }

  @Get('statistics/:companyName') // Agregar companyName a la ruta
  @ApiOperation({ summary: 'Get statistics for the last month and last year' })
  async getStatistics(@Param('companyName') companyName: string): Promise<{ statsLastMonth: OrderStatisticsDTO, statsLastYear: OrderStatisticsDTO, allPending: OrderStatisticsDTO, futurePending: OrderStatisticsDTO }> {
    // Utiliza companyName en tu lógica para obtener las estadísticas relevantes
    const statsLastMonth = await this.queryBus.execute(new GetOrderStatsLastMonthQuery(companyName));
    const statsLastYear = await this.queryBus.execute(new GetOrderStatsLastYearQuery(companyName));
    const { allPending, futurePending } = await this.queryBus.execute(new GetPendingOrdersFromQuery(companyName));

    return { statsLastMonth, statsLastYear, allPending, futurePending };
  }

  @Get('weekly-stats/:companyName') // Agregar companyName a la ruta
  @ApiOperation({ summary: 'Get weekly order statistics for the last year' })
  async getWeeklyStatistics(@Param('companyName') companyName: string) {
    // Utiliza companyName en tu lógica para obtener las estadísticas semanales relevantes
    const weeklyStats = await this.queryBus.execute(new GetWeeklyOrderGraphQuery(companyName));
    return weeklyStats;
  }

  @Get('processing-stats/:fromDate/:companyName')
  @ApiOperation({ summary: 'Get order processing time statistics for graphs' })
  async getOrderProcessingStats(
    @Param('fromDate') fromDate: string,
    @Param('companyName') companyName: string,
    @Query('clientName') clientName?: string // Parámetro de consulta opcional
  ): Promise<OrderProcessingStatsDTO[]> {
    return this.queryBus.execute(new GetOrderProcessingStatsQuery(fromDate, companyName, clientName));
  }

  @Get('/download-pdf/:id')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    //console.log("Attempting to download PDF for order ID:", id);
    try {
      const pdfBuffer = await this.commandBus.execute(new GeneratePdfCommand(id));
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="order_${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (error) {
      console.error("Error during PDF download process:", error);

      // Distinguish between not found error and other errors
      if (error instanceof NotFoundException) {
        res.status(404).send('Order not found');
      } else {
        console.error("Error during PDF download process:", error);
        res.status(500).send(`Error in generating PDF: ${error.message}`);
        // Alternatively, throw an InternalServerErrorException to automatically send a 500 status
        // throw new InternalServerErrorException('Error in generating PDF');
      }
    }
  }

  @Get('fromDate/:fromDate')
  @ApiOperation({ summary: 'Get Order Statistics from a specific date' })
  async getOrderStats(
    @Param('fromDate') fromDate: string,
    @Query('companyName') companyName?: string,
    @Query('clientName') clientName?: string // clientName is optional
  ): Promise<OrderStatsDTO[]> {
    console.log("fromDate:", fromDate);
    console.log("companyName:", companyName);
    console.log("clientName:", clientName);

    // Ejecuta la consulta con los datos adecuados
    return this.queryBus.execute(new GetOrderStatsQuery(fromDate, companyName, clientName));
  }
  

  @Get('getById/:id')
  @ApiOperation({ summary: 'Get an Order by id' })
  // @Roles('admin')
  async getById(@Param('id') id: string) {
    return this.queryBus.execute(new GetOrderByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Order' })
  async create(
      @Body() orderDto: OrderDto
  ) {
      console.log("Creating order with company:", orderDto);
      return this.commandBus.execute(new CreateOrderCommand( orderDto));
  }

  @Post(':id/update-quantity-processed')
  async updateQuantityProcessed(@Param('id') id: string, @Body() body: { quantityProcessed: number }) {
    try {
      const { quantityProcessed } = body;
      await this.commandBus.execute(new UpdateQuantityProcessedCommand(id, quantityProcessed));
      return { message: 'Quantity processed updated successfully' };
    } catch (error) {
      throw new NotFoundException(`Order with ID: ${id} not found`);
    }
  }

  @Patch('orderUpdate/:id')
  @ApiOperation({ summary: 'Update an Order' })
  async update(@Param('id') id: string, @Body() dto: OrderUpdateDto) {
    console.log("555555", dto);
    return this.commandBus.execute(new UpdateOrderCommand(id, dto));
  }

  @Patch('final/:id')
  @ApiOperation({ summary: 'Update the final process of an OPI' })
  async updateFinal(@Param('id') id: string, @Body() dto: OpiFinalDTO) {
    return this.commandBus.execute(new UpdateOpiFinalCommand(id, dto));
  }

  @Patch('initial/:id')
  @ApiOperation({ summary: 'Update the initial process of an OPI' })
  async updateinitial(@Param('id') id: string, @Body() dto: OpiInitialDTO) {
    return this.commandBus.execute(new UpdateOpiInitialCommand(id, dto));
  }

  @Patch('material-info/:id') // Ruta para actualizar información del material
  @ApiOperation({ summary: 'Update material info of an Order' })
  async updateMaterialInfo(@Param('id') id: string, @Body() dto: { materialWeight: string, materialArea: string }) {
    console.log("3", dto);

    const materialWeight = parseFloat(dto.materialWeight);
    const materialArea = parseFloat(dto.materialArea);

    console.log("3", materialWeight);
    console.log("3", materialArea);
    console.log("Parsed values:", { materialWeight, materialArea });

    return this.commandBus.execute(new UpdateMaterialInfoCommand(id, materialWeight, materialArea));
  }





  @Delete(':id')
  @ApiOperation({ summary: 'Delete an Order' })
  // @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteOrderCommand(id));
  }
}
