export const TRANSFER_BRANCH_OPTIONS = [
  {
    province: 'Baghdad Province',
    isArticle140: false,
    branches: [
      {
        code: 'BAG-KARKH-01',
    branchName: 'Karkh 1st Food Supply Branch',
        centers: [
          {
            centerId: '101',
            centerName: 'Mansour Core Ration Center',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-01', name: 'Mansour 1st Flour Station', currentHouseholds: 1240, maxCapacity: 1500, manager: 'Samir Jassim' },
              { id: 'FA-BAG-02', name: 'Yarmouk Flour Service Store', currentHouseholds: 1500, maxCapacity: 1500, manager: 'Ali Khalid (Full)' }
            ],
            foodAgents: [
              { id: 'FD-BAG-01', name: 'Mansour 3rd Food & Oil Co-op', currentHouseholds: 980, maxCapacity: 1500, manager: 'Walid Mohammed' },
              { id: 'FD-BAG-02', name: 'Tahrir Square Food Service Station', currentHouseholds: 1485, maxCapacity: 1500, manager: 'Youssef Hassan' }
            ]
          },
          {
            centerId: '102',
            centerName: 'Kadhimiya Ration Center',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-03', name: 'Kadhimiya Mosque West Flour Station', currentHouseholds: 890, maxCapacity: 1500, manager: 'Abbas Kadhim' }
            ],
            foodAgents: [
              { id: 'FD-BAG-03', name: 'Kadhimiya Center Food Station', currentHouseholds: 1320, maxCapacity: 1500, manager: 'Haider Rahim' }
            ]
          }
        ]
      },
      {
        code: 'BAG-RUSAFA-02',
    branchName: 'Rusafa 2nd Food Supply Branch',
        centers: [
          {
            centerId: '108',
            centerName: 'Sadr City Central Ration Center',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-08', name: 'Sadr 5th Flour Outlet', currentHouseholds: 1420, maxCapacity: 1500, manager: 'Mustafa Nasser' }
            ],
            foodAgents: [
              { id: 'FD-BAG-08', name: 'Sadr People\'s Grain Co-op', currentHouseholds: 1500, maxCapacity: 1500, manager: 'Raad Saad (Full)' },
              { id: 'FD-BAG-09', name: 'East District Food Relief Post', currentHouseholds: 650, maxCapacity: 1500, manager: 'Nouri Kamal' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: 'Diyala Province',
    isArticle140: true,
    branches: [
      {
        code: 'DIY-EAST-01',
    branchName: 'Diyala Eastern Branch',
        centers: [
          {
            centerId: '496',
            centerName: 'Khanaqin Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-DIY-01', name: 'Khanaqin 1st Border Flour Station', currentHouseholds: 1100, maxCapacity: 1500, manager: 'Barzan Karad' }
            ],
            foodAgents: [
              { id: 'FD-DIY-01', name: 'Khanaqin Central Food Supply Co-op', currentHouseholds: 890, maxCapacity: 1500, manager: 'Sherwan Majid' }
            ]
          },
          {
            centerId: '497',
            centerName: 'Jalawla Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-DIY-02', name: 'Jalawla Highway Flour Service Point', currentHouseholds: 750, maxCapacity: 1500, manager: 'Mahmoud Ahmed' }
            ],
            foodAgents: [
              { id: 'FD-DIY-02', name: 'Jalawla General Food & Grain Outlet', currentHouseholds: 620, maxCapacity: 1500, manager: 'Karim Farouk' }
            ]
          },
          {
            centerId: '498',
            centerName: 'Saadiya Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-DIY-03', name: 'Saadiya Oasis Flour Station', currentHouseholds: 830, maxCapacity: 1500, manager: 'Salah Youssef' }
            ],
            foodAgents: [
              { id: 'FD-DIY-03', name: 'Saadiya Food Rationing Division', currentHouseholds: 710, maxCapacity: 1500, manager: 'Farouk Omar' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: 'Nineveh Province',
    isArticle140: true,
    branches: [
      {
        code: 'NIN-WEST-01',
    branchName: 'Nineveh West & Mountain Ration Branch',
        centers: [
          {
            centerId: '320',
            centerName: 'Sinjar Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-NIN-01', name: 'Sinjar Revival Flour Direct Outlet', currentHouseholds: 920, maxCapacity: 1500, manager: 'Ilyas Haji' }
            ],
            foodAgents: [
              { id: 'FD-NIN-01', name: 'Sinjar Central Food & Oil Station', currentHouseholds: 1040, maxCapacity: 1500, manager: 'Mirza Qasim' }
            ]
          },
          {
            centerId: '304',
            centerName: 'Zummar Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-NIN-02', name: 'Zummar Lakeside Flour Agency', currentHouseholds: 680, maxCapacity: 1500, manager: 'Hashim Abdullah' }
            ],
            foodAgents: [
              { id: 'FD-NIN-02', name: 'Zummar Agri-Food Station', currentHouseholds: 590, maxCapacity: 1500, manager: 'Salim Bashir' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: 'Kirkuk Province',
    isArticle140: true,
    branches: [
      {
        code: 'KIR-CENTER-01',
    branchName: 'Kirkuk Central Food Supply Branch',
        centers: [
          {
            centerId: '511',
            centerName: 'Kirkuk Citadel Core Ration Center',
            isArticle140: true,
            flourAgents: [
              { id: 'FA-KIR-01', name: 'Kirkuk Old City 1st Flour Agency', currentHouseholds: 1350, maxCapacity: 1500, manager: 'Osman Tolga' }
            ],
            foodAgents: [
              { id: 'FD-KIR-01', name: 'Kirkuk Oil Avenue Food Station', currentHouseholds: 1200, maxCapacity: 1500, manager: 'Mohammed Bayati' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: 'Basra Province',
    isArticle140: false,
    branches: [
      {
        code: 'BAS-PORT-01',
    branchName: 'Basra Port Ration Support Branch',
        centers: [
          {
            centerId: '201',
            centerName: 'Ashar Portside Ration Center',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAS-01', name: 'Ashar Port Flour Agency', currentHouseholds: 980, maxCapacity: 1500, manager: 'Jaber Salim' }
            ],
            foodAgents: [
              { id: 'FD-BAS-01', name: 'Corniche General Food Supply Station', currentHouseholds: 1150, maxCapacity: 1500, manager: 'Mohsen Nadim' }
            ]
          }
        ]
      }
    ]
  }
];
