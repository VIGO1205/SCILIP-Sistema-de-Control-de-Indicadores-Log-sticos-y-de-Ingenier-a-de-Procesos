import { Test, TestingModule } from '@nestjs/testing'; 
 import { getRepositoryToken } from '@nestjs/typeorm'; 
 import { Repository } from 'typeorm'; 
 import { InventoryAccuracyCalculator } from '../../../src/modules/inventory-production/calculators/inventory-accuracy.calculator'; 
 import { PhysicalInventory } from '../../../src/entities/physical-inventory.entity'; 
 
 describe('InventoryAccuracyCalculator', () => { 
   let calculator: InventoryAccuracyCalculator; 
   let physicalInventoryRepo: Repository<PhysicalInventory>; 
   
   const mockPhysicalInventoryRepo = { 
     createQueryBuilder: jest.fn(() => ({ 
       select: jest.fn().mockReturnThis(), 
       where: jest.fn().mockReturnThis(), 
       getRawMany: jest.fn().mockResolvedValue([ 
         { totalDifference: 7000, totalInventoryValue: 100000 } 
       ]), 
     })), 
   }; 
   
   beforeEach(async () => { 
     const module: TestingModule = await Test.createTestingModule({ 
       providers: [ 
         InventoryAccuracyCalculator, 
         { 
           provide: getRepositoryToken(PhysicalInventory), 
           useValue: mockPhysicalInventoryRepo, 
         }, 
       ], 
     }).compile(); 
     
     calculator = module.get<InventoryAccuracyCalculator>(InventoryAccuracyCalculator); 
     physicalInventoryRepo = module.get<Repository<PhysicalInventory>>( 
       getRepositoryToken(PhysicalInventory) 
     ); 
   }); 
   
   afterEach(() => { 
     jest.clearAllMocks(); 
   }); 
   
   describe('calculate', () => { 
     it('debería calcular correctamente el porcentaje de exactitud', async () => { 
       const result = await calculator.calculate(new Date('2024-01-01'), new Date('2024-01-31')); 
       
       expect(result.accuracyPercentage).toBe(7); 
       expect(result.totalDifference).toBe(7000); 
       expect(result.totalInventoryValue).toBe(100000); 
     }); 
     
     it('debería retornar 0% cuando no hay diferencia', async () => { 
       mockPhysicalInventoryRepo.createQueryBuilder = jest.fn(() => ({ 
         select: jest.fn().mockReturnThis(), 
         where: jest.fn().mockReturnThis(), 
         getRawMany: jest.fn().mockResolvedValue([ 
           { totalDifference: 0, totalInventoryValue: 100000 } 
         ]), 
       })); 
       
       const result = await calculator.calculate(new Date('2024-01-01'), new Date('2024-01-31')); 
       
       expect(result.accuracyPercentage).toBe(0); 
     }); 
     
     it('debería manejar el caso sin datos de inventario', async () => { 
       mockPhysicalInventoryRepo.createQueryBuilder = jest.fn(() => ({ 
         select: jest.fn().mockReturnThis(), 
         where: jest.fn().mockReturnThis(), 
         getRawMany: jest.fn().mockResolvedValue([]), 
       })); 
       
       const result = await calculator.calculate(new Date('2024-01-01'), new Date('2024-01-31')); 
       
       expect(result.accuracyPercentage).toBe(0); 
       expect(result.message).toContain('No se encontraron datos'); 
     }); 
   }); 
   
   describe('getTimeSeries', () => { 
     it('debería retornar series de tiempo correctas para múltiples meses', async () => { 
       const mockTimeSeries = [ 
         { month: 1, totalDifference: 7000, totalInventoryValue: 100000 }, 
         { month: 2, totalDifference: 5000, totalInventoryValue: 135000 }, 
         { month: 3, totalDifference: 6000, totalInventoryValue: 110000 }, 
       ]; 
       
       mockPhysicalInventoryRepo.createQueryBuilder = jest.fn(() => ({ 
         select: jest.fn().mockReturnThis(), 
         where: jest.fn().mockReturnThis(), 
         groupBy: jest.fn().mockReturnThis(), 
         orderBy: jest.fn().mockReturnThis(), 
         getRawMany: jest.fn().mockResolvedValue(mockTimeSeries), 
       })); 
       
       const result = await calculator.getTimeSeries(new Date('2024-01-01'), new Date('2024-03-31')); 
       
       expect(result).toHaveLength(3); 
       expect(result[0].accuracyPercentage).toBe(7); 
       expect(result[1].accuracyPercentage).toBe(3.7); 
       expect(result[2].accuracyPercentage).toBe(5.45); 
     }); 
   }); 
 }); 
