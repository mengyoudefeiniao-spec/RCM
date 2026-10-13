export const MOCK_DASHBOARD_STATS = {
  totalFamilies: 9482150,
  activeCards: 9120400,
  monthlyDistributedTons: 384500,
  pendingReviewTickets: 18,
  todayApprovedOrders: 4290,
  fraudAlertsCount: 3,
  supplyFulfillmentRate: 99.4,
  recentDistributionTrend: [
    { month: '4月', amount: 372000 },
    { month: '5月', amount: 381000 },
    { month: '6月', amount: 389000 },
    { month: '7月', amount: 395000 },
    { month: '8月', amount: 384500 }
  ]
};

/**
 * 管理角色专属：涵盖 公民、家庭、各地区代理商、实际配给情况、投诉和处理 五大维度的统计与分析数据
 * 支持按本季度 (quarter)、近30天 (month)、近7天 (week) 动态切换
 */
export const MOCK_ADMIN_DASHBOARD_DATA = {
  quarter: {
    timeRange: 'quarter',
    timeLabel: '2026年第四季度',
    // 1. 公民统计
    citizens: {
      totalCitizens: 38420500,
      activeBeneficiaries: 36890000,
      biometricVerifiedRate: 97.8,
      newRegistered: 186400,
      vulnerableCount: 1280000, // 特困/孤寡/残障重点保障人数
      ageDistribution: [
        { name: '0-14岁未成年人', value: 12400000, percentage: 32.3 },
        { name: '15-59岁适龄劳动力', value: 23120500, percentage: 60.2 },
        { name: '60岁及以上长者', value: 2900000, percentage: 7.5 }
      ],
      growthTrend: {
        dates: ['第40周', '第41周', '第42周', '第43周', '第44周', '第45周', '第46周', '第47周'],
        newRegistered: [21500, 24200, 22800, 25100, 23400, 22900, 24100, 22400],
        biometricVerified: [142000, 168000, 155000, 172000, 163000, 159000, 178000, 182000]
      }
    },
    // 2. 家庭统计
    families: {
      totalFamilies: 9482150,
      avgFamilySize: 4.05,
      activeRate: 96.4,
      totalBusinessHandled: 78500, // 季度业务办理总量
      sizeDistribution: [
        { name: '1-2人小家庭', count: 1612000, percentage: 17.0 },
        { name: '3-4人标准家庭', count: 4551400, percentage: 48.0 },
        { name: '5-6大家庭', count: 2465350, percentage: 26.0 },
        { name: '7人及以上多代家庭', count: 853400, percentage: 9.0 }
      ],
      businessStats: [
        { type: '变更户主', applyCount: 18500, approvedCount: 17920 },
        { type: '申请解冻', applyCount: 14200, approvedCount: 13680 },
        { type: '申请分户', applyCount: 26400, approvedCount: 25100 },
        { type: '成员转移', applyCount: 19400, approvedCount: 18950 }
      ]
    },
    // 3. 各地区代理商统计
    agents: {
      totalAgents: 42150,
      complianceRate: 92.6,
      overloadedAgents: 128, // 超1500户网点
      penalizedAgents: 46, // 整顿中
      regionDistribution: [
        { province: '巴格达省', agentCount: 9800, avgHouseholds: 1180, complianceRate: 94.2 },
        { province: '尼尼微省', agentCount: 5200, avgHouseholds: 960, complianceRate: 91.5 },
        { province: '巴士拉省', agentCount: 4600, avgHouseholds: 1040, complianceRate: 93.8 },
        { province: '苏莱曼尼亚省', agentCount: 3800, avgHouseholds: 820, complianceRate: 96.0 },
        { province: '埃尔比勒省', agentCount: 3400, avgHouseholds: 850, complianceRate: 95.5 },
        { province: '迪亚拉省', agentCount: 2900, avgHouseholds: 920, complianceRate: 90.8 },
        { province: '基尔库克省', agentCount: 2800, avgHouseholds: 990, complianceRate: 89.5 },
        { province: '安巴尔省', agentCount: 2650, avgHouseholds: 890, complianceRate: 91.0 }
      ],
      regulatoryFlow: [
        { name: '新设授予代理权', count: 320 },
        { name: '代理权轮替继承', count: 215 },
        { name: '合并优化网点', count: 142 },
        { name: '清退注销网点', count: 78 },
        { name: '行政处罚整顿', count: 46 }
      ]
    },
    // 4. 实际配给情况
    distribution: {
      totalDistributedTons: 1153500, // 季度实际配发总量
      targetFulfillmentRate: 99.1,
      householdAdequacyRate: 99.4,
      onTimeDeliveryRate: 98.2,
      commodities: [
        { name: '小麦粉', plannedTon: 620000, actualTon: 615000, completionRate: 99.2 },
        { name: '大米', plannedTon: 260000, actualTon: 258000, completionRate: 99.2 },
        { name: '食用油', plannedTon: 95000, actualTon: 94200, completionRate: 99.1 },
        { name: '白糖', plannedTon: 68000, actualTon: 67100, completionRate: 98.7 },
        { name: '奶粉', plannedTon: 22000, actualTon: 21800, completionRate: 99.0 },
        { name: '食盐', plannedTon: 18000, actualTon: 17900, completionRate: 99.4 }
      ],
      provinceProgress: [
        { province: '巴格达省', distributedTon: 360000, targetTon: 362000, progress: 99.4 },
        { province: '巴士拉省', distributedTon: 185000, targetTon: 187000, progress: 98.9 },
        { province: '尼尼微省', distributedTon: 172000, targetTon: 175000, progress: 98.3 },
        { province: '苏莱曼尼亚省', distributedTon: 112000, targetTon: 113000, progress: 99.1 },
        { province: '埃尔比勒省', distributedTon: 104000, targetTon: 105000, progress: 99.0 },
        { province: '迪亚拉省', distributedTon: 82000, targetTon: 84000, progress: 97.6 },
        { province: '基尔库克省', distributedTon: 76500, targetTon: 78000, progress: 98.1 },
        { province: '安巴尔省', distributedTon: 62000, targetTon: 63500, progress: 97.6 }
      ]
    },
    // 5. 投诉和处理
    complaints: {
      totalComplaints: 3920,
      resolvedRate: 97.4,
      avgResolutionHours: 3.8,
      satisfactionRate: 96.2,
      categoryDistribution: [
        { name: '代销点缺斤短两/克扣', count: 1098, percentage: 28.0 },
        { name: '服务态度差/排队耗时', count: 941, percentage: 24.0 },
        { name: '物资品质口感异议', count: 706, percentage: 18.0 },
        { name: '私自加价/违规收费', count: 627, percentage: 16.0 },
        { name: '配给份额核定有误', count: 548, percentage: 14.0 }
      ],
      trend: {
        dates: ['第40周', '第41周', '第42周', '第43周', '第44周', '第45周', '第46周', '第47周'],
        received: [520, 480, 510, 495, 460, 475, 490, 490],
        resolved: [508, 472, 498, 482, 451, 465, 479, 481],
        avgHours: [4.2, 4.0, 3.9, 3.8, 3.7, 3.8, 3.6, 3.5]
      },
      recentComplaints: [
        { id: 'CMP-2026-1082', type: '违规收费', province: '巴格达省卡尔赫区', agent: '第14号食品供应站', applicant: '拉希德·马吉德', status: '已办结', result: '退还违规差价并责令通报批评', time: '2026-10-10' },
        { id: 'CMP-2026-1081', type: '少发漏发', province: '巴士拉省阿沙尔区', agent: '滨海第二代销点', applicant: '萨巴赫·卡西姆', status: '已办结', result: '经核实当日补发2公斤大米', time: '2026-10-09' },
        { id: 'CMP-2026-1079', type: '物资品质', province: '迪亚拉省哈奈根', agent: '哈奈根中心代销站', applicant: '穆罕默德·阿里', status: '处理中', result: '已抽样送质检实验室化验', time: '2026-10-11' },
        { id: 'CMP-2026-1075', type: '排队耗时', province: '尼尼微省摩苏尔', agent: '摩苏尔第三配发处', applicant: '法蒂玛·努尔', status: '已办结', result: '已协调增开2个扫码核销核发窗口', time: '2026-10-08' }
      ]
    }
  },
  month: {
    timeRange: 'month',
    timeLabel: '过去30天',
    citizens: {
      totalCitizens: 38420500,
      activeBeneficiaries: 36890000,
      biometricVerifiedRate: 98.1,
      newRegistered: 58200,
      vulnerableCount: 1280000,
      ageDistribution: [
        { name: '0-14岁未成年人', value: 12400000, percentage: 32.3 },
        { name: '15-59岁适龄劳动力', value: 23120500, percentage: 60.2 },
        { name: '60岁及以上长者', value: 2900000, percentage: 7.5 }
      ],
      growthTrend: {
        dates: ['09-13', '09-18', '09-23', '09-28', '10-03', '10-08', '10-12'],
        newRegistered: [8200, 9500, 8900, 10200, 9400, 8800, 9200],
        biometricVerified: [54000, 61000, 58000, 64000, 59000, 57000, 62000]
      }
    },
    families: {
      totalFamilies: 9482150,
      avgFamilySize: 4.05,
      activeRate: 96.7,
      totalBusinessHandled: 24180,
      sizeDistribution: [
        { name: '1-2人小家庭', count: 1612000, percentage: 17.0 },
        { name: '3-4人标准家庭', count: 4551400, percentage: 48.0 },
        { name: '5-6大家庭', count: 2465350, percentage: 26.0 },
        { name: '7人及以上多代家庭', count: 853400, percentage: 9.0 }
      ],
      businessStats: [
        { type: '变更户主', applyCount: 5600, approvedCount: 5480 },
        { type: '申请解冻', applyCount: 4300, approvedCount: 4190 },
        { type: '申请分户', applyCount: 8100, approvedCount: 7850 },
        { type: '成员转移', applyCount: 6180, approvedCount: 6050 }
      ]
    },
    agents: {
      totalAgents: 42150,
      complianceRate: 93.4,
      overloadedAgents: 112,
      penalizedAgents: 28,
      regionDistribution: [
        { province: '巴格达省', agentCount: 9800, avgHouseholds: 1180, complianceRate: 95.0 },
        { province: '尼尼微省', agentCount: 5200, avgHouseholds: 960, complianceRate: 92.4 },
        { province: '巴士拉省', agentCount: 4600, avgHouseholds: 1040, complianceRate: 94.6 },
        { province: '苏莱曼尼亚省', agentCount: 3800, avgHouseholds: 820, complianceRate: 96.8 },
        { province: '埃尔比勒省', agentCount: 3400, avgHouseholds: 850, complianceRate: 96.1 },
        { province: '迪亚拉省', agentCount: 2900, avgHouseholds: 920, complianceRate: 91.5 },
        { province: '基尔库克省', agentCount: 2800, avgHouseholds: 990, complianceRate: 90.2 },
        { province: '安巴尔省', agentCount: 2650, avgHouseholds: 890, complianceRate: 92.0 }
      ],
      regulatoryFlow: [
        { name: '新设授予代理权', count: 95 },
        { name: '代理权轮替继承', count: 68 },
        { name: '合并优化网点', count: 44 },
        { name: '清退注销网点', count: 24 },
        { name: '行政处罚整顿', count: 18 }
      ]
    },
    distribution: {
      totalDistributedTons: 384500,
      targetFulfillmentRate: 99.4,
      householdAdequacyRate: 99.6,
      onTimeDeliveryRate: 98.7,
      commodities: [
        { name: '小麦粉', plannedTon: 206000, actualTon: 205000, completionRate: 99.5 },
        { name: '大米', plannedTon: 86500, actualTon: 86000, completionRate: 99.4 },
        { name: '食用油', plannedTon: 31600, actualTon: 31400, completionRate: 99.4 },
        { name: '白糖', plannedTon: 22600, actualTon: 22400, completionRate: 99.1 },
        { name: '奶粉', plannedTon: 7300, actualTon: 7250, completionRate: 99.3 },
        { name: '食盐', plannedTon: 6000, actualTon: 5980, completionRate: 99.7 }
      ],
      provinceProgress: [
        { province: '巴格达省', distributedTon: 120000, targetTon: 120500, progress: 99.6 },
        { province: '巴士拉省', distributedTon: 61600, targetTon: 62000, progress: 99.4 },
        { province: '尼尼微省', distributedTon: 57400, targetTon: 58000, progress: 99.0 },
        { province: '苏莱曼尼亚省', distributedTon: 37400, targetTon: 37600, progress: 99.5 },
        { province: '埃尔比勒省', distributedTon: 34600, targetTon: 34800, progress: 99.4 },
        { province: '迪亚拉省', distributedTon: 27300, targetTon: 27800, progress: 98.2 },
        { province: '基尔库克省', distributedTon: 25500, targetTon: 25900, progress: 98.5 },
        { province: '安巴尔省', distributedTon: 20700, targetTon: 21100, progress: 98.1 }
      ]
    },
    complaints: {
      totalComplaints: 1284,
      resolvedRate: 98.2,
      avgResolutionHours: 3.2,
      satisfactionRate: 96.8,
      categoryDistribution: [
        { name: '代销点缺斤短两/克扣', count: 359, percentage: 28.0 },
        { name: '服务态度差/排队耗时', count: 308, percentage: 24.0 },
        { name: '物资品质口感异议', count: 231, percentage: 18.0 },
        { name: '私自加价/违规收费', count: 205, percentage: 16.0 },
        { name: '配给份额核定有误', count: 181, percentage: 14.0 }
      ],
      trend: {
        dates: ['09-13', '09-18', '09-23', '09-28', '10-03', '10-08', '10-12'],
        received: [178, 192, 185, 201, 179, 184, 165],
        resolved: [175, 189, 182, 198, 177, 181, 163],
        avgHours: [3.6, 3.4, 3.3, 3.2, 3.1, 3.0, 2.9]
      },
      recentComplaints: [
        { id: 'CMP-2026-1082', type: '违规收费', province: '巴格达省卡尔赫区', agent: '第14号食品供应站', applicant: '拉希德·马吉德', status: '已办结', result: '退还违规差价并责令通报批评', time: '2026-10-10' },
        { id: 'CMP-2026-1081', type: '少发漏发', province: '巴士拉省阿沙尔区', agent: '滨海第二代销点', applicant: '萨巴赫·卡西姆', status: '已办结', result: '经核实当日补发2公斤大米', time: '2026-10-09' },
        { id: 'CMP-2026-1079', type: '物资品质', province: '迪亚拉省哈奈根', agent: '哈奈根中心代销站', applicant: '穆罕默德·阿里', status: '处理中', result: '已抽样送质检实验室化验', time: '2026-10-11' },
        { id: 'CMP-2026-1075', type: '排队耗时', province: '尼尼微省摩苏尔', agent: '摩苏尔第三配发处', applicant: '法蒂玛·努尔', status: '已办结', result: '已协调增开2个扫码核销核发窗口', time: '2026-10-08' }
      ]
    }
  },
  week: {
    timeRange: 'week',
    timeLabel: '过去7天',
    citizens: {
      totalCitizens: 38420500,
      activeBeneficiaries: 36890000,
      biometricVerifiedRate: 98.4,
      newRegistered: 12400,
      vulnerableCount: 1280000,
      ageDistribution: [
        { name: '0-14岁未成年人', value: 12400000, percentage: 32.3 },
        { name: '15-59岁适龄劳动力', value: 23120500, percentage: 60.2 },
        { name: '60岁及以上长者', value: 2900000, percentage: 7.5 }
      ],
      growthTrend: {
        dates: ['10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12'],
        newRegistered: [1750, 1820, 1690, 1910, 1840, 1680, 1710],
        biometricVerified: [11500, 12200, 11800, 12600, 12100, 10900, 11200]
      }
    },
    families: {
      totalFamilies: 9482150,
      avgFamilySize: 4.05,
      activeRate: 96.9,
      totalBusinessHandled: 5620,
      sizeDistribution: [
        { name: '1-2人小家庭', count: 1612000, percentage: 17.0 },
        { name: '3-4人标准家庭', count: 4551400, percentage: 48.0 },
        { name: '5-6大家庭', count: 2465350, percentage: 26.0 },
        { name: '7人及以上多代家庭', count: 853400, percentage: 9.0 }
      ],
      businessStats: [
        { type: '变更户主', applyCount: 1320, approvedCount: 1290 },
        { type: '申请解冻', applyCount: 980, approvedCount: 960 },
        { type: '申请分户', applyCount: 1890, approvedCount: 1840 },
        { type: '成员转移', applyCount: 1430, approvedCount: 1400 }
      ]
    },
    agents: {
      totalAgents: 42150,
      complianceRate: 94.2,
      overloadedAgents: 96,
      penalizedAgents: 14,
      regionDistribution: [
        { province: '巴格达省', agentCount: 9800, avgHouseholds: 1180, complianceRate: 95.8 },
        { province: '尼尼微省', agentCount: 5200, avgHouseholds: 960, complianceRate: 93.2 },
        { province: '巴士拉省', agentCount: 4600, avgHouseholds: 1040, complianceRate: 95.2 },
        { province: '苏莱曼尼亚省', agentCount: 3800, avgHouseholds: 820, complianceRate: 97.2 },
        { province: '埃尔比勒省', agentCount: 3400, avgHouseholds: 850, complianceRate: 96.8 },
        { province: '迪亚拉省', agentCount: 2900, avgHouseholds: 920, complianceRate: 92.4 },
        { province: '基尔库克省', agentCount: 2800, avgHouseholds: 990, complianceRate: 91.2 },
        { province: '安巴尔省', agentCount: 2650, avgHouseholds: 890, complianceRate: 93.0 }
      ],
      regulatoryFlow: [
        { name: '新设授予代理权', count: 22 },
        { name: '代理权轮替继承', count: 16 },
        { name: '合并优化网点', count: 9 },
        { name: '清退注销网点', count: 5 },
        { name: '行政处罚整顿', count: 4 }
      ]
    },
    distribution: {
      totalDistributedTons: 89600,
      targetFulfillmentRate: 99.7,
      householdAdequacyRate: 99.8,
      onTimeDeliveryRate: 99.1,
      commodities: [
        { name: '小麦粉', plannedTon: 48200, actualTon: 48100, completionRate: 99.8 },
        { name: '大米', plannedTon: 20200, actualTon: 20150, completionRate: 99.7 },
        { name: '食用油', plannedTon: 7400, actualTon: 7380, completionRate: 99.7 },
        { name: '白糖', plannedTon: 5300, actualTon: 5280, completionRate: 99.6 },
        { name: '奶粉', plannedTon: 1720, actualTon: 1715, completionRate: 99.7 },
        { name: '食盐', plannedTon: 1400, actualTon: 1398, completionRate: 99.9 }
      ],
      provinceProgress: [
        { province: '巴格达省', distributedTon: 28100, targetTon: 28150, progress: 99.8 },
        { province: '巴士拉省', distributedTon: 14400, targetTon: 14450, progress: 99.6 },
        { province: '尼尼微省', distributedTon: 13400, targetTon: 13500, progress: 99.3 },
        { province: '苏莱曼尼亚省', distributedTon: 8750, targetTon: 8780, progress: 99.7 },
        { province: '埃尔比勒省', distributedTon: 8100, targetTon: 8120, progress: 99.7 },
        { province: '迪亚拉省', distributedTon: 6400, targetTon: 6480, progress: 98.8 },
        { province: '基尔库克省', distributedTon: 5950, targetTon: 6020, progress: 98.8 },
        { province: '安巴尔省', distributedTon: 4500, targetTon: 4550, progress: 98.9 }
      ]
    },
    complaints: {
      totalComplaints: 286,
      resolvedRate: 98.9,
      avgResolutionHours: 2.6,
      satisfactionRate: 97.4,
      categoryDistribution: [
        { name: '代销点缺斤短两/克扣', count: 80, percentage: 28.0 },
        { name: '服务态度差/排队耗时', count: 69, percentage: 24.0 },
        { name: '物资品质口感异议', count: 51, percentage: 18.0 },
        { name: '私自加价/违规收费', count: 46, percentage: 16.0 },
        { name: '配给份额核定有误', count: 40, percentage: 14.0 }
      ],
      trend: {
        dates: ['10-06', '10-07', '10-08', '10-09', '10-10', '10-11', '10-12'],
        received: [42, 39, 45, 41, 38, 40, 41],
        resolved: [42, 38, 45, 41, 38, 39, 40],
        avgHours: [2.8, 2.7, 2.6, 2.6, 2.5, 2.5, 2.4]
      },
      recentComplaints: [
        { id: 'CMP-2026-1082', type: '违规收费', province: '巴格达省卡尔赫区', agent: '第14号食品供应站', applicant: '拉希德·马吉德', status: '已办结', result: '退还违规差价并责令通报批评', time: '2026-10-10' },
        { id: 'CMP-2026-1081', type: '少发漏发', province: '巴士拉省阿沙尔区', agent: '滨海第二代销点', applicant: '萨巴赫·卡西姆', status: '已办结', result: '经核实当日补发2公斤大米', time: '2026-10-09' },
        { id: 'CMP-2026-1079', type: '物资品质', province: '迪亚拉省哈奈根', agent: '哈奈根中心代销站', applicant: '穆罕默德·阿里', status: '处理中', result: '已抽样送质检实验室化验', time: '2026-10-11' },
        { id: 'CMP-2026-1075', type: '排队耗时', province: '尼尼微省摩苏尔', agent: '摩苏尔第三配发处', applicant: '法蒂玛·努尔', status: '已办结', result: '已协调增开2个扫码核销核发窗口', time: '2026-10-08' }
      ]
    }
  },
  day: {
    timeRange: 'day',
    timeLabel: '近1天 (今日实时)',
    citizens: {
      totalCitizens: 38420500,
      activeBeneficiaries: 36890000,
      biometricVerifiedRate: 98.6,
      newRegistered: 1850,
      vulnerableCount: 1280000,
      ageDistribution: [
        { name: '0-14岁未成年人', value: 12400000, percentage: 32.3 },
        { name: '15-59岁适龄劳动力', value: 23120500, percentage: 60.2 },
        { name: '60岁及以上长者', value: 2900000, percentage: 7.5 }
      ],
      growthTrend: {
        dates: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        newRegistered: [210, 340, 290, 310, 280, 230, 190],
        biometricVerified: [1420, 2180, 1950, 2060, 1890, 1540, 1260]
      }
    },
    families: {
      totalFamilies: 9482150,
      avgFamilySize: 4.05,
      activeRate: 97.1,
      totalBusinessHandled: 820,
      sizeDistribution: [
        { name: '1-2人小家庭', count: 1612000, percentage: 17.0 },
        { name: '3-4人标准家庭', count: 4551400, percentage: 48.0 },
        { name: '5-6大家庭', count: 2465350, percentage: 26.0 },
        { name: '7人及以上多代家庭', count: 853400, percentage: 9.0 }
      ],
      businessStats: [
        { type: '变更户主', applyCount: 195, approvedCount: 190 },
        { type: '申请解冻', applyCount: 142, approvedCount: 140 },
        { type: '申请分户', applyCount: 278, approvedCount: 270 },
        { type: '成员转移', applyCount: 205, approvedCount: 200 }
      ]
    },
    agents: {
      totalAgents: 42150,
      complianceRate: 95.8,
      overloadedAgents: 64,
      penalizedAgents: 8,
      regionDistribution: [
        { province: '巴格达省', agentCount: 9800, avgHouseholds: 1180, complianceRate: 96.5 },
        { province: '尼尼微省', agentCount: 5200, avgHouseholds: 960, complianceRate: 94.8 },
        { province: '巴士拉省', agentCount: 4600, avgHouseholds: 1040, complianceRate: 96.0 },
        { province: '苏莱曼尼亚省', agentCount: 3800, avgHouseholds: 820, complianceRate: 98.0 },
        { province: '埃尔比勒省', agentCount: 3400, avgHouseholds: 850, complianceRate: 97.5 },
        { province: '迪亚拉省', agentCount: 2900, avgHouseholds: 920, complianceRate: 93.6 },
        { province: '基尔库克省', agentCount: 2800, avgHouseholds: 990, complianceRate: 92.4 },
        { province: '安巴尔省', agentCount: 2650, avgHouseholds: 890, complianceRate: 94.2 }
      ],
      regulatoryFlow: [
        { name: '新设授予代理权', count: 4 },
        { name: '代理权轮替继承', count: 3 },
        { name: '合并优化网点', count: 2 },
        { name: '清退注销网点', count: 1 },
        { name: '行政处罚整顿', count: 1 }
      ]
    },
    distribution: {
      totalDistributedTons: 12850,
      targetFulfillmentRate: 99.8,
      householdAdequacyRate: 99.9,
      onTimeDeliveryRate: 99.4,
      commodities: [
        { name: '小麦粉', plannedTon: 6900, actualTon: 6890, completionRate: 99.9 },
        { name: '大米', plannedTon: 2900, actualTon: 2895, completionRate: 99.8 },
        { name: '食用油', plannedTon: 1060, actualTon: 1058, completionRate: 99.8 },
        { name: '白糖', plannedTon: 760, actualTon: 758, completionRate: 99.7 },
        { name: '奶粉', plannedTon: 245, actualTon: 244, completionRate: 99.6 },
        { name: '食盐', plannedTon: 200, actualTon: 200, completionRate: 100.0 }
      ],
      provinceProgress: [
        { province: '巴格达省', distributedTon: 4050, targetTon: 4060, progress: 99.8 },
        { province: '巴士拉省', distributedTon: 2070, targetTon: 2075, progress: 99.8 },
        { province: '尼尼微省', distributedTon: 1920, targetTon: 1930, progress: 99.5 },
        { province: '苏莱曼尼亚省', distributedTon: 1250, targetTon: 1255, progress: 99.6 },
        { province: '埃尔比勒省', distributedTon: 1160, targetTon: 1165, progress: 99.6 },
        { province: '迪亚拉省', distributedTon: 920, targetTon: 928, progress: 99.1 },
        { province: '基尔库克省', distributedTon: 855, targetTon: 862, progress: 99.2 },
        { province: '安巴尔省', distributedTon: 625, targetTon: 630, progress: 99.2 }
      ]
    },
    complaints: {
      totalComplaints: 41,
      resolvedRate: 99.2,
      avgResolutionHours: 1.8,
      satisfactionRate: 98.1,
      categoryDistribution: [
        { name: '代销点缺斤短两/克扣', count: 12, percentage: 29.3 },
        { name: '服务态度差/排队耗时', count: 10, percentage: 24.4 },
        { name: '物资品质口感异议', count: 8, percentage: 19.5 },
        { name: '私自加价/违规收费', count: 6, percentage: 14.6 },
        { name: '配给份额核定有误', count: 5, percentage: 12.2 }
      ],
      trend: {
        dates: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        received: [6, 8, 7, 6, 5, 5, 4],
        resolved: [6, 8, 7, 6, 5, 5, 4],
        avgHours: [2.0, 1.9, 1.8, 1.8, 1.7, 1.6, 1.5]
      },
      recentComplaints: [
        { id: 'CMP-2026-1082', type: '违规收费', province: '巴格达省卡尔赫区', agent: '第14号食品供应站', applicant: '拉希德·马吉德', status: '已办结', result: '退还违规差价并责令通报批评', time: '2026-10-12' },
        { id: 'CMP-2026-1081', type: '少发漏发', province: '巴士拉省阿沙尔区', agent: '滨海第二代销点', applicant: '萨巴赫·卡西姆', status: '已办结', result: '经核实当日补发2公斤大米', time: '2026-10-12' }
      ]
    }
  }
};

/**
 * 配给代理专属：保持原有保供与供应链全景大盘数据，增加按时间周期 (quarter/month/week/day) 过滤的数据集
 */
export const MOCK_AGENT_DASHBOARD_DATA = {
  quarter: {
    kpi: {
      outboundRate: 80.0,
      receivedRate: 64.0,
      claimedRate: 50.0,
      availableStock: 378000,
      lockedStock: 25920,
      frozenStock: 400,
      complianceRate: 99.8,
      blockedCount: 1,
      matchRate: 99.88,
      lossRate: 0.48
    },
    inventoryStats: {
      totalInbound: 38200,
      plannedInbound: 45000,
      inboundRate: 84.9,
      totalOutbound: 30560,
      plannedOutbound: 36000,
      outboundDispatchRate: 84.9,
      endingStock: 7640,
      stockHealthRate: 92,
      turnoverDays: 22,
      stockChangeRate: 4.8
    },
    fulfillmentReports: [
      { province: '巴格达省', totalAllocatedTon: 15000, outboundTon: 12000, receivedTon: 9600, claimedTon: 7500, fulfillmentRate: 80.0 },
      { province: '尼尼微省', totalAllocatedTon: 8500, outboundTon: 6800, receivedTon: 5440, claimedTon: 4250, fulfillmentRate: 80.0 },
      { province: '巴士拉省', totalAllocatedTon: 9200, outboundTon: 7500, receivedTon: 6000, claimedTon: 4600, fulfillmentRate: 81.5 },
      { province: '迪亚拉省', totalAllocatedTon: 4800, outboundTon: 3900, receivedTon: 3120, claimedTon: 2400, fulfillmentRate: 81.25 },
      { province: '基尔库克省', totalAllocatedTon: 6000, outboundTon: 4800, receivedTon: 3840, claimedTon: 3000, fulfillmentRate: 80.0 },
      { province: '安巴尔省', totalAllocatedTon: 5200, outboundTon: 4100, receivedTon: 3280, claimedTon: 2600, fulfillmentRate: 78.8 }
    ],
    throughputDays: 30
  },
  month: {
    kpi: {
      outboundRate: 72.5,
      receivedRate: 58.2,
      claimedRate: 46.0,
      availableStock: 385200,
      lockedStock: 21400,
      frozenStock: 300,
      complianceRate: 99.9,
      blockedCount: 0,
      matchRate: 99.92,
      lossRate: 0.42
    },
    inventoryStats: {
      totalInbound: 12580,
      plannedInbound: 15000,
      inboundRate: 83.9,
      totalOutbound: 9870,
      plannedOutbound: 12000,
      outboundDispatchRate: 82.3,
      endingStock: 2710,
      stockHealthRate: 88,
      turnoverDays: 18,
      stockChangeRate: -3.2
    },
    fulfillmentReports: [
      { province: '巴格达省', totalAllocatedTon: 5000, outboundTon: 3625, receivedTon: 2910, claimedTon: 2300, fulfillmentRate: 72.5 },
      { province: '尼尼微省', totalAllocatedTon: 2800, outboundTon: 2030, receivedTon: 1624, claimedTon: 1280, fulfillmentRate: 72.5 },
      { province: '巴士拉省', totalAllocatedTon: 3100, outboundTon: 2260, receivedTon: 1810, claimedTon: 1430, fulfillmentRate: 72.9 },
      { province: '迪亚拉省', totalAllocatedTon: 1600, outboundTon: 1160, receivedTon: 930, claimedTon: 735, fulfillmentRate: 72.5 },
      { province: '基尔库克省', totalAllocatedTon: 2000, outboundTon: 1450, receivedTon: 1160, claimedTon: 920, fulfillmentRate: 72.5 },
      { province: '安巴尔省', totalAllocatedTon: 1750, outboundTon: 1260, receivedTon: 1010, claimedTon: 800, fulfillmentRate: 72.0 }
    ],
    throughputDays: 30
  },
  week: {
    kpi: {
      outboundRate: 88.2,
      receivedRate: 76.5,
      claimedRate: 64.2,
      availableStock: 391500,
      lockedStock: 16200,
      frozenStock: 100,
      complianceRate: 100.0,
      blockedCount: 0,
      matchRate: 99.95,
      lossRate: 0.38
    },
    inventoryStats: {
      totalInbound: 3120,
      plannedInbound: 3500,
      inboundRate: 89.1,
      totalOutbound: 2750,
      plannedOutbound: 3000,
      outboundDispatchRate: 91.7,
      endingStock: 370,
      stockHealthRate: 95,
      turnoverDays: 6,
      stockChangeRate: 5.6
    },
    fulfillmentReports: [
      { province: '巴格达省', totalAllocatedTon: 1200, outboundTon: 1058, receivedTon: 918, claimedTon: 770, fulfillmentRate: 88.2 },
      { province: '尼尼微省', totalAllocatedTon: 680, outboundTon: 600, receivedTon: 520, claimedTon: 436, fulfillmentRate: 88.2 },
      { province: '巴士拉省', totalAllocatedTon: 750, outboundTon: 665, receivedTon: 578, claimedTon: 485, fulfillmentRate: 88.7 },
      { province: '迪亚拉省', totalAllocatedTon: 380, outboundTon: 335, receivedTon: 291, claimedTon: 244, fulfillmentRate: 88.2 },
      { province: '基尔库克省', totalAllocatedTon: 480, outboundTon: 423, receivedTon: 367, claimedTon: 308, fulfillmentRate: 88.1 },
      { province: '安巴尔省', totalAllocatedTon: 420, outboundTon: 370, receivedTon: 321, claimedTon: 270, fulfillmentRate: 88.1 }
    ],
    throughputDays: 7
  },
  day: {
    kpi: {
      outboundRate: 94.6,
      receivedRate: 85.0,
      claimedRate: 72.8,
      availableStock: 394800,
      lockedStock: 12500,
      frozenStock: 0,
      complianceRate: 100.0,
      blockedCount: 0,
      matchRate: 99.98,
      lossRate: 0.22
    },
    inventoryStats: {
      totalInbound: 485,
      plannedInbound: 500,
      inboundRate: 97.0,
      totalOutbound: 458,
      plannedOutbound: 470,
      outboundDispatchRate: 97.4,
      endingStock: 127,
      stockHealthRate: 98,
      turnoverDays: 1,
      stockChangeRate: 1.2
    },
    fulfillmentReports: [
      { province: '巴格达省', totalAllocatedTon: 180, outboundTon: 172, receivedTon: 155, claimedTon: 132, fulfillmentRate: 95.5 },
      { province: '尼尼微省', totalAllocatedTon: 105, outboundTon: 99, receivedTon: 89, claimedTon: 76, fulfillmentRate: 94.3 },
      { province: '巴士拉省', totalAllocatedTon: 115, outboundTon: 110, receivedTon: 98, claimedTon: 84, fulfillmentRate: 95.6 },
      { province: '迪亚拉省', totalAllocatedTon: 58, outboundTon: 54, receivedTon: 48, claimedTon: 41, fulfillmentRate: 93.1 },
      { province: '基尔库克省', totalAllocatedTon: 72, outboundTon: 68, receivedTon: 61, claimedTon: 52, fulfillmentRate: 94.4 },
      { province: '安巴尔省', totalAllocatedTon: 65, outboundTon: 61, receivedTon: 55, claimedTon: 47, fulfillmentRate: 93.8 }
    ],
    throughputDays: 1
  }
};
