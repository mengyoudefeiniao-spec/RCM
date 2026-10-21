// Complete four-language copy for citizen application screens and sample documents.
export default {
  "zh": {
    "split": {
      "documentsTitle": "上传分户法定证明文件（支持两份材料分别上传）",
      "requiredHint": "* 为法定必需材料",
      "assessmentTitle": "分立合规研判与业务流转路径",
      "automaticPriority": "优先智能判别",
      "precheckStatus": "预审合规匹配状态",
      "ready": "就绪 ✓",
      "movingMembers": "分出成员人数：",
      "peopleCount": "{count} 人",
      "marriageEvidence": "婚姻关系材料：",
      "uploadedVerified": "已上传验证 ✓",
      "residenceEvidence": "独立居住证明：",
      "supportingAttached": "已附辅助公文 ✓",
      "residenceExempt": "免交 / 依户主住所",
      "routingRulesTitle": "业务流转规则：",
      "routingRules": "支付后系统优先自动比对规则。夫妻婚姻合法存续且名下无其他活动配给卡时，自动审批并签发新卡；不符合自动审批标准时，转交分部两级人工复核。",
      "newHouseholdMembers": "拟移入独立新户的成员清单：",
      "paymentSummaryTitle": "核对申请摘要并完成电子支付",
      "feeBadge": "规费 {amount}",
      "originalCardNo": "原配给卡号：",
      "originalHead": "原法定户主：",
      "feeStandard": "分立规费标准：",
      "administrativeFee": "数字配给卡家庭分立分户与独立建卡行政规费：",
      "iraqiDinar": "伊拉克第纳尔",
      "paymentMethods": "支持 Qi Card、ZainCash、Switch 在线支付（密码 / 指纹 / 刷脸）",
      "feeReady": "规费核定就绪 ✓",
      "payAndSubmitTitle": "最后一步：在线支付并提交申请",
      "payAndSubmitHint": "打开在线收银台，使用密码、指纹或刷脸支付。支付完成后，系统将启动智能判别与流转。",
      "openCheckout": "打开收银台并完成支付",
      "resultApproved": "家庭分立分户已自动核准生效！",
      "resultManualReview": "系统自动判别未通过，需转入分部电子审核",
      "resultSuccessDescription": "已为分出成员签发独立电子配给卡 {cardNo}，配给定额已独立核定。",
      "receiptTitle": "分立建卡存根凭证",
      "cardActivated": "自动建卡生效",
      "branchReview": "分部审核受理",
      "referenceNo": "业务流水单号：",
      "newCardNo": "新独立配给卡号：",
      "documentFee": "分立公文规费：",
      "feePaid": "{amount}（已实缴）",
      "processingMode": "办理处理模式：",
      "automaticApproval": "智能自动核准",
      "twoTierReview": "分部两级人工复核",
      "returnToCard": "返回我的家庭配给卡",
      "adjustMembers": "重新调整成员",
      "paymentTitle": "数字配给卡家庭分户与独立建卡规费",
      "errorSelectMembers": "请选择拟移入新户的家庭成员。",
      "errorMarriageDocument": "请上传法定结婚证明或同等效力公文。",
      "manualReviewAvailable": "自动判别未通过，可提交分部电子审核。",
      "reviewSubmitted": "已提交分部两级电子审核。",
      "singleMemberReason": "仅选择了一名成员，不满足夫妻组合自动识别规则，需要人工审核。",
      "nonCoupleReason": "所选成员不符合夫妻组合自动识别规则，需要人工审核。",
      "relations": {
        "head": "户主",
        "spouse": "配偶",
        "child": "子女",
        "father": "父亲",
        "mother": "母亲",
        "dependent": "受抚养人"
      },
      "genders": {
        "male": "男",
        "female": "女"
      },
      "documents": {
        "marriage": {
          "title": "1. 结婚证明或同等效力公文",
          "subtitle": "民政婚姻登记证书或最高司法委员会法院判决文书，用于核验夫妻合法关系。",
          "badge": "民政结婚证书 / 司法判决书",
          "issuer": "伊拉克最高司法委员会 · 卡尔赫民事法庭",
          "fileName": "民事结婚证书与分立公函_MC-2026-BAG-09921.pdf",
          "ocrSummary": "婚姻公证印鉴与配偶身份核验通过，符合婚姻分户立卡规定。"
        },
        "residence": {
          "title": "2. 其他辅助证明文件",
          "subtitle": "可选提交独立住宅产权证、租赁合同、水电气户头单据或社区居住证明。",
          "badge": "住所产权 / 租赁合同 / 补充公文",
          "issuer": "地方市政规划委员会与房屋所有权登记局",
          "fileName": "独立住宅产权证明与租约_ADD-2026-7810.pdf",
          "ocrSummary": "房屋租赁合同及独立用电编号已核验，具备独立常住居住条件。"
        }
      }
    },
    "unfreeze": {
      "resolutionBadge": "第140号决议申诉",
      "caseNames": {
        "commercial": "商业",
        "travel": "旅行",
        "income": "高收入",
        "address": "住址不明",
        "update": "信息更新",
        "duplicate": "重复登记",
        "temporary": "临时限制",
        "location": "地理位置"
      },
      "documents": {
        "commercial": {
          "title": "商业登记注销公文与税务清算核定函",
          "subtitle": "贸易部企业注册总局注销证明及税务局清税证明",
          "badge": "商业登记与税务清算",
          "issuer": "伊拉克贸易部企业注册总局 & 国家税务局",
          "fileName": "商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf",
          "ocrSummary": "企业法人营业执照名额已注销，纳税零申报及税务清算完毕，符合配给补贴恢复标准"
        },
        "travel": {
          "title": "海关出入境与永久回国居留公证书",
          "subtitle": "海关边检入境戳记及出入境常住定居证明",
          "badge": "海关出入境与永久居留",
          "issuer": "伊拉克内政部居留与边境总局",
          "fileName": "内政部海关边检_入境戳记护照扫描件及回国定居申明_TRV-2026-5521.pdf",
          "ocrSummary": "巴格达国际机场入境戳记核实属实，居留常驻伊拉克境内声明经公证生效"
        },
        "income": {
          "title": "财政薪资核定单与雇主证明",
          "subtitle": "财政部薪资发放底册核算公文",
          "badge": "财政薪资核定与雇主证明",
          "issuer": "财政部公共薪资核准司 & 雇主单位",
          "fileName": "财政部与雇主用人单位_最新月收入核定单与社保证明_INC-2026-3108.pdf",
          "ocrSummary": "月度核算收入低于国家配给补助门槛标准，雇主公章与税单一致"
        },
        "address": {
          "title": "社区网格户籍实地核查公函",
          "subtitle": "社区网格长连续居住证明与水电账单",
          "badge": "社区网格户籍实地核查",
          "issuer": "巴格达省地方行政委员会 & 社区网格处",
          "fileName": "地方社区行政处_网格长常住户籍确认公函与水电账单_LOC-2026-7740.pdf",
          "ocrSummary": "社区网格员现场入户核验属实，已连续常住超过6个月，地址有效激活"
        },
        "update": {
          "title": "统一国民卡数据校正批准通知书",
          "subtitle": "内政部户政总局个人底账信息已完成更正核实公文",
          "badge": "内政部户籍更正公文",
          "issuer": "伊拉克内政部户政总局",
          "fileName": "内政部户政总局_国家统一国民卡数据校正批准通知书_UPD-2026-6219.pdf",
          "ocrSummary": "国民卡档案信息与配给底册完成双向对齐，系统更正生效记录比对属实"
        },
        "duplicate": {
          "title": "户籍身份唯一性司法公证书及销重批文",
          "subtitle": "民事身份法院出具的无多重档案唯一人身地位证明",
          "badge": "司法唯一身份公证",
          "issuer": "最高司法委员会民事身份法庭",
          "fileName": "司法法庭_配给卡唯一登记与多重底册销重裁定书_DUP-2026-9041.pdf",
          "ocrSummary": "司法裁定明确家庭成员人身唯一合法性，重复登记条目已正式注销"
        },
        "temporary": {
          "title": "临时限制解除通知函及合规证明",
          "subtitle": "贸易部粮食总署撤销临时管制清单公函",
          "badge": "临时限制解除批文",
          "issuer": "贸易部国家粮食与物资总署",
          "fileName": "国家粮食总署_关于解除数字配给卡临时管制决定的批函_TMP-2026-2810.pdf",
          "ocrSummary": "解除临时口粮配额暂停发放管制，指令属地代销点即日恢复核销"
        },
        "location": {
          "title": "属地不动产权属公证书及现场定位核验单",
          "subtitle": "不动产登记处合法住所证明及网点经纬度核验公函",
          "badge": "属地不动产与定位核验",
          "issuer": "司法部不动产登记总局 & 属地配给中心",
          "fileName": "不动产登记总局_合法居所所有权登记证与GPS定位件_GEO-2026-6102.pdf",
          "ocrSummary": "现场地理位置核验通过，家庭居住地址位于该配给中心标准服务辐射半径内"
        }
      }
    },
    "payment": {
      "defaultFeeTitle": "法定业务公文规费",
      "processingDetails": "渠道：{channel} · 验证：{method} · 单号：{order}",
      "clearanceVerified": "中央银行电子支付清算已核验",
      "pinIncomplete": "请输入完整的 6 位支付密码。",
      "fallbackWallet": "电子钱包",
      "channels": {
        "qi": "Qi Card（万事达）",
        "zain": "ZainCash 钱包",
        "switch": "Switch 中央银行支付通道"
      },
      "verifyLabels": {
        "pin": "PIN 密码安全扣款",
        "fingerprint": "生物指纹验证扣款",
        "face": "人脸验证支付",
        "secure": "在线安全扣款"
      }
    },
    "uploader": {
      "previewAuthority": "伊拉克共和国 · 贸易部 / 司法部 / 卫生部"
    },
    "citizen": {
      "stepBasicShort": "基本",
      "stepVerifyShort": "核验",
      "stepConfirmShort": "确认",
      "demoMemberName": "奥马尔·艾哈迈德·哈桑"
    },
    "citizenPurchase": {
      "orderSuccess": "配给品选购成功并已完成电子支付！专属防伪取货码：{code}",
      "orderError": "订单提交失败，请重试。"
    }
  },
  "en": {
    "split": {
      "documentsTitle": "Upload household split documents separately",
      "requiredHint": "* Legally required document",
      "assessmentTitle": "Split eligibility and application routing",
      "automaticPriority": "Automatic check first",
      "precheckStatus": "Eligibility precheck",
      "ready": "Ready ✓",
      "movingMembers": "Members moving:",
      "peopleCount": "{count} member(s)",
      "marriageEvidence": "Marriage documents:",
      "uploadedVerified": "Uploaded and verified ✓",
      "residenceEvidence": "Independent residence:",
      "supportingAttached": "Supporting proof attached ✓",
      "residenceExempt": "Exempt / household head’s address",
      "routingRulesTitle": "Routing rules:",
      "routingRules": "After payment, the system checks eligibility automatically. A legally married couple with no other active ration card receives automatic approval and a new card. Applications outside these criteria go to a two-stage manual review at the branch.",
      "newHouseholdMembers": "Members of the proposed new household:",
      "paymentSummaryTitle": "Review application and complete payment",
      "feeBadge": "Fee {amount}",
      "originalCardNo": "Original ration card:",
      "originalHead": "Original household head:",
      "feeStandard": "Household split fee:",
      "administrativeFee": "Administrative fee for household split and independent digital ration card issuance:",
      "iraqiDinar": "Iraqi dinars",
      "paymentMethods": "Pay with Qi Card, ZainCash or Switch using PIN, fingerprint or face verification.",
      "feeReady": "Fee confirmed ✓",
      "payAndSubmitTitle": "Final step: pay online and submit",
      "payAndSubmitHint": "Open checkout and pay using your PIN, fingerprint or face verification. Eligibility checks and application routing start after payment.",
      "openCheckout": "Open checkout and pay",
      "resultApproved": "Household split automatically approved!",
      "resultManualReview": "Automatic assessment not passed; branch review is required",
      "resultSuccessDescription": "Independent digital ration card {cardNo} has been issued with a separate quota for the moving members.",
      "receiptTitle": "Household split receipt",
      "cardActivated": "New card activated",
      "branchReview": "Branch review",
      "referenceNo": "Application reference:",
      "newCardNo": "New ration card:",
      "documentFee": "Document fee:",
      "feePaid": "{amount} (paid)",
      "processingMode": "Processing method:",
      "automaticApproval": "Automatic approval",
      "twoTierReview": "Two-stage branch review",
      "returnToCard": "Return to my ration card",
      "adjustMembers": "Change member selection",
      "paymentTitle": "Household split and independent ration card fee",
      "errorSelectMembers": "Select the members moving to the new household.",
      "errorMarriageDocument": "Upload the required marriage certificate or equivalent legal document.",
      "manualReviewAvailable": "Automatic assessment not passed. You can submit the application for branch review.",
      "reviewSubmitted": "Submitted for two-stage electronic branch review.",
      "singleMemberReason": "Only one member was selected. The automatic couple assessment criteria are not met; manual review is required.",
      "nonCoupleReason": "The selected members do not meet the automatic couple assessment criteria; manual review is required.",
      "relations": {
        "head": "Head",
        "spouse": "Spouse",
        "child": "Child",
        "father": "Father",
        "mother": "Mother",
        "dependent": "Dependent"
      },
      "genders": {
        "male": "Male",
        "female": "Female"
      },
      "documents": {
        "marriage": {
          "title": "1. Marriage certificate or equivalent legal document",
          "subtitle": "Civil marriage certificate or Supreme Judicial Council court ruling confirming the legal marital relationship.",
          "badge": "Marriage certificate / court ruling",
          "issuer": "Supreme Judicial Council · Karkh Civil Court",
          "fileName": "Civil_Marriage_and_Household_Split_MC-2026-BAG-09921.pdf",
          "ocrSummary": "Marriage seal and spouse identity verified; the document meets household split requirements."
        },
        "residence": {
          "title": "2. Other supporting documents",
          "subtitle": "Optional property deed, lease, utility account statement or community residency certificate.",
          "badge": "Property deed / lease / supporting proof",
          "issuer": "Municipal Planning Commission and Property Registry",
          "fileName": "Independent_Residence_Deed_and_Lease_ADD-2026-7810.pdf",
          "ocrSummary": "Lease and separate electricity account verified; independent permanent residence confirmed."
        }
      }
    },
    "unfreeze": {
      "resolutionBadge": "Resolution 140 appeal",
      "caseNames": {
        "commercial": "Commercial",
        "travel": "Travel",
        "income": "High income",
        "address": "Unknown address",
        "update": "Record update",
        "duplicate": "Duplicate registration",
        "temporary": "Temporary restriction",
        "location": "Geolocation"
      },
      "documents": {
        "commercial": {
          "title": "Commercial Deregistration & Tax Clearance Certificate",
          "subtitle": "Ministry of Trade Deregistration Deed & Tax Clearance Receipt",
          "badge": "Commercial Deregistration",
          "issuer": "Ministry of Trade Companies Directorate & General Commission for Taxes",
          "fileName": "Commercial_Chamber_Tax_Clearance_Deed_COM-2026-0914.pdf",
          "ocrSummary": "Commercial entity registration annulled; zero-liability tax clearance verified."
        },
        "travel": {
          "title": "Customs Entry Stamp & Permanent Return Affidavit",
          "subtitle": "Border control passport stamps & permanent domestic resettlement proof",
          "badge": "Customs & Return Deed",
          "issuer": "Ministry of Interior Residency & Border Directorate",
          "fileName": "Border_Control_Passport_Entry_Stamp_TRV-2026-5521.pdf",
          "ocrSummary": "Baghdad International Airport entry stamp verified; permanent residency affidavit confirmed."
        },
        "income": {
          "title": "Income Assessment Deed & Employer Payroll Statement",
          "subtitle": "Ministry of Finance civil payroll assessment deed",
          "badge": "Income Statement",
          "issuer": "Ministry of Finance & Employer",
          "fileName": "Ministry_of_Finance_Salary_Audit_Sheet_INC-2026-3108.pdf",
          "ocrSummary": "Monthly income evaluated below state subsidy ceiling threshold."
        },
        "address": {
          "title": "Community Grid In-Person Residency Verification Deed",
          "subtitle": "Municipal neighborhood grid chief residency certificate and utility invoices",
          "badge": "Residency Verification",
          "issuer": "Provincial Administrative Council & Local Grid Division",
          "fileName": "Community_Grid_Residency_Verification_LOC-2026-7740.pdf",
          "ocrSummary": "On-site verification completed; applicant confirmed residing over 6 months continuously."
        },
        "update": {
          "title": "National Unified Card Correction Approval Letter",
          "subtitle": "Civil Status General Directorate archive correction decree",
          "badge": "Civil Archive Correction",
          "issuer": "Ministry of Interior Civil Status Directorate",
          "fileName": "Civil_Status_Record_Correction_Decree_UPD-2026-6219.pdf",
          "ocrSummary": "Civil profile corrections verified; identity status synchronised."
        },
        "duplicate": {
          "title": "Civil Registration Duplicate Cancellation Decree",
          "subtitle": "Court of Personal Status unique identity affidavit and duplicate cancellation",
          "badge": "Duplicate Cancellation",
          "issuer": "Supreme Judicial Council Court of Personal Status",
          "fileName": "Court_Decree_Cancelling_Duplicate_Card_DUP-2026-9041.pdf",
          "ocrSummary": "Judicial confirmation of unique identity; redundant registration deleted."
        },
        "temporary": {
          "title": "Order Lifting Temporary Ration Suspension",
          "subtitle": "Strategic Reserve Directorate temporary restriction termination notice",
          "badge": "Lifting Suspension Order",
          "issuer": "Ministry of Trade Grain Reserve Directorate",
          "fileName": "Notice_Lifting_Temporary_Suspension_TMP-2026-2810.pdf",
          "ocrSummary": "Temporary restriction cause resolved; full quota restoration instructed."
        },
        "location": {
          "title": "Geographic Residential Relocation & GPS Audit Deed",
          "subtitle": "Spatial coordinates verification and lease notarization",
          "badge": "Spatial Location Audit",
          "issuer": "Urban Planning Commission & Territorial Supply Division",
          "fileName": "GIS_Location_Audit_Deed_GEO-2026-6102.pdf",
          "ocrSummary": "GPS spatial coordinates confirmed within target distribution center zone."
        }
      }
    },
    "payment": {
      "defaultFeeTitle": "Statutory application fee",
      "processingDetails": "Channel: {channel} · Verification: {method} · Order: {order}",
      "clearanceVerified": "CBI electronic payment clearance verified",
      "pinIncomplete": "Enter the complete six-digit payment PIN.",
      "fallbackWallet": "E-wallet",
      "channels": {
        "qi": "Qi Card (Mastercard)",
        "zain": "ZainCash Wallet",
        "switch": "Switch CBI Gateway"
      },
      "verifyLabels": {
        "pin": "PIN-secured debit",
        "fingerprint": "Fingerprint-verified debit",
        "face": "Face-verified payment",
        "secure": "Secure online debit"
      }
    },
    "uploader": {
      "previewAuthority": "Republic of Iraq · Ministry of Trade / Justice / Health"
    },
    "citizen": {
      "stepBasicShort": "Basic",
      "stepVerifyShort": "Verify",
      "stepConfirmShort": "Confirm",
      "demoMemberName": "Omar Ahmed Hassan"
    },
    "citizenPurchase": {
      "orderSuccess": "Ration purchase and electronic payment succeeded! Your secure pickup code is {code}.",
      "orderError": "Order submission failed. Please try again."
    }
  },
  "ar": {
    "split": {
      "step1Name": "اختيار الأفراد",
      "step1Desc": "تحديد الأفراد المراد نقلهم إلى البطاقة الجديدة",
      "step2Name": "رفع وثائق الفصل",
      "step2Desc": "وثيقة الزواج وإثبات السكن",
      "step3Name": "تقييم الأهلية والمسار",
      "step3Desc": "فحص الشروط وتحديد التدقيق الآلي أو اليدوي",
      "step4Name": "الرسوم والدفع الإلكتروني",
      "step4Desc": "احتساب رسوم إصدار البطاقة البالغة 10,000 دينار",
      "step5Name": "المعالجة وتفعيل البطاقة",
      "step5Desc": "إصدار آلي أو تدقيق لدى الفرع",
      "currentCardNo": "رقم البطاقة التموينية الحالية:",
      "legalHeadName": "رب الأسرة القانوني:",
      "provinceDistrict": "المحافظة والقضاء:",
      "contractedAgent": "الوكيل المتعاقد:",
      "selectMembersTitle": "اختيار الأفراد المراد نقلهم إلى أسرة مستقلة",
      "selectedCount": "تم اختيار {count} فرد",
      "selected": "محدد للنقل",
      "notSelected": "يبقى على البطاقة",
      "marriageNotice": "إصدار بطاقة مستقلة يتطلب زوجين بعمر 14 عاماً فأكثر مع وثيقة زواج قانونية.",
      "marriageUploaderTitle": "وثيقة الزواج المدني (إلزامية)",
      "marriageUploaderSub": "وثيقة زواج رسمية من مجلس القضاء الأعلى أو محكمة الأحوال الشخصية",
      "otherUploaderTitle": "سند ملكية السكن أو عقد إيجار مصدّق (اختياري)",
      "otherUploaderSub": "إثبات سكن معتمد من وزارة الداخلية أو البلدية",
      "documentsTitle": "رفع وثائق الفصل القانونية، كل وثيقة على حدة",
      "requiredHint": "* مستند إلزامي قانوناً",
      "assessmentTitle": "تقييم أهلية الفصل ومسار المعاملة",
      "automaticPriority": "الفحص الآلي أولاً",
      "precheckStatus": "حالة فحص الأهلية الأولي",
      "ready": "جاهز ✓",
      "movingMembers": "عدد الأفراد المنقولين:",
      "peopleCount": "{count} فرد",
      "marriageEvidence": "وثيقة الزواج:",
      "uploadedVerified": "تم الرفع والتحقق ✓",
      "residenceEvidence": "إثبات السكن المستقل:",
      "supportingAttached": "أُرفق المستند المساند ✓",
      "residenceExempt": "معفى / اعتماد سكن رب الأسرة",
      "routingRulesTitle": "قواعد مسار المعاملة:",
      "routingRules": "بعد الدفع يفحص النظام الشروط آلياً. تُعتمد المعاملة وتُصدر بطاقة جديدة للزوجين ذوي الزواج القانوني الساري دون بطاقة تموينية فعالة أخرى. وتُحال المعاملات غير المطابقة إلى تدقيق يدوي من مرحلتين لدى الفرع.",
      "newHouseholdMembers": "الأفراد المقترح نقلهم إلى الأسرة المستقلة:",
      "paymentSummaryTitle": "مراجعة الطلب وإتمام الدفع الإلكتروني",
      "feeBadge": "الرسوم {amount}",
      "originalCardNo": "البطاقة التموينية الأصلية:",
      "originalHead": "رب الأسرة الأصلي:",
      "feeStandard": "رسوم فصل الأسرة:",
      "administrativeFee": "الرسوم الإدارية لفصل الأسرة وإصدار بطاقة تموينية إلكترونية مستقلة:",
      "iraqiDinar": "دينار عراقي",
      "paymentMethods": "الدفع عبر Qi Card وZainCash وSwitch باستخدام الرقم السري أو بصمة الإصبع أو الوجه.",
      "feeReady": "تم تأكيد الرسوم ✓",
      "payAndSubmitTitle": "الخطوة الأخيرة: الدفع الإلكتروني وتقديم الطلب",
      "payAndSubmitHint": "افتح بوابة الدفع واستخدم الرقم السري أو بصمة الإصبع أو الوجه. يبدأ فحص الأهلية وتوجيه المعاملة بعد إتمام الدفع.",
      "openCheckout": "فتح بوابة الدفع وإتمام السداد",
      "resultApproved": "تمت الموافقة الآلية على فصل الأسرة!",
      "resultManualReview": "لم يجتز الطلب الفحص الآلي ويلزم تدقيق الفرع",
      "resultSuccessDescription": "صدرت البطاقة التموينية المستقلة {cardNo} مع حصة منفصلة للأفراد المنقولين.",
      "receiptTitle": "إيصال فصل الأسرة وإصدار البطاقة",
      "cardActivated": "تم تفعيل البطاقة الجديدة",
      "branchReview": "تدقيق الفرع",
      "referenceNo": "رقم المعاملة:",
      "newCardNo": "رقم البطاقة الجديدة:",
      "documentFee": "رسوم المستندات:",
      "feePaid": "{amount} (مسدد)",
      "processingMode": "طريقة المعالجة:",
      "automaticApproval": "موافقة آلية",
      "twoTierReview": "تدقيق يدوي من مرحلتين لدى الفرع",
      "returnToCard": "العودة إلى بطاقتي التموينية",
      "adjustMembers": "تعديل اختيار الأفراد",
      "paymentTitle": "رسوم فصل الأسرة وإصدار بطاقة تموينية مستقلة",
      "errorSelectMembers": "اختر الأفراد المراد نقلهم إلى الأسرة الجديدة.",
      "errorMarriageDocument": "ارفع وثيقة الزواج الإلزامية أو وثيقة قانونية معادلة.",
      "manualReviewAvailable": "لم يجتز الطلب الفحص الآلي. يمكنك إرساله إلى تدقيق الفرع.",
      "reviewSubmitted": "أُرسل الطلب إلى التدقيق الإلكتروني من مرحلتين لدى الفرع.",
      "singleMemberReason": "تم اختيار فرد واحد فقط، لذلك لا تتحقق شروط الفحص الآلي للزوجين ويلزم تدقيق يدوي.",
      "nonCoupleReason": "الأفراد المحددون لا يطابقون شروط الفحص الآلي للزوجين، ويلزم تدقيق يدوي.",
      "relations": {
        "head": "رب الأسرة",
        "spouse": "زوج / زوجة",
        "child": "ابن / ابنة",
        "father": "الأب",
        "mother": "الأم",
        "dependent": "فرد معال"
      },
      "genders": {
        "male": "ذكر",
        "female": "أنثى"
      },
      "documents": {
        "marriage": {
          "title": "1. وثيقة الزواج أو وثيقة قانونية معادلة",
          "subtitle": "وثيقة زواج مدني أو حكم صادر عن مجلس القضاء الأعلى لإثبات العلاقة الزوجية القانونية.",
          "badge": "وثيقة زواج / حكم قضائي",
          "issuer": "مجلس القضاء الأعلى · محكمة الكرخ المدنية",
          "fileName": "وثيقة_الزواج_وفصل_الأسرة_MC-2026-BAG-09921.pdf",
          "ocrSummary": "تم التحقق من ختم وثيقة الزواج وهوية الزوجين ومطابقة متطلبات فصل الأسرة."
        },
        "residence": {
          "title": "2. وثائق ثبوتية مساندة أخرى",
          "subtitle": "سند ملكية أو عقد إيجار أو كشف حساب خدمات أو شهادة سكن من المجتمع المحلي، اختيارياً.",
          "badge": "ملكية السكن / عقد إيجار / مستندات مساندة",
          "issuer": "هيئة التخطيط البلدي ودائرة التسجيل العقاري",
          "fileName": "سند_السكن_المستقل_وعقد_الإيجار_ADD-2026-7810.pdf",
          "ocrSummary": "تم التحقق من عقد الإيجار وحساب الكهرباء المستقل وتأكيد شروط السكن الدائم المستقل."
        }
      }
    },
    "unfreeze": {
      "resolutionBadge": "اعتراض بموجب القرار 140",
      "caseCommercial": "1. نشاط تجاري (شطب السجل أو براءة الذمة الضريبية)",
      "caseTravel": "2. سفر (ختم العودة إلى العراق وإثبات الاستقرار)",
      "caseHighIncome": "3. دخل مرتفع (بيان دخل حديث من جهة العمل أو الضرائب)",
      "caseUnknownAddress": "4. عنوان غير معروف (شهادة سكن من الإدارة المحلية)",
      "caseUpdate": "5. تحديث البيانات (وثيقة تصحيح البطاقة الوطنية الموحدة)",
      "caseDuplicate": "6. قيد مكرر (قرار تثبيت الهوية وإلغاء القيد المكرر)",
      "caseTemporary": "7. قيد مؤقت (أمر رسمي برفع التقييد)",
      "caseGeoLocation": "8. موقع جغرافي (إثبات سكن مصدّق وتحقق ميداني من الموقع)",
      "statementPlaceholder": "اشرح بالتفصيل أسباب طلب رفع التجميد…",
      "reviewNoticeTitle": "إرشادات التدقيق:",
      "reviewNoticeText": "يُحال هذا الاعتراض إلى منصة التدقيق، وتُستعاد الاستحقاقات التموينية بعد الموافقة على مرحلتي التدقيق.",
      "paymentTitle": "رسوم طلب رفع تجميد البطاقة التموينية ({type})",
      "errorUploadProof": "يرجى رفع وثائق إثبات رفع التجميد الإلزامية.",
      "errorInputStatement": "يرجى تقديم شرح مفصل لأسباب الاعتراض.",
      "submitSuccess": "تم تقديم الاعتراض وإحالته إلى منصة التدقيق.",
      "caseNames": {
        "commercial": "نشاط تجاري",
        "travel": "سفر",
        "income": "دخل مرتفع",
        "address": "عنوان غير معروف",
        "update": "تحديث البيانات",
        "duplicate": "قيد مكرر",
        "temporary": "قيد مؤقت",
        "location": "الموقع الجغرافي"
      },
      "documents": {
        "commercial": {
          "title": "شهادة شطب السجل التجاري وبراءة الذمة الضريبية",
          "subtitle": "وثيقة شطب السجل من وزارة التجارة وشهادة براءة الذمة من دائرة الضرائب",
          "badge": "شطب تجاري وبراءة ذمة ضريبية",
          "issuer": "دائرة تسجيل الشركات بوزارة التجارة والهيئة العامة للضرائب",
          "fileName": "شطب_السجل_وبراءة_الذمة_COM-2026-0914.pdf",
          "ocrSummary": "تم التحقق من شطب السجل التجاري وتسوية الضرائب وبراءة الذمة لاستعادة الاستحقاق التمويني."
        },
        "travel": {
          "title": "ختم الدخول وإقرار العودة الدائمة",
          "subtitle": "ختم الدخول في جواز السفر وإثبات الاستقرار الدائم داخل العراق",
          "badge": "دخول حدودي وإقامة دائمة",
          "issuer": "مديرية الإقامة والحدود بوزارة الداخلية",
          "fileName": "ختم_الدخول_وإقرار_العودة_TRV-2026-5521.pdf",
          "ocrSummary": "تم التحقق من ختم دخول مطار بغداد الدولي وصحة إقرار الإقامة الدائمة."
        },
        "income": {
          "title": "بيان تقييم الدخل وشهادة راتب جهة العمل",
          "subtitle": "بيان تدقيق الرواتب المعتمد من وزارة المالية",
          "badge": "بيان الدخل والراتب",
          "issuer": "وزارة المالية وجهة العمل",
          "fileName": "بيان_تدقيق_الراتب_INC-2026-3108.pdf",
          "ocrSummary": "الدخل الشهري المحقق أقل من سقف استحقاق الدعم الحكومي."
        },
        "address": {
          "title": "شهادة التحقق الميداني من السكن",
          "subtitle": "شهادة سكن من المختار مع فواتير الخدمات",
          "badge": "التحقق من عنوان السكن",
          "issuer": "المجلس الإداري للمحافظة والإدارة المحلية",
          "fileName": "شهادة_التحقق_من_السكن_LOC-2026-7740.pdf",
          "ocrSummary": "تم التحقق ميدانياً من العنوان وتأكيد الإقامة المستمرة لأكثر من ستة أشهر."
        },
        "update": {
          "title": "قرار تصحيح بيانات البطاقة الوطنية الموحدة",
          "subtitle": "قرار تصحيح السجل الصادر عن مديرية الأحوال المدنية",
          "badge": "تصحيح السجل المدني",
          "issuer": "مديرية الأحوال المدنية بوزارة الداخلية",
          "fileName": "قرار_تصحيح_السجل_UPD-2026-6219.pdf",
          "ocrSummary": "تمت مطابقة تصحيح البيانات المدنية وتحديث حالة الهوية في النظام."
        },
        "duplicate": {
          "title": "قرار إلغاء القيد المكرر وتثبيت الهوية",
          "subtitle": "قرار محكمة الأحوال الشخصية بشأن القيد القانوني الوحيد",
          "badge": "إلغاء القيد المكرر",
          "issuer": "مجلس القضاء الأعلى · محكمة الأحوال الشخصية",
          "fileName": "قرار_إلغاء_القيد_المكرر_DUP-2026-9041.pdf",
          "ocrSummary": "ثبتت الهوية القانونية الوحيدة وأُلغي التسجيل المكرر بموجب القرار القضائي."
        },
        "temporary": {
          "title": "أمر رفع الإيقاف التمويني المؤقت",
          "subtitle": "إشعار إنهاء التقييد المؤقت من مديرية الاحتياط الغذائي",
          "badge": "أمر رفع الإيقاف",
          "issuer": "مديرية الاحتياط الغذائي بوزارة التجارة",
          "fileName": "أمر_رفع_الإيقاف_المؤقت_TMP-2026-2810.pdf",
          "ocrSummary": "زالت أسباب التقييد المؤقت وصدر أمر باستعادة الحصة التموينية كاملة."
        },
        "location": {
          "title": "وثيقة السكن وتدقيق الإحداثيات الجغرافية",
          "subtitle": "التحقق من إحداثيات السكن مع عقد إيجار مصدّق",
          "badge": "تدقيق الموقع الجغرافي",
          "issuer": "هيئة التخطيط العمراني وفرع التموين المحلي",
          "fileName": "وثيقة_تدقيق_الموقع_GEO-2026-6102.pdf",
          "ocrSummary": "تم التحقق من إحداثيات السكن ووقوعه ضمن نطاق خدمة مركز التموين المحدد."
        }
      }
    },
    "payment": {
      "defaultFeeTitle": "رسوم المعاملة القانونية",
      "processingDetails": "القناة: {channel} · التحقق: {method} · رقم الطلب: {order}",
      "clearanceVerified": "تم التحقق من مقاصة الدفع الإلكتروني لدى البنك المركزي",
      "pinIncomplete": "أدخل الرقم السري للدفع المكوّن من ستة أرقام كاملاً.",
      "fallbackWallet": "محفظة إلكترونية",
      "channels": {
        "qi": "Qi Card (ماستركارد)",
        "zain": "محفظة ZainCash",
        "switch": "بوابة Switch للبنك المركزي"
      },
      "verifyLabels": {
        "pin": "خصم مؤمّن بالرقم السري",
        "fingerprint": "خصم موثّق ببصمة الإصبع",
        "face": "دفع موثّق بالوجه",
        "secure": "خصم إلكتروني آمن"
      }
    },
    "uploader": {
      "previewAuthority": "جمهورية العراق · وزارة التجارة / وزارة العدل / وزارة الصحة",
      "btnReupload": "استبدال",
      "btnReloadTemplate": "نموذج",
      "btnPreview": "معاينة",
      "btnDelete": "حذف"
    },
    "citizen": {
      "stepBasicShort": "البيانات",
      "stepVerifyShort": "التحقق",
      "stepConfirmShort": "التأكيد",
      "demoMemberName": "عمر أحمد حسن"
    },
    "citizenPurchase": {
      "orderSuccess": "تم شراء المواد التموينية وإتمام الدفع الإلكتروني بنجاح! رمز الاستلام الآمن الخاص بك هو: {code}",
      "orderError": "تعذر تقديم الطلب. يرجى المحاولة مرة أخرى."
    }
  },
  "ckb": {
    "split": {
      "step1Name": "هەڵبژاردنی ئەندامان",
      "step1Desc": "دیاریکردنی ئەندامانی گوازراوە بۆ کارتی نوێ",
      "step2Name": "بارکردنی بەڵگەنامەکان",
      "step2Desc": "بەڵگەی هاوسەرگیری و نیشتەجێبوون",
      "step3Name": "هەڵسەنگاندن و ڕێڕەو",
      "step3Desc": "پشکنینی مەرجەکان و دیاریکردنی پشکنینی خۆکار یان دەستی",
      "step4Name": "رسووم و پارەدانی ئەلیکترۆنی",
      "step4Desc": "هەژمارکردنی رسوومی دەرکردنی کارت بە 10,000 دینار",
      "step5Name": "چارەسەرکردن و چالاککردنی کارت",
      "step5Desc": "دەرکردنی خۆکار یان پشکنینی لق",
      "currentCardNo": "ژمارەی کارتی خۆراکی ئێستا:",
      "legalHeadName": "سەرۆکی یاسایی خێزان:",
      "provinceDistrict": "پارێزگا و قەزا:",
      "contractedAgent": "بریکاری گرێبەستکراو:",
      "selectMembersTitle": "هەڵبژاردنی ئەندامانی گوازراوە بۆ خێزانی سەربەخۆ",
      "selectedCount": "{count} ئەندام هەڵبژێردراوە",
      "selected": "هەڵبژێردراو بۆ گواستنەوە",
      "notSelected": "لە کارتەکە دەمێنێتەوە",
      "marriageNotice": "کارتی سەربەخۆ پێویستی بە هاوسەری یاسایی تەمەن 14 ساڵ و سەرووتر و بەڵگەی هاوسەرگیری هەیە.",
      "marriageUploaderTitle": "بەڵگەی هاوسەرگیری شارستانی (پێویستە)",
      "marriageUploaderSub": "بەڵگەی فەرمی ئەنجومەنی باڵای دادوەری یان دادگای باری کەسی",
      "otherUploaderTitle": "بەڵگەی خاوەندارێتی خانوو یان گرێبەستی کرێی پەسەندکراو (ئارەزوومەندانە)",
      "otherUploaderSub": "بەڵگەی نیشتەجێبوونی پەسەندکراوی وەزارەتی ناوخۆ یان شارەوانی",
      "documentsTitle": "بارکردنی بەڵگەنامە یاساییەکانی جیاکردنەوە بە جیاوازی",
      "requiredHint": "* بەڵگەی پێویستی یاسایی",
      "assessmentTitle": "هەڵسەنگاندنی شایستەیی جیاکردنەوە و ڕێڕەوی داواکاری",
      "automaticPriority": "یەکەم پشکنینی خۆکار",
      "precheckStatus": "دۆخی پشکنینی سەرەتایی",
      "ready": "ئامادەیە ✓",
      "movingMembers": "ژمارەی ئەندامانی گوازراوە:",
      "peopleCount": "{count} ئەندام",
      "marriageEvidence": "بەڵگەی هاوسەرگیری:",
      "uploadedVerified": "بارکرا و پشتڕاست کرایەوە ✓",
      "residenceEvidence": "بەڵگەی نیشتەجێبوونی سەربەخۆ:",
      "supportingAttached": "بەڵگەی یارمەتیدەر هاوپێچکرا ✓",
      "residenceExempt": "لێخۆشبوو / ناونیشانی سەرۆکی خێزان",
      "routingRulesTitle": "ڕێساکانی ڕێڕەوی داواکاری:",
      "routingRules": "دوای پارەدان سیستەم مەرجەکان خۆکار دەپشکنێت. بۆ هاوسەری یاسایی کە کارتی خۆراکی چالاکی تریان نییە، داواکاری خۆکار پەسەند دەکرێت و کارتی نوێ دەردەکرێت. داواکارییەکانی تر بۆ پشکنینی دەستی دوو قۆناغی لق دەنێردرێن.",
      "newHouseholdMembers": "ئەندامانی پێشنیارکراو بۆ خێزانی سەربەخۆ:",
      "paymentSummaryTitle": "پێداچوونەوەی داواکاری و تەواوکردنی پارەدان",
      "feeBadge": "رسووم {amount}",
      "originalCardNo": "کارتی خۆراکی ڕەسەن:",
      "originalHead": "سەرۆکی خێزانی ڕەسەن:",
      "feeStandard": "رسوومی جیاکردنەوەی خێزان:",
      "administrativeFee": "رسوومی کارگێڕی بۆ جیاکردنەوەی خێزان و دەرکردنی کارتی خۆراکی سەربەخۆ:",
      "iraqiDinar": "دیناری عێراقی",
      "paymentMethods": "پارەدان بە Qi Card و ZainCash و Switch بە ژمارەی نهێنی، پەنجەمۆر یان ناسینەوەی ڕووخسار.",
      "feeReady": "رسووم پشتڕاست کرایەوە ✓",
      "payAndSubmitTitle": "قۆناغی کۆتایی: پارەدان و ناردنی داواکاری",
      "payAndSubmitHint": "دەروازەی پارەدان بکەرەوە و بە ژمارەی نهێنی، پەنجەمۆر یان ڕووخسار پارە بدە. دوای پارەدان پشکنینی شایستەیی و ڕێڕەوی داواکاری دەست پێدەکات.",
      "openCheckout": "کردنەوەی دەروازە و تەواوکردنی پارەدان",
      "resultApproved": "جیاکردنەوەی خێزان خۆکار پەسەندکرا!",
      "resultManualReview": "پشکنینی خۆکار سەرکەوتوو نەبوو؛ پشکنینی لق پێویستە",
      "resultSuccessDescription": "کارتی خۆراکی سەربەخۆی {cardNo} بۆ ئەندامانی گوازراوە بە بەشەخۆراکی جیاواز دەرکرا.",
      "receiptTitle": "پسوولەی جیاکردنەوەی خێزان و دەرکردنی کارت",
      "cardActivated": "کارتی نوێ چالاککرا",
      "branchReview": "پشکنینی لق",
      "referenceNo": "ژمارەی داواکاری:",
      "newCardNo": "ژمارەی کارتی نوێ:",
      "documentFee": "رسوومی بەڵگەنامە:",
      "feePaid": "{amount} (دراوە)",
      "processingMode": "شێوازی چارەسەرکردن:",
      "automaticApproval": "پەسەندکردنی خۆکار",
      "twoTierReview": "پشکنینی دەستی دوو قۆناغی لق",
      "returnToCard": "گەڕانەوە بۆ کارتی خۆراکەکەم",
      "adjustMembers": "گۆڕینی هەڵبژاردنی ئەندامان",
      "paymentTitle": "رسوومی جیاکردنەوەی خێزان و دەرکردنی کارتی سەربەخۆ",
      "errorSelectMembers": "ئەندامانی گوازراوە بۆ خێزانی نوێ هەڵبژێرە.",
      "errorMarriageDocument": "بەڵگەی پێویستی هاوسەرگیری یان بەڵگەی یاسایی هاوتا باربکە.",
      "manualReviewAvailable": "پشکنینی خۆکار سەرکەوتوو نەبوو. دەتوانیت داواکاری بۆ پشکنینی لق بنێریت.",
      "reviewSubmitted": "نێردرا بۆ پشکنینی ئەلیکترۆنی دوو قۆناغی لق.",
      "singleMemberReason": "تەنها یەک ئەندام هەڵبژێردراوە؛ مەرجەکانی پشکنینی خۆکاری هاوسەران تێدا نییە و پشکنینی دەستی پێویستە.",
      "nonCoupleReason": "ئەندامە هەڵبژێردراوەکان مەرجەکانی پشکنینی خۆکاری هاوسەران تێدا نییە و پشکنینی دەستی پێویستە.",
      "relations": {
        "head": "سەرۆکی خێزان",
        "spouse": "هاوسەر",
        "child": "منداڵ",
        "father": "باوک",
        "mother": "دایک",
        "dependent": "کەسی بەخێوکراو"
      },
      "genders": {
        "male": "نێر",
        "female": "مێ"
      },
      "documents": {
        "marriage": {
          "title": "1. بەڵگەی هاوسەرگیری یان بەڵگەی یاسایی هاوتا",
          "subtitle": "بەڵگەی هاوسەرگیری شارستانی یان بڕیاری دادگای ئەنجومەنی باڵای دادوەری بۆ سەلماندنی پەیوەندی هاوسەری.",
          "badge": "بەڵگەی هاوسەرگیری / بڕیاری دادگا",
          "issuer": "ئەنجومەنی باڵای دادوەری · دادگای شارستانی کەرخ",
          "fileName": "بەڵگەی_هاوسەرگیری_و_جیاکردنەوە_MC-2026-BAG-09921.pdf",
          "ocrSummary": "مۆری هاوسەرگیری و ناسنامەی هاوسەران پشتڕاست کرایەوە و مەرجەکانی جیاکردنەوەی خێزان تێدایە."
        },
        "residence": {
          "title": "2. بەڵگەنامەی یارمەتیدەری تر",
          "subtitle": "بە ئارەزوو بەڵگەی خاوەندارێتی، گرێبەستی کرێ، پسوولەی خزمەتگوزاری یان بەڵگەی نیشتەجێبوون بنێرە.",
          "badge": "خاوەندارێتی خانوو / کرێ / بەڵگەی یارمەتیدەر",
          "issuer": "لیژنەی پلانی شارەوانی و بەڕێوەبەرایەتی تۆماری خانووبەرە",
          "fileName": "بەڵگەی_نیشتەجێبوونی_سەربەخۆ_و_کرێ_ADD-2026-7810.pdf",
          "ocrSummary": "گرێبەستی کرێ و هەژماری سەربەخۆی کارەبا پشتڕاست کرایەوە؛ مەرجی نیشتەجێبوونی هەمیشەیی تێدایە."
        }
      }
    },
    "unfreeze": {
      "resolutionBadge": "ناڕەزایی بەپێی بڕیاری 140",
      "caseCommercial": "1. بازرگانی (سڕینەوەی تۆمار یان پاکتاوی باج)",
      "caseTravel": "2. گەشت (مۆری گەڕانەوە و بەڵگەی نیشتەجێبوون)",
      "caseHighIncome": "3. داهاتی بەرز (بەڵگەی نوێی داهات لە خاوەنکار یان باج)",
      "caseUnknownAddress": "4. ناونیشانی نەزانراو (بەڵگەی نیشتەجێبوونی گەڕەک)",
      "caseUpdate": "5. نوێکردنەوەی زانیاری (بەڵگەی ڕاستکردنەوەی کارتی نیشتمانی)",
      "caseDuplicate": "6. تۆماری دووبارە (بڕیاری ناسنامەی تاک و سڕینەوەی دووبارە)",
      "caseTemporary": "7. بەستنی کاتی (فەرمانی فەرمی هەڵگرتنی بەستن)",
      "caseGeoLocation": "8. شوێنی جوگرافی (بەڵگەی سەلمێنراوی نیشتەجێبوون و پشکنینی شوێن)",
      "statementPlaceholder": "هۆکارەکانی داواکاری هەڵوەشاندنەوەی بەستن بە وردی بنووسە…",
      "reviewNoticeTitle": "ڕێنمایی پشکنین:",
      "reviewNoticeText": "ئەم ناڕەزاییە دەنێردرێت بۆ مێزی پشکنین. دوای پەسەندکردنی هەردوو قۆناغەکە، شایستەیی بەشەخۆراک دەگەڕێندرێتەوە.",
      "paymentTitle": "رسوومی داواکاری هەڵوەشاندنەوەی بەستنی کارت ({type})",
      "errorUploadProof": "تکایە بەڵگەنامە پێویستەکانی هەڵوەشاندنەوەی بەستن باربکە.",
      "errorInputStatement": "تکایە هۆکارەکانی ناڕەزاییەکە بە وردی بنووسە.",
      "submitSuccess": "ناڕەزاییەکە نێردرا بۆ مێزی پشکنین.",
      "caseNames": {
        "commercial": "بازرگانی",
        "travel": "گەشت",
        "income": "داهاتی بەرز",
        "address": "ناونیشانی نەزانراو",
        "update": "نوێکردنەوەی زانیاری",
        "duplicate": "تۆماری دووبارە",
        "temporary": "بەستنی کاتی",
        "location": "شوێنی جوگرافی"
      },
      "documents": {
        "commercial": {
          "title": "بەڵگەی سڕینەوەی تۆماری بازرگانی و پاکتاوی باج",
          "subtitle": "بەڵگەی سڕینەوەی تۆمار لە وەزارەتی بازرگانی و پاکتاوی باج",
          "badge": "سڕینەوەی بازرگانی و پاکتاوی باج",
          "issuer": "بەڕێوەبەرایەتی تۆماری کۆمپانیاکان و دەستەی گشتی باج",
          "fileName": "سڕینەوەی_تۆمار_و_پاکتاوی_باج_COM-2026-0914.pdf",
          "ocrSummary": "سڕینەوەی تۆماری بازرگانی و پاکتاوی باج بۆ گەڕاندنەوەی بەشەخۆراک پشتڕاست کرایەوە."
        },
        "travel": {
          "title": "مۆری چوونەژوورەوە و بەڵێننامەی گەڕانەوەی هەمیشەیی",
          "subtitle": "مۆری پاسپۆرت و بەڵگەی نیشتەجێبوونی هەمیشەیی لە عێراق",
          "badge": "چوونەژوورەوە و نیشتەجێبوونی هەمیشەیی",
          "issuer": "بەڕێوەبەرایەتی نیشتەجێبوون و سنوورەکانی وەزارەتی ناوخۆ",
          "fileName": "مۆری_چوونەژوورەوە_و_گەڕانەوە_TRV-2026-5521.pdf",
          "ocrSummary": "مۆری فڕۆکەخانەی نێودەوڵەتی بەغدا و بەڵێننامەی نیشتەجێبوونی هەمیشەیی پشتڕاست کرایەوە."
        },
        "income": {
          "title": "بەڵگەی هەڵسەنگاندنی داهات و مووچەی خاوەنکار",
          "subtitle": "بەڵگەی پشکنینی مووچەی پەسەندکراوی وەزارەتی دارایی",
          "badge": "بەڵگەی داهات و مووچە",
          "issuer": "وەزارەتی دارایی و خاوەنکار",
          "fileName": "بەڵگەی_پشکنینی_مووچە_INC-2026-3108.pdf",
          "ocrSummary": "داهاتی مانگانە لەژێر سنووری شایستەیی پشتیوانی دەوڵەتدایە."
        },
        "address": {
          "title": "بەڵگەی پشکنینی مەیدانی نیشتەجێبوون",
          "subtitle": "بەڵگەی نیشتەجێبوونی گەڕەک و پسوولەی خزمەتگوزاری",
          "badge": "پشکنینی ناونیشانی نیشتەجێبوون",
          "issuer": "ئەنجومەنی کارگێڕی پارێزگا و بەڕێوەبەرایەتی ناوخۆیی",
          "fileName": "بەڵگەی_پشکنینی_نیشتەجێبوون_LOC-2026-7740.pdf",
          "ocrSummary": "ناونیشان لە مەیدان پشتڕاست کرایەوە و نیشتەجێبوونی بەردەوام بۆ زیاتر لە شەش مانگ سەلمێنرا."
        },
        "update": {
          "title": "بڕیاری ڕاستکردنەوەی زانیاری کارتی نیشتمانی یەکگرتوو",
          "subtitle": "بڕیاری ڕاستکردنەوەی تۆمار لە بەڕێوەبەرایەتی باری شارستانی",
          "badge": "ڕاستکردنەوەی تۆماری شارستانی",
          "issuer": "بەڕێوەبەرایەتی باری شارستانی وەزارەتی ناوخۆ",
          "fileName": "بڕیاری_ڕاستکردنەوەی_تۆمار_UPD-2026-6219.pdf",
          "ocrSummary": "ڕاستکردنەوەی زانیاری شارستانی و نوێکردنەوەی دۆخی ناسنامە پشتڕاست کرایەوە."
        },
        "duplicate": {
          "title": "بڕیاری سڕینەوەی تۆماری دووبارە و سەلماندنی ناسنامە",
          "subtitle": "بڕیاری دادگای باری کەسی بۆ ناسنامەی یاسایی تاک",
          "badge": "سڕینەوەی تۆماری دووبارە",
          "issuer": "ئەنجومەنی باڵای دادوەری · دادگای باری کەسی",
          "fileName": "بڕیاری_سڕینەوەی_دووبارە_DUP-2026-9041.pdf",
          "ocrSummary": "ناسنامەی یاسایی تاک سەلمێنرا و تۆماری دووبارە بەپێی بڕیاری دادگا سڕایەوە."
        },
        "temporary": {
          "title": "فەرمانی هەڵگرتنی بەستنی کاتی بەشەخۆراک",
          "subtitle": "ئاگادارکردنەوەی کۆتاییهێنان بە بەستنی کاتی لە بەڕێوەبەرایەتی یەدەگی خۆراک",
          "badge": "فەرمانی هەڵگرتنی بەستن",
          "issuer": "بەڕێوەبەرایەتی یەدەگی خۆراکی وەزارەتی بازرگانی",
          "fileName": "فەرمانی_هەڵگرتنی_بەستنی_کاتی_TMP-2026-2810.pdf",
          "ocrSummary": "هۆکارەکانی بەستنی کاتی چارەسەر کراون و فەرمانی گەڕاندنەوەی تەواوی بەشەخۆراک دەرچووە."
        },
        "location": {
          "title": "بەڵگەی نیشتەجێبوون و پشکنینی شوێنی جوگرافی",
          "subtitle": "پشکنینی کۆئۆردیناتی نیشتەجێبوون و گرێبەستی کرێی پەسەندکراو",
          "badge": "پشکنینی شوێنی جوگرافی",
          "issuer": "دەستەی پلانی شار و لقی خۆراکی ناوخۆیی",
          "fileName": "بەڵگەی_پشکنینی_شوێن_GEO-2026-6102.pdf",
          "ocrSummary": "کۆئۆردیناتی نیشتەجێبوون لە ناوچەی خزمەتگوزاری ناوەندی خۆراکدا پشتڕاست کرایەوە."
        }
      }
    },
    "payment": {
      "defaultFeeTitle": "رسوومی داواکاری یاسایی",
      "processingDetails": "کەناڵ: {channel} · پشتڕاستکردنەوە: {method} · داواکاری: {order}",
      "clearanceVerified": "پاکتاوی پارەدانی ئەلیکترۆنی لە بانکی ناوەندی پشتڕاست کرایەوە",
      "pinIncomplete": "ژمارەی نهێنی پارەدان بە شەش ژمارە بە تەواوی بنووسە.",
      "fallbackWallet": "جزدانی ئەلیکترۆنی",
      "channels": {
        "qi": "Qi Card (ماستەرکارد)",
        "zain": "جزدانی ZainCash",
        "switch": "دەروازەی Switchی بانکی ناوەندی"
      },
      "verifyLabels": {
        "pin": "لێبڕین بە ژمارەی نهێنی",
        "fingerprint": "لێبڕینی پشتڕاستکراو بە پەنجەمۆر",
        "face": "پارەدانی پشتڕاستکراو بە ڕووخسار",
        "secure": "لێبڕینی ئەلیکترۆنی پارێزراو"
      }
    },
    "uploader": {
      "previewAuthority": "کۆماری عێراق · وەزارەتی بازرگانی / داد / تەندروستی",
      "btnReupload": "گۆڕین",
      "btnReloadTemplate": "نموونە",
      "btnPreview": "بینین",
      "btnDelete": "سڕینەوە"
    },
    "citizen": {
      "stepBasicShort": "زانیاری",
      "stepVerifyShort": "پشکنین",
      "stepConfirmShort": "پەسەند",
      "demoMemberName": "عومەر ئەحمەد حەسەن"
    },
    "citizenPurchase": {
      "orderSuccess": "کڕینی بەشەخۆراک و پارەدانی ئەلیکترۆنی بە سەرکەوتوویی تەواو بوو! کۆدی پارێزراوی وەرگرتن: {code}",
      "orderError": "نەتوانرا داواکارییەکە بنێردرێت. تکایە دووبارە هەوڵ بدەرەوە."
    }
  }
};
