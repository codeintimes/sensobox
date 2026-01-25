import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOpiFinalCommand } from '../commands/update-opi-final.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { differenceInMilliseconds } from 'date-fns';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateOpiFinalCommand)
export class UpdateOpiFinalHandler implements ICommandHandler<UpdateOpiFinalCommand> {
  private readonly logger = new Logger(UpdateOpiFinalHandler.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(command: UpdateOpiFinalCommand): Promise<void> {
    const { id, opiFinalDTO } = command;
    this.logger.log(`Attempting to update final process of OPI with ID: ${id}`);

    const order = await this.orderRepository.findById(id);
    if (!order) {
      this.logger.error(`OPI with ID: ${id} not found`);
      throw new NotFoundException(`OPI with ID: ${id} not found`);
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
    } catch (error) {
      this.logger.error(`Error during final process update of OPI with ID: ${id}`, error.stack);
      throw new InternalServerErrorException('Error occurred during final process update of OPI');
    }
  }
}
