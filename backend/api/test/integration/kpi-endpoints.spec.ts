import { Test, TestingModule } from '@nestjs/testing'; 
 import { INestApplication } from '@nestjs/common'; 
 import * as request from 'supertest'; 
 import { AppModule } from '../../src/app.module'; 
 
 describe('KPI Endpoints (Integration)', () => { 
   let app: INestApplication; 
   let authToken: string; 
   
   beforeAll(async () => { 
     const moduleFixture: TestingModule = await Test.createTestingModule({ 
       imports: [AppModule], 
     }).compile(); 
     
     app = moduleFixture.createNestApplication(); 
     await app.init(); 
     
     // Obtener token de autenticación para pruebas 
     const loginResponse = await request(app.getHttpServer()) 
       .post('/auth/login') 
       .send({ email: 'admin@logistics.com', password: 'Admin123!' }); 
     
     authToken = loginResponse.body.access_token; 
   }); 
   
   afterAll(async () => { 
     await app.close(); 
   }); 
   
   describe('GET /kpi/inventory-accuracy', () => { 
     it('debería retornar datos de exactitud de inventario para el período solicitado', async () => { 
       const response = await request(app.getHttpServer()) 
         .get('/kpi/inventory-accuracy') 
         .query({ 
           startDate: '2024-01-01', 
           endDate: '2024-12-31', 
         }) 
         .set('Authorization', `Bearer ${authToken}`); 
       
       expect(response.status).toBe(200); 
       expect(response.body).toHaveProperty('accuracyPercentage'); 
       expect(response.body).toHaveProperty('totalDifference'); 
       expect(response.body).toHaveProperty('totalInventoryValue'); 
       expect(response.body.accuracyPercentage).toBeGreaterThanOrEqual(0); 
     }); 
     
     it('debería rechazar acceso sin autenticación', async () => { 
       const response = await request(app.getHttpServer()) 
         .get('/kpi/inventory-accuracy') 
         .query({ 
           startDate: '2024-01-01', 
           endDate: '2024-12-31', 
         }); 
       
       expect(response.status).toBe(401); 
     }); 
     
     it('debería validar fechas incorrectas', async () => { 
       const response = await request(app.getHttpServer()) 
         .get('/kpi/inventory-accuracy') 
         .query({ 
           startDate: 'fecha-invalida', 
           endDate: '2024-12-31', 
         }) 
         .set('Authorization', `Bearer ${authToken}`); 
       
       expect(response.status).toBe(400); 
       expect(response.body).toHaveProperty('message'); 
     }); 
   }); 
 }); 
