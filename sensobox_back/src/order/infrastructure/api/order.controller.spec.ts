import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrderController } from './order.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OrderDto } from '../../application/dto/order.dto';
import { OpiInitialDTO } from '../../application/dto/opi-initial.dto';
import { OpiFinalDTO } from '../../application/dto/opi-final.dto';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);
  });

  describe('/orders (GET)', () => {
    it('should return all orders', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/technician (GET)', () => {
    it('should return all orders for a technician', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/technician?name=Test Technician&companyName=Test Company')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/company (GET)', () => {
    it('should return all orders for a company', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/company?companyName=Test Company&clientName=Test Client')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/eco-emissions (GET)', () => {
    it('should return eco emissions for orders', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/eco-emissions?companyName=Test Company')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/statistics/:companyName (GET)', () => {
    it('should return statistics for the last month and last year', async () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce({});
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce({});
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce({ allPending: {}, futurePending: {} });

      return request(app.getHttpServer())
        .get('/orders/statistics/Test Company')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.objectContaining({
            statsLastMonth: expect.any(Object),
            statsLastYear: expect.any(Object),
            allPending: expect.any(Object),
            futurePending: expect.any(Object),
          }));
        });
    });
  });

  describe('/orders/weekly-stats/:companyName (GET)', () => {
    it('should return weekly order statistics for the last year', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/weekly-stats/Test Company')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/processing-stats/:fromDate/:companyName (GET)', () => {
    it('should return order processing time statistics for graphs', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/processing-stats/2021-01-01/Test Company')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/download-pdf/:id (GET)', () => {
    it('should download PDF for order by id', async () => {
      const pdfBuffer = Buffer.from('PDF content');
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(pdfBuffer);

      return request(app.getHttpServer())
        .get('/orders/download-pdf/1')
        .expect(200)
        .expect('Content-Type', /application\/pdf/)
        .expect('Content-Disposition', /attachment; filename="order_1.pdf"/)
        .expect('Content-Length', pdfBuffer.length.toString());
    });
  });

  describe('/orders/fromDate/:fromDate (GET)', () => {
    it('should return order statistics from a specific date', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/orders/fromDate/2021-01-01?companyName=Test Company&clientName=Test Client')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/orders/getById/:id (GET)', () => {
    it('should return an order by id', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .get('/orders/getById/1')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Object));
        });
    });
  });

  describe('/orders (POST)', () => {
    it('should create a new order', () => {
      const orderDto: OrderDto = {
        orderNumber: 123,
        clientName: 'Test Client',
        companyName: 'Test Company',
        workName: 'Test Job',
        workType: 'Type A',
        productionQuantity: 100,
        colors: 'Red, Blue',
        processes: 'Process 1, Process 2',
        specialFinishes: 'Finish 1, Finish 2',
        palletsNumber: 5,
        technician: 'John Doe',
        processingDate: new Date(),
        processingTime: 120,
        materialArea: 50,
        materialWeight: 30,
        quantityProcessed: 0
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({ id: '1' });

      return request(app.getHttpServer())
        .post('/orders')
        .send(orderDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id', '1');
        });
    });
  });

  describe('/orders/:id/update-quantity-processed (POST)', () => {
    it('should update the quantity processed for an order', () => {
      const updateData = { quantityProcessed: 500 };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({ message: 'Quantity processed updated successfully' });

      return request(app.getHttpServer())
        .post('/orders/1/update-quantity-processed')
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message', 'Quantity processed updated successfully');
        });
    });
  });

  describe('/orders/:id (PATCH)', () => {
    it('should update an order', () => {
      const orderDto: OrderDto = {
        orderNumber: 123,
        clientName: 'Test Client',
        companyName: 'Test Company',
        workName: 'Test Job',
        workType: 'Type A',
        productionQuantity: 100,
        colors: 'Red, Blue',
        processes: 'Process 1, Process 2',
        specialFinishes: 'Finish 1, Finish 2',
        palletsNumber: 5,
        technician: 'John Doe',
        processingDate: new Date(),
        processingTime: 120,
        materialArea: 50,
        materialWeight: 30,
        quantityProcessed: 0
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/orders/1')
        .send(orderDto)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  describe('/orders/:id/initial (PATCH)', () => {
    it('should update the initial process of an OPI', () => {
      const opiInitialDto: OpiInitialDTO = {
        initialQuantity: 500,
        processingDateInitial: '2023-01-01T00:00:00Z',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/orders/1/initial')
        .send(opiInitialDto)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  describe('/orders/:id/final (PATCH)', () => {
    it('should update the final process of an OPI', () => {
      const opiFinalDto: OpiFinalDTO = {
        finalQuantity: 400,
        processingDateFinal: new Date('2023-01-01T00:00:00Z'),
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/orders/1/final')
        .send(opiFinalDto)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  describe('/orders/:id/material-info (PATCH)', () => {
    it('should update the material info of an order', () => {
      const materialInfo = {
        materialWeight: 1000,
        materialArea: 50,
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/orders/1/material-info')
        .send(materialInfo)
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  describe('/orders/:id (DELETE)', () => {
    it('should delete an order', () => {
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .delete('/orders/1')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
