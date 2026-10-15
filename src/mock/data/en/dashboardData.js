export const MOCK_DASHBOARD_STATS = {
  "totalFamilies": 9482150,
  "activeCards": 9120400,
  "monthlyDistributedTons": 384500,
  "pendingReviewTickets": 18,
  "todayApprovedOrders": 4290,
  "fraudAlertsCount": 3,
  "supplyFulfillmentRate": 99.4,
  "recentDistributionTrend": [
    {
      "month": "Apr",
      "amount": 372000
    },
    {
      "month": "May",
      "amount": 381000
    },
    {
      "month": "Jun",
      "amount": 389000
    },
    {
      "month": "Jul",
      "amount": 395000
    },
    {
      "month": "Aug",
      "amount": 384500
    }
  ]
};

export const MOCK_ADMIN_DASHBOARD_DATA = {
  "quarter": {
    "timeRange": "quarter",
    "timeLabel": "Q4 2026",
    "citizens": {
      "totalCitizens": 38420500,
      "activeBeneficiaries": 36890000,
      "biometricVerifiedRate": 97.8,
      "newRegistered": 186400,
      "vulnerableCount": 1280000,
      "ageDistribution": [
        {
          "name": "Minors Aged 0-14",
          "value": 12400000,
          "percentage": 32.3
        },
        {
          "name": "Working-Age Population Aged 15-59",
          "value": 23120500,
          "percentage": 60.2
        },
        {
          "name": "Seniors Aged 60+",
          "value": 2900000,
          "percentage": 7.5
        }
      ],
      "growthTrend": {
        "dates": [
          "Week 40",
          "Week 41",
          "Week 42",
          "Week 43",
          "Week 44",
          "Week 45",
          "Week 46",
          "Week 47"
        ],
        "newRegistered": [
          21500,
          24200,
          22800,
          25100,
          23400,
          22900,
          24100,
          22400
        ],
        "biometricVerified": [
          142000,
          168000,
          155000,
          172000,
          163000,
          159000,
          178000,
          182000
        ]
      }
    },
    "families": {
      "totalFamilies": 9482150,
      "avgFamilySize": 4.05,
      "activeRate": 96.4,
      "totalBusinessHandled": 78500,
      "sizeDistribution": [
        {
          "name": "Small Family (1-2 Members)",
          "count": 1612000,
          "percentage": 17
        },
        {
          "name": "Standard Family (3-4 Members)",
          "count": 4551400,
          "percentage": 48
        },
        {
          "name": "Large Family (5-6 Members)",
          "count": 2465350,
          "percentage": 26
        },
        {
          "name": "Multi-Generational Family (7+ Members)",
          "count": 853400,
          "percentage": 9
        }
      ],
      "businessStats": [
        {
          "type": "Change Head",
          "applyCount": 18500,
          "approvedCount": 17920
        },
        {
          "type": "Unfreeze Card",
          "applyCount": 14200,
          "approvedCount": 13680
        },
        {
          "type": "Split Household",
          "applyCount": 26400,
          "approvedCount": 25100
        },
        {
          "type": "Member Entry",
          "applyCount": 19400,
          "approvedCount": 18950
        }
      ]
    },
    "agents": {
      "totalAgents": 42150,
      "complianceRate": 92.6,
      "overloadedAgents": 128,
      "penalizedAgents": 46,
      "regionDistribution": [
        {
          "province": "Baghdad Province",
          "agentCount": 9800,
          "avgHouseholds": 1180,
          "complianceRate": 94.2
        },
        {
          "province": "Nineveh Province",
          "agentCount": 5200,
          "avgHouseholds": 960,
          "complianceRate": 91.5
        },
        {
          "province": "Basra Province",
          "agentCount": 4600,
          "avgHouseholds": 1040,
          "complianceRate": 93.8
        },
        {
          "province": "Sulaymaniyah Province",
          "agentCount": 3800,
          "avgHouseholds": 820,
          "complianceRate": 96
        },
        {
          "province": "Erbil Province",
          "agentCount": 3400,
          "avgHouseholds": 850,
          "complianceRate": 95.5
        },
        {
          "province": "Diyala Province",
          "agentCount": 2900,
          "avgHouseholds": 920,
          "complianceRate": 90.8
        },
        {
          "province": "Kirkuk Province",
          "agentCount": 2800,
          "avgHouseholds": 990,
          "complianceRate": 89.5
        },
        {
          "province": "Anbar Province",
          "agentCount": 2650,
          "avgHouseholds": 890,
          "complianceRate": 91
        }
      ],
      "regulatoryFlow": [
        {
          "name": "New Agency Grant",
          "count": 320
        },
        {
          "name": "Agency Rotation Succession",
          "count": 215
        },
        {
          "name": "Station Merger & Optimization",
          "count": 142
        },
        {
          "name": "Station Deregistration & Clearance",
          "count": 78
        },
        {
          "name": "Administrative Punishment Rectification",
          "count": 46
        }
      ]
    },
    "distribution": {
      "totalDistributedTons": 1153500,
      "targetFulfillmentRate": 99.1,
      "householdAdequacyRate": 99.4,
      "onTimeDeliveryRate": 98.2,
      "commodities": [
        {
          "name": "Wheat Flour",
          "plannedTon": 620000,
          "actualTon": 615000,
          "completionRate": 99.2
        },
        {
          "name": "Rice",
          "plannedTon": 260000,
          "actualTon": 258000,
          "completionRate": 99.2
        },
        {
          "name": "Cooking Oil",
          "plannedTon": 95000,
          "actualTon": 94200,
          "completionRate": 99.1
        },
        {
          "name": "Sugar",
          "plannedTon": 68000,
          "actualTon": 67100,
          "completionRate": 98.7
        },
        {
          "name": "Milk Powder",
          "plannedTon": 22000,
          "actualTon": 21800,
          "completionRate": 99
        },
        {
          "name": "Salt",
          "plannedTon": 18000,
          "actualTon": 17900,
          "completionRate": 99.4
        }
      ],
      "provinceProgress": [
        {
          "province": "Baghdad Province",
          "distributedTon": 360000,
          "targetTon": 362000,
          "progress": 99.4
        },
        {
          "province": "Basra Province",
          "distributedTon": 185000,
          "targetTon": 187000,
          "progress": 98.9
        },
        {
          "province": "Nineveh Province",
          "distributedTon": 172000,
          "targetTon": 175000,
          "progress": 98.3
        },
        {
          "province": "Sulaymaniyah Province",
          "distributedTon": 112000,
          "targetTon": 113000,
          "progress": 99.1
        },
        {
          "province": "Erbil Province",
          "distributedTon": 104000,
          "targetTon": 105000,
          "progress": 99
        },
        {
          "province": "Diyala Province",
          "distributedTon": 82000,
          "targetTon": 84000,
          "progress": 97.6
        },
        {
          "province": "Kirkuk Province",
          "distributedTon": 76500,
          "targetTon": 78000,
          "progress": 98.1
        },
        {
          "province": "Anbar Province",
          "distributedTon": 62000,
          "targetTon": 63500,
          "progress": 97.6
        }
      ]
    },
    "complaints": {
      "totalComplaints": 3920,
      "resolvedRate": 97.4,
      "avgResolutionHours": 3.8,
      "satisfactionRate": 96.2,
      "categoryDistribution": [
        {
          "name": "Station Short-Weighing / Under-Portioning",
          "count": 1098,
          "percentage": 28
        },
        {
          "name": "Poor Service Attitude / Long Queue Time",
          "count": 941,
          "percentage": 24
        },
        {
          "name": "Material Quality & Taste Objection",
          "count": 706,
          "percentage": 18
        },
        {
          "name": "Unauthorized Overcharge / Illegal Fees",
          "count": 627,
          "percentage": 16
        },
        {
          "name": "Ration Quota Assessment Error",
          "count": 548,
          "percentage": 14
        }
      ],
      "trend": {
        "dates": [
          "Week 40",
          "Week 41",
          "Week 42",
          "Week 43",
          "Week 44",
          "Week 45",
          "Week 46",
          "Week 47"
        ],
        "received": [
          520,
          480,
          510,
          495,
          460,
          475,
          490,
          490
        ],
        "resolved": [
          508,
          472,
          498,
          482,
          451,
          465,
          479,
          481
        ],
        "avgHours": [
          4.2,
          4,
          3.9,
          3.8,
          3.7,
          3.8,
          3.6,
          3.5
        ]
      },
      "recentComplaints": [
        {
          "id": "CMP-2026-1082",
          "type": "Illegal Fees",
          "province": "Al-Karkh District, Baghdad Province",
          "agent": "No.14 Food Supply Station",
          "applicant": "Rasheed Majid",
          "status": "Resolved",
          "result": "Illegal overcharge refunded with circulated criticism order",
          "time": "2026-10-10"
        },
        {
          "id": "CMP-2026-1081",
          "type": "Under-Delivery",
          "province": "Al-Ashar District, Basra Province",
          "agent": "Coastal 2nd Distribution Station",
          "applicant": "Sabah Qasim",
          "status": "Resolved",
          "result": "Verified and 2 KG of Rice re-issued the same day",
          "time": "2026-10-09"
        },
        {
          "id": "CMP-2026-1079",
          "type": "Material Quality",
          "province": "Khanaqin, Diyala Province",
          "agent": "Khanaqin Central Distribution Station",
          "applicant": "Mohammed Ali",
          "status": "Processing",
          "result": "Sampled and sent to the QC laboratory for testing",
          "time": "2026-10-11"
        },
        {
          "id": "CMP-2026-1075",
          "type": "Long Queue Time",
          "province": "Mosul, Nineveh Province",
          "agent": "Mosul 3rd Distribution Office",
          "applicant": "Fatima Nour",
          "status": "Resolved",
          "result": "Coordinated to open 2 additional scan-verification issuance windows",
          "time": "2026-10-08"
        }
      ]
    }
  },
  "month": {
    "timeRange": "month",
    "timeLabel": "Last 30 Days",
    "citizens": {
      "totalCitizens": 38420500,
      "activeBeneficiaries": 36890000,
      "biometricVerifiedRate": 98.1,
      "newRegistered": 58200,
      "vulnerableCount": 1280000,
      "ageDistribution": [
        {
          "name": "Minors Aged 0-14",
          "value": 12400000,
          "percentage": 32.3
        },
        {
          "name": "Working-Age Population Aged 15-59",
          "value": 23120500,
          "percentage": 60.2
        },
        {
          "name": "Seniors Aged 60+",
          "value": 2900000,
          "percentage": 7.5
        }
      ],
      "growthTrend": {
        "dates": [
          "09-13",
          "09-18",
          "09-23",
          "09-28",
          "10-03",
          "10-08",
          "10-12"
        ],
        "newRegistered": [
          8200,
          9500,
          8900,
          10200,
          9400,
          8800,
          9200
        ],
        "biometricVerified": [
          54000,
          61000,
          58000,
          64000,
          59000,
          57000,
          62000
        ]
      }
    },
    "families": {
      "totalFamilies": 9482150,
      "avgFamilySize": 4.05,
      "activeRate": 96.7,
      "totalBusinessHandled": 24180,
      "sizeDistribution": [
        {
          "name": "Small Family (1-2 Members)",
          "count": 1612000,
          "percentage": 17
        },
        {
          "name": "Standard Family (3-4 Members)",
          "count": 4551400,
          "percentage": 48
        },
        {
          "name": "Large Family (5-6 Members)",
          "count": 2465350,
          "percentage": 26
        },
        {
          "name": "Multi-Generational Family (7+ Members)",
          "count": 853400,
          "percentage": 9
        }
      ],
      "businessStats": [
        {
          "type": "Change Head",
          "applyCount": 5600,
          "approvedCount": 5480
        },
        {
          "type": "Unfreeze Card",
          "applyCount": 4300,
          "approvedCount": 4190
        },
        {
          "type": "Split Household",
          "applyCount": 8100,
          "approvedCount": 7850
        },
        {
          "type": "Member Entry",
          "applyCount": 6180,
          "approvedCount": 6050
        }
      ]
    },
    "agents": {
      "totalAgents": 42150,
      "complianceRate": 93.4,
      "overloadedAgents": 112,
      "penalizedAgents": 28,
      "regionDistribution": [
        {
          "province": "Baghdad Province",
          "agentCount": 9800,
          "avgHouseholds": 1180,
          "complianceRate": 95
        },
        {
          "province": "Nineveh Province",
          "agentCount": 5200,
          "avgHouseholds": 960,
          "complianceRate": 92.4
        },
        {
          "province": "Basra Province",
          "agentCount": 4600,
          "avgHouseholds": 1040,
          "complianceRate": 94.6
        },
        {
          "province": "Sulaymaniyah Province",
          "agentCount": 3800,
          "avgHouseholds": 820,
          "complianceRate": 96.8
        },
        {
          "province": "Erbil Province",
          "agentCount": 3400,
          "avgHouseholds": 850,
          "complianceRate": 96.1
        },
        {
          "province": "Diyala Province",
          "agentCount": 2900,
          "avgHouseholds": 920,
          "complianceRate": 91.5
        },
        {
          "province": "Kirkuk Province",
          "agentCount": 2800,
          "avgHouseholds": 990,
          "complianceRate": 90.2
        },
        {
          "province": "Anbar Province",
          "agentCount": 2650,
          "avgHouseholds": 890,
          "complianceRate": 92
        }
      ],
      "regulatoryFlow": [
        {
          "name": "New Agency Grant",
          "count": 95
        },
        {
          "name": "Agency Rotation Succession",
          "count": 68
        },
        {
          "name": "Station Merger & Optimization",
          "count": 44
        },
        {
          "name": "Station Deregistration & Clearance",
          "count": 24
        },
        {
          "name": "Administrative Punishment Rectification",
          "count": 18
        }
      ]
    },
    "distribution": {
      "totalDistributedTons": 384500,
      "targetFulfillmentRate": 99.4,
      "householdAdequacyRate": 99.6,
      "onTimeDeliveryRate": 98.7,
      "commodities": [
        {
          "name": "Wheat Flour",
          "plannedTon": 206000,
          "actualTon": 205000,
          "completionRate": 99.5
        },
        {
          "name": "Rice",
          "plannedTon": 86500,
          "actualTon": 86000,
          "completionRate": 99.4
        },
        {
          "name": "Cooking Oil",
          "plannedTon": 31600,
          "actualTon": 31400,
          "completionRate": 99.4
        },
        {
          "name": "Sugar",
          "plannedTon": 22600,
          "actualTon": 22400,
          "completionRate": 99.1
        },
        {
          "name": "Milk Powder",
          "plannedTon": 7300,
          "actualTon": 7250,
          "completionRate": 99.3
        },
        {
          "name": "Salt",
          "plannedTon": 6000,
          "actualTon": 5980,
          "completionRate": 99.7
        }
      ],
      "provinceProgress": [
        {
          "province": "Baghdad Province",
          "distributedTon": 120000,
          "targetTon": 120500,
          "progress": 99.6
        },
        {
          "province": "Basra Province",
          "distributedTon": 61600,
          "targetTon": 62000,
          "progress": 99.4
        },
        {
          "province": "Nineveh Province",
          "distributedTon": 57400,
          "targetTon": 58000,
          "progress": 99
        },
        {
          "province": "Sulaymaniyah Province",
          "distributedTon": 37400,
          "targetTon": 37600,
          "progress": 99.5
        },
        {
          "province": "Erbil Province",
          "distributedTon": 34600,
          "targetTon": 34800,
          "progress": 99.4
        },
        {
          "province": "Diyala Province",
          "distributedTon": 27300,
          "targetTon": 27800,
          "progress": 98.2
        },
        {
          "province": "Kirkuk Province",
          "distributedTon": 25500,
          "targetTon": 25900,
          "progress": 98.5
        },
        {
          "province": "Anbar Province",
          "distributedTon": 20700,
          "targetTon": 21100,
          "progress": 98.1
        }
      ]
    },
    "complaints": {
      "totalComplaints": 1284,
      "resolvedRate": 98.2,
      "avgResolutionHours": 3.2,
      "satisfactionRate": 96.8,
      "categoryDistribution": [
        {
          "name": "Station Short-Weighing / Under-Portioning",
          "count": 359,
          "percentage": 28
        },
        {
          "name": "Poor Service Attitude / Long Queue Time",
          "count": 308,
          "percentage": 24
        },
        {
          "name": "Material Quality & Taste Objection",
          "count": 231,
          "percentage": 18
        },
        {
          "name": "Unauthorized Overcharge / Illegal Fees",
          "count": 205,
          "percentage": 16
        },
        {
          "name": "Ration Quota Assessment Error",
          "count": 181,
          "percentage": 14
        }
      ],
      "trend": {
        "dates": [
          "09-13",
          "09-18",
          "09-23",
          "09-28",
          "10-03",
          "10-08",
          "10-12"
        ],
        "received": [
          178,
          192,
          185,
          201,
          179,
          184,
          165
        ],
        "resolved": [
          175,
          189,
          182,
          198,
          177,
          181,
          163
        ],
        "avgHours": [
          3.6,
          3.4,
          3.3,
          3.2,
          3.1,
          3,
          2.9
        ]
      },
      "recentComplaints": [
        {
          "id": "CMP-2026-1082",
          "type": "Illegal Fees",
          "province": "Al-Karkh District, Baghdad Province",
          "agent": "No.14 Food Supply Station",
          "applicant": "Rasheed Majid",
          "status": "Resolved",
          "result": "Illegal overcharge refunded with circulated criticism order",
          "time": "2026-10-10"
        },
        {
          "id": "CMP-2026-1081",
          "type": "Under-Delivery",
          "province": "Al-Ashar District, Basra Province",
          "agent": "Coastal 2nd Distribution Station",
          "applicant": "Sabah Qasim",
          "status": "Resolved",
          "result": "Verified and 2 KG of Rice re-issued the same day",
          "time": "2026-10-09"
        },
        {
          "id": "CMP-2026-1079",
          "type": "Material Quality",
          "province": "Khanaqin, Diyala Province",
          "agent": "Khanaqin Central Distribution Station",
          "applicant": "Mohammed Ali",
          "status": "Processing",
          "result": "Sampled and sent to the QC laboratory for testing",
          "time": "2026-10-11"
        },
        {
          "id": "CMP-2026-1075",
          "type": "Long Queue Time",
          "province": "Mosul, Nineveh Province",
          "agent": "Mosul 3rd Distribution Office",
          "applicant": "Fatima Nour",
          "status": "Resolved",
          "result": "Coordinated to open 2 additional scan-verification issuance windows",
          "time": "2026-10-08"
        }
      ]
    }
  },
  "week": {
    "timeRange": "week",
    "timeLabel": "Last 7 Days",
    "citizens": {
      "totalCitizens": 38420500,
      "activeBeneficiaries": 36890000,
      "biometricVerifiedRate": 98.4,
      "newRegistered": 12400,
      "vulnerableCount": 1280000,
      "ageDistribution": [
        {
          "name": "Minors Aged 0-14",
          "value": 12400000,
          "percentage": 32.3
        },
        {
          "name": "Working-Age Population Aged 15-59",
          "value": 23120500,
          "percentage": 60.2
        },
        {
          "name": "Seniors Aged 60+",
          "value": 2900000,
          "percentage": 7.5
        }
      ],
      "growthTrend": {
        "dates": [
          "10-06",
          "10-07",
          "10-08",
          "10-09",
          "10-10",
          "10-11",
          "10-12"
        ],
        "newRegistered": [
          1750,
          1820,
          1690,
          1910,
          1840,
          1680,
          1710
        ],
        "biometricVerified": [
          11500,
          12200,
          11800,
          12600,
          12100,
          10900,
          11200
        ]
      }
    },
    "families": {
      "totalFamilies": 9482150,
      "avgFamilySize": 4.05,
      "activeRate": 96.9,
      "totalBusinessHandled": 5620,
      "sizeDistribution": [
        {
          "name": "Small Family (1-2 Members)",
          "count": 1612000,
          "percentage": 17
        },
        {
          "name": "Standard Family (3-4 Members)",
          "count": 4551400,
          "percentage": 48
        },
        {
          "name": "Large Family (5-6 Members)",
          "count": 2465350,
          "percentage": 26
        },
        {
          "name": "Multi-Generational Family (7+ Members)",
          "count": 853400,
          "percentage": 9
        }
      ],
      "businessStats": [
        {
          "type": "Change Head",
          "applyCount": 1320,
          "approvedCount": 1290
        },
        {
          "type": "Unfreeze Card",
          "applyCount": 980,
          "approvedCount": 960
        },
        {
          "type": "Split Household",
          "applyCount": 1890,
          "approvedCount": 1840
        },
        {
          "type": "Member Entry",
          "applyCount": 1430,
          "approvedCount": 1400
        }
      ]
    },
    "agents": {
      "totalAgents": 42150,
      "complianceRate": 94.2,
      "overloadedAgents": 96,
      "penalizedAgents": 14,
      "regionDistribution": [
        {
          "province": "Baghdad Province",
          "agentCount": 9800,
          "avgHouseholds": 1180,
          "complianceRate": 95.8
        },
        {
          "province": "Nineveh Province",
          "agentCount": 5200,
          "avgHouseholds": 960,
          "complianceRate": 93.2
        },
        {
          "province": "Basra Province",
          "agentCount": 4600,
          "avgHouseholds": 1040,
          "complianceRate": 95.2
        },
        {
          "province": "Sulaymaniyah Province",
          "agentCount": 3800,
          "avgHouseholds": 820,
          "complianceRate": 97.2
        },
        {
          "province": "Erbil Province",
          "agentCount": 3400,
          "avgHouseholds": 850,
          "complianceRate": 96.8
        },
        {
          "province": "Diyala Province",
          "agentCount": 2900,
          "avgHouseholds": 920,
          "complianceRate": 92.4
        },
        {
          "province": "Kirkuk Province",
          "agentCount": 2800,
          "avgHouseholds": 990,
          "complianceRate": 91.2
        },
        {
          "province": "Anbar Province",
          "agentCount": 2650,
          "avgHouseholds": 890,
          "complianceRate": 93
        }
      ],
      "regulatoryFlow": [
        {
          "name": "New Agency Grant",
          "count": 22
        },
        {
          "name": "Agency Rotation Succession",
          "count": 16
        },
        {
          "name": "Station Merger & Optimization",
          "count": 9
        },
        {
          "name": "Station Deregistration & Clearance",
          "count": 5
        },
        {
          "name": "Administrative Punishment Rectification",
          "count": 4
        }
      ]
    },
    "distribution": {
      "totalDistributedTons": 89600,
      "targetFulfillmentRate": 99.7,
      "householdAdequacyRate": 99.8,
      "onTimeDeliveryRate": 99.1,
      "commodities": [
        {
          "name": "Wheat Flour",
          "plannedTon": 48200,
          "actualTon": 48100,
          "completionRate": 99.8
        },
        {
          "name": "Rice",
          "plannedTon": 20200,
          "actualTon": 20150,
          "completionRate": 99.7
        },
        {
          "name": "Cooking Oil",
          "plannedTon": 7400,
          "actualTon": 7380,
          "completionRate": 99.7
        },
        {
          "name": "Sugar",
          "plannedTon": 5300,
          "actualTon": 5280,
          "completionRate": 99.6
        },
        {
          "name": "Milk Powder",
          "plannedTon": 1720,
          "actualTon": 1715,
          "completionRate": 99.7
        },
        {
          "name": "Salt",
          "plannedTon": 1400,
          "actualTon": 1398,
          "completionRate": 99.9
        }
      ],
      "provinceProgress": [
        {
          "province": "Baghdad Province",
          "distributedTon": 28100,
          "targetTon": 28150,
          "progress": 99.8
        },
        {
          "province": "Basra Province",
          "distributedTon": 14400,
          "targetTon": 14450,
          "progress": 99.6
        },
        {
          "province": "Nineveh Province",
          "distributedTon": 13400,
          "targetTon": 13500,
          "progress": 99.3
        },
        {
          "province": "Sulaymaniyah Province",
          "distributedTon": 8750,
          "targetTon": 8780,
          "progress": 99.7
        },
        {
          "province": "Erbil Province",
          "distributedTon": 8100,
          "targetTon": 8120,
          "progress": 99.7
        },
        {
          "province": "Diyala Province",
          "distributedTon": 6400,
          "targetTon": 6480,
          "progress": 98.8
        },
        {
          "province": "Kirkuk Province",
          "distributedTon": 5950,
          "targetTon": 6020,
          "progress": 98.8
        },
        {
          "province": "Anbar Province",
          "distributedTon": 4500,
          "targetTon": 4550,
          "progress": 98.9
        }
      ]
    },
    "complaints": {
      "totalComplaints": 286,
      "resolvedRate": 98.9,
      "avgResolutionHours": 2.6,
      "satisfactionRate": 97.4,
      "categoryDistribution": [
        {
          "name": "Station Short-Weighing / Under-Portioning",
          "count": 80,
          "percentage": 28
        },
        {
          "name": "Poor Service Attitude / Long Queue Time",
          "count": 69,
          "percentage": 24
        },
        {
          "name": "Material Quality & Taste Objection",
          "count": 51,
          "percentage": 18
        },
        {
          "name": "Unauthorized Overcharge / Illegal Fees",
          "count": 46,
          "percentage": 16
        },
        {
          "name": "Ration Quota Assessment Error",
          "count": 40,
          "percentage": 14
        }
      ],
      "trend": {
        "dates": [
          "10-06",
          "10-07",
          "10-08",
          "10-09",
          "10-10",
          "10-11",
          "10-12"
        ],
        "received": [
          42,
          39,
          45,
          41,
          38,
          40,
          41
        ],
        "resolved": [
          42,
          38,
          45,
          41,
          38,
          39,
          40
        ],
        "avgHours": [
          2.8,
          2.7,
          2.6,
          2.6,
          2.5,
          2.5,
          2.4
        ]
      },
      "recentComplaints": [
        {
          "id": "CMP-2026-1082",
          "type": "Illegal Fees",
          "province": "Al-Karkh District, Baghdad Province",
          "agent": "No.14 Food Supply Station",
          "applicant": "Rasheed Majid",
          "status": "Resolved",
          "result": "Illegal overcharge refunded with circulated criticism order",
          "time": "2026-10-10"
        },
        {
          "id": "CMP-2026-1081",
          "type": "Under-Delivery",
          "province": "Al-Ashar District, Basra Province",
          "agent": "Coastal 2nd Distribution Station",
          "applicant": "Sabah Qasim",
          "status": "Resolved",
          "result": "Verified and 2 KG of Rice re-issued the same day",
          "time": "2026-10-09"
        },
        {
          "id": "CMP-2026-1079",
          "type": "Material Quality",
          "province": "Khanaqin, Diyala Province",
          "agent": "Khanaqin Central Distribution Station",
          "applicant": "Mohammed Ali",
          "status": "Processing",
          "result": "Sampled and sent to the QC laboratory for testing",
          "time": "2026-10-11"
        },
        {
          "id": "CMP-2026-1075",
          "type": "Long Queue Time",
          "province": "Mosul, Nineveh Province",
          "agent": "Mosul 3rd Distribution Office",
          "applicant": "Fatima Nour",
          "status": "Resolved",
          "result": "Coordinated to open 2 additional scan-verification issuance windows",
          "time": "2026-10-08"
        }
      ]
    }
  },
  "day": {
    "timeRange": "day",
    "timeLabel": "Last 1 Day (Today, Real-Time)",
    "citizens": {
      "totalCitizens": 38420500,
      "activeBeneficiaries": 36890000,
      "biometricVerifiedRate": 98.6,
      "newRegistered": 1850,
      "vulnerableCount": 1280000,
      "ageDistribution": [
        {
          "name": "Minors Aged 0-14",
          "value": 12400000,
          "percentage": 32.3
        },
        {
          "name": "Working-Age Population Aged 15-59",
          "value": 23120500,
          "percentage": 60.2
        },
        {
          "name": "Seniors Aged 60+",
          "value": 2900000,
          "percentage": 7.5
        }
      ],
      "growthTrend": {
        "dates": [
          "08:00",
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00",
          "20:00"
        ],
        "newRegistered": [
          210,
          340,
          290,
          310,
          280,
          230,
          190
        ],
        "biometricVerified": [
          1420,
          2180,
          1950,
          2060,
          1890,
          1540,
          1260
        ]
      }
    },
    "families": {
      "totalFamilies": 9482150,
      "avgFamilySize": 4.05,
      "activeRate": 97.1,
      "totalBusinessHandled": 820,
      "sizeDistribution": [
        {
          "name": "Small Family (1-2 Members)",
          "count": 1612000,
          "percentage": 17
        },
        {
          "name": "Standard Family (3-4 Members)",
          "count": 4551400,
          "percentage": 48
        },
        {
          "name": "Large Family (5-6 Members)",
          "count": 2465350,
          "percentage": 26
        },
        {
          "name": "Multi-Generational Family (7+ Members)",
          "count": 853400,
          "percentage": 9
        }
      ],
      "businessStats": [
        {
          "type": "Change Head",
          "applyCount": 195,
          "approvedCount": 190
        },
        {
          "type": "Unfreeze Card",
          "applyCount": 142,
          "approvedCount": 140
        },
        {
          "type": "Split Household",
          "applyCount": 278,
          "approvedCount": 270
        },
        {
          "type": "Member Entry",
          "applyCount": 205,
          "approvedCount": 200
        }
      ]
    },
    "agents": {
      "totalAgents": 42150,
      "complianceRate": 95.8,
      "overloadedAgents": 64,
      "penalizedAgents": 8,
      "regionDistribution": [
        {
          "province": "Baghdad Province",
          "agentCount": 9800,
          "avgHouseholds": 1180,
          "complianceRate": 96.5
        },
        {
          "province": "Nineveh Province",
          "agentCount": 5200,
          "avgHouseholds": 960,
          "complianceRate": 94.8
        },
        {
          "province": "Basra Province",
          "agentCount": 4600,
          "avgHouseholds": 1040,
          "complianceRate": 96
        },
        {
          "province": "Sulaymaniyah Province",
          "agentCount": 3800,
          "avgHouseholds": 820,
          "complianceRate": 98
        },
        {
          "province": "Erbil Province",
          "agentCount": 3400,
          "avgHouseholds": 850,
          "complianceRate": 97.5
        },
        {
          "province": "Diyala Province",
          "agentCount": 2900,
          "avgHouseholds": 920,
          "complianceRate": 93.6
        },
        {
          "province": "Kirkuk Province",
          "agentCount": 2800,
          "avgHouseholds": 990,
          "complianceRate": 92.4
        },
        {
          "province": "Anbar Province",
          "agentCount": 2650,
          "avgHouseholds": 890,
          "complianceRate": 94.2
        }
      ],
      "regulatoryFlow": [
        {
          "name": "New Agency Grant",
          "count": 4
        },
        {
          "name": "Agency Rotation Succession",
          "count": 3
        },
        {
          "name": "Station Merger & Optimization",
          "count": 2
        },
        {
          "name": "Station Deregistration & Clearance",
          "count": 1
        },
        {
          "name": "Administrative Punishment Rectification",
          "count": 1
        }
      ]
    },
    "distribution": {
      "totalDistributedTons": 12850,
      "targetFulfillmentRate": 99.8,
      "householdAdequacyRate": 99.9,
      "onTimeDeliveryRate": 99.4,
      "commodities": [
        {
          "name": "Wheat Flour",
          "plannedTon": 6900,
          "actualTon": 6890,
          "completionRate": 99.9
        },
        {
          "name": "Rice",
          "plannedTon": 2900,
          "actualTon": 2895,
          "completionRate": 99.8
        },
        {
          "name": "Cooking Oil",
          "plannedTon": 1060,
          "actualTon": 1058,
          "completionRate": 99.8
        },
        {
          "name": "Sugar",
          "plannedTon": 760,
          "actualTon": 758,
          "completionRate": 99.7
        },
        {
          "name": "Milk Powder",
          "plannedTon": 245,
          "actualTon": 244,
          "completionRate": 99.6
        },
        {
          "name": "Salt",
          "plannedTon": 200,
          "actualTon": 200,
          "completionRate": 100
        }
      ],
      "provinceProgress": [
        {
          "province": "Baghdad Province",
          "distributedTon": 4050,
          "targetTon": 4060,
          "progress": 99.8
        },
        {
          "province": "Basra Province",
          "distributedTon": 2070,
          "targetTon": 2075,
          "progress": 99.8
        },
        {
          "province": "Nineveh Province",
          "distributedTon": 1920,
          "targetTon": 1930,
          "progress": 99.5
        },
        {
          "province": "Sulaymaniyah Province",
          "distributedTon": 1250,
          "targetTon": 1255,
          "progress": 99.6
        },
        {
          "province": "Erbil Province",
          "distributedTon": 1160,
          "targetTon": 1165,
          "progress": 99.6
        },
        {
          "province": "Diyala Province",
          "distributedTon": 920,
          "targetTon": 928,
          "progress": 99.1
        },
        {
          "province": "Kirkuk Province",
          "distributedTon": 855,
          "targetTon": 862,
          "progress": 99.2
        },
        {
          "province": "Anbar Province",
          "distributedTon": 625,
          "targetTon": 630,
          "progress": 99.2
        }
      ]
    },
    "complaints": {
      "totalComplaints": 41,
      "resolvedRate": 99.2,
      "avgResolutionHours": 1.8,
      "satisfactionRate": 98.1,
      "categoryDistribution": [
        {
          "name": "Station Short-Weighing / Under-Portioning",
          "count": 12,
          "percentage": 29.3
        },
        {
          "name": "Poor Service Attitude / Long Queue Time",
          "count": 10,
          "percentage": 24.4
        },
        {
          "name": "Material Quality & Taste Objection",
          "count": 8,
          "percentage": 19.5
        },
        {
          "name": "Unauthorized Overcharge / Illegal Fees",
          "count": 6,
          "percentage": 14.6
        },
        {
          "name": "Ration Quota Assessment Error",
          "count": 5,
          "percentage": 12.2
        }
      ],
      "trend": {
        "dates": [
          "08:00",
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00",
          "20:00"
        ],
        "received": [
          6,
          8,
          7,
          6,
          5,
          5,
          4
        ],
        "resolved": [
          6,
          8,
          7,
          6,
          5,
          5,
          4
        ],
        "avgHours": [
          2,
          1.9,
          1.8,
          1.8,
          1.7,
          1.6,
          1.5
        ]
      },
      "recentComplaints": [
        {
          "id": "CMP-2026-1082",
          "type": "Illegal Fees",
          "province": "Al-Karkh District, Baghdad Province",
          "agent": "No.14 Food Supply Station",
          "applicant": "Rasheed Majid",
          "status": "Resolved",
          "result": "Illegal overcharge refunded with circulated criticism order",
          "time": "2026-10-12"
        },
        {
          "id": "CMP-2026-1081",
          "type": "Under-Delivery",
          "province": "Al-Ashar District, Basra Province",
          "agent": "Coastal 2nd Distribution Station",
          "applicant": "Sabah Qasim",
          "status": "Resolved",
          "result": "Verified and 2 KG of Rice re-issued the same day",
          "time": "2026-10-12"
        }
      ]
    }
  }
};

export const MOCK_AGENT_DASHBOARD_DATA = {
  "quarter": {
    "kpi": {
      "outboundRate": 80,
      "receivedRate": 64,
      "claimedRate": 50,
      "availableStock": 378000,
      "lockedStock": 25920,
      "frozenStock": 400,
      "complianceRate": 99.8,
      "blockedCount": 1,
      "matchRate": 99.88,
      "lossRate": 0.48
    },
    "inventoryStats": {
      "totalInbound": 38200,
      "plannedInbound": 45000,
      "inboundRate": 84.9,
      "totalOutbound": 30560,
      "plannedOutbound": 36000,
      "outboundDispatchRate": 84.9,
      "endingStock": 7640,
      "stockHealthRate": 92,
      "turnoverDays": 22,
      "stockChangeRate": 4.8
    },
    "fulfillmentReports": [
      {
        "province": "Baghdad Province",
        "totalAllocatedTon": 15000,
        "outboundTon": 12000,
        "receivedTon": 9600,
        "claimedTon": 7500,
        "fulfillmentRate": 80
      },
      {
        "province": "Nineveh Province",
        "totalAllocatedTon": 8500,
        "outboundTon": 6800,
        "receivedTon": 5440,
        "claimedTon": 4250,
        "fulfillmentRate": 80
      },
      {
        "province": "Basra Province",
        "totalAllocatedTon": 9200,
        "outboundTon": 7500,
        "receivedTon": 6000,
        "claimedTon": 4600,
        "fulfillmentRate": 81.5
      },
      {
        "province": "Diyala Province",
        "totalAllocatedTon": 4800,
        "outboundTon": 3900,
        "receivedTon": 3120,
        "claimedTon": 2400,
        "fulfillmentRate": 81.25
      },
      {
        "province": "Kirkuk Province",
        "totalAllocatedTon": 6000,
        "outboundTon": 4800,
        "receivedTon": 3840,
        "claimedTon": 3000,
        "fulfillmentRate": 80
      },
      {
        "province": "Anbar Province",
        "totalAllocatedTon": 5200,
        "outboundTon": 4100,
        "receivedTon": 3280,
        "claimedTon": 2600,
        "fulfillmentRate": 78.8
      }
    ],
    "throughputDays": 30
  },
  "month": {
    "kpi": {
      "outboundRate": 72.5,
      "receivedRate": 58.2,
      "claimedRate": 46,
      "availableStock": 385200,
      "lockedStock": 21400,
      "frozenStock": 300,
      "complianceRate": 99.9,
      "blockedCount": 0,
      "matchRate": 99.92,
      "lossRate": 0.42
    },
    "inventoryStats": {
      "totalInbound": 12580,
      "plannedInbound": 15000,
      "inboundRate": 83.9,
      "totalOutbound": 9870,
      "plannedOutbound": 12000,
      "outboundDispatchRate": 82.3,
      "endingStock": 2710,
      "stockHealthRate": 88,
      "turnoverDays": 18,
      "stockChangeRate": -3.2
    },
    "fulfillmentReports": [
      {
        "province": "Baghdad Province",
        "totalAllocatedTon": 5000,
        "outboundTon": 3625,
        "receivedTon": 2910,
        "claimedTon": 2300,
        "fulfillmentRate": 72.5
      },
      {
        "province": "Nineveh Province",
        "totalAllocatedTon": 2800,
        "outboundTon": 2030,
        "receivedTon": 1624,
        "claimedTon": 1280,
        "fulfillmentRate": 72.5
      },
      {
        "province": "Basra Province",
        "totalAllocatedTon": 3100,
        "outboundTon": 2260,
        "receivedTon": 1810,
        "claimedTon": 1430,
        "fulfillmentRate": 72.9
      },
      {
        "province": "Diyala Province",
        "totalAllocatedTon": 1600,
        "outboundTon": 1160,
        "receivedTon": 930,
        "claimedTon": 735,
        "fulfillmentRate": 72.5
      },
      {
        "province": "Kirkuk Province",
        "totalAllocatedTon": 2000,
        "outboundTon": 1450,
        "receivedTon": 1160,
        "claimedTon": 920,
        "fulfillmentRate": 72.5
      },
      {
        "province": "Anbar Province",
        "totalAllocatedTon": 1750,
        "outboundTon": 1260,
        "receivedTon": 1010,
        "claimedTon": 800,
        "fulfillmentRate": 72
      }
    ],
    "throughputDays": 30
  },
  "week": {
    "kpi": {
      "outboundRate": 88.2,
      "receivedRate": 76.5,
      "claimedRate": 64.2,
      "availableStock": 391500,
      "lockedStock": 16200,
      "frozenStock": 100,
      "complianceRate": 100,
      "blockedCount": 0,
      "matchRate": 99.95,
      "lossRate": 0.38
    },
    "inventoryStats": {
      "totalInbound": 3120,
      "plannedInbound": 3500,
      "inboundRate": 89.1,
      "totalOutbound": 2750,
      "plannedOutbound": 3000,
      "outboundDispatchRate": 91.7,
      "endingStock": 370,
      "stockHealthRate": 95,
      "turnoverDays": 6,
      "stockChangeRate": 5.6
    },
    "fulfillmentReports": [
      {
        "province": "Baghdad Province",
        "totalAllocatedTon": 1200,
        "outboundTon": 1058,
        "receivedTon": 918,
        "claimedTon": 770,
        "fulfillmentRate": 88.2
      },
      {
        "province": "Nineveh Province",
        "totalAllocatedTon": 680,
        "outboundTon": 600,
        "receivedTon": 520,
        "claimedTon": 436,
        "fulfillmentRate": 88.2
      },
      {
        "province": "Basra Province",
        "totalAllocatedTon": 750,
        "outboundTon": 665,
        "receivedTon": 578,
        "claimedTon": 485,
        "fulfillmentRate": 88.7
      },
      {
        "province": "Diyala Province",
        "totalAllocatedTon": 380,
        "outboundTon": 335,
        "receivedTon": 291,
        "claimedTon": 244,
        "fulfillmentRate": 88.2
      },
      {
        "province": "Kirkuk Province",
        "totalAllocatedTon": 480,
        "outboundTon": 423,
        "receivedTon": 367,
        "claimedTon": 308,
        "fulfillmentRate": 88.1
      },
      {
        "province": "Anbar Province",
        "totalAllocatedTon": 420,
        "outboundTon": 370,
        "receivedTon": 321,
        "claimedTon": 270,
        "fulfillmentRate": 88.1
      }
    ],
    "throughputDays": 7
  },
  "day": {
    "kpi": {
      "outboundRate": 94.6,
      "receivedRate": 85,
      "claimedRate": 72.8,
      "availableStock": 394800,
      "lockedStock": 12500,
      "frozenStock": 0,
      "complianceRate": 100,
      "blockedCount": 0,
      "matchRate": 99.98,
      "lossRate": 0.22
    },
    "inventoryStats": {
      "totalInbound": 485,
      "plannedInbound": 500,
      "inboundRate": 97,
      "totalOutbound": 458,
      "plannedOutbound": 470,
      "outboundDispatchRate": 97.4,
      "endingStock": 127,
      "stockHealthRate": 98,
      "turnoverDays": 1,
      "stockChangeRate": 1.2
    },
    "fulfillmentReports": [
      {
        "province": "Baghdad Province",
        "totalAllocatedTon": 180,
        "outboundTon": 172,
        "receivedTon": 155,
        "claimedTon": 132,
        "fulfillmentRate": 95.5
      },
      {
        "province": "Nineveh Province",
        "totalAllocatedTon": 105,
        "outboundTon": 99,
        "receivedTon": 89,
        "claimedTon": 76,
        "fulfillmentRate": 94.3
      },
      {
        "province": "Basra Province",
        "totalAllocatedTon": 115,
        "outboundTon": 110,
        "receivedTon": 98,
        "claimedTon": 84,
        "fulfillmentRate": 95.6
      },
      {
        "province": "Diyala Province",
        "totalAllocatedTon": 58,
        "outboundTon": 54,
        "receivedTon": 48,
        "claimedTon": 41,
        "fulfillmentRate": 93.1
      },
      {
        "province": "Kirkuk Province",
        "totalAllocatedTon": 72,
        "outboundTon": 68,
        "receivedTon": 61,
        "claimedTon": 52,
        "fulfillmentRate": 94.4
      },
      {
        "province": "Anbar Province",
        "totalAllocatedTon": 65,
        "outboundTon": 61,
        "receivedTon": 55,
        "claimedTon": 47,
        "fulfillmentRate": 93.8
      }
    ],
    "throughputDays": 1
  }
};
