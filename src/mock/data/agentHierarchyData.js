/**
 * 代理三级层级体系与家庭挂靠数据模型
 * 契合 Spring Cloud 微服务架构 (Gateway -> Auth / SCM / BPM / GIS)
 * 层级结构：省级代理 (宏观监控) -> 区域代理 (多中心协调) -> 街道代理 (终端服务，1500户硬上限)
 */

export const MOCK_AGENT_HIERARCHY_TREE = [
  {
    id: 'PROV-AGT-BAG01',
    level: 'PROVINCE',
    levelName: '省级代理 (总管)',
    name: '穆罕默德·贾巴尔·拉希德',
    title: '巴格达省配给运营总监 (我)',
    isSelf: true,
    phone: '07701122339',
    province: '巴格达省 (Baghdad)',
    jurisdictionScope: '巴格达全境 14 个行政区',
    totalDistricts: 3,
    totalStreetStations: 7,
    totalHouseholdsServed: 7650,
    maxCapacitySum: 10500, // 7 * 1500
    overallSaturationRate: 72.8,
    gisBoundaryCode: 'GEO-IRQ-BAG-PROV',
    children: [
      {
        id: 'REG-AGT-01',
        level: 'DISTRICT',
        levelName: '区域代理 (区级调度)',
        name: '海德尔·法蒂赫·纳吉姆',
        title: '卡尔赫区区域代理经理',
        isSelf: false,
        phone: '07705544331',
        province: '巴格达省',
        district: '卡尔赫区 (Al-Karkh)',
        centerBindingName: '卡尔赫第一配给中心 / 第二配给中心',
        centerId: '101',
        totalStreetStations: 3,
        totalHouseholdsServed: 4100,
        maxCapacitySum: 4500, // 3 * 1500
        overallSaturationRate: 91.1,
        gisDistrictPolygon: 'POLYGON_KARKH_SECTOR',
        children: [
          {
            id: 'FA-00128',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '穆罕默德·贾巴尔·拉希德 (本人经营代销站)',
            storeName: '卡尔赫第一配给中心综合代销站',
            isSelf: true,
            phone: '07701122339',
            province: '巴格达省',
            district: '卡尔赫区 (Al-Karkh)',
            streetName: '曼苏尔街道 (Al-Mansour)',
            address: '巴格达市卡尔赫区曼苏尔商业街14号',
            centerId: '101',
            centerName: '卡尔赫第一配给中心 (曼苏尔)',
            licenseNo: 'LIC-BAG-101-2024',
            storeAreaSqM: 42,
            householdsCount: 1120,
            maxHouseholdsLimit: 1500,
            saturationRate: 74.7,
            status: '正常营业',
            lockStatus: 'NORMAL', // NORMAL(正常), WARNING(临界预警), SATURATED_LOCKED(饱和锁定)
            statusDescription: '网格负荷正常，尚可容纳 380 户家庭迁入',
            gisCoords: {
              x: 330,
              y: 300,
              lat: 33.3128,
              lng: 44.3615,
              radiusMeters: 800
            }
          },
          {
            id: 'FA-00135',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '奥马尔·萨巴赫·阿尔-纳西尔',
            storeName: '亚尔穆克第3街道便民配给站',
            isSelf: false,
            phone: '07706677882',
            province: '巴格达省',
            district: '卡尔赫区 (Al-Karkh)',
            streetName: '亚尔穆克街道 (Al-Yarmouk)',
            address: '巴格达市卡尔赫区亚尔穆克商业环岛西侧6号',
            centerId: '101',
            centerName: '卡尔赫第一配给中心 (曼苏尔)',
            licenseNo: 'LIC-BAG-135-2024',
            storeAreaSqM: 38,
            householdsCount: 1480,
            maxHouseholdsLimit: 1500,
            saturationRate: 98.7,
            status: '临界预警',
            lockStatus: 'WARNING',
            statusDescription: '已签约 1,480 户，逼近 1,500 户硬上限，建议区域经理提前筹备分流点',
            gisCoords: {
              x: 275,
              y: 375,
              lat: 33.298,
              lng: 44.345,
              radiusMeters: 750
            }
          },
          {
            id: 'FA-00142',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '萨米尔·卡米勒·巴格达迪',
            storeName: '哈德拉新村粮食代理服务点',
            isSelf: false,
            phone: '07708899114',
            province: '巴格达省',
            district: '卡尔赫区 (Al-Karkh)',
            streetName: '哈德拉街道 (Al-Khadraa)',
            address: '巴格达市卡尔赫区哈德拉绿化带社区中路22号',
            centerId: '101',
            centerName: '卡尔赫第一配给中心 (曼苏尔)',
            licenseNo: 'LIC-BAG-142-2023',
            storeAreaSqM: 45,
            householdsCount: 1500,
            maxHouseholdsLimit: 1500,
            saturationRate: 100.0,
            status: '网格饱和锁定',
            lockStatus: 'SATURATED_LOCKED',
            statusDescription: '已触发 1,500 户硬上限网格饱和锁定，禁止新户迁入，必须由区域经理分流设立新代理点',
            gisCoords: {
              x: 235,
              y: 245,
              lat: 33.328,
              lng: 44.331,
              radiusMeters: 850
            }
          }
        ]
      },
      {
        id: 'REG-AGT-02',
        level: 'DISTRICT',
        levelName: '区域代理 (区级调度)',
        name: '阿德南·巴希尔·侯赛因',
        title: '鲁萨法区区域代理经理',
        isSelf: false,
        phone: '07703322118',
        province: '巴格达省',
        district: '鲁萨法区 (Al-Rusafa)',
        centerBindingName: '鲁萨法中央配给站',
        centerId: '102',
        totalStreetStations: 2,
        totalHouseholdsServed: 1950,
        maxCapacitySum: 3000,
        overallSaturationRate: 65.0,
        gisDistrictPolygon: 'POLYGON_RUSAFA_SECTOR',
        children: [
          {
            id: 'FA-00201',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '宰因·阿比丁·穆赫辛',
            storeName: '卡拉达商业街便民代销点',
            isSelf: false,
            phone: '07704455667',
            province: '巴格达省',
            district: '鲁萨法区 (Al-Rusafa)',
            streetName: '卡拉达街道 (Al-Karrada)',
            address: '鲁萨法区卡拉达内街58号',
            centerId: '102',
            centerName: '鲁萨法中央配给站',
            licenseNo: 'LIC-BAG-201-2024',
            storeAreaSqM: 40,
            householdsCount: 950,
            maxHouseholdsLimit: 1500,
            saturationRate: 63.3,
            status: '正常营业',
            lockStatus: 'NORMAL',
            statusDescription: '网格负荷正常，运行平稳',
            gisCoords: {
              x: 485,
              y: 355,
              lat: 33.305,
              lng: 44.425,
              radiusMeters: 700
            }
          },
          {
            id: 'FA-00208',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '哈立德·瓦利德·贾西姆',
            storeName: '巴布谢赫清真寺外街保供站',
            isSelf: false,
            phone: '07709988776',
            province: '巴格达省',
            district: '鲁萨法区 (Al-Rusafa)',
            streetName: '巴布谢赫街道 (Bab Al-Sheikh)',
            address: '鲁萨法区巴布谢赫街巷19号',
            centerId: '102',
            centerName: '鲁萨法中央配给站',
            licenseNo: 'LIC-BAG-208-2024',
            storeAreaSqM: 35,
            householdsCount: 1000,
            maxHouseholdsLimit: 1500,
            saturationRate: 66.7,
            status: '正常营业',
            lockStatus: 'NORMAL',
            statusDescription: '网格负荷正常',
            gisCoords: {
              x: 445,
              y: 285,
              lat: 33.335,
              lng: 44.405,
              radiusMeters: 650
            }
          }
        ]
      },
      {
        id: 'REG-AGT-03',
        level: 'DISTRICT',
        levelName: '区域代理 (区级调度)',
        name: '哈桑·阿里·穆尔塔达',
        title: '萨德尔城区区域代理经理',
        isSelf: false,
        phone: '07707766554',
        province: '巴格达省',
        district: '萨德尔城区 (Sadr City)',
        centerBindingName: '萨德尔城中央配给中心',
        centerId: '108',
        totalStreetStations: 2,
        totalHouseholdsServed: 1600,
        maxCapacitySum: 3000,
        overallSaturationRate: 53.3,
        gisDistrictPolygon: 'POLYGON_SADR_SECTOR',
        children: [
          {
            id: 'FA-00305',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '穆斯塔法·卡西姆·纳吉',
            storeName: '萨德尔城第5区面粉直供服务站',
            isSelf: false,
            phone: '07701199228',
            province: '巴格达省',
            district: '萨德尔城区 (Sadr City)',
            streetName: '萨德尔第5区街道 (Sector 5)',
            address: '萨德尔城区中央大道第5区综合楼1号',
            centerId: '108',
            centerName: '萨德尔城中央配给中心',
            licenseNo: 'LIC-BAG-305-2024',
            storeAreaSqM: 36,
            householdsCount: 1220,
            maxHouseholdsLimit: 1500,
            saturationRate: 81.3,
            status: '正常营业',
            lockStatus: 'NORMAL',
            statusDescription: '网格平稳运营',
            gisCoords: {
              x: 565,
              y: 215,
              lat: 33.385,
              lng: 44.455,
              radiusMeters: 800
            }
          },
          {
            id: 'FA-00312',
            level: 'STREET',
            levelName: '街道代理 (终端门店)',
            name: '贾瓦德·卡齐姆·萨拉赫',
            storeName: '萨德尔城第12区便民综合站',
            isSelf: false,
            phone: '07702288337',
            province: '巴格达省',
            district: '萨德尔城区 (Sadr City)',
            streetName: '萨德尔第12区街道 (Sector 12)',
            address: '萨德尔城第12区集市东口',
            centerId: '108',
            centerName: '萨德尔城中央配给中心',
            licenseNo: 'LIC-BAG-312-2024',
            storeAreaSqM: 32,
            householdsCount: 380,
            maxHouseholdsLimit: 1500,
            saturationRate: 25.3,
            status: '正常营业',
            lockStatus: 'NORMAL',
            statusDescription: '新迁入发展网格',
            gisCoords: {
              x: 620,
              y: 175,
              lat: 33.41,
              lng: 44.485,
              radiusMeters: 750
            }
          }
        ]
      }
    ]
  }
];

/**
 * 街道代理挂靠的家庭明细数据池 (家庭列表)
 * 最底层街道代理挂靠不超过 1500 户
 */
export const MOCK_AGENT_FAMILIES_MAP = {
  // 1. 卡尔赫第一配给中心综合代销站 (FA-00128，当前网格 1,120 户)
  'FA-00128': [
    {
      rationCardNo: 'RC-10029381',
      familyCode: 'FAM-BAG-08832',
      headName: '艾哈迈德·哈桑·萨利赫',
      nationalId: '197582910481',
      phone: '07701234567',
      memberCount: 5,
      address: '巴格达市卡尔赫区曼苏尔街区14号',
      assignedDate: '2024-03-15',
      quotaFlourKg: 45,
      quotaRiceKg: 22.5,
      quotaOilL: 6.0,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029382',
      familyCode: 'FAM-BAG-08833',
      headName: '阿里·侯赛因·拉希姆',
      nationalId: '198210150992',
      phone: '07701234588',
      memberCount: 6,
      address: '巴格达市卡尔赫区曼苏尔商业街18号附3号',
      assignedDate: '2024-04-10',
      quotaFlourKg: 54,
      quotaRiceKg: 27.0,
      quotaOilL: 7.2,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029383',
      familyCode: 'FAM-BAG-08834',
      headName: '海德尔·穆尔塔达·贾西姆',
      nationalId: '197904221103',
      phone: '07701234599',
      memberCount: 4,
      address: '巴格达市卡尔赫区曼苏尔街区绿树巷2号',
      assignedDate: '2024-05-18',
      quotaFlourKg: 36,
      quotaRiceKg: 18.0,
      quotaOilL: 4.8,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029384',
      familyCode: 'FAM-BAG-08835',
      headName: '法蒂玛·扎赫拉·纳赛尔 (户主代表)',
      nationalId: '198607180024',
      phone: '07701234610',
      memberCount: 3,
      address: '巴格达市卡尔赫区曼苏尔中心花园北路9号',
      assignedDate: '2024-06-01',
      quotaFlourKg: 27,
      quotaRiceKg: 13.5,
      quotaOilL: 3.6,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029385',
      familyCode: 'FAM-BAG-08836',
      headName: '奥马尔·法鲁克·巴希尔',
      nationalId: '199103091155',
      phone: '07701234621',
      memberCount: 7,
      address: '巴格达市卡尔赫区曼苏尔商务外环11号',
      assignedDate: '2024-07-22',
      quotaFlourKg: 63,
      quotaRiceKg: 31.5,
      quotaOilL: 8.4,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029386',
      familyCode: 'FAM-BAG-08837',
      headName: '塔里克·阿齐兹·阿卜杜拉',
      nationalId: '197311200846',
      phone: '07701234632',
      memberCount: 5,
      address: '巴格达市卡尔赫区曼苏尔中段77号',
      assignedDate: '2024-08-05',
      quotaFlourKg: 45,
      quotaRiceKg: 22.5,
      quotaOilL: 6.0,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029387',
      familyCode: 'FAM-BAG-08838',
      headName: '穆斯塔法·卡迈勒·萨巴赫',
      nationalId: '198809140327',
      phone: '07701234643',
      memberCount: 4,
      address: '巴格达市卡尔赫区曼苏尔南苑3号楼',
      assignedDate: '2024-09-12',
      quotaFlourKg: 36,
      quotaRiceKg: 18.0,
      quotaOilL: 4.8,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10029388',
      familyCode: 'FAM-BAG-08839',
      headName: '努尔丁·贾瓦德·马吉德',
      nationalId: '198402280738',
      phone: '07701234654',
      memberCount: 6,
      address: '巴格达市卡尔赫区曼苏尔商业街西段5号',
      assignedDate: '2024-10-02',
      quotaFlourKg: 54,
      quotaRiceKg: 27.0,
      quotaOilL: 7.2,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    }
  ],

  // 2. 亚尔穆克第3街道便民配给站 (FA-00135，临界预警 1,480 户)
  'FA-00135': [
    {
      rationCardNo: 'RC-10041121',
      familyCode: 'FAM-BAG-12901',
      headName: '瓦利德·哈立德·阿尔-哈希米',
      nationalId: '197705120199',
      phone: '07703344111',
      memberCount: 5,
      address: '巴格达市亚尔穆克环岛6号',
      assignedDate: '2024-01-20',
      quotaFlourKg: 45,
      quotaRiceKg: 22.5,
      quotaOilL: 6.0,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10041122',
      familyCode: 'FAM-BAG-12902',
      headName: '巴西姆·阿卜杜勒·拉赫曼',
      nationalId: '198308190342',
      phone: '07703344112',
      memberCount: 6,
      address: '巴格达市亚尔穆克第3街坊12号',
      assignedDate: '2024-02-14',
      quotaFlourKg: 54,
      quotaRiceKg: 27.0,
      quotaOilL: 7.2,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    },
    {
      rationCardNo: 'RC-10041123',
      familyCode: 'FAM-BAG-12903',
      headName: '萨巴赫·努里·马赫迪',
      nationalId: '198011240561',
      phone: '07703344113',
      memberCount: 4,
      address: '巴格达市亚尔穆克商业中心附8号',
      assignedDate: '2024-09-28',
      quotaFlourKg: 36,
      quotaRiceKg: 18.0,
      quotaOilL: 4.8,
      cardStatus: '正常发放',
      complianceStatus: '临界新迁入'
    }
  ],

  // 3. 哈德拉新村粮食代理服务点 (FA-00142，网格饱和锁定 1,500 户)
  'FA-00142': [
    {
      rationCardNo: 'RC-10052201',
      familyCode: 'FAM-BAG-18801',
      headName: '卡里姆·萨迪克·贾巴尔',
      nationalId: '197609200481',
      phone: '07707788111',
      memberCount: 5,
      address: '哈德拉绿化带社区中路22号',
      assignedDate: '2023-11-10',
      quotaFlourKg: 45,
      quotaRiceKg: 22.5,
      quotaOilL: 6.0,
      cardStatus: '正常发放',
      complianceStatus: '饱和锁定保留户'
    },
    {
      rationCardNo: 'RC-10052202',
      familyCode: 'FAM-BAG-18802',
      headName: '拉希姆·阿卜杜拉·卡西姆',
      nationalId: '198104150923',
      phone: '07707788112',
      memberCount: 6,
      address: '哈德拉社区4号院',
      assignedDate: '2024-08-30',
      quotaFlourKg: 54,
      quotaRiceKg: 27.0,
      quotaOilL: 7.2,
      cardStatus: '正常发放',
      complianceStatus: '饱和锁定第1500户(终号)'
    }
  ],

  // 4. 卡拉达商业街便民代销点 (FA-00201，950 户)
  'FA-00201': [
    {
      rationCardNo: 'RC-10061101',
      familyCode: 'FAM-BAG-21001',
      headName: '萨阿德·穆罕默德·阿里',
      nationalId: '197903110941',
      phone: '07709911221',
      memberCount: 4,
      address: '鲁萨法区卡拉达内街58号',
      assignedDate: '2024-05-02',
      quotaFlourKg: 36,
      quotaRiceKg: 18.0,
      quotaOilL: 4.8,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    }
  ],

  // 5. 萨德尔城第5区面粉直供服务站 (FA-00305，1,220 户)
  'FA-00305': [
    {
      rationCardNo: 'RC-10073301',
      familyCode: 'FAM-BAG-30501',
      headName: '海德尔·阿巴斯·卡齐姆',
      nationalId: '198312010411',
      phone: '07704433221',
      memberCount: 7,
      address: '萨德尔城区中央大道第5区综合楼1号',
      assignedDate: '2024-04-12',
      quotaFlourKg: 63,
      quotaRiceKg: 31.5,
      quotaOilL: 8.4,
      cardStatus: '正常发放',
      complianceStatus: '合规在册'
    }
  ]
};
