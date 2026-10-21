import { TRANSFER_BRANCH_OPTIONS as englishOptions } from '../../src/mock/data/en/transferData.js';

const provinces = {
  'Baghdad Province': 'محافظة بغداد',
  'Diyala Province': 'محافظة ديالى',
  'Nineveh Province': 'محافظة نينوى',
  'Kirkuk Province': 'محافظة كركوك',
  'Basra Province': 'محافظة البصرة',
};
const branches = {
  'Karkh 1st Food Supply Branch': 'فرع الكرخ الأول لتجهيز المواد الغذائية',
  'Rusafa 2nd Food Supply Branch': 'فرع الرصافة الثاني لتجهيز المواد الغذائية',
  'Diyala Eastern Branch': 'فرع ديالى الشرقي',
  'Nineveh West & Mountain Ration Branch': 'فرع نينوى الغربي والجبلي للتموين',
  'Kirkuk Central Food Supply Branch': 'فرع كركوك المركزي لتجهيز المواد الغذائية',
  'Basra Port Ration Support Branch': 'فرع دعم التموين في ميناء البصرة',
};
const centers = {
  '101': 'مركز المنصور المركزي للتموين', '102': 'مركز الكاظمية للتموين', '108': 'مركز مدينة الصدر المركزي للتموين',
  '496': 'مركز خانقين للتموين', '497': 'مركز جلولاء للتموين', '498': 'مركز السعدية للتموين',
  '320': 'مركز سنجار للتموين', '304': 'مركز زمار للتموين', '511': 'مركز قلعة كركوك للتموين', '201': 'مركز العشار للتموين',
};
const agents = {
  'FA-BAG-01': ['وكالة المنصور الأولى للدقيق', 'سمير جاسم'],
  'FA-BAG-02': ['متجر اليرموك لخدمات الدقيق', 'علي خالد'],
  'FD-BAG-01': ['تعاونية المنصور الثالثة للمواد الغذائية والزيوت', 'وليد محمد'],
  'FD-BAG-02': ['محطة ساحة التحرير لخدمات الأغذية', 'يوسف حسن'],
  'FA-BAG-03': ['محطة غرب جامع الكاظمية للدقيق', 'عباس كاظم'],
  'FD-BAG-03': ['محطة الكاظمية المركزية للمواد الغذائية', 'حيدر رحيم'],
  'FA-BAG-08': ['منفذ الصدر الخامس للدقيق', 'مصطفى ناصر'],
  'FD-BAG-08': ['تعاونية حبوب أهل الصدر', 'رعد سعد'],
  'FD-BAG-09': ['مركز إمداد الأغذية في المنطقة الشرقية', 'نوري كمال'],
  'FA-DIY-01': ['محطة خانقين الأولى الحدودية للدقيق', 'بارزان كراد'],
  'FD-DIY-01': ['تعاونية خانقين المركزية لتجهيز الأغذية', 'شيروان مجيد'],
  'FA-DIY-02': ['نقطة خدمات دقيق طريق جلولاء السريع', 'محمود أحمد'],
  'FD-DIY-02': ['منفذ جلولاء العام للمواد الغذائية والحبوب', 'كريم فاروق'],
  'FA-DIY-03': ['محطة السعدية للدقيق', 'صلاح يوسف'],
  'FD-DIY-03': ['قسم توزيع المواد الغذائية في السعدية', 'فاروق عمر'],
  'FA-NIN-01': ['منفذ سنجار المباشر للدقيق', 'إلياس حاجي'],
  'FD-NIN-01': ['محطة سنجار المركزية للأغذية والزيوت', 'ميرزا قاسم'],
  'FA-NIN-02': ['وكالة زمار للدقيق', 'هاشم عبدالله'],
  'FD-NIN-02': ['محطة زمار الزراعية الغذائية', 'سليم بشير'],
  'FA-KIR-01': ['وكالة المدينة القديمة الأولى للدقيق', 'عثمان طوغا'],
  'FD-KIR-01': ['محطة شارع النفط للمواد الغذائية', 'محمد البياتي'],
  'FA-BAS-01': ['وكالة العشار للميناء للدقيق', 'جابر سليم'],
  'FD-BAS-01': ['محطة الكورنيش المركزية لتجهيز الأغذية', 'محسن نديم'],
};

export const TRANSFER_BRANCH_OPTIONS = englishOptions.map((province) => ({
  ...province,
  province: provinces[province.province] || province.province,
  branches: province.branches.map((branch) => ({
    ...branch,
    branchName: branches[branch.branchName] || branch.branchName,
    centers: branch.centers.map((center) => ({
      ...center,
      centerName: centers[center.centerId] || center.centerName,
      flourAgents: center.flourAgents.map((agent) => ({ ...agent, name: agents[agent.id]?.[0] || agent.name, manager: agents[agent.id]?.[1] || agent.manager })),
      foodAgents: center.foodAgents.map((agent) => ({ ...agent, name: agents[agent.id]?.[0] || agent.name, manager: agents[agent.id]?.[1] || agent.manager })),
    })),
  })),
}));
