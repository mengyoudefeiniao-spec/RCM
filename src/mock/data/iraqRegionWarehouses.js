/**
 * 伊拉克全国 19 个省份、300 多个城市/行政区、600 个配给储备仓库与中心数据库
 * 契合 Spring Cloud 微服务体系 (UNICODE / SCM / BPM)
 * 严格包含伊拉克宪法第 140 号决议重点管辖省份与中心标识
 */

// 1. 伊拉克完整 19 个行政省份清单定义 (含第 140 号决议属性)
export const IRAQ_19_PROVINCES = [
  { id: 'BAG', name: '巴格达省', enName: 'Baghdad', isArticle140: false, note: '首都直辖行政区', cityBaseName: '巴格达', citiesCount: 22, centerCount: 52 },
  { id: 'BAS', name: '巴士拉省', enName: 'Basra', isArticle140: false, note: '南部经济中心与港口枢纽', cityBaseName: '巴士拉', citiesCount: 16, centerCount: 38 },
  { id: 'NIN', name: '尼尼微省', enName: 'Nineveh', isArticle140: true, note: '第140号决议重点管辖区 (辛贾尔/祖马尔/泰勒阿费尔等)', cityBaseName: '摩苏尔', citiesCount: 22, centerCount: 46 },
  { id: 'KIR', name: '基尔库克省', enName: 'Kirkuk', isArticle140: true, note: '第140号决议全境重点特别管辖', cityBaseName: '基尔库克', citiesCount: 16, centerCount: 36 },
  { id: 'DIY', name: '迪亚拉省', enName: 'Diyala', isArticle140: true, note: '第140号决议重点管辖区 (哈奈根/贾劳拉/萨阿迪耶/曼德利等)', cityBaseName: '巴古拜', citiesCount: 16, centerCount: 34 },
  { id: 'ANB', name: '安巴尔省', enName: 'Anbar', isArticle140: false, note: '西部边境及幼发拉底河流域', cityBaseName: '拉马迪', citiesCount: 16, centerCount: 32 },
  { id: 'BAB', name: '巴比伦省', enName: 'Babil', isArticle140: false, note: '中部平原与历史名城', cityBaseName: '希拉', citiesCount: 15, centerCount: 30 },
  { id: 'KAR', name: '卡尔巴拉省', enName: 'Karbala', isArticle140: false, note: '中部文化与朝圣重镇', cityBaseName: '卡尔巴拉', citiesCount: 12, centerCount: 24 },
  { id: 'NAJ', name: '纳杰夫省', enName: 'Najaf', isArticle140: false, note: '中部重要枢纽', cityBaseName: '纳杰夫', citiesCount: 14, centerCount: 26 },
  { id: 'QAD', name: '卡迪西亚省', enName: 'Al-Qadisiyyah', isArticle140: false, note: '美索不达米亚腹地粮食主产区', cityBaseName: '迪瓦尼耶', citiesCount: 14, centerCount: 26 },
  { id: 'MUT', name: '穆萨纳省', enName: 'Al-Muthanna', isArticle140: false, note: '南部边陲与农牧保障区', cityBaseName: '萨马沃', citiesCount: 12, centerCount: 22 },
  { id: 'DHQ', name: '济加尔省', enName: 'Dhi Qar', isArticle140: false, note: '沼泽湿地与底格里斯-幼发拉底汇流区', cityBaseName: '纳西里耶', citiesCount: 18, centerCount: 34 },
  { id: 'MAY', name: '米桑省', enName: 'Maysan', isArticle140: false, note: '东南部粮油物资供应通道', cityBaseName: '阿马拉', citiesCount: 14, centerCount: 26 },
  { id: 'WAS', name: '瓦西特省', enName: 'Wasit', isArticle140: false, note: '东部农业核心重镇', cityBaseName: '库特', citiesCount: 15, centerCount: 28 },
  { id: 'SAL', name: '萨拉赫丁省', enName: 'Salah al-Din', isArticle140: true, note: '含第140号决议区 (图兹霍尔马图特别行政区)', cityBaseName: '提克里特', citiesCount: 16, centerCount: 32 },
  { id: 'ERB', name: '埃尔比勒省', enName: 'Erbil', isArticle140: false, note: '北部自治区首府与北部仓储走廊', cityBaseName: '埃尔比勒', citiesCount: 18, centerCount: 34 },
  { id: 'SUL', name: '苏莱曼尼亚省', enName: 'Sulaymaniyah', isArticle140: true, note: '含第140号决议区 (加尔米安/基夫里/卡拉尔等)', cityBaseName: '苏莱曼尼亚', citiesCount: 18, centerCount: 34 },
  { id: 'DOH', name: '杜胡克省', enName: 'Dohuk', isArticle140: true, note: '含第140号决议区 (阿克拉/拜尔达拉什等)', cityBaseName: '杜胡克', citiesCount: 16, centerCount: 30 },
  { id: 'HAL', name: '哈拉卜贾省', enName: 'Halabja', isArticle140: false, note: '伊拉克第19行政省 (2014年设立)', cityBaseName: '哈拉卜贾', citiesCount: 10, centerCount: 16 }
];

// 2. 伊拉克 19 省对应的 300+ 个重点城市/行政市区完整字典
export const IRAQ_PROVINCE_CITIES = {
  '巴格达省': [
    '卡尔赫区 (Al-Karkh)', '鲁萨法区 (Al-Rusafa)', '曼苏尔 (Al-Mansour)', '卡达米亚 (Kadhimiya)', '阿达米亚 (Adhamiyah)',
    '萨德尔城第一区 (Sadr City 1)', '萨德尔城第二区 (Sadr City 2)', '卡拉达 (Karrada)', '多拉区 (Al-Dora)', '马哈茂迪耶 (Mahmoudiyah)',
    '阿布格莱卜 (Abu Ghraib)', '塔吉 (Al-Taji)', '塔尔米亚 (Tarmiyah)', '麦达因 (Al-Mada-in)', '拉希德商业区 (Al-Rashid)',
    '扎法拉尼亚 (Zafraniya)', '优素菲亚 (Al-Yusufiyah)', '拜亚 (Al-Bayaa)', '拉特菲耶 (Latifiyah)', '胡尔里亚 (Hurriya)',
    '哈德拉 (Khadra)', '加扎利亚 (Ghazaliya)'
  ],
  '巴士拉省': [
    '阿夏尔市区 (Al-Ashar)', '祖拜尔 (Al-Zubair)', '库尔纳 (Al-Qurna)', '法奥港口区 (Al-Faw)', '阿布哈西卜 (Abu Al-Khaseeb)',
    '阿拉伯河区 (Shatt Al-Arab)', '麦德纳 (Al-Midaina)', '哈里萨 (Al-Hartha)', '迪尔 (Al-Dair)', '乌姆盖斯尔 (Umm Qasr)',
    '马吉奈 (Al-Majinah)', '巴拉西耶 (Baradiyah)', '朱拜拉 (Jubaila)', '坦努马 (Tannuma)', '盖尔奈粮港 (Gurna Port)', '塞法特 (Saffat)'
  ],
  '尼尼微省': [
    '摩苏尔老城区 (Mosul Old)', '辛贾尔核心区 (Sinjar)*', '祖马尔港区 (Zummar)*', '泰勒阿费尔 (Tal Afar)*', '谢汉 (Sheikhan)*',
    '哈姆达尼亚 (Al-Hamdaniya)*', '泰勒凯夫 (Tel Kaif)*', '巴希卡 (Bashiqa)*', '哈特拉 (Hatra)', '卡亚拉粮库区 (Al-Qayyarah)',
    '马赫穆尔 (Makhmour)*', '拉比阿边境区 (Rabia)*', '摩苏尔东区 (Mosul East)', '摩苏尔西区 (Mosul West)', '巴特纳亚 (Batnaya)*',
    '克拉姆莱斯 (Karamlesh)*', '阿勒库什 (Alqosh)*', '瓦纳 (Wana)*', '舒拉 (Al-Shura)', '穆哈拉比亚 (Muhallabiya)',
    '卡赫塔尼亚 (Qahtaniyah)*', '西瓦尔 (Siwar)'
  ],
  '基尔库克省': [
    '基尔库克老城区 (Kirkuk Center)*', '哈维贾中央区 (Hawija)*', '达古格南区 (Daquq)*', '迪比斯干线 (Dibs)*', '阿尔通库普里 (Altun Kupri)*',
    '里亚德粮仓区 (Al-Riyadh)*', '扎卜农业区 (Al-Zab)*', '阿巴斯干线 (Al-Abbasi)*', '莱兰特别区 (Laylan)*', '肖拉乌 (Shorau)*',
    '塔扎胡尔马图 (Taza)*', '瓦西提区 (Wasiti)*', '阿扎迪区 (Azadi)*', '拉希迪亚 (Rashidiya)*', '多米兹区 (Domiz)*', '潘贾阿里 (Panja Ali)*'
  ],
  '迪亚拉省': [
    '巴古拜中央区 (Baqubah)', '哈奈根核心区 (Khanaqin)*', '贾劳拉干线 (Jalawla)*', '萨阿迪耶绿洲 (Saadiya)*', '曼德利口岸 (Mandali)*',
    '盖拉塔佩 (Qaratapa)*', '米格达迪耶 (Muqdadiyah)', '哈利斯 (Khalis)', '巴拉德鲁兹 (Balad Ruz)', '卡纳安 (Kanaan)',
    '乌济姆 (Al-Udhaim)*', '贾巴尔哈姆林 (Hamrin)*', '布赫鲁兹 (Buhriz)', '希巴布 (Hibhib)', '阿比赛达 (Abi Saida)', '巴斯廷 (Basateen)'
  ],
  '安巴尔省': [
    '拉马迪中央区 (Ramadi)', '费卢杰商业区 (Fallujah)', '希特古城 (Hit)', '哈迪塞大坝区 (Haditha)', '加伊姆口岸 (Al-Qaim)',
    '阿纳 (Anah)', '拉瓦 (Rawah)', '鲁特巴沙漠枢纽 (Al-Rutba)', '哈巴尼亚 (Habbaniyah)', '卡尔马 (Al-Karmah)',
    '哈格拉尼亚 (Haqlaniyah)', '萨克拉维亚 (Saqlawiyah)', '巴格达迪 (Al-Baghdadi)', '瓦利德 (Al-Waleed)', '欧卡沙特 (Akashat)', '塔米姆区 (Al-Tamim)'
  ],
  '巴比伦省': [
    '希拉古城区 (Hillah)', '哈希米耶 (Hashimiyah)', '穆斯亚卜 (Musayyib)', '马哈维尔 (Mahaweel)', '伊斯坎德里耶 (Iskandariya)',
    '卡西姆圣城区 (Al-Qasim)', '基夫尔 (Al-Kifl)', '米德哈蒂耶 (Midhatiya)', '尼罗区 (Al-Neel)', '吉卜拉 (Jibla)',
    '肖马里 (Al-Shomali)', '巴尔哈 (Barha)', '塔赫马齐亚 (Tahmaziya)', '纳季亚 (Najiya)', '伊玛目区 (Al-Imam)'
  ],
  '卡尔巴拉省': [
    '卡尔巴拉古城区 (Karbala City)', '欣迪耶干线 (Hindiyah)', '艾因塔穆尔 (Ain Al-Tamur)', '胡塞尼亚 (Husseiniya)', '海拉特 (Al-Khayrat)',
    '贾德瓦尔 (Jadwal Al-Gharbi)', '米拉德 (Milad)', '阿巴斯大道区 (Al-Abbas)', '奥鲁巴 (Al-Orouba)', '拉扎扎湖区 (Razzaza)',
    '哈尔区 (Al-Hurr)', '赛义夫萨德 (Saif Saad)'
  ],
  '纳杰夫省': [
    '纳杰夫中央区 (Najaf Center)', '库法历史城区 (Kufa)', '马纳希拉 (Manathera)', '米沙布 (Mishkhab)', '希拉古镇 (Al-Hira)',
    '卡迪西亚农区 (Al-Qadisiyah)', '阿达拉区 (Al-Adala)', '安萨尔 (Al-Ansar)', '阿巴斯商业区 (Al-Abbassia)', '海达里亚 (Haidariya)',
    '拉扎米亚 (Razamiya)', '巴拉基亚 (Barakiya)', '希尔米亚 (Shilmiya)', '纳杰夫北仓 (North Grain Hub)'
  ],
  '卡迪西亚省': [
    '迪瓦尼耶中央区 (Diwaniyah)', '沙米耶 (Shamiyah)', '阿法克 (Afak)', '哈姆扎 (Al-Hamza)', '达加拉 (Al-Daghara)',
    '西尼亚 (Al-Siniyah)', '纳法尔遗址区 (Nippur)', '苏代尔 (Al-Sudair)', '加马斯 (Ghammas)', '沙法耶 (Al-Shafiyah)',
    '梅哈维尔 (Mehaweel South)', '塔利阿 (Al-Taliah)', '贝德尔区 (Al-Badeer)', '索拉区 (Al-Thawra)'
  ],
  '穆萨纳省': [
    '萨马沃市区 (Samawah)', '鲁迈萨 (Rumaitha)', '希德尔 (Al-Khidhir)', '萨勒曼边塞 (Al-Salman)', '瓦尔卡文明区 (Warka)',
    '马吉德 (Al-Majd)', '希拉尔 (Al-Hilal)', '巴萨亚 (Al-Bassaya)', '纳杰米 (Al-Najmi)', '苏韦尔 (Al-Suwayr)',
    '萨马沃西仓 (West Samawah)', '阿斯亚 (Al-Asiyah)'
  ],
  '济加尔省': [
    '纳西里耶中央区 (Nasiriyah)', '里法伊 (Rifai)', '苏格什尤赫 (Suq Al-Shuyukh)', '沙特拉 (Shatrah)', '奇巴伊希沼泽区 (Chibayish)',
    '达瓦耶 (Dawayah)', '加拉夫 (Gharraf)', '纳斯尔 (Al-Nasr)', '巴特哈 (Al-Batha)', '法胡德 (Al-Fahud)',
    '阿卡卡 (Akaka)', '卡尔马特贝尼赛义德 (Karmat Beni Saeed)', '塔尔 (Al-Tar)', '哈马尔湖区 (Hammar)', '塞德达希勒 (Sayed Dakhil)',
    '法杰尔 (Al-Fajr)', '乌尔遗址区 (Ur Hub)', '沙哈纳 (Shahana)'
  ],
  '米桑省': [
    '阿马拉市区 (Amarah)', '马贾尔卡比尔 (Majal Al-Kabir)', '阿里加尔比 (Ali Al-Gharbi)', '阿里沙尔基 (Ali Al-Sharqi)', '迈穆纳 (Maymouna)',
    '卡哈拉 (Kahla)', '加拉特萨利赫 (Qalat Saleh)', '穆沙拉赫 (Al-Musharrah)', '巴米尔 (Al-Bameer)', '库穆特 (Kumait)',
    '胡韦扎沼泽区 (Huwaiza)', '泰卜 (Al-Teeb)', '萨拉姆 (Al-Salam)', '西阿马拉 (West Amarah)'
  ],
  '瓦西特省': [
    '库特中央区 (Kut)', '努马尼亚 (Numaniyah)', '苏维拉 (Suwaira)', '海伊区 (Hayy)', '拜德拉边境区 (Badra)',
    '阿齐齐耶 (Aziziyah)', '谢赫萨阿德 (Sheikh Saad)', '祖拜迪耶 (Zubaidiyah)', '沙哈米亚 (Shahamiya)', '瓦希德 (Al-Wahid)',
    '贾桑 (Jassan)', '巴希亚 (Al-Bashir)', '达尔瓦扎 (Darwaza)', '阿赫拉尔 (Al-Ahrar)', '库特粮仓走廊 (Kut Grain Silo)'
  ],
  '萨拉赫丁省': [
    '提克里特中央区 (Tikrit)', '萨迈拉圣城区 (Samarra)', '拜吉炼厂区 (Baiji)', '巴拉德 (Balad)', '杜杰勒 (Dujail)',
    '图兹霍尔马图特别区 (Tuz Khurmatu)*', '杜尔 (Al-Dour)', '舍尔加特 (Al-Shirqat)', '穆塔辛 (Al-Mu-tasim)', '伊斯哈齐 (Ishaqi)',
    '雅斯里卜 (Yathrib)', '苏莱曼贝克 (Sulaiman Bek)*', '阿米尔利 (Amerli)*', '西奈亚 (Al-Siniyah)', '祖卢耶 (Al-Dhuluiya)', '哈姆拉 (Hamra)'
  ],
  '埃尔比勒省': [
    '埃尔比勒城堡区 (Erbil Citadel)', '索兰边境区 (Soran)', '沙格拉瓦 (Shaqlawa)', '科亚 (Koya)', '拉万杜兹 (Rawanduz)',
    '哈巴特 (Khabat)', '乔曼 (Choman)', '梅尔加苏尔 (Mergasor)', '安卡瓦 (Ainkawa)', '卡斯纳赞 (Kasnazan)',
    '巴赫尔卡 (Bahrka)', '代格莱 (Degala)', '哈里尔 (Harir)', '哈里兰 (Khalifan)', '西德坎 (Sidakan)',
    '托普扎瓦 (Topzawa)', '肖尔什 (Shoresh)', '埃尔比勒粮储中心 (Erbil Grain Hub)'
  ],
  '苏莱曼尼亚省': [
    '苏莱曼尼亚市区 (Sulaymaniyah)', '拉尼亚 (Ranya)', '卡拉迪泽 (Qaladiza)', '达尔班迪汗 (Darbandikhan)', '杜坎大坝区 (Dokan)',
    '萨伊德萨迪克 (Saidsadiq)', '基夫里特别区 (Kifri)*', '卡拉尔特别区 (Kalar)*', '占恰马勒 (Chamchamal)*', '巴齐扬 (Bazyan)',
    '佩杰德尔 (Pshdar)', '贝格拉 (Penjwen)', '哈贾瓦 (Hajiawa)', '扎拉扬 (Zarayan)', '沃泰 (Warmawa)',
    '乔阿尔塔 (Chwarta)', '毛贝特 (Mawat)', '加尔米安总署区 (Garmian HQ)*'
  ],
  '杜胡克省': [
    '杜胡克中央区 (Dohuk Center)', '扎胡边检枢纽 (Zakho)', '阿马迪亚古堡区 (Amadiya)', '阿克拉特别区 (Aqra)*', '塞迈勒 (Semel)',
    '拜尔达拉什特别区 (Barda Rash)*', '希汉特别区 (Shekhan)*', '卡尼马西 (Kani Masi)', '巴特尔 (Batel)', '曼格什 (Mangesh)',
    '扎维塔 (Zawita)', '巴尔瓦里 (Barwari)', '萨尔辛克 (Sarsink)', '达拉图 (Daratou)', '希尔瓦 (Shirwa)', '杜胡克北库 (North Dohuk)'
  ],
  '哈拉卜贾省': [
    '哈拉卜贾市区 (Halabja Center)', '沙拉祖尔农业区 (Sharazoor)', '拜亚拉山区 (Byara)', '西尔万 (Sirwan)', '霍尔马尔 (Khurmal)',
    '扎兰 (Zalalm)', '古尔普 (Gulp)', '哈拉卜贾东库 (East Halabja)', '塞德萨迪克南 (South Sadiq)', '巴尔津贾 (Barzinjah)'
  ]
};

// 预置已存在的关键中心编号（保持系统前后兼容）
const PRESERVED_CENTERS = {
  '101': { centerName: '卡尔赫第一配给中心 (曼苏尔)', province: '巴格达省', city: '曼苏尔 (Al-Mansour)', is140: false, status: '已被代理', agent: '穆罕默德·贾巴尔·拉希德', households: 1120 },
  '108': { centerName: '萨德尔城中央配给中心', province: '巴格达省', city: '萨德尔城第一区 (Sadr City 1)', is140: false, status: '已注销(空置待申请)', agent: '原代理已故分支', households: 0 },
  '496': { centerName: '哈奈根 (Khanaqin) 第一配给中心', province: '迪亚拉省', city: '哈奈根核心区 (Khanaqin)*', is140: true, status: '已被代理', agent: '穆罕默德·贾巴尔·拉希德', households: 890 },
  '497': { centerName: '贾劳拉 (Jalawla) 干线配给中心', province: '迪亚拉省', city: '贾劳拉干线 (Jalawla)*', is140: true, status: '已注销(空置待申请)', agent: '原代理：卡里姆·法鲁克', households: 0 },
  '498': { centerName: '萨阿迪耶 (Saadiya) 绿洲配给中心', province: '迪亚拉省', city: '萨阿迪耶绿洲 (Saadiya)*', is140: true, status: '已被代理', agent: '法鲁克·奥马尔·哈桑', households: 710 },
  '499': { centerName: '曼德利 (Mandali) 边境便民配给中心', province: '迪亚拉省', city: '曼德利口岸 (Mandali)*', is140: true, status: '已注销(空置待申请)', agent: '原代理：塔里克·萨利赫', households: 0 },
  '512': { centerName: '达古格 (Daquq) 南部便民配给中心', province: '基尔库克省', city: '达古格南区 (Daquq)*', is140: true, status: '已注销(空置待申请)', agent: '原代理：穆罕默德·库尔迪', households: 0 },
  '513': { centerName: '哈维贾 (Hawija) 农业配给中心', province: '基尔库克省', city: '哈维贾中央区 (Hawija)*', is140: true, status: '已被代理', agent: '哈米德·阿卜杜勒拉赫曼', households: 1220 },
  '320': { centerName: '辛贾尔 (Sinjar) 核心配给中心', province: '尼尼微省', city: '辛贾尔核心区 (Sinjar)*', is140: true, status: '已被代理', agent: '伊利亚斯·哈吉·米尔扎', households: 1040 },
  '304': { centerName: '祖马尔 (Zummar) 湖畔配给中心', province: '尼尼微省', city: '祖马尔港区 (Zummar)*', is140: true, status: '已注销(空置待申请)', agent: '原代理：哈希姆·阿卜杜拉', households: 0 },
  '305': { centerName: '泰勒阿费尔 (Tal Afar) 西区配给中心', province: '尼尼微省', city: '泰勒阿费尔 (Tal Afar)*', is140: true, status: '已注销(空置待申请)', agent: '原代理：萨利姆·巴希尔', households: 0 }
};

const CATEGORIES = ['综合 (食品+面粉)', '面粉', '食品', '综合 (食品+面粉)'];
const AGENT_NAMES = [
  '阿里·海德尔·哈桑', '穆斯塔法·纳赛尔', '法鲁克·卡西姆', '萨利姆·努里', '艾哈迈德·易卜拉欣',
  '贾瓦德·卡齐姆', '哈立德·奥马尔', '萨阿德·阿卜杜拉', '侯赛因·巴吉尔', '卡里姆·萨迪克',
  '努尔丁·穆尔塔达', '阿巴斯·法尔汉', '塔里克·阿齐兹', '马吉德·拉希德', '阿德南·巴希尔'
];

/**
 * 3. 动态生成符合规范的 600 个仓库 (配给中心) 完整数据集
 */
function generate600Warehouses() {
  const result = [];
  let centerIdCounter = 101;
  const preservedIds = Object.keys(PRESERVED_CENTERS);

  // 首先植入保留的关键中心
  for (const id of preservedIds) {
    const item = PRESERVED_CENTERS[id];
    result.push({
      centerId: id,
      centerName: item.centerName,
      warehouseCode: `WH-${id}`,
      province: `${item.province} (${getProvinceEn(item.province)})`,
      city: item.city.replace('*', ''),
      branchName: `${item.province}粮食配给物资保障分部`,
      isArticle140: item.is140,
      article140RegionNote: item.is140 ? '受宪法第140号决议管辖地区 (重点特别行政区)' : null,
      category: id === '108' || id === '497' || id === '304' ? '面粉' : (id === '498' || id === '305' ? '食品' : '综合 (食品+面粉)'),
      status: item.status,
      isMyCenter: id === '101' || id === '496' || id === '108',
      currentAgentId: item.status === '已被代理' ? `AGT-${id}` : null,
      currentAgentName: item.agent,
      currentHouseholds: item.households,
      registeredHouseholds: item.households || 750,
      maxCapacity: 1500,
      address: `${item.province}${item.city.replace('*', '')}中央配给站街区第${id}号`,
      lastCancellationReason: item.status.includes('注销') ? '原代理自愿清退或依法注销，满足空置准入条件' : null,
      canApply: item.status.includes('注销'),
      canRestore: item.status.includes('注销'),
      canRotate: !item.status.includes('注销')
    });
  }

  // 遍历 19 个省，补全每个省下的所有城市和仓库，使总数精准达到 600
  for (const prov of IRAQ_19_PROVINCES) {
    const provinceFullName = `${prov.name} (${prov.enName})`;
    const cities = IRAQ_PROVINCE_CITIES[prov.name] || [prov.cityBaseName];
    const targetCenterCount = prov.centerCount;
    
    // 当前省已有的保留仓库数
    const existingInProv = result.filter(c => c.province.includes(prov.name)).length;
    const needToAdd = targetCenterCount - existingInProv;

    for (let i = 0; i < needToAdd; i++) {
      while (preservedIds.includes(String(centerIdCounter))) {
        centerIdCounter++;
      }
      const currentId = String(centerIdCounter++);
      const cityItem = cities[i % cities.length];
      const isCity140 = cityItem.includes('*') || prov.isArticle140 && (prov.id === 'KIR');
      const cleanCity = cityItem.replace('*', '');
      
      const isAssigned = (i % 4 !== 1); // 75% 已被代理，25% 空置已注销
      const agentName = AGENT_NAMES[(centerIdCounter + i) % AGENT_NAMES.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      const households = isAssigned ? 600 + ((centerIdCounter * 37) % 780) : 0;

      result.push({
        centerId: currentId,
        centerName: `${cleanCity}第${(i % 3) + 1}配给储备中心`,
        warehouseCode: `WH-${prov.id}-${String(i + 1).padStart(3, '0')}`,
        province: provinceFullName,
        city: cleanCity,
        branchName: `${prov.name}物资保障分部`,
        isArticle140: isCity140,
        article140RegionNote: isCity140 ? '受宪法第140号决议管辖地区 (重点特别行政区)' : null,
        category: category,
        status: isAssigned ? '已被代理' : '已注销(空置待申请)',
        isMyCenter: false,
        currentAgentId: isAssigned ? `AGT-${prov.id}-${currentId}` : null,
        currentAgentName: isAssigned ? agentName : `原代理已注销 (可申请)`,
        currentHouseholds: households,
        registeredHouseholds: isAssigned ? households : 650 + (i * 20) % 500,
        maxCapacity: 1500,
        address: `${prov.name}${cleanCity}粮食储备与代销直供街区${(i % 50) + 1}号`,
        lastCancellationReason: !isAssigned ? '原网点合规注销并完成份额结清，向社会公示开放申请' : null,
        canApply: !isAssigned,
        canRestore: !isAssigned,
        canRotate: isAssigned
      });
    }
  }

  return result;
}

function getProvinceEn(name) {
  const p = IRAQ_19_PROVINCES.find(item => item.name === name);
  return p ? p.enName : 'Iraq';
}

// 导出 600 个仓库实体数据
export const IRAQ_ALL_600_CENTERS = generate600Warehouses();
