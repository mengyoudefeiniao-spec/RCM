export const MOCK_CITIZEN_CARDS = [
  {
    id: "CARD-10029381",
    cardNo: "RC-10029381",
    headName: "Ahmed Hassan Saleh",
    nationalId: "IQ-1980-0419-8271",
    phone: "+964 780 123 4567",
    province: "Baghdad Province",
    district: "Karkh 1st Ration Center (#04)",
    memberCount: 5,
    status: "Active",
    freezeReason: "",
    quotas: {
      flour: 45,
      rice: 15,
      oil: 5,
      sugar: 4
    },
    lastVerifiedAt: "2026-03-28 10:15",
    issueDate: "2024-01-15",
    rfidChipUid: "NFC-IQ-8829104A"
  },
  {
    id: "CARD-10029382",
    cardNo: "RC-10029382",
    headName: "Haider Abdul-Rahman",
    nationalId: "IQ-1975-1102-3392",
    phone: "+964 771 992 8831",
    province: "Baghdad Province",
    district: "Al-Rusafa Center Station",
    memberCount: 4,
    status: "Frozen",
    freezeReason: "Annual citizen biometric verification overdue for 3 months",
    quotas: {
      flour: 36,
      rice: 12,
      oil: 4,
      sugar: 3
    },
    lastVerifiedAt: "2025-12-10 14:20",
    issueDate: "2023-06-11",
    rfidChipUid: "NFC-IQ-9102482B"
  },
  {
    id: "CARD-10034820",
    cardNo: "RC-10034820",
    headName: "Fatima Zahra Mohammed",
    nationalId: "IQ-1988-0814-7719",
    phone: "+964 750 443 1122",
    province: "Basra Province",
    district: "Al-Ashar Coastal Service Center",
    memberCount: 3,
    status: "Active",
    freezeReason: "",
    quotas: {
      flour: 27,
      rice: 9,
      oil: 3,
      sugar: 2
    },
    lastVerifiedAt: "2026-04-01 09:30",
    issueDate: "2024-03-20",
    rfidChipUid: "NFC-IQ-1102938C"
  },
  {
    id: "CARD-10041928",
    cardNo: "RC-10041928",
    headName: "Omar Farooq Khalil",
    nationalId: "IQ-1969-0220-4491",
    phone: "+964 782 556 7788",
    province: "Nineveh Province",
    district: "Old Mosul Ration Center",
    memberCount: 6,
    status: "Under Review",
    freezeReason: "Pending head of household inheritance review",
    quotas: {
      flour: 54,
      rice: 18,
      oil: 6,
      sugar: 5
    },
    lastVerifiedAt: "2026-02-14 11:45",
    issueDate: "2023-09-05",
    rfidChipUid: "NFC-IQ-3394817D"
  },
  {
    id: "CARD-10052910",
    cardNo: "RC-10052910",
    headName: "Youssef Ibrahim Qasim",
    nationalId: "IQ-1992-0518-9921",
    phone: "+964 773 221 4455",
    province: "Erbil Province",
    district: "Ainkawa Supply Station",
    memberCount: 2,
    status: "Active",
    freezeReason: "",
    quotas: {
      flour: 18,
      rice: 6,
      oil: 2,
      sugar: 2
    },
    lastVerifiedAt: "2026-03-19 16:22",
    issueDate: "2025-02-01",
    rfidChipUid: "NFC-IQ-7728190E"
  }
];

export const MOCK_FAMILIES_ADMIN = [
  {
    id: "FAM-BAG-001",
    familyCode: "FAM-BAG-10029",
    cardNo: "RC-10029381",
    headName: "Ahmed Hassan Saleh",
    headNationalId: "IQ-1980-0419-8271",
    category: "Standard Assistance",
    memberCount: 5,
    address: "No. 14, Mansour St, Karkh District, Baghdad",
    registeredDate: "2024-01-15",
    adminBranch: "Karkh 1st Food Supply Branch",
    phone: "+964 780 123 4567",
    members: [
      {
        id: "m-01",
        name: "Ahmed Hassan Saleh",
        relation: "Head",
        nationalId: "IQ-1980-0419-8271",
        birthDate: "1980-04-19",
        gender: "Male",
        isFrozen: false
      },
      {
        id: "m-02",
        name: "Fatima Ali Mohammed",
        relation: "Spouse",
        nationalId: "IQ-1984-0712-9921",
        birthDate: "1984-07-12",
        gender: "Female",
        isFrozen: false
      },
      {
        id: "m-03",
        name: "Omar Ahmed Hassan",
        relation: "Child",
        nationalId: "IQ-2006-1103-4412",
        birthDate: "2006-11-03",
        gender: "Male",
        isFrozen: false
      },
      {
        id: "m-04",
        name: "Zainab Ahmed Hassan",
        relation: "Child",
        nationalId: "IQ-2010-0218-3382",
        birthDate: "2010-02-18",
        gender: "Female",
        isFrozen: false
      },
      {
        id: "m-05",
        name: "Youssef Ahmed Hassan",
        relation: "Child",
        nationalId: "IQ-2015-0909-1120",
        birthDate: "2015-09-09",
        gender: "Male",
        isFrozen: false
      }
    ]
  },
  {
    id: "FAM-BAG-002",
    familyCode: "FAM-BAG-10030",
    cardNo: "RC-10029382",
    headName: "Haider Abdul-Rahman",
    headNationalId: "IQ-1975-1102-3392",
    category: "Special Hardship",
    memberCount: 4,
    address: "No. 32, Sadr City, Al-Rusafa District, Baghdad",
    registeredDate: "2023-06-11",
    adminBranch: "Al-Rusafa 2nd Food Supply Branch",
    phone: "+964 771 992 8831",
    members: [
      {
        id: "m-11",
        name: "Haider Abdul-Rahman",
        relation: "Head",
        nationalId: "IQ-1975-1102-3392",
        birthDate: "1975-11-02",
        gender: "Male",
        isFrozen: true
      },
      {
        id: "m-12",
        name: "Layla Samir",
        relation: "Spouse",
        nationalId: "IQ-1979-0520-2219",
        birthDate: "1979-05-20",
        gender: "Female",
        isFrozen: true
      },
      {
        id: "m-13",
        name: "Mustafa Haider",
        relation: "Child",
        nationalId: "IQ-2005-0814-6621",
        birthDate: "2005-08-14",
        gender: "Male",
        isFrozen: true
      },
      {
        id: "m-14",
        name: "Sara Haider",
        relation: "Child",
        nationalId: "IQ-2009-1201-8843",
        birthDate: "2009-12-01",
        gender: "Female",
        isFrozen: true
      }
    ]
  },
  {
    id: "FAM-BAS-001",
    familyCode: "FAM-BAS-20018",
    cardNo: "RC-10034820",
    headName: "Fatima Zahra Mohammed",
    headNationalId: "IQ-1988-0814-7719",
    category: "Preferential Care",
    memberCount: 3,
    address: "No. 8, Seaside Ave, Al-Ashar District, Basra",
    registeredDate: "2024-03-20",
    adminBranch: "Basra Port Ration Support Station",
    phone: "+964 750 443 1122",
    members: [
      {
        id: "m-21",
        name: "Fatima Zahra Mohammed",
        relation: "Head",
        nationalId: "IQ-1988-0814-7719",
        birthDate: "1988-08-14",
        gender: "Female",
        isFrozen: false
      },
      {
        id: "m-22",
        name: "Hassan Ali Mohammed",
        relation: "Child",
        nationalId: "IQ-2012-0311-5521",
        birthDate: "2012-03-11",
        gender: "Male",
        isFrozen: false
      },
      {
        id: "m-23",
        name: "Noor Ali Mohammed",
        relation: "Child",
        nationalId: "IQ-2016-1025-7734",
        birthDate: "2016-10-25",
        gender: "Female",
        isFrozen: false
      }
    ]
  }
];

export const MOCK_AGENTS_ADMIN = [
  {
    id: "AGT-001",
    code: "FA-00128",
    name: "Baghdad 1st Food Distribution Center",
    manager: "Mohammed Jabbar",
    phone: "+964 770 123 4567",
    province: "Baghdad Province",
    district: "Mansour District, Al-Karkh",
    address: "No. 45-1, Mansour Commercial St",
    status: "Active",
    rating: 5,
    servedHouseholds: 1250,
    storageCapacity: 80,
    lastInspectedAt: "2026-03-25"
  },
  {
    id: "AGT-002",
    code: "FA-00256",
    name: "Al-Rusafa Central Food Agent Station",
    manager: "Tariq Aziz",
    phone: "+964 771 234 5678",
    province: "Baghdad Province",
    district: "Sadr City, Al-Rusafa",
    address: "Service Station #3, East Tahrir Square",
    status: "Active",
    rating: 4,
    servedHouseholds: 2100,
    storageCapacity: 120,
    lastInspectedAt: "2026-03-20"
  },
  {
    id: "AGT-003",
    code: "FA-00389",
    name: "Karrada Emergency Food Distribution Point",
    manager: "Salah al-Din Mohsen",
    phone: "+964 780 345 6789",
    province: "Baghdad Province",
    district: "Karrada District",
    address: "No. 88, Karrada Inner St",
    status: "Suspended",
    rating: 2,
    servedHouseholds: 680,
    storageCapacity: 45,
    lastInspectedAt: "2026-03-12"
  },
  {
    id: "AGT-004",
    code: "FA-00412",
    name: "Al-Ashar Coastal Distribution Cooperative",
    manager: "Walid Khalid",
    phone: "+964 750 456 7890",
    province: "Basra Province",
    district: "Al-Ashar District",
    address: "Block A, Seaside Food Assurance Building",
    status: "Active",
    rating: 5,
    servedHouseholds: 1850,
    storageCapacity: 100,
    lastInspectedAt: "2026-04-02"
  }
];

export const MOCK_WAREHOUSES_ADMIN = [
  {
    id: "WH-01",
    code: "WH-BAG-01",
    name: "Baghdad 1st National Reserve Grain Silo",
    type: "Strategic Reserve Silo",
    province: "Baghdad Province",
    center: "Karkh 1st Food Supply Branch",
    capacity: 160000,
    currentStock: 148500,
    manager: "Abdul Hakim",
    phone: "+964 780 998 1122",
    status: "Active",
    address: "No. 1, Industrial Food Park, Karkh, Baghdad"
  },
  {
    id: "WH-02",
    code: "WH-BAG-02",
    name: "Al-Karkh Flour Strategic Reserve Warehouse",
    type: "Regional Central Warehouse",
    province: "Baghdad Province",
    center: "Karkh 1st Food Supply Branch",
    capacity: 110000,
    currentStock: 98200,
    manager: "Qasim Naji",
    phone: "+964 771 883 2233",
    status: "Active",
    address: "No. 5, Mansour Reserve Avenue, Karkh"
  },
  {
    id: "WH-03",
    code: "WH-BAG-03",
    name: "Al-Rusafa Logistics Distribution Hub",
    type: "Hub Forward Warehouse",
    province: "Baghdad Province",
    center: "Al-Rusafa 2nd Food Supply Branch",
    capacity: 75000,
    currentStock: 69400,
    manager: "Rashid Saleh",
    phone: "+964 782 119 3344",
    status: "Active",
    address: "East Transfer Logistics Port, Sadr City, Al-Rusafa"
  },
  {
    id: "WH-04",
    code: "WH-BAS-01",
    name: "Basra Seaport Strategic Reserve Silo",
    type: "Strategic Reserve Silo",
    province: "Basra Province",
    center: "Basra Port Ration Support Station",
    capacity: 120000,
    currentStock: 113000,
    manager: "Walid Farooq",
    phone: "+964 750 443 8899",
    status: "Active",
    address: "Grain Terminal Dock, Umm Qasr Deepwater Port"
  },
  {
    id: "WH-05",
    code: "WH-MOS-01",
    name: "North Mosul Emergency Food Reserve Silo",
    type: "Regional Central Warehouse",
    province: "Nineveh Province",
    center: "Old Mosul Ration Center",
    capacity: 90000,
    currentStock: 82000,
    manager: "Samir Majid",
    phone: "+964 773 665 7711",
    status: "Active",
    address: "Station 7, West Bank Industrial Zone, Mosul"
  },
  {
    id: "WH-06",
    code: "WH-DIY-01",
    name: "Diyala Khanaqin Forward Supply Silo (Res. 140 Zone)",
    type: "Emergency Reserve Silo",
    province: "Diyala Province",
    center: "Diyala Khanaqin Forward Supply Branch",
    capacity: 35000,
    currentStock: 31200,
    manager: "Hassan Baqir",
    phone: "+964 781 224 5566",
    status: "Alert Reserve",
    address: "Khanaqin Border Crossing Reserve Base"
  }
];
