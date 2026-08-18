import { prisma } from './prisma';

export async function runSeed() {
  console.log('🌱 [PRIMAL Seeder] Resetting and seeding warehouse database...');

  // Clean existing tables in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.decisionRecommendation.deleteMany();
  await prisma.exception.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.qualityCheck.deleteMany();
  await prisma.packingStation.deleteMany();
  await prisma.pickingTask.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.rack.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  await prisma.user.createMany({
    data: [
      { id: 'usr-1', name: 'Vikram Malhotra', email: 'vikram.m@primalops.in', role: 'OPERATIONS_MANAGER', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { id: 'usr-2', name: 'Pooja Patel', email: 'pooja.p@primalops.in', role: 'QC_INSPECTOR', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      { id: 'usr-3', name: 'Aarav Sharma', email: 'aarav.s@primalops.in', role: 'PICKER', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { id: 'usr-4', name: 'Rohan Gupta', email: 'rohan.g@primalops.in', role: 'PACKER', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { id: 'usr-5', name: 'Sneha Reddy', email: 'sneha.r@primalops.in', role: 'SUPERVISOR', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { id: 'usr-6', name: 'Karan Mehra', email: 'karan.m@primalops.in', role: 'PICKER' },
      { id: 'usr-7', name: 'Ananya Verma', email: 'ananya.v@primalops.in', role: 'PACKER' },
      { id: 'usr-8', name: 'Rahul Joshi', email: 'rahul.j@primalops.in', role: 'PICKER' },
    ],
  });

  // 2. Warehouses
  const whA = await prisma.warehouse.create({
    data: {
      id: 'wh-a',
      code: 'WH-A',
      name: 'PRIMAL Central Fulfillment Center',
      location: 'Bengaluru, Karnataka',
      address: 'Plot 42, Electronic City Phase 2, Hosur Road, Bengaluru 560100',
      capacity: 18000,
    },
  });

  const whB = await prisma.warehouse.create({
    data: {
      id: 'wh-b',
      code: 'WH-B',
      name: 'PRIMAL Hyderabad Regional Hub',
      location: 'Hyderabad, Telangana',
      address: 'Logistics Park Sector 8, Shamshabad, Hyderabad 500409',
      capacity: 12000,
    },
  });

  // 3. Zones
  const zoneA = await prisma.zone.create({
    data: { id: 'zone-a', warehouseId: whA.id, code: 'A', name: 'Zone A - High-Velocity Electronics', color: '#06B6D4', capacity: 5000 },
  });
  const zoneB = await prisma.zone.create({
    data: { id: 'zone-b', warehouseId: whA.id, code: 'B', name: 'Zone B - Audio & Computer Hardware', color: '#3B82F6', capacity: 4500 },
  });
  const zoneC = await prisma.zone.create({
    data: { id: 'zone-c', warehouseId: whA.id, code: 'C', name: 'Zone C - Wearables & Smart Home', color: '#10B981', capacity: 4000 },
  });
  const zoneD = await prisma.zone.create({
    data: { id: 'zone-d', warehouseId: whA.id, code: 'D', name: 'Zone D - High-Value Secure Vault', color: '#8B5CF6', capacity: 2500 },
  });
  const zonePacking = await prisma.zone.create({
    data: { id: 'zone-pack', warehouseId: whA.id, code: 'PACKING', name: 'Packing & Quality Control Bay', color: '#F59E0B', capacity: 1000 },
  });
  const zoneDispatch = await prisma.zone.create({
    data: { id: 'zone-disp', warehouseId: whA.id, code: 'DISPATCH', name: 'Carrier Staging & Dock Doors', color: '#EC4899', capacity: 1000 },
  });

  // 4. Racks with 3D Spatial Coordinates
  const rackDefinitions = [
    { code: 'A01', zoneId: zoneA.id, posX: -12, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'A02', zoneId: zoneA.id, posX: -12, posY: 0, posZ: -2, status: 'HEALTHY' },
    { code: 'A03', zoneId: zoneA.id, posX: -12, posY: 0, posZ: 4, status: 'LOW' },
    { code: 'A04', zoneId: zoneA.id, posX: -7, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'A05', zoneId: zoneA.id, posX: -7, posY: 0, posZ: -2, status: 'CRITICAL' },
    { code: 'A06', zoneId: zoneA.id, posX: -7, posY: 0, posZ: 4, status: 'HEALTHY' },

    { code: 'B01', zoneId: zoneB.id, posX: -2, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'B02', zoneId: zoneB.id, posX: -2, posY: 0, posZ: -2, status: 'HEALTHY' },
    { code: 'B03', zoneId: zoneB.id, posX: -2, posY: 0, posZ: 4, status: 'HEALTHY' },
    { code: 'B04', zoneId: zoneB.id, posX: 3, posY: 0, posZ: -8, status: 'LOW' },
    { code: 'B05', zoneId: zoneB.id, posX: 3, posY: 0, posZ: -2, status: 'OUT_OF_STOCK' },
    { code: 'B06', zoneId: zoneB.id, posX: 3, posY: 0, posZ: 4, status: 'HEALTHY' },

    { code: 'C01', zoneId: zoneC.id, posX: 8, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'C02', zoneId: zoneC.id, posX: 8, posY: 0, posZ: -2, status: 'HEALTHY' },
    { code: 'C03', zoneId: zoneC.id, posX: 8, posY: 0, posZ: 4, status: 'CRITICAL' },
    { code: 'C04', zoneId: zoneC.id, posX: 13, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'C05', zoneId: zoneC.id, posX: 13, posY: 0, posZ: -2, status: 'LOW' },
    { code: 'C06', zoneId: zoneC.id, posX: 13, posY: 0, posZ: 4, status: 'HEALTHY' },

    { code: 'D01', zoneId: zoneD.id, posX: 18, posY: 0, posZ: -8, status: 'HEALTHY' },
    { code: 'D02', zoneId: zoneD.id, posX: 18, posY: 0, posZ: -2, status: 'HEALTHY' },
    { code: 'D03', zoneId: zoneD.id, posX: 18, posY: 0, posZ: 4, status: 'HEALTHY' },
    { code: 'D04', zoneId: zoneD.id, posX: 18, posY: 0, posZ: 10, status: 'HEALTHY' },
  ];

  const createdRacks: Record<string, any> = {};
  for (const r of rackDefinitions) {
    const rack = await prisma.rack.create({
      data: {
        code: r.code,
        zoneId: r.zoneId,
        posX: r.posX,
        posY: r.posY,
        posZ: r.posZ,
        width: 2.8,
        height: 4.2,
        depth: 1.4,
        levels: 4,
        bays: 3,
        status: r.status,
      },
    });
    createdRacks[r.code] = rack;
  }

  // 5. Storage Locations (Bins)
  const createdLocations: Record<string, any> = {};
  for (const [code, rack] of Object.entries(createdRacks)) {
    for (let level = 1; level <= 3; level++) {
      for (let bay = 1; bay <= 2; bay++) {
        const binCode = `${code}-L${level}-B${bay}`;
        const loc = await prisma.storageLocation.create({
          data: {
            rackId: rack.id,
            binCode,
            level,
            bay,
            maxCapacity: 120,
            currentCapacity: 45,
            posX: rack.posX + (bay - 1) * 0.8,
            posY: level * 1.1,
            posZ: rack.posZ,
          },
        });
        createdLocations[binCode] = loc;
      }
    }
  }

  // 6. 50+ Products
  const rawProducts = [
    { sku: 'WH-1001', name: 'PRIMAL SoundFlow Pro Wireless Headphones', cat: 'Audio & Peripherals', brand: 'SoundFlow', price: 4999, cost: 2800, rating: 4.8, supplier: 'AcousticTech India', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
    { sku: 'KB-1002', name: 'PRIMAL Strike RGB Mechanical Gaming Keyboard', cat: 'Audio & Peripherals', brand: 'StrikeForce', price: 3499, cost: 1950, rating: 4.7, supplier: 'Keytronix Pvt Ltd', rop: 25, lead: 5, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
    { sku: 'MS-1003', name: 'Apex Ultra Wireless Gaming Mouse 16000 DPI', cat: 'Audio & Peripherals', brand: 'ApexTech', price: 2199, cost: 1100, rating: 4.6, supplier: 'Keytronix Pvt Ltd', rop: 30, lead: 3, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500' },
    { sku: 'SP-1004', name: 'PulseBoom Waterproof Bluetooth Speaker 24W', cat: 'Audio & Peripherals', brand: 'PulseSound', price: 2899, cost: 1450, rating: 4.5, supplier: 'AcousticTech India', rop: 18, lead: 6, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500' },
    { sku: 'WC-1005', name: 'ClearView 4K Ultra HD Streaming Webcam', cat: 'Audio & Peripherals', brand: 'VisionPro', price: 4299, cost: 2300, rating: 4.4, supplier: 'Visionix Electronics', rop: 15, lead: 4, img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500' },
    { sku: 'MC-1006', name: 'StudioCast Condenser USB Podcast Microphone', cat: 'Audio & Peripherals', brand: 'SoundFlow', price: 5499, cost: 3100, rating: 4.9, supplier: 'AcousticTech India', rop: 12, lead: 5, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
    { sku: 'HP-1007', name: 'BassNova Active Noise Cancelling Earbuds', cat: 'Audio & Peripherals', brand: 'NovaAudio', price: 3199, cost: 1600, rating: 4.7, supplier: 'AcousticTech India', rop: 35, lead: 3, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
    { sku: 'DP-1008', name: 'ErgoPad Extended Microfiber Desk Mat', cat: 'Audio & Peripherals', brand: 'ErgoGear', price: 899, cost: 350, rating: 4.6, supplier: 'DeskWorx India', rop: 40, lead: 2, img: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500' },
    { sku: 'SW-2001', name: 'AeroChron AMOLED Smartwatch with GPS & SpO2', cat: 'Wearables', brand: 'AeroFit', price: 6499, cost: 3800, rating: 4.8, supplier: 'Zenith Microchips', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
    { sku: 'FB-2002', name: 'VibeFit Pro Activity & Sleep Fitness Tracker', cat: 'Wearables', brand: 'AeroFit', price: 2499, cost: 1300, rating: 4.5, supplier: 'Zenith Microchips', rop: 25, lead: 3, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500' },
    { sku: 'AR-2003', name: 'Titanium Smart Health Ring (Size 10)', cat: 'Wearables', brand: 'BioMetrics', price: 12999, cost: 8200, rating: 4.9, supplier: 'Zenith Microchips', rop: 10, lead: 7, img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500' },
    { sku: 'VR-2004', name: 'ImmersionVR Spatial Computing Headset 128GB', cat: 'Wearables', brand: 'CyberSpace', price: 34999, cost: 24500, rating: 4.9, supplier: 'Quantum Vision Ltd', rop: 8, lead: 10, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=500' },
    { sku: 'SL-3001', name: 'LuminaSmart WiFi RGB Smart LED Bulb 12W (Pack of 2)', cat: 'Smart Home', brand: 'LuminaTech', price: 1199, cost: 580, rating: 4.6, supplier: 'BrightLite India', rop: 50, lead: 3, img: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500' },
    { sku: 'SP-3002', name: 'VoltSafe 16A WiFi Smart Plug with Energy Monitor', cat: 'Smart Home', brand: 'VoltSafe', price: 899, cost: 420, rating: 4.5, supplier: 'BrightLite India', rop: 45, lead: 3, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500' },
    { sku: 'SC-3003', name: 'GuardianEye 360° AI Indoor Security Camera', cat: 'Smart Home', brand: 'GuardianTech', price: 2999, cost: 1600, rating: 4.7, supplier: 'Visionix Electronics', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500' },
    { sku: 'SH-3004', name: 'SmartSense Temperature & Humidity Sensor Hub', cat: 'Smart Home', brand: 'LuminaTech', price: 1799, cost: 950, rating: 4.4, supplier: 'BrightLite India', rop: 22, lead: 5, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' },
    { sku: 'SL-3005', name: 'SafeLock Biometric Fingerprint Smart Door Lock', cat: 'Smart Home', brand: 'SecureLiving', price: 8499, cost: 5100, rating: 4.8, supplier: 'SecureLiving Solutions', rop: 10, lead: 6, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500' },
    { sku: 'SSD-4001', name: 'HyperDrive 1TB NVMe PCIe 4.0 Internal SSD', cat: 'Computer Hardware', brand: 'HyperSilicon', price: 7299, cost: 4900, rating: 4.9, supplier: 'SiliconMatrix India', rop: 18, lead: 4, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500' },
    { sku: 'SSD-4002', name: 'PocketFast 500GB Rugged Portable External SSD', cat: 'Computer Hardware', brand: 'HyperSilicon', price: 4499, cost: 2800, rating: 4.7, supplier: 'SiliconMatrix India', rop: 24, lead: 4, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500' },
    { sku: 'RAM-4003', name: 'Vortex RGB DDR5 32GB (2x16GB) 6000MHz RAM Kit', cat: 'Computer Hardware', brand: 'VortexTech', price: 9999, cost: 7200, rating: 4.8, supplier: 'SiliconMatrix India', rop: 15, lead: 5, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500' },
    { sku: 'MN-4004', name: 'ViewMax 27-inch 165Hz IPS QHD Gaming Monitor', cat: 'Computer Hardware', brand: 'ViewMax', price: 19999, cost: 14200, rating: 4.8, supplier: 'DisplayMatrix Pvt Ltd', rop: 10, lead: 7, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
    { sku: 'HUB-4005', name: 'CoreConnect 9-in-1 USB-C Docking Station 100W PD', cat: 'Computer Hardware', brand: 'CoreConnect', price: 3299, cost: 1750, rating: 4.6, supplier: 'DeskWorx India', rop: 30, lead: 3, img: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500' },
    { sku: 'RT-4006', name: 'SpeedNet WiFi 6 AX3000 Dual-Band Gigabit Router', cat: 'Computer Hardware', brand: 'SpeedNet', price: 3999, cost: 2200, rating: 4.6, supplier: 'NetLink Enterprises', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' },
    { sku: 'PB-4007', name: 'ChargeCore 20000mAh 65W Fast Charging Power Bank', cat: 'Computer Hardware', brand: 'ChargeCore', price: 2699, cost: 1400, rating: 4.7, supplier: 'VoltSafe India', rop: 35, lead: 3, img: 'https://images.unsplash.com/photo-1609592426868-6c845b4c1022?w=500' },
    { sku: 'TB-4008', name: 'SlatePad 10.4-inch 2K Display Tablet 128GB LTE', cat: 'Computer Hardware', brand: 'SlateTech', price: 16999, cost: 12100, rating: 4.6, supplier: 'Quantum Vision Ltd', rop: 12, lead: 6, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
    { sku: 'AU-5001', name: 'TrueBass Studio Subwoofer 100W', cat: 'Audio & Peripherals', brand: 'BassNova', price: 8999, cost: 5800, rating: 4.7, supplier: 'AcousticTech India', rop: 10, lead: 6, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500' },
    { sku: 'AU-5002', name: 'AeroLink Bluetooth 5.3 Audio Transmitter', cat: 'Audio & Peripherals', brand: 'AeroFit', price: 1499, cost: 720, rating: 4.5, supplier: 'AcousticTech India', rop: 25, lead: 3, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
    { sku: 'CH-5003', name: 'MagPower 3-in-1 Magnetic Wireless Charging Stand', cat: 'Smart Home', brand: 'ChargeCore', price: 2999, cost: 1650, rating: 4.8, supplier: 'VoltSafe India', rop: 25, lead: 4, img: 'https://images.unsplash.com/photo-1609592426868-6c845b4c1022?w=500' },
    { sku: 'CH-5004', name: 'GaNFast 100W 4-Port Rapid Desktop Charger', cat: 'Computer Hardware', brand: 'VoltSafe', price: 3799, cost: 2100, rating: 4.9, supplier: 'VoltSafe India', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1609592426868-6c845b4c1022?w=500' },
    { sku: 'WR-5005', name: 'HydroFit Smart Water Bottle with Hydration Reminder', cat: 'Wearables', brand: 'BioMetrics', price: 1899, cost: 950, rating: 4.3, supplier: 'Zenith Microchips', rop: 18, lead: 5, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500' },
    { sku: 'CP-5006', name: 'IceFrost Dual-Fan Laptop Cooling Pad with RGB', cat: 'Computer Hardware', brand: 'ErgoGear', price: 1699, cost: 850, rating: 4.5, supplier: 'DeskWorx India', rop: 25, lead: 3, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
    { sku: 'CP-5007', name: 'CableNest Heavy Duty Under-Desk Cable Tray', cat: 'Computer Hardware', brand: 'ErgoGear', price: 1199, cost: 480, rating: 4.6, supplier: 'DeskWorx India', rop: 30, lead: 3, img: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500' },
    { sku: 'SM-5008', name: 'AuraBreeze Smart Ultrasonic Essential Oil Diffuser', cat: 'Smart Home', brand: 'LuminaTech', price: 2199, cost: 1150, rating: 4.7, supplier: 'BrightLite India', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500' },
    { sku: 'SM-5009', name: 'RoboClean Intelligent Robot Vacuum Cleaner 3000Pa', cat: 'Smart Home', brand: 'RoboTech', price: 21999, cost: 15400, rating: 4.8, supplier: 'RoboTech Solutions', rop: 8, lead: 8, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500' },
    { sku: 'AU-5010', name: 'AirDuo Wireless Lavalier Microphone Kit', cat: 'Audio & Peripherals', brand: 'VisionPro', price: 3699, cost: 1900, rating: 4.8, supplier: 'Visionix Electronics', rop: 22, lead: 4, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500' },
    { sku: 'MN-5011', name: 'FlexiArm Heavy-Duty Gas Spring Single Monitor Arm', cat: 'Computer Hardware', brand: 'ErgoGear', price: 2799, cost: 1350, rating: 4.7, supplier: 'DeskWorx India', rop: 20, lead: 3, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
    { sku: 'MN-5012', name: 'ScreenBar Eye-Care Stepless Dimming Monitor Light Bar', cat: 'Smart Home', brand: 'LuminaTech', price: 2499, cost: 1200, rating: 4.9, supplier: 'BrightLite India', rop: 25, lead: 3, img: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500' },
    { sku: 'KB-5013', name: 'PBT Double-Shot Custom Keycaps Set (134 Keys)', cat: 'Audio & Peripherals', brand: 'StrikeForce', price: 1699, cost: 800, rating: 4.6, supplier: 'Keytronix Pvt Ltd', rop: 30, lead: 4, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
    { sku: 'MS-5014', name: 'GlideFeet PTFE Ceramic Mouse Skates Replacement', cat: 'Audio & Peripherals', brand: 'ApexTech', price: 499, cost: 150, rating: 4.8, supplier: 'Keytronix Pvt Ltd', rop: 50, lead: 2, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500' },
    { sku: 'AU-5015', name: 'SoundStage 7.1 Surround Gaming Headset with Mic', cat: 'Audio & Peripherals', brand: 'SoundFlow', price: 3899, cost: 2100, rating: 4.7, supplier: 'AcousticTech India', rop: 18, lead: 4, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
    { sku: 'SSD-5016', name: 'HeatShield M.2 NVMe SSD Aluminum Heatsink Cooler', cat: 'Computer Hardware', brand: 'HyperSilicon', price: 699, cost: 250, rating: 4.6, supplier: 'SiliconMatrix India', rop: 40, lead: 3, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500' },
    { sku: 'CH-5017', name: 'UltraTough Braided 240W USB4 Type-C Cable 2m', cat: 'Computer Hardware', brand: 'VoltSafe', price: 799, cost: 300, rating: 4.9, supplier: 'VoltSafe India', rop: 60, lead: 2, img: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500' },
    { sku: 'TB-5018', name: 'StylusPen Pro Magnetic Wireless Charging Touch Pen', cat: 'Computer Hardware', brand: 'SlateTech', price: 2999, cost: 1500, rating: 4.7, supplier: 'Quantum Vision Ltd', rop: 20, lead: 4, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500' },
    { sku: 'WR-5019', name: 'BreathGuard Smart Air Quality Wearable Badge', cat: 'Wearables', brand: 'BioMetrics', price: 3499, cost: 1900, rating: 4.4, supplier: 'Zenith Microchips', rop: 15, lead: 5, img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500' },
    { sku: 'VR-5020', name: 'HapticGlove VR Tactile Feedback Controllers', cat: 'Wearables', brand: 'CyberSpace', price: 14999, cost: 9800, rating: 4.8, supplier: 'Quantum Vision Ltd', rop: 10, lead: 8, img: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=500' },
    { sku: 'SL-5021', name: 'SmartWater Leak & Flood WiFi Detector Alarm', cat: 'Smart Home', brand: 'SecureLiving', price: 1299, cost: 600, rating: 4.6, supplier: 'SecureLiving Solutions', rop: 30, lead: 3, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500' },
    { sku: 'SP-5022', name: 'MiniSound Clip-On Portable Bluetooth Speaker', cat: 'Audio & Peripherals', brand: 'PulseSound', price: 1499, cost: 700, rating: 4.5, supplier: 'AcousticTech India', rop: 35, lead: 3, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500' },
    { sku: 'WC-5023', name: 'PrivacyShutter 1080p FHD Dual-Mic Office Webcam', cat: 'Audio & Peripherals', brand: 'VisionPro', price: 2199, cost: 1100, rating: 4.5, supplier: 'Visionix Electronics', rop: 25, lead: 4, img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500' },
    { sku: 'HUB-5024', name: 'NanoHub 4-Port USB 3.0 Ultra-Slim Data Splitter', cat: 'Computer Hardware', brand: 'CoreConnect', price: 699, cost: 240, rating: 4.6, supplier: 'DeskWorx India', rop: 50, lead: 2, img: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500' },
    { sku: 'RT-5025', name: 'MeshExtender Dual-Band WiFi Signal Booster 1200Mbps', cat: 'Computer Hardware', brand: 'SpeedNet', price: 1899, cost: 950, rating: 4.4, supplier: 'NetLink Enterprises', rop: 25, lead: 4, img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' },
  ];

  const createdProducts: any[] = [];
  for (const p of rawProducts) {
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: `High-performance ${p.name} engineered for enterprise speed and reliability. Tested in India.`,
        category: p.cat,
        brand: p.brand,
        price: p.price,
        cost: p.cost,
        rating: p.rating,
        supplier: p.supplier,
        reorderPoint: p.rop,
        safetyStock: Math.round(p.rop * 0.5),
        leadTimeDays: p.lead,
        avgDailyDemand: parseFloat((4 + Math.random() * 8).toFixed(1)),
        weightKg: parseFloat((0.2 + Math.random() * 1.5).toFixed(2)),
        image: p.img,
      },
    });
    createdProducts.push(prod);
  }

  // 7. 100+ Inventory Records
  const locationKeys = Object.keys(createdLocations);
  let locIdx = 0;

  for (let i = 0; i < createdProducts.length; i++) {
    const prod = createdProducts[i];
    const loc1 = createdLocations[locationKeys[locIdx % locationKeys.length]];
    locIdx++;

    let qty1 = Math.floor(25 + Math.random() * 45);
    let res1 = Math.floor(Math.random() * 6);
    let status1 = 'HEALTHY';

    if (i === 0) {
      qty1 = 7;
      res1 = 3;
      status1 = 'CRITICAL';
    } else if (i === 1) {
      qty1 = 12;
      res1 = 4;
      status1 = 'LOW_STOCK';
    } else if (i === 4) {
      qty1 = 2;
      res1 = 2;
      status1 = 'OUT_OF_STOCK';
    }

    await prisma.inventory.create({
      data: {
        productId: prod.id,
        locationId: loc1.id,
        warehouseId: whA.id,
        quantity: qty1,
        reserved: res1,
        available: Math.max(0, qty1 - res1),
        status: status1,
        batchNumber: `BATCH-${202400 + i}`,
      },
    });

    if (i < 20) {
      const loc2 = createdLocations[locationKeys[(locIdx + 10) % locationKeys.length]];
      let qty2 = i === 0 ? 6 : Math.floor(15 + Math.random() * 30);
      let res2 = 0;

      await prisma.inventory.create({
        data: {
          productId: prod.id,
          locationId: loc2.id,
          warehouseId: whB.id,
          quantity: qty2,
          reserved: res2,
          available: qty2 - res2,
          status: qty2 < 10 ? 'LOW_STOCK' : 'HEALTHY',
          batchNumber: `BATCH-HYD-${202400 + i}`,
        },
      });
    }
  }

  // 8. 5 Packing Stations
  await prisma.packingStation.createMany({
    data: [
      { stationCode: 'P01', workerName: 'Rohan Gupta', currentOrderNum: 'ORD-1044', queueDepth: 2, avgPackingTimeMin: 4.9, status: 'AVAILABLE' },
      { stationCode: 'P02', workerName: 'Ananya Verma', currentOrderNum: 'ORD-1045', queueDepth: 5, avgPackingTimeMin: 5.1, status: 'PACKING' },
      { stationCode: 'P03', workerName: 'Suresh Kumar', currentOrderNum: 'ORD-1048', queueDepth: 17, avgPackingTimeMin: 8.4, status: 'OVERLOADED' },
      { stationCode: 'P04', workerName: 'Divya Nair', currentOrderNum: 'ORD-1049', queueDepth: 3, avgPackingTimeMin: 4.8, status: 'PACKING' },
      { stationCode: 'P05', workerName: 'Kunal Sen', currentOrderNum: 'ORD-1050', queueDepth: 1, avgPackingTimeMin: 5.0, status: 'AVAILABLE' },
    ],
  });

  // 9. 40+ Orders
  const customerNames = [
    { name: 'Aarav Enterprise Ltd', email: 'aarav.ent@example.in', city: 'Bengaluru' },
    { name: 'Priya Sharma', email: 'priya.s@gmail.com', city: 'Mumbai' },
    { name: 'Vikramaditya Tech', email: 'ops@vikramtech.in', city: 'Delhi NCR' },
    { name: 'Sneha Sundaram', email: 'sneha.s@outlook.com', city: 'Chennai' },
    { name: 'Aditya Birla Retail', email: 'orders@abretail.com', city: 'Hyderabad' },
    { name: 'Meera Iyer', email: 'meera.iyer@yahoo.com', city: 'Pune' },
    { name: 'Karthik Raja', email: 'karthik.r@techcorp.in', city: 'Coimbatore' },
    { name: 'Neha Chawla', email: 'neha.c@gmail.com', city: 'Kolkata' },
    { name: 'Rajesh Khanna', email: 'rajesh.k@innovate.in', city: 'Ahmedabad' },
    { name: 'Deepika Padukone Retail', email: 'dp.supply@fashiontech.in', city: 'Bengaluru' },
  ];

  const stagesList = ['CREATED', 'PRIORITIZED', 'ALLOCATED', 'PICKING', 'PACKING', 'QC', 'READY', 'DISPATCHED'];

  for (let i = 0; i < 42; i++) {
    const cust = customerNames[i % customerNames.length];
    const orderNum = `ORD-${1010 + i}`;
    const stage = stagesList[i % stagesList.length];
    const itemProd = createdProducts[i % createdProducts.length];
    const requestedQty = i === 38 ? 10 : Math.floor(1 + Math.random() * 4);
    const orderValue = itemProd.price * requestedQty;

    const hoursAhead = (i % 4) === 0 ? 1.5 : (i % 3 === 0 ? 3.0 : 8.0);
    const slaDeadline = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    const priorityScore = (i % 4) === 0 ? 94 : Math.floor(45 + Math.random() * 40);

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        customerName: cust.name,
        customerEmail: cust.email,
        customerCity: cust.city,
        orderValue,
        shippingType: (i % 3 === 0) ? 'SAME_DAY_PRIORITY' : ((i % 2 === 0) ? 'EXPRESS' : 'STANDARD'),
        priorityScore,
        priorityExplanation: JSON.stringify({
          slaUrgency: (i % 4 === 0) ? 35 : 15,
          shippingUrgency: (i % 3 === 0) ? 25 : 10,
          customerPriority: (i % 2 === 0) ? 20 : 10,
          orderAge: 14,
          inventoryRisk: 10,
          totalScore: priorityScore,
        }),
        stage,
        slaDeadline,
        slaRisk: (i % 4 === 0) ? 'HIGH' : ((i % 3 === 0) ? 'MEDIUM' : 'LOW'),
        assignedPicker: stage === 'PICKING' ? 'Aarav Sharma' : null,
        warehouseId: whA.id,
        items: {
          create: [
            {
              productId: itemProd.id,
              requestedQty,
              allocatedQty: stage !== 'CREATED' ? requestedQty : 0,
              pickedQty: (stage === 'PACKING' || stage === 'QC' || stage === 'READY' || stage === 'DISPATCHED') ? requestedQty : 0,
              packedQty: (stage === 'QC' || stage === 'READY' || stage === 'DISPATCHED') ? requestedQty : 0,
              unitPrice: itemProd.price,
            },
          ],
        },
      },
    });

    if (stage === 'PICKING' || stage === 'PACKING') {
      await prisma.pickingTask.create({
        data: {
          orderId: order.id,
          pickerName: 'Aarav Sharma',
          status: stage === 'PICKING' ? 'IN_PROGRESS' : 'COMPLETED',
          priority: order.priorityScore,
          baselineDistanceM: 428.0,
          optimizedDistanceM: 295.0,
          savingsPercent: 31.0,
          currentStep: stage === 'PICKING' ? 2 : 4,
          totalSteps: 4,
          routeWaypoints: JSON.stringify({
            baselineDistanceM: 428.0,
            optimizedDistanceM: 295.0,
            savingsMeters: 133,
            savingsPercent: 31.0,
            estimatedPickTimeMin: 5.4,
            optimizedWaypoints: [
              { step: 1, rackCode: 'A01', binCode: 'A01-L1-B1', sku: itemProd.sku, productName: itemProd.name, quantity: requestedQty, posX: -12, posY: 1.1, posZ: -8, zone: 'A', action: 'PICK' },
              { step: 2, rackCode: 'B02', binCode: 'B02-L2-B1', sku: 'KB-1002', productName: 'Mechanical Gaming Keyboard', quantity: 1, posX: -2, posY: 2.2, posZ: -2, zone: 'B', action: 'PICK' },
              { step: 3, rackCode: 'PACKING-BAY-1', binCode: 'STATION-P01', sku: 'ALL', productName: 'Deposit at Packing Station', quantity: requestedQty + 1, posX: 0, posY: 0, posZ: -15, zone: 'PACKING', action: 'DEPOSIT_PACKING' },
            ],
          }),
        },
      });
    }

    if (stage === 'READY' || stage === 'DISPATCHED') {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber: `TRK-${900000000 + i}`,
          carrier: i % 2 === 0 ? 'DELHIVERY' : 'BLUEDART',
          destinationCity: cust.city,
          status: stage === 'DISPATCHED' ? 'DISPATCHED' : 'READY',
          dispatchTime: stage === 'DISPATCHED' ? new Date(Date.now() - 2 * 60 * 60 * 1000) : null,
          estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 10. 20+ Exceptions
  const exceptionTemplates = [
    { type: 'OUT_OF_STOCK', sev: 'CRITICAL', desc: 'SKU WC-1005 (4K Webcam) completely depleted during multi-order wave', impact: '3 orders blocked from allocation', rec: 'Execute split allocation from WH-B and issue emergency supplier PO for 45 units.', conf: 96 },
    { type: 'ALLOCATION_CONFLICT', sev: 'CRITICAL', desc: 'ORD-1048 requires 10 × Wireless Headphones; only 7 available at WH-A Rack A12', impact: 'SLA breach in 1h 42m without cross-warehouse fulfillment', rec: 'Allocate 7 units from WH-A Rack A12 and source 3 units from WH-B Rack C09.', conf: 94 },
    { type: 'WAREHOUSE_CONGESTION', sev: 'CRITICAL', desc: 'Packing Station P03 queue backlogged with 17 parcels (Avg cycle: 8.4 min)', impact: '+42 minutes dispatch departure delay', rec: 'Shift 1 packing operator from Station P01 to Station P03 immediately.', conf: 92 },
    { type: 'DAMAGED_ITEM', sev: 'HIGH', desc: 'Broken seal detected on mechanical keyboard parcel during QC inspection', impact: 'Order ORD-1035 halted prior to carrier release', rec: 'Quarantine damaged SKU to QC Bin and auto-allocate replacement from Rack B02.', conf: 97 },
    { type: 'SLA_RISK', sev: 'HIGH', desc: 'ORD-1044 Same-Day Priority SLA cutoff in 48 minutes', impact: 'Risk of ₹5,000 SLA penalty clause', rec: 'Elevate priority score to 98 and assign dedicated express picker Aarav Sharma.', conf: 95 },
    { type: 'LOW_STOCK', sev: 'HIGH', desc: 'SKU KB-1002 (Mechanical Keyboard) stock breached reorder point (12 units left)', impact: 'Stockout predicted in 2.2 days before supplier replenishment', rec: 'Trigger automated purchase order for 75 units from Keytronix Pvt Ltd.', conf: 94 },
    { type: 'PICKING_DELAY', sev: 'MEDIUM', desc: 'Picker trolley blocked in Aisle A-05 due to replenishment pallet staging', impact: '6 minutes added to picking wave 12', rec: 'Reroute picker via Aisle A-04 S-pathway and clear staging obstruction.', conf: 89 },
    { type: 'WRONG_SKU', sev: 'MEDIUM', desc: 'Barcode scanner mismatch in Bin C02-L1-B2 (Expected AR-2003, Scanned FB-2002)', impact: 'Inventory miscount risk in Zone C', rec: 'Trigger immediate bin count audit and update storage location SKU mapping.', conf: 93 },
  ];

  for (let i = 0; i < 20; i++) {
    const tmpl = exceptionTemplates[i % exceptionTemplates.length];
    const isResolved = i > 12;
    await prisma.exception.create({
      data: {
        exceptionNumber: `EXC-${2010 + i}`,
        type: tmpl.type,
        severity: tmpl.sev,
        status: isResolved ? 'RESOLVED' : (i < 4 ? 'ACTION_REQUIRED' : 'OPEN'),
        description: tmpl.desc,
        impact: tmpl.impact,
        primalRecommendation: tmpl.rec,
        confidenceScore: tmpl.conf,
        resolutionNotes: isResolved ? 'Resolved via PRIMAL Automated Intelligence Workflow.' : null,
        resolvedAt: isResolved ? new Date(Date.now() - (i * 3600000)) : null,
      },
    });
  }

  // 11. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { action: 'SYSTEM_INITIALIZED', entityType: 'SYSTEM', details: 'PRIMAL Warehouse Command Center initialized nominal operations across 2 Fulfillment Centers.' },
      { action: 'ALLOCATION_OPTIMIZED', entityType: 'ALLOCATION', details: 'Allocation Engine resolved multi-bin split for 8 orders, saving 42 mins in cross-docking.' },
      { action: 'BOTTLENECK_ALERT', entityType: 'PACKING', details: 'Packing Station P03 reached 17 backlogged orders. Worker rebalance recommendation dispatched.' },
      { action: 'ROUTE_OPTIMIZED', entityType: 'PICKING', details: 'TSP route solver reduced wave distance from 428m to 295m (31% reduction).' },
      { action: 'EXCEPTION_DETECTED', entityType: 'EXCEPTION', details: 'Critical allocation conflict detected for ORD-1048. Recommendation generated.' },
    ],
  });

  // 12. Notifications
  await prisma.notification.createMany({
    data: [
      { title: 'Critical SLA Warning', message: 'Order ORD-1048 has less than 90 minutes remaining before carrier departure cutoff.', type: 'CRITICAL', category: 'SLA' },
      { title: 'Packing Station Congestion', message: 'Station P03 queue has exceeded threshold (17 orders waiting). Reallocation recommended.', type: 'WARNING', category: 'BOTTLENECK' },
      { title: 'Stockout Risk Predicted', message: 'Mechanical Keyboard (SKU KB-1002) run-rate indicates stockout in 2.2 days.', type: 'WARNING', category: 'STOCK' },
      { title: 'Fulfillment Wave Completed', message: 'Wave 14 completed with 98.4% on-time dispatch rate.', type: 'SUCCESS', category: 'ORDER' },
    ],
  });

  console.log('✅ [PRIMAL Seeder] Seeding finished successfully!');
}
