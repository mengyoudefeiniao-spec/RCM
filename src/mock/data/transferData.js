// 代理转移支持的省份、分部、中心及代理网点元数据
// 包含第 140 号决议区域标识与 1,500 户代理容量指标

export const TRANSFER_BRANCH_OPTIONS = [
  {
    province: '巴格达省 (Baghdad)',
    isArticle140: false,
    branches: [
      {
        branchName: '卡尔赫第一粮食供应分部',
        centers: [
          {
            centerId: '101',
            centerName: '曼苏尔核心配给中心',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-01', name: '曼苏尔第一面粉代销站', currentHouseholds: 1240, maxCapacity: 1500, manager: '萨米尔·贾希姆' },
              { id: 'FA-BAG-02', name: '雅尔穆克综合面粉惠民店', currentHouseholds: 1500, maxCapacity: 1500, manager: '阿里·哈立德 (已满额)' }
            ],
            foodAgents: [
              { id: 'FD-BAG-01', name: '曼苏尔第3食品粮油保供社', currentHouseholds: 980, maxCapacity: 1500, manager: '瓦利德·穆罕默德' },
              { id: 'FD-BAG-02', name: '解放广场便民食品服务站', currentHouseholds: 1485, maxCapacity: 1500, manager: '优素福·哈桑' }
            ]
          },
          {
            centerId: '102',
            centerName: '卡达米亚配给中心',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-03', name: '卡达米亚清真寺西侧面粉站', currentHouseholds: 890, maxCapacity: 1500, manager: '阿巴斯·卡迪姆' }
            ],
            foodAgents: [
              { id: 'FD-BAG-03', name: '卡达米亚中心食品配给站', currentHouseholds: 1320, maxCapacity: 1500, manager: '海德尔·拉希姆' }
            ]
          }
        ]
      },
      {
        branchName: '鲁萨法第二粮食供应分部',
        centers: [
          {
            centerId: '108',
            centerName: '萨德尔城中央配给中心',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAG-08', name: '萨德尔第5面粉网点', currentHouseholds: 1420, maxCapacity: 1500, manager: '穆斯塔法·纳赛尔' }
            ],
            foodAgents: [
              { id: 'FD-BAG-08', name: '萨德尔惠民粮油合作社', currentHouseholds: 1500, maxCapacity: 1500, manager: '拉阿德·萨阿德 (已满额)' },
              { id: 'FD-BAG-09', name: '东区应急食品代发点', currentHouseholds: 650, maxCapacity: 1500, manager: '努里·卡迈勒' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: '迪亚拉省 (Diyala)',
    isArticle140: true, // 含有第140号决议中心
    branches: [
      {
        branchName: '迪亚拉东部分部',
        centers: [
          {
            centerId: '496',
            centerName: '哈奈根 (Khanaqin) 配给中心',
            isArticle140: true, // 第140号决议覆盖
            flourAgents: [
              { id: 'FA-DIY-01', name: '哈奈根第一边境面粉代销站', currentHouseholds: 1100, maxCapacity: 1500, manager: '巴尔赞·卡拉德' }
            ],
            foodAgents: [
              { id: 'FD-DIY-01', name: '哈奈根中心食品供应合作社', currentHouseholds: 890, maxCapacity: 1500, manager: '谢尔万·马吉德' }
            ]
          },
          {
            centerId: '497',
            centerName: '贾劳拉 (Jalawla) 配给中心',
            isArticle140: true, // 第140号决议覆盖
            flourAgents: [
              { id: 'FA-DIY-02', name: '贾劳拉干线面粉服务点', currentHouseholds: 750, maxCapacity: 1500, manager: '马哈茂德·艾哈迈德' }
            ],
            foodAgents: [
              { id: 'FD-DIY-02', name: '贾劳拉惠民综合粮油店', currentHouseholds: 620, maxCapacity: 1500, manager: '卡里姆·法鲁克' }
            ]
          },
          {
            centerId: '498',
            centerName: '萨阿迪耶 (Saadiya) 配给中心',
            isArticle140: true, // 第140号决议覆盖
            flourAgents: [
              { id: 'FA-DIY-03', name: '萨阿迪耶绿洲面粉站', currentHouseholds: 830, maxCapacity: 1500, manager: '萨拉赫·优素福' }
            ],
            foodAgents: [
              { id: 'FD-DIY-03', name: '萨阿迪耶粮食配给部', currentHouseholds: 710, maxCapacity: 1500, manager: '法鲁克·奥马尔' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: '尼尼微省 (Nineveh)',
    isArticle140: true,
    branches: [
      {
        branchName: '尼尼微西部与山区配给分部',
        centers: [
          {
            centerId: '320',
            centerName: '辛贾尔 (Sinjar) 配给中心',
            isArticle140: true, // 第140号决议覆盖
            flourAgents: [
              { id: 'FA-NIN-01', name: '辛贾尔复兴面粉直供点', currentHouseholds: 920, maxCapacity: 1500, manager: '伊利亚斯·哈吉' }
            ],
            foodAgents: [
              { id: 'FD-NIN-01', name: '辛贾尔中心综合粮油站', currentHouseholds: 1040, maxCapacity: 1500, manager: '米尔扎·卡西姆' }
            ]
          },
          {
            centerId: '304',
            centerName: '祖马尔 (Zummar) 配给中心',
            isArticle140: true, // 第140号决议覆盖
            flourAgents: [
              { id: 'FA-NIN-02', name: '祖马尔湖畔面粉代销所', currentHouseholds: 680, maxCapacity: 1500, manager: '哈希姆·阿卜杜拉' }
            ],
            foodAgents: [
              { id: 'FD-NIN-02', name: '祖马尔农牧便民食品点', currentHouseholds: 590, maxCapacity: 1500, manager: '萨利姆·巴希尔' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: '基尔库克省 (Kirkuk)',
    isArticle140: true, // 基尔库克全境全部中心受第140号决议覆盖
    branches: [
      {
        branchName: '基尔库克中央粮食配给分部',
        centers: [
          {
            centerId: '511',
            centerName: '基尔库克城堡核心配给中心',
            isArticle140: true, // 全境覆盖
            flourAgents: [
              { id: 'FA-KIR-01', name: '基尔库克第一古城面粉代销网点', currentHouseholds: 1350, maxCapacity: 1500, manager: '奥斯曼·托尔加' }
            ],
            foodAgents: [
              { id: 'FD-KIR-01', name: '基尔库克石油大街食品惠民点', currentHouseholds: 1200, maxCapacity: 1500, manager: '穆罕默德·拜亚提' }
            ]
          }
        ]
      }
    ]
  },
  {
    province: '巴士拉省 (Basra)',
    isArticle140: false,
    branches: [
      {
        branchName: '巴士拉港口配给保障分部',
        centers: [
          {
            centerId: '201',
            centerName: '阿沙尔滨海配给中心',
            isArticle140: false,
            flourAgents: [
              { id: 'FA-BAS-01', name: '阿沙尔港口面粉代销点', currentHouseholds: 980, maxCapacity: 1500, manager: '贾比尔·萨利姆' }
            ],
            foodAgents: [
              { id: 'FD-BAS-01', name: '滨海大道综合食品供应站', currentHouseholds: 1150, maxCapacity: 1500, manager: '穆赫辛·纳迪姆' }
            ]
          }
        ]
      }
    ]
  }
];
