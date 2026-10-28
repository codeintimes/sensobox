import { tr } from '../../../i18n/i18n';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOpiFinalCommand } from '../commands/update-opi-final.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { differenceInMilliseconds } from 'date-fns';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { facturarOrden } from '../billing/enlace-fiscal';

@CommandHandler(UpdateOpiFinalCommand)
export class UpdateOpiFinalHandler implements ICommandHandler<UpdateOpiFinalCommand> {
  private readonly logger = new Logger(UpdateOpiFinalHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOpiFinalCommand): Promise<void> {
    const { id, opiFinalDTO } = command;
    this.logger.log(`Attempting to update final process of OPI with ID: ${id}`);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      this.logger.error(tr('errors.orderNotFound', { id }));
      throw new NotFoundException(tr('errors.orderNotFound', { id }));
    }

    const differenceInHours = (date1: Date, date2: Date): number => {
      const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60); // Convertir de milisegundos a horas
      return parseFloat(diffInHours.toFixed(2)); // Redondear a 2 decimales y convertir a número
    };
    

    try {
      const quantityRate = order.initialQuantity / opiFinalDTO.finalQuantity;
      
      // const processingTimeRate = order.processingTime / differenceInMilliseconds(opiFinalDTO.processingDateFinal, order.processingDateInitial);
      // const processingTimeFinal = differenceInMilliseconds(opiFinalDTO.processingDateFinal, order.processingDateInitial);
      // const processingTimeDiffrence = differenceInMilliseconds(opiFinalDTO.processingDateFinal, order.processingDateInitial) / order.processingTime;
      const processingTimeFinal = differenceInHours(opiFinalDTO.processingDateFinal, order.processingDateInitial);
      const processingTimeRate = order.processingTime / processingTimeFinal;
      const processingTimeDifference = processingTimeFinal - order.processingTime;
      const finalQuantityDifference = opiFinalDTO.finalQuantity - order.initialQuantity;

      await this.orderRepository.updateFinalProcess(id, {
        finalQuantity: opiFinalDTO.finalQuantity,
        processingDateFinal: opiFinalDTO.processingDateFinal,
        quantityRate,
        processingTimeRate,
        processingTimeFinal,
        processingTimeDifference,
        finalQuantityDifference
      });

      this.logger.log(`Final process of OPI with ID: ${id} successfully updated`);
      // Orden cerrada: su factura va a la carpeta vigilada de Enlace Fiscal (si está activado); un fallo aquí no para la OPI
      try {
        const f = facturarOrden({ orderNumber: order.orderNumber, clientName: order.clientName, workName: order.workName, workType: order.workType,
          productionQuantity: order.productionQuantity, finalQuantity: opiFinalDTO.finalQuantity, processingDateFinal: opiFinalDTO.processingDateFinal });
        if (f.estado !== 'desactivada') this.logger.log(`Enlace Fiscal: ${JSON.stringify(f)}`);
      } catch (e) {
        this.logger.error(`Enlace Fiscal: no se ha podido dejar la factura de la orden ${order.orderNumber}: ${(e as Error).message}`);
      }
    } catch (error) {
      this.logger.error(`Error during final process update of OPI with ID: ${id}`, error.stack);
      throw new InternalServerErrorException(tr('errors.orderUpdateFailed'));
    }
  }
}
