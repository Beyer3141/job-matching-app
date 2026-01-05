import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, CheckCircle, Heart, History, Phone, ChevronDown, ChevronRight, User, Target, ZoomIn, ZoomOut, Maximize2, AlertCircle, Check, Loader, XCircle, MinusCircle, MapPin, Building, RefreshCw, Search, Filter, AlertTriangle, Info, Clock, DollarSign, Users, Briefcase, Database, Navigation, Eye, ExternalLink, CheckSquare, Square, ArrowUpDown, TrendingUp, TrendingDown, Settings, BarChart3, Sparkles, Award, Zap, ChevronUp, Sliders, List } from 'lucide-react';

// =====================================
// Material Design 3 デザインシステム
// =====================================

const MD3 = {
  color: {
    primary: {
      main: '#4F46E5',
      onMain: '#FFFFFF',
      container: '#E0DFFE',
      onContainer: '#1E0D5D',
    },
    secondary: {
      main: '#7C3AED',
      onMain: '#FFFFFF',
      container: '#EDE9FE',
      onContainer: '#3B0764',
    },
    tertiary: {
      main: '#059669',
      onMain: '#FFFFFF',
      container: '#D1FAE5',
      onContainer: '#064E3B',
    },
    error: {
      main: '#DC2626',
      onMain: '#FFFFFF',
      container: '#FEE2E2',
      onContainer: '#7F1D1D',
    },
    warning: {
      main: '#F59E0B',
      onMain: '#FFFFFF',
      container: '#FEF3C7',
      onContainer: '#78350F',
    },
    surface: {
      main: '#FEFEFE',
      onMain: '#1A1C1E',
      variant: '#F4F5FA',
      onVariant: '#42474E',
      dim: '#DADDE3',
    },
    background: '#F8FAFB',
    onBackground: '#1A1C1E',
    outline: '#C4C7CE',
    outlineVariant: '#E1E3E8',
    shadow: 'rgba(0, 0, 0, 0.15)',
  },
  
  typography: {
    displayLarge: 'text-[57px] font-normal leading-[64px] tracking-[-0.25px]',
    displayMedium: 'text-[45px] font-normal leading-[52px]',
    displaySmall: 'text-[36px] font-normal leading-[44px]',
    headlineLarge: 'text-[32px] font-normal leading-[40px]',
    headlineMedium: 'text-[28px] font-normal leading-[36px]',
    headlineSmall: 'text-[24px] font-normal leading-[32px]',
    titleLarge: 'text-[22px] font-medium leading-[28px]',
    titleMedium: 'text-[16px] font-medium leading-[24px] tracking-[0.15px]',
    titleSmall: 'text-[14px] font-medium leading-[20px] tracking-[0.1px]',
    bodyLarge: 'text-[16px] font-normal leading-[24px] tracking-[0.5px]',
    bodyMedium: 'text-[14px] font-normal leading-[20px] tracking-[0.25px]',
    bodySmall: 'text-[12px] font-normal leading-[16px] tracking-[0.4px]',
    labelLarge: 'text-[14px] font-medium leading-[20px] tracking-[0.1px]',
    labelMedium: 'text-[12px] font-medium leading-[16px] tracking-[0.5px]',
    labelSmall: 'text-[11px] font-medium leading-[16px] tracking-[0.5px]',
  },
  
  elevation: {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl',
  },
  
  transition: {
    fast: 'transition-all duration-150 ease-out',
    standard: 'transition-all duration-300 ease-out',
    emphasized: 'transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// =====================================
// 定数定義
// =====================================

const SPREADSHEET_ID = '1yKbGLc9wbXamYeMhjennjDPnW46Cyz7QcQXKF773G8g';

const COMMUTE_DISTANCE_PER_30MIN = {
  '車': 15,
  '自家用車': 15,
  'バイク': 10,
  '自転車': 5,
  '徒歩': 2,
  'バス': 10,
  '電車': 20
};

const getCompanyRank = (companyName) => {
  if (!companyName) return 'C';
  const upperName = companyName.toUpperCase();
  
  if (upperName.includes('UT') || upperName.includes('UTAIM') || 
      upperName.includes('UTAGT') || upperName.includes('UTCNT') ||
      upperName.includes('UT(CNT)') || upperName.includes('UT(AGT)')) {
    return 'S';
  }
  if (upperName.includes('日研') || upperName.includes('NIKKEN')) {
    return 'A';
  }
  if (upperName.includes('WITC') || upperName.includes('BN') || 
      upperName.includes('ウィルテック') || upperName.includes('ビーネックス')) {
    return 'B';
  }
  return 'C';
};

const COMPANY_RANKS = {
  'S': { 
    label: 'S', 
    color: '#7C3AED',
    bg: '#EDE9FE',
    border: '#C4B5FD',
    textColor: '#5B21B6',
    bgLight: '#F5F3FF',
    description: 'UT系' 
  },
  'A': { 
    label: 'A', 
    color: '#2563EB',
    bg: '#DBEAFE',
    border: '#93C5FD',
    textColor: '#1E40AF',
    bgLight: '#EFF6FF',
    description: '日研' 
  },
  'B': { 
    label: 'B', 
    color: '#059669',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    textColor: '#047857',
    bgLight: '#ECFDF5',
    description: 'WITC・BN' 
  },
  'C': { 
    label: 'C', 
    color: '#64748B',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    textColor: '#475569',
    bgLight: '#F8FAFC',
    description: 'その他' 
  },
};

const SCORE_WEIGHTS = {
  distance: 25,
  vacancy: 25,
  fee: 20,
  companyRank: 15,
  salaryMatch: 10,
  shiftMatch: 5,
  ageWarning: -10,
  commuteMethodMismatch: -5,
  dormMismatch: -5,
};

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// =====================================
// ユーティリティ関数
// =====================================

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const extractShiftWork = (workTimeText) => {
  if (!workTimeText || workTimeText.trim() === '') return 'その他';
  
  let text = workTimeText;
  
  // 研修期間・入社期間の記載を除外（研修後の形態を採用）
  text = text.replace(/研修.*?は.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/研修.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/入社.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/研修中.*?日勤/gi, '');
  text = text.replace(/研修時.*?日勤/gi, '');
  text = text.replace(/研修期間中.*?日勤/gi, '');
  
  // 「または」がある場合、より複雑な方（後半）を優先
  if (text.includes('または')) {
    const parts = text.split('または');
    text = parts[parts.length - 1];
  }
  
  // 括弧内の記載を最優先で判定
  if (/[（(]3交替[）)]/i.test(text)) return '3交替';
  if (/[（(]2交替[）)]/i.test(text)) return '2交替';
  if (/[（(]シフト制[）)]/i.test(text)) return 'シフト制';
  
  // 「交替制」の場合は時間帯の数で判定
  if (/[（(]交替制[）)]/i.test(text)) {
    const slashCount = (text.match(/\//g) || []).length;
    if (slashCount >= 2) return '3交替';
    if (slashCount === 1) return '2交替';
    return '2交替';
  }
  
  if (/[（(]夜勤[）)]/i.test(text)) return '夜勤';
  if (/[（(]日勤[）)]/i.test(text)) return '日勤';
  
  // 括弧がない場合、時間帯の数で判定
  const slashCount = (text.match(/\//g) || []).length;
  if (slashCount >= 2) return '3交替';
  if (slashCount === 1) return '2交替';
  
  // 単一の時間帯のみ
  if (/\d{1,2}[:：]\d{2}/.test(text)) return '日勤';
  
  return 'その他';
};

const estimateCommuteTime = (distanceKm, commuteMethod) => {
  const distancePer30Min = COMMUTE_DISTANCE_PER_30MIN[commuteMethod] || 15;
  return Math.round((distanceKm / distancePer30Min) * 30);
};

const geocodeAddress = async (prefecture, city, detail = '') => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1100));
    const address = `${prefecture}${city}${detail}`.replace(/\s+/g, '');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=jp&limit=1`,
      { headers: { 'Accept-Language': 'ja', 'User-Agent': 'JobMatchingTool/1.0' } }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), accuracy: 'exact' };
    }
    
    if (detail) {
      await new Promise(resolve => setTimeout(resolve, 1100));
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${prefecture}${city}`)}&countrycodes=jp&limit=1`,
        { headers: { 'Accept-Language': 'ja', 'User-Agent': 'JobMatchingTool/1.0' } }
      );
      const fallbackData = await fallbackResponse.json();
      if (fallbackData && fallbackData.length > 0) {
        return { lat: parseFloat(fallbackData[0].lat), lng: parseFloat(fallbackData[0].lon), accuracy: 'approximate' };
      }
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};


const transformSpreadsheetData = (row, headers, addressMasterMap) => {
  const getVal = (colName) => {
    const idx = headers.indexOf(colName);
    return idx >= 0 && row.c && row.c[idx] ? (row.c[idx].v ?? row.c[idx].f ?? '') : '';
  };
  
  const aid = getVal('Aid') || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const company = getVal('派遣会社名(※自動入力)') || '';
  
  // ⭐ 勤務形態の取得ロジック（修正） ⭐
  let shiftWork = '';
  
  if (company.includes('DPT')) {
    // DPTの場合はAM列「シフト」を参照
    const workTimeText = getVal('シフト');
    shiftWork = extractShiftWork(workTimeText);
  } else if (company.includes('日研') || company.includes('NIKKEN')) {
    // 日研の場合はAP列「勤務時間開始①」を参照
    const workTimeText = getVal('勤務時間開始①');
    shiftWork = extractShiftWork(workTimeText);
  } else {
    // その他の派遣会社は従来通り「勤務形態」列
    shiftWork = getVal('勤務形態') || '日勤';
  }
  
  // シフト・勤務時間開始①にも記載がない場合
  if (!shiftWork || shiftWork === 'その他') {
    shiftWork = getVal('勤務形態') || 'その他';
  }
  
  const fee = parseInt(getVal('fee')) || 0;
  const totalSalary = parseInt(getVal('総支給額')) || 0;
  const baseSalary = parseInt(getVal('基準内賃金')) || 0;
  const commuteMethods = (getVal('可能通勤手段') || '').split('\\').filter(Boolean);
  
  let lat = null, lng = null;
  const latStr = getVal('緯度'), lngStr = getVal('経度');
  if (latStr && !String(latStr).includes('読み込') && !isNaN(parseFloat(latStr))) lat = parseFloat(latStr);
  if (lngStr && !String(lngStr).includes('読み込') && !isNaN(parseFloat(lngStr))) lng = parseFloat(lngStr);

  const prefecture = getVal('所在地（都道府県）') || '';
  let addressDetail = getVal('所在地 （市区町村以降）') || '';
  
  // ⭐ 緯度経度マスターから住所を取得（追加） ⭐
  if (addressMasterMap && addressMasterMap.has(aid)) {
    const masterData = addressMasterMap.get(aid);
    // マスターの都道府県 + 住所を結合
    const fullAddressFromMaster = `${masterData.prefecture || ''}${masterData.address || ''}`.trim();
    if (fullAddressFromMaster) {
      // マスターに住所がある場合は優先的に使用
      addressDetail = masterData.address || addressDetail;
    }
  }
  
  if (company.includes('綜合キャリア')) {
    const officeAddress = getVal('事業所') || '';
    if (officeAddress && !addressDetail.includes(officeAddress)) {
      addressDetail = addressDetail + ' ' + officeAddress;
    }
  }

  return {
    id: aid,
    name: getVal('案件: 案件名') || '',
    company: company,
    companyRank: getCompanyRank(company),
    status: getVal('案件ステータス') || '',
    prefecture: prefecture,
    address: addressDetail.trim(),
    fullAddress: `${prefecture}${addressDetail}`.trim(),
    lat, lng,
    fee: Math.round(fee / 10000),
    feeRaw: fee,
    monthlySalary: Math.round(totalSalary / 10000),
    monthlySalaryRaw: totalSalary,
    baseSalary: Math.round(baseSalary / 10000),
    baseSalaryRaw: baseSalary,
    overtimePay: getVal('（月平均）法定外残業手当') || '',
    holidayPay: getVal('（月平均）休日出勤手当') || '',
    nightPay: getVal('（月平均）深夜手当') || '',
    gender: getVal('性別') || '不問',
    minAge: parseInt(getVal('年齢下限')) || null,
    maxAge: parseInt(getVal('年齢上限')) || null,
    maxClothingSize: getVal('制服サイズ（上限）') || '',
    shiftWork: shiftWork, // ⭐ 修正された勤務形態 ⭐
    shift: getVal('シフト') || '',
    workTime1Start: getVal('勤務時間（開始①）') || '',
    workTime1End: getVal('勤務時間（終了①）') || '',
    workTime2Start: getVal('勤務時間（開始②）') || '',
    workTime2End: getVal('勤務時間（終了②）') || '',
    workTime3Start: getVal('勤務時間（開始③）') || '',
    workTime3End: getVal('勤務時間（終了③）') || '',
    workTime4Start: getVal('勤務時間（開始④）') || '',
    workTime4End: getVal('勤務時間（終了④）') || '',
    holidays: getVal('休日') || '',
    annualHolidays: parseInt(getVal('年間休日')) || 0,
    overtime: parseInt(getVal('（月平均）法定外残業')) || 0,
    acceptedCommuteMethods: commuteMethods.map(m => m.trim()),
    commuteOption: getVal('入寮可否') === '可' ? '入寮可' : '通勤可',
    dormAvailable: getVal('入寮可否') === '可',
    dormSubsidy: getVal('社宅費補助額') || '',
    dormSubsidyType: getVal('社宅費負担') || '',
    familyDorm: getVal('家族入寮') || '',
    coupleDorm: getVal('カップル入居') || '',
    vacancy: parseInt(getVal('当月欠員数')) || 0,
    nextMonthVacancy: parseInt(getVal('翌月欠員数 (見込)')) || 0,
    nextNextMonthVacancy: parseInt(getVal('翌々月欠員数 (見込)')) || 0,
    workDetail: getVal('業務内容詳細') || '',
    merit: getVal('メリット （訴求ポイント）') || '',
    workLocation: getVal('事業所') || '',
    experienceRequired: getVal('業務経験') || '',
    experienceDetail: getVal('業務経験詳細') || '',
    jobExperience: getVal('職種経験') || '',
    jobExperienceDetail: getVal('職種経験詳細') || '',
    foreignerAccepted: getVal('外国籍') || '',
    tattooAccepted: getVal('【刺青】可否') || '',
    tattooCondition: getVal('【刺青】 可能条件') || '',
    workplaceVisit: getVal('職場見学') || '',
    remarks: getVal('配属可能条件に関する備考') || '',
    commuteTime: null,
    placement2025: parseInt(getVal('2025実績')) || 0,
    placement2024: parseInt(getVal('2024実績')) || 0,
  };
};

// =====================================
// UIコンポーネント
// =====================================

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getColors = () => {
    switch (type) {
      case 'success': return { bg: MD3.color.tertiary.container, text: MD3.color.tertiary.onContainer, icon: MD3.color.tertiary.main };
      case 'error': return { bg: MD3.color.error.container, text: MD3.color.error.onContainer, icon: MD3.color.error.main };
      case 'warning': return { bg: MD3.color.warning.container, text: MD3.color.warning.onContainer, icon: MD3.color.warning.main };
      default: return { bg: MD3.color.primary.container, text: MD3.color.primary.onContainer, icon: MD3.color.primary.main };
    }
  };
  
  const colors = getColors();
  
  return (
    <div 
      className={`fixed top-6 right-6 ${MD3.elevation[4]} ${MD3.transition.emphasized} z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl min-w-[320px]`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div style={{ color: colors.icon }}>
        {type === 'success' && <CheckCircle size={24} />}
        {type === 'error' && <AlertCircle size={24} />}
        {type === 'warning' && <AlertTriangle size={24} />}
        {type === 'info' && <Info size={24} />}
      </div>
      <span className={`${MD3.typography.bodyLarge} flex-1 font-medium`}>{message}</span>
      <button onClick={onClose} className={`${MD3.transition.fast} hover:opacity-70 p-1 rounded-full`} style={{ color: colors.text }}>
        <X size={20} />
      </button>
    </div>
  );
};

const LoadingSpinner = ({ message = '読み込み中...' }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
    <div className={`${MD3.elevation[5]} rounded-3xl p-10 flex flex-col items-center gap-6 min-w-[300px]`} style={{ backgroundColor: MD3.color.surface.main }}>
      <div className="relative w-16 h-16">
        <Loader className="animate-spin absolute inset-0" size={64} style={{ color: MD3.color.primary.main }} strokeWidth={2.5} />
        <div className="absolute inset-2 rounded-full" style={{ backgroundColor: MD3.color.primary.container, opacity: 0.2 }} />
      </div>
      <p className={`${MD3.typography.bodyLarge} font-medium text-center`} style={{ color: MD3.color.onSurface }}>{message}</p>
    </div>
  </div>
);

const ProgressStepper = ({ currentStep, steps }) => (
  <div className={`${MD3.elevation[1]} rounded-2xl p-6 mb-6`} style={{ backgroundColor: MD3.color.surface.main }}>
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1 relative">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${MD3.transition.standard} ${MD3.elevation[index === currentStep ? 2 : 0]}`}
              style={{
                backgroundColor: index < currentStep ? MD3.color.tertiary.main 
                  : index === currentStep ? MD3.color.primary.main : MD3.color.surface.variant,
                color: index <= currentStep ? MD3.color.primary.onMain : MD3.color.surface.onVariant,
              }}
            >
              {index < currentStep ? <CheckCircle size={24} /> : index + 1}
            </div>
            {index === currentStep && (
              <div className="absolute -inset-1 rounded-full animate-pulse" style={{ border: `2px solid ${MD3.color.primary.main}`, opacity: 0.3 }} />
            )}
            <span className={`mt-3 text-center ${MD3.typography.labelMedium} ${MD3.transition.standard} px-2`} style={{ color: index <= currentStep ? MD3.color.primary.main : MD3.color.surface.onVariant }}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-[2px] mx-3 rounded-full ${MD3.transition.standard}`} style={{ backgroundColor: index < currentStep ? MD3.color.tertiary.main : MD3.color.outline, maxWidth: '80px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const CompanyRankBadge = ({ rank, showLabel = false }) => {
  const config = COMPANY_RANKS[rank] || COMPANY_RANKS['C'];
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${MD3.typography.labelMedium} font-bold ${MD3.transition.fast}`}
      style={{ backgroundColor: config.bg, color: config.textColor, border: `1px solid ${config.border}` }}
    >
      <span className="text-sm">{config.label}</span>
      {showLabel && <span className={`${MD3.typography.labelSmall} opacity-90`}>{config.description}</span>}
    </span>
  );
};

const ScoreBreakdown = ({ breakdown }) => (
  <div className="space-y-2">
    {breakdown.map((item, i) => (
      <div key={i} className="flex justify-between items-center group">
        <span className={`${MD3.typography.bodyMedium}`} style={{ color: MD3.color.surface.onVariant }}>{item.label}</span>
        <span 
          className={`${MD3.typography.titleSmall} font-bold px-3 py-1 rounded-lg ${MD3.transition.fast}`}
          style={{ 
            backgroundColor: item.score >= 0 ? MD3.color.tertiary.container : MD3.color.error.container,
            color: item.score >= 0 ? MD3.color.tertiary.onContainer : MD3.color.error.onContainer,
          }}
        >
          {item.score >= 0 ? '+' : ''}{item.score}点
        </span>
      </div>
    ))}
  </div>
);

// 案件詳細モーダル
const JobDetailModal = ({ job, onClose, seekerConditions }) => {
  if (!job) return null;

  const checkCondition = (conditionId) => {
    switch(conditionId) {
      case 'age':
        if (!seekerConditions.age) return { status: 'unknown', message: '年齢未入力' };
        const age = parseInt(seekerConditions.age);
        if (job.minAge && age < job.minAge) return { status: 'fail', message: `最低${job.minAge}歳以上が必要` };
        if (job.maxAge && age > job.maxAge) return { status: 'fail', message: `最高${job.maxAge}歳以下が必要` };
        if (job.maxAge && age >= job.maxAge - 2) return { status: 'warning', message: `年齢上限ギリギリ（${job.maxAge}歳まで）` };
        return { status: 'pass', message: '条件クリア' };
      case 'gender':
        if (job.gender === '不問') return { status: 'pass', message: '性別不問' };
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (jobGender.includes(seekerConditions.gender)) return { status: 'pass', message: '条件クリア' };
        return { status: 'fail', message: `${job.gender}のみ募集` };
      case 'shiftWork':
        if (!seekerConditions.shiftWork) return { status: 'unknown', message: '勤務形態未入力' };
        if (seekerConditions.shiftWork === job.shiftWork) return { status: 'pass', message: '希望と一致' };
        return { status: 'relax', message: `${job.shiftWork}勤務でも可能か要確認` };
      case 'commuteTime':
        if (!job.estimatedTime) return { status: 'unknown', message: '距離計算不可' };
        if (!seekerConditions.commuteTime) return { status: 'unknown', message: '希望通勤時間未入力' };
        if (job.estimatedTime <= seekerConditions.commuteTime) return { status: 'pass', message: '通勤圏内' };
        return { status: 'relax', message: `通勤${job.estimatedTime}分かかるが許容できるか要確認` };
      case 'commuteMethod':
        if (!seekerConditions.commuteMethod) return { status: 'unknown', message: '通勤手段未入力' };
        if (!job.acceptedCommuteMethods || job.acceptedCommuteMethods.length === 0) return { status: 'unknown', message: '通勤手段情報なし' };
        const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
        const methodMatch = job.acceptedCommuteMethods.some(m => m.includes(commuteMethodKey) || commuteMethodKey.includes(m));
        if (methodMatch) return { status: 'pass', message: '通勤手段OK' };
        return { status: 'relax', message: `${job.acceptedCommuteMethods.join('/')}のみ対応、変更可能か要確認` };
      case 'commutePreference':
        if (!seekerConditions.commutePreference || seekerConditions.commutePreference === 'どちらでもいい') {
          return { status: 'unknown', message: '入寮/通勤の希望未入力' };
        }
        if (seekerConditions.commutePreference === '入寮希望' && !job.dormAvailable) {
          return { status: 'relax', message: '入寮不可だが通勤での対応可能か要確認' };
        }
        return { status: 'pass', message: '条件クリア' };
      case 'salary':
        if (!seekerConditions.monthlySalary || !job.monthlySalary) return { status: 'unknown', message: '月収情報なし' };
        const seekerSalary = parseInt(seekerConditions.monthlySalary);
        if (job.monthlySalary >= seekerSalary) return { status: 'pass', message: '希望月収を満たす' };
        return { status: 'relax', message: `月収${job.monthlySalary}万円で許容できるか要確認（希望${seekerSalary}万円）` };
      default:
        return { status: 'unknown', message: '' };
    }
  };

  const conditions = [
    { id: 'age', name: '年齢', canRelax: false },
    { id: 'gender', name: '性別', canRelax: false },
    { id: 'shiftWork', name: '勤務形態', canRelax: true },
    { id: 'commuteTime', name: '通勤時間', canRelax: true },
    { id: 'commuteMethod', name: '通勤手段', canRelax: true },
    { id: 'commutePreference', name: '入寮/通勤', canRelax: true },
    { id: 'salary', name: '月収', canRelax: true }
  ];

  const conditionResults = conditions.map(cond => ({ ...cond, ...checkCondition(cond.id) }));
  const failConditions = conditionResults.filter(c => c.status === 'fail');
  const relaxConditions = conditionResults.filter(c => c.status === 'relax');
  const passConditions = conditionResults.filter(c => c.status === 'pass');

  const InfoRow = ({ label, value, highlight = false }) => (
    <div className={`flex justify-between py-2 border-b border-slate-100 ${highlight ? 'bg-amber-50 -mx-2 px-2' : ''}`}>
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`font-medium text-sm ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>{value || '-'}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="font-bold text-slate-700 mb-2 pb-1 border-b-2 border-indigo-200">{title}</h4>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CompanyRankBadge rank={job.companyRank} />
                <span className="text-sm opacity-90">{job.company}</span>
              </div>
              <h3 className="text-xl font-bold">{job.name}</h3>
              <p className="text-sm opacity-90 mt-1">{job.prefecture} {job.address}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold">{job.pickupScore || '-'}</div>
              <div className="text-xs opacity-90">総合スコア</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold">💰{job.fee}万</div>
              <div className="text-xs opacity-90">Fee</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold">{job.vacancy + (job.nextMonthVacancy || 0)}</div>
              <div className="text-xs opacity-90">欠員数</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <div className="text-2xl font-bold">{job.estimatedTime ? `${job.estimatedTime}分` : '-'}</div>
              <div className="text-xs opacity-90">推定通勤</div>
            </div>
          </div>
        </div>

        {(failConditions.length > 0 || relaxConditions.length > 0) && (
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} />
              条件確認が必要な項目
            </h3>
            
            {failConditions.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-bold text-red-700 mb-2">❌ 絶対条件で不適合（紹介不可）</h4>
                <div className="space-y-1">
                  {failConditions.map(cond => (
                    <div key={cond.id} className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm">
                      <span className="font-bold text-red-800">{cond.name}:</span>
                      <span className="text-red-700 ml-2">{cond.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {relaxConditions.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-amber-700 mb-2">⚠️ 条件緩和が必要（要確認）</h4>
                <div className="space-y-1">
                  {relaxConditions.map(cond => (
                    <div key={cond.id} className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-sm">
                      <span className="font-bold text-amber-800">{cond.name}:</span>
                      <span className="text-amber-700 ml-2">{cond.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {passConditions.length > 0 && (
          <div className="p-4 border-b border-slate-200 bg-emerald-50 flex-shrink-0">
            <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
              <CheckCircle size={16} />
              ✅ クリアしている条件
            </h4>
            <div className="flex flex-wrap gap-2">
              {passConditions.map(cond => (
                <span key={cond.id} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                  {cond.name}: {cond.message}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Section title="💰 給与情報">
                <InfoRow label="総支給額" value={job.monthlySalary ? `${job.monthlySalary}万円（${job.monthlySalaryRaw?.toLocaleString()}円）` : '-'} />
                <InfoRow label="基準内賃金" value={job.baseSalary ? `${job.baseSalary}万円` : '-'} />
                <InfoRow label="Fee" value={job.fee ? `${job.fee}万円（${job.feeRaw?.toLocaleString()}円）` : '-'} highlight />
                <InfoRow label="残業手当（月平均）" value={job.overtimePay} />
                <InfoRow label="休日出勤手当" value={job.holidayPay} />
                <InfoRow label="深夜手当" value={job.nightPay} />
              </Section>

              <Section title="👤 応募条件">
                <InfoRow label="性別" value={job.gender} />
                <InfoRow label="年齢" value={job.minAge || job.maxAge ? `${job.minAge || '-'}歳 〜 ${job.maxAge || '-'}歳` : '不問'} />
                <InfoRow label="制服サイズ上限" value={job.maxClothingSize} />
                <InfoRow label="業務経験" value={job.experienceRequired} />
                {job.experienceDetail && <InfoRow label="業務経験詳細" value={job.experienceDetail} />}
                <InfoRow label="職種経験" value={job.jobExperience} />
                {job.jobExperienceDetail && <InfoRow label="職種経験詳細" value={job.jobExperienceDetail} />}
                <InfoRow label="外国籍" value={job.foreignerAccepted} />
                <InfoRow label="刺青" value={job.tattooAccepted} />
                {job.tattooCondition && <InfoRow label="刺青条件" value={job.tattooCondition} />}
                <InfoRow label="職場見学" value={job.workplaceVisit} />
              </Section>

              <Section title="🚗 通勤・入寮">
                <InfoRow label="可能通勤手段" value={job.acceptedCommuteMethods?.join(' / ') || '-'} />
                <InfoRow label="入寮" value={job.dormAvailable ? '可' : '不可'} highlight={job.dormAvailable} />
                <InfoRow label="社宅費補助" value={job.dormSubsidy} />
                <InfoRow label="社宅費負担" value={job.dormSubsidyType} />
                <InfoRow label="家族入寮" value={job.familyDorm} />
                <InfoRow label="カップル入居" value={job.coupleDorm} />
                {job.distance && <InfoRow label="距離" value={`${job.distance.toFixed(1)}km`} />}
                {job.estimatedTime && <InfoRow label="推定通勤時間" value={`約${job.estimatedTime}分`} />}
              </Section>
            </div>

            <div>
              <Section title="🕐 勤務情報">
                <InfoRow label="勤務形態" value={job.shiftWork} />
                <InfoRow label="シフト" value={job.shift} />
                <InfoRow label="勤務時間①" value={job.workTime1Start && job.workTime1End ? `${job.workTime1Start} 〜 ${job.workTime1End}` : '-'} />
                <InfoRow label="勤務時間②" value={job.workTime2Start && job.workTime2End ? `${job.workTime2Start} 〜 ${job.workTime2End}` : '-'} />
                <InfoRow label="勤務時間③" value={job.workTime3Start && job.workTime3End ? `${job.workTime3Start} 〜 ${job.workTime3End}` : '-'} />
                <InfoRow label="勤務時間④" value={job.workTime4Start && job.workTime4End ? `${job.workTime4Start} 〜 ${job.workTime4End}` : '-'} />
                <InfoRow label="休日" value={job.holidays} />
                <InfoRow label="年間休日" value={job.annualHolidays ? `${job.annualHolidays}日` : '-'} />
                <InfoRow label="残業（月平均）" value={job.overtime ? `${job.overtime}時間` : '-'} />
              </Section>

              <Section title="📊 欠員情報">
                <InfoRow label="当月欠員数" value={job.vacancy ? `${job.vacancy}名` : '0名'} highlight={job.vacancy >= 5} />
                <InfoRow label="翌月欠員数" value={job.nextMonthVacancy ? `${job.nextMonthVacancy}名` : '0名'} />
                <InfoRow label="翌々月欠員数" value={job.nextNextMonthVacancy ? `${job.nextNextMonthVacancy}名` : '0名'} />
              </Section>

              {((job.placement2025 || 0) + (job.placement2024 || 0) > 0) && (
                <Section title="📈 入社実績">
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-700">{job.placement2025 || 0}名</div>
                        <div className="text-xs text-teal-600">2025年実績</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-700">{job.placement2024 || 0}名</div>
                        <div className="text-xs text-emerald-600">2024年実績</div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-teal-200 text-center">
                      <span className="text-sm font-bold text-teal-800">
                        合計 {(job.placement2025 || 0) + (job.placement2024 || 0)}名
                      </span>
                    </div>
                  </div>
                </Section>
              )}

              {job.scoreBreakdown && (
                <Section title="📈 スコア内訳">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <ScoreBreakdown breakdown={job.scoreBreakdown} />
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                      <span>合計</span>
                      <span className="text-indigo-600">{job.pickupScore}点</span>
                    </div>
                  </div>
                </Section>
              )}
            </div>
          </div>

          {(job.merit || job.workDetail || job.remarks) && (
            <div className="mt-4 space-y-3">
              {job.merit && (
                <div className="bg-emerald-50 rounded-lg p-3">
                  <h4 className="font-bold text-emerald-800 mb-1">✨ メリット・訴求ポイント</h4>
                  <p className="text-sm text-emerald-700 whitespace-pre-wrap">{job.merit}</p>
                </div>
              )}
              {job.workDetail && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-bold text-blue-800 mb-1">📋 業務内容詳細</h4>
                  <p className="text-sm text-blue-700 whitespace-pre-wrap">{job.workDetail}</p>
                </div>
              )}
              {job.remarks && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <h4 className="font-bold text-amber-800 mb-1">⚠️ 備考</h4>
                  <p className="text-sm text-amber-700 whitespace-pre-wrap">{job.remarks}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddressInput = ({ value, onChange, onGeocode, isLoading }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !window.L || !mapContainerRef.current) return;
    if (typeof value.lat !== 'number' || typeof value.lng !== 'number') return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = window.L.map(mapContainerRef.current).setView([value.lat, value.lng], 15);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const popupText = value.prefecture + value.city + (value.detail ? ' ' + value.detail : '');
    window.L.marker([value.lat, value.lng])
      .addTo(map)
      .bindPopup(popupText)
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [leafletLoaded, value.lat, value.lng, value.prefecture, value.city, value.detail]);

  const shouldShowMap = typeof value.lat === 'number' && typeof value.lng === 'number';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="text-indigo-600" size={20} />
        <span className="font-semibold text-gray-700">現住所（距離計算用）</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">都道府県 *</label>
          <select
            value={value.prefecture}
            onChange={(e) => onChange({ ...value, prefecture: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map(pref => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">市区町村 *</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="例: 渋谷区"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">詳細住所（任意）</label>
          <input
            type="text"
            value={value.detail}
            onChange={(e) => onChange({ ...value, detail: e.target.value })}
            placeholder="例: 神南1-2-3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onGeocode}
          disabled={!value.prefecture || !value.city || isLoading}
          className={
            !value.prefecture || !value.city || isLoading
              ? 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-indigo-600 text-white hover:bg-indigo-700'
          }
        >
          {isLoading ? (
            <React.Fragment>
              <Loader className="animate-spin" size={16} />
              変換中...
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Navigation size={16} />
              位置を取得
            </React.Fragment>
          )}
        </button>
        {shouldShowMap && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <Check size={16} />
            <span>
              位置取得済み
              {value.accuracy === 'approximate' && (
                <span className="text-amber-600 ml-1">（概算）</span>
              )}
            </span>
          </div>
        )}
      </div>

      {shouldShowMap && (
  <div className="mt-4 border-2 border-indigo-200 rounded-xl overflow-hidden bg-white shadow-lg">
    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MapPin className="text-indigo-600" size={18} />
        <span className="font-semibold text-indigo-800 text-sm">取得した位置</span>
      </div>
      
      <a
        href={'https://www.openstreetmap.org/?mlat=' + value.lat + '&mlon=' + value.lng + '&zoom=15'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition"
      >
        <ExternalLink size={14} />
        OpenStreetMapで開く
      </a>
    </div>
    
    <div 
      ref={mapContainerRef}
      style={{ width: '100%', height: '400px', background: '#f1f5f9' }}
    />
    
    <div className="px-4 py-3 bg-slate-50 text-xs text-slate-600 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <span className="font-mono">{value.lat.toFixed(6) + ', ' + value.lng.toFixed(6)}</span>
        <span className="text-slate-500">{value.prefecture + value.city + value.detail}</span>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
// =====================================
// メインコンポーネント
// =====================================

const JobMatchingFlowchart = () => {
  const commuteMethods = [
    { value: '', label: '未設定' },
    { value: '自家用車', label: '🚗 自家用車' },
    { value: '自転車', label: '🚲 自転車' },
    { value: 'バイク', label: '🏍️ バイク' },
    { value: 'バス', label: '🚌 バス' },
    { value: '電車', label: '🚊 電車' },
    { value: '徒歩', label: '🚶 徒歩' }
  ];

  const shiftWorkOptions = ['日勤', '夜勤', '2交替', '3交替', 'シフト制'];
  const genderOptions = ['男性', '女性'];
  const commutePreferenceOptions = ['', '通勤希望', '入寮希望', 'どちらでもいい'];

  // State
  const [mainStep, setMainStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [seekerConditions, setSeekerConditions] = useState({
    age: '',
    gender: '男性',
    monthlySalary: '',
    shiftWork: '',
    commuteTime: 30,
    commutePreference: '',
    commuteMethod: '',
    address: { prefecture: '', city: '', detail: '', lat: null, lng: null, accuracy: null },
    priorities: { salary: 5, shiftWork: 4, commuteTime: 3, commuteMethod: 3, commutePreference: 2 }
  });

  const [pickedJobs, setPickedJobs] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedConditions, setExpandedConditions] = useState(new Set(['immediate', 'possible']));
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedJobForTracking, setSelectedJobForTracking] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  
  const [selectedCompanies, setSelectedCompanies] = useState(new Set());
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const canvasRef = useRef(null);
  const treeContainerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [zoom, setZoom] = useState(0.6);
  const [flowTree, setFlowTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [treeContentSize, setTreeContentSize] = useState({ width: 0, height: 0 });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getUniqueCompanies = () => {
    const companies = new Set();
    pickedJobs.forEach(job => {
      if (job.company) companies.add(job.company);
    });
    return Array.from(companies).sort();
  };

  const uniqueCompanies = getUniqueCompanies();

  const toggleCompanySelection = (company) => {
    setSelectedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  };

  const selectAllCompanies = () => {
    setSelectedCompanies(new Set(uniqueCompanies));
  };

  const deselectAllCompanies = () => {
    setSelectedCompanies(new Set());
  };

  const getFilteredAndSortedJobs = () => {
    let filtered = [...pickedJobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.name?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.prefecture?.toLowerCase().includes(query) ||
        job.address?.toLowerCase().includes(query) ||
        job.id?.toLowerCase().includes(query)
      );
    }

    if (selectedCompanies.size > 0) {
      filtered = filtered.filter(job => selectedCompanies.has(job.company));
    }

    if (activeTab === 'day-shift') {
      filtered = filtered.filter(job => job.shiftWork === '日勤');
    } else if (activeTab === 'other-shift') {
      filtered = filtered.filter(job => job.shiftWork !== '日勤');
    } else if (activeTab === 'high-fee') {
      filtered = filtered.filter(job => job.fee >= 40);
    } else if (activeTab === 'placement-history') {
      filtered = filtered.filter(job => (job.placement2025 || 0) + (job.placement2024 || 0) > 0);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.pickupScore || 0) - (a.pickupScore || 0);
        case 'fee':
          return (b.fee || 0) - (a.fee || 0);
        case 'distance':
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        case 'vacancy':
          const aVacancy = (a.vacancy || 0) + (a.nextMonthVacancy || 0);
          const bVacancy = (b.vacancy || 0) + (b.nextMonthVacancy || 0);
          return bVacancy - aVacancy;
        case 'salary':
          return (b.monthlySalary || 0) - (a.monthlySalary || 0);
        case 'placement':
          const aPlacement = (a.placement2025 || 0) + (a.placement2024 || 0);
          const bPlacement = (b.placement2025 || 0) + (b.placement2024 || 0);
          return bPlacement - aPlacement;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPickedJobs = getFilteredAndSortedJobs();

  const toggleJobSelection = (jobId) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const selectAllFiltered = () => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      filteredPickedJobs.forEach(job => newSet.add(job.id));
      return newSet;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      filteredPickedJobs.forEach(job => newSet.delete(job.id));
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedJobIds(new Set(pickedJobs.map(job => job.id)));
  };

  const deselectAll = () => {
    setSelectedJobIds(new Set());
  };

  
  const fetchSpreadsheetData = async () => {
    setIsLoading(true);
    setLoadingMessage('スプレッドシートからデータを取得中...');
  
    try {
      // ⭐ 緯度経度マスターの取得（追加） ⭐
      setLoadingMessage('緯度経度マスターを読み込み中...');
      const masterUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=緯度経度マスター&tqx=out:json`;
      const masterResponse = await fetch(masterUrl);
      const masterText = await masterResponse.text();
      
      const masterJsonMatch = masterText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      const addressMasterMap = new Map();
      
      if (masterJsonMatch) {
        const masterData = JSON.parse(masterJsonMatch[1]);
        const masterRows = masterData.table.rows;
        
        // A列: Aid, B列: 都道府県, C列: 住所
        masterRows.forEach(row => {
          if (row.c && row.c[0]) {
            const aid = row.c[0].v || '';
            const prefecture = row.c[1] ? (row.c[1].v || '') : '';
            const address = row.c[2] ? (row.c[2].v || '') : '';
            
            if (aid) {
              addressMasterMap.set(aid, { prefecture, address });
            }
          }
        });
        
        console.log(`緯度経度マスターから${addressMasterMap.size}件の住所情報を取得しました`);
      }
      
      // 案件一覧の取得
      setLoadingMessage('案件一覧を読み込み中...');
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
      const response = await fetch(url);
      const text = await response.text();
      
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      if (!jsonMatch) throw new Error('データの解析に失敗しました');
      
      const data = JSON.parse(jsonMatch[1]);
      const rows = data.table.rows;
      const headers = data.table.cols.map(col => col.label);
      
      // ⭐ addressMasterMapを渡す（修正） ⭐
      const transformedJobs = rows.map(row => transformSpreadsheetData(row, headers, addressMasterMap))
        .filter(job => job.name && job.status === 'オープン');
  
      setAllJobs(transformedJobs);
      setLastFetchTime(new Date());
      showToast(`${transformedJobs.length}件の案件を取得しました`, 'success');
      if (mainStep === 0) setMainStep(1);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('データの取得に失敗しました: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGeocode = async () => {
    const { prefecture, city, detail } = seekerConditions.address;
    if (!prefecture || !city) return;

    setIsLoading(true);
    setLoadingMessage('住所を変換中...');

    try {
      const result = await geocodeAddress(prefecture, city, detail);
      if (result) {
        setSeekerConditions(prev => ({
          ...prev,
          address: { ...prev.address, lat: result.lat, lng: result.lng, accuracy: result.accuracy }
        }));
        showToast(result.accuracy === 'approximate' ? '概算位置を取得しました' : '住所を変換しました', result.accuracy === 'approximate' ? 'warning' : 'success');
      } else {
        showToast('住所が見つかりませんでした', 'error');
      }
    } catch (error) {
      showToast('変換中にエラーが発生しました', 'error');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // 全件表示モード（新規追加）
  const runFullListMode = async () => {
    if (allJobs.length === 0) {
      showToast('案件データを取得してください', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('全案件を表示中...');

    const picked = allJobs.map(job => {
      let distance = null;
      let estimatedTime = null;

      if (seekerConditions.address.lat && seekerConditions.address.lng && job.lat && job.lng) {
        distance = calculateDistance(seekerConditions.address.lat, seekerConditions.address.lng, job.lat, job.lng);
        if (seekerConditions.commuteMethod) {
          estimatedTime = estimateCommuteTime(distance, seekerConditions.commuteMethod);
        }
      }

      const scoreBreakdown = [];
      let totalScore = 0;

      if (distance !== null) {
        const distanceScore = Math.max(0, 25 - Math.floor(distance / 10) * 5);
        scoreBreakdown.push({ label: `距離（${distance.toFixed(1)}km）`, score: distanceScore });
        totalScore += distanceScore;
      } else {
        scoreBreakdown.push({ label: '距離（計算不可）', score: 0 });
      }

      let feeScore = 0;
      if (job.fee >= 30) {
        feeScore = 20;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）超高額`, score: 20 });
      } else if (job.fee >= 25) {
        feeScore = 16;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）高額`, score: 16 });
      } else if (job.fee >= 20) {
        feeScore = 12;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）標準`, score: 12 });
      } else if (job.fee >= 15) {
        feeScore = 8;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）`, score: 8 });
      } else {
        feeScore = 4;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）低め`, score: 4 });
      }
      totalScore += feeScore;

      let companyScore = 0;
      if (job.companyRank === 'S') {
        companyScore = 15;
        scoreBreakdown.push({ label: `会社ランク（S: ${COMPANY_RANKS['S'].description}）`, score: 15 });
      } else if (job.companyRank === 'A') {
        companyScore = 12;
        scoreBreakdown.push({ label: `会社ランク（A: ${COMPANY_RANKS['A'].description}）`, score: 12 });
      } else if (job.companyRank === 'B') {
        companyScore = 8;
        scoreBreakdown.push({ label: `会社ランク（B: ${COMPANY_RANKS['B'].description}）`, score: 8 });
      } else {
        companyScore = 4;
        scoreBreakdown.push({ label: `会社ランク（C: その他）`, score: 4 });
      }
      totalScore += companyScore;

      const totalVacancy = (job.vacancy || 0) + (job.nextMonthVacancy || 0) + (job.nextNextMonthVacancy || 0);
      let vacancyScore = 0;
      if (totalVacancy >= 20) {
        vacancyScore = 25;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）超大量！`, score: 25 });
      } else if (totalVacancy >= 10) {
        vacancyScore = 20;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）大量`, score: 20 });
      } else if (totalVacancy >= 5) {
        vacancyScore = 15;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）多め`, score: 15 });
      } else if (totalVacancy >= 3) {
        vacancyScore = 10;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）`, score: 10 });
      } else if (totalVacancy >= 1) {
        vacancyScore = 5;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）少なめ`, score: 5 });
      } else {
        scoreBreakdown.push({ label: '欠員数（0名）', score: 0 });
      }
      totalScore += vacancyScore;

      return {
        ...job,
        pickupScore: totalScore,
        scoreBreakdown,
        distance,
        estimatedTime
      };
    });

    picked.sort((a, b) => {
      if (!a.distance && !b.distance) return 0;
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    });

    setPickedJobs(picked);
    setSelectedJobIds(new Set());
    setSearchQuery('');
    setActiveTab('all');
    setSelectedCompanies(new Set());
    setSortBy('distance');
    setMainStep(2);
    setIsLoading(false);
    
    showToast(`${picked.length}件を表示しました`, 'success');
  };

  const runAutoPickup = async () => {
    if (allJobs.length === 0) {
      showToast('案件データを取得してください', 'warning');
      return;
    }
    if (!seekerConditions.age) {
      showToast('年齢を入力してください', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('案件を自動ピックアップ中...');

    const seekerAge = parseInt(seekerConditions.age);
    const seekerLat = seekerConditions.address.lat;
    const seekerLng = seekerConditions.address.lng;
    const seekerSalary = seekerConditions.monthlySalary ? parseInt(seekerConditions.monthlySalary) : null;
    const maxCommuteTime = seekerConditions.commuteTime;

    const picked = [];

    for (const job of allJobs) {
      let eligible = true;
      const scoreBreakdown = [];
      let totalScore = 0;

      if (job.minAge && seekerAge < job.minAge) { eligible = false; continue; }
      if (job.maxAge && seekerAge > job.maxAge) { eligible = false; continue; }

      if (job.gender !== '不問') {
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (!jobGender.includes(seekerConditions.gender)) { eligible = false; continue; }
      }

      let distance = null;
      let estimatedTime = null;

      if (seekerLat && seekerLng && job.lat && job.lng) {
        distance = calculateDistance(seekerLat, seekerLng, job.lat, job.lng);
        
        if (seekerConditions.commuteMethod) {
          estimatedTime = estimateCommuteTime(distance, seekerConditions.commuteMethod);
          
          if (estimatedTime > 80) {
            eligible = false;
            continue;
          }
        }
      }

      if (!eligible) continue;

      if (estimatedTime !== null && seekerConditions.commuteMethod) {
        let distanceScore = 0;
        
        if (estimatedTime <= maxCommuteTime) {
          distanceScore = SCORE_WEIGHTS.distance;
          scoreBreakdown.push({ 
            label: `通勤時間（${estimatedTime}分/${maxCommuteTime}分）✨希望範囲内`, 
            score: distanceScore 
          });
        } else if (estimatedTime <= 60) {
          const overTimeRatio = (estimatedTime - maxCommuteTime) / (60 - maxCommuteTime);
          distanceScore = Math.round(SCORE_WEIGHTS.distance * (1 - overTimeRatio));
          const overMinutes = estimatedTime - maxCommuteTime;
          scoreBreakdown.push({ 
            label: `通勤時間（${estimatedTime}分）⚠️希望+${overMinutes}分`, 
            score: distanceScore 
          });
        }
        
        totalScore += distanceScore;
      } else if (distance !== null) {
        scoreBreakdown.push({ label: '通勤時間（手段未設定）', score: Math.round(SCORE_WEIGHTS.distance / 2) });
        totalScore += Math.round(SCORE_WEIGHTS.distance / 2);
      } else {
        scoreBreakdown.push({ label: '通勤時間（計算不可）', score: 0 });
      }

      const totalVacancy = (job.vacancy || 0) + (job.nextMonthVacancy || 0) + (job.nextNextMonthVacancy || 0);
      let vacancyScore = 0;
      if (totalVacancy >= 20) {
        vacancyScore = 25;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）超大量！`, score: 25 });
      } else if (totalVacancy >= 10) {
        vacancyScore = 20;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）大量`, score: 20 });
      } else if (totalVacancy >= 5) {
        vacancyScore = 15;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）多め`, score: 15 });
      } else if (totalVacancy >= 3) {
        vacancyScore = 10;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）`, score: 10 });
      } else if (totalVacancy >= 1) {
        vacancyScore = 5;
        scoreBreakdown.push({ label: `欠員数（${totalVacancy}名）少なめ`, score: 5 });
      } else {
        scoreBreakdown.push({ label: '欠員数（0名）', score: 0 });
      }
      totalScore += vacancyScore;

      let feeScore = 0;
      if (job.fee >= 30) {
        feeScore = 20;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）超高額`, score: 20 });
      } else if (job.fee >= 25) {
        feeScore = 16;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）高額`, score: 16 });
      } else if (job.fee >= 20) {
        feeScore = 12;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）標準`, score: 12 });
      } else if (job.fee >= 15) {
        feeScore = 8;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）`, score: 8 });
      } else {
        feeScore = 4;
        scoreBreakdown.push({ label: `Fee（${job.fee}万）低め`, score: 4 });
      }
      totalScore += feeScore;

      let companyScore = 0;
      if (job.companyRank === 'S') {
        companyScore = 15;
        scoreBreakdown.push({ label: `会社ランク（S: ${COMPANY_RANKS['S'].description}）`, score: 15 });
      } else if (job.companyRank === 'A') {
        companyScore = 12;
        scoreBreakdown.push({ label: `会社ランク（A: ${COMPANY_RANKS['A'].description}）`, score: 12 });
      } else if (job.companyRank === 'B') {
        companyScore = 8;
        scoreBreakdown.push({ label: `会社ランク（B: ${COMPANY_RANKS['B'].description}）`, score: 8 });
      } else {
        companyScore = 4;
        scoreBreakdown.push({ label: `会社ランク（C: その他）`, score: 4 });
      }
      totalScore += companyScore;

      if (seekerSalary && job.monthlySalary) {
        if (job.monthlySalary >= seekerSalary) {
          scoreBreakdown.push({ label: `給与（${job.monthlySalary}万 ≥ 希望${seekerSalary}万）`, score: 10 });
          totalScore += 10;
        } else {
          const deficit = seekerSalary - job.monthlySalary;
          const penalty = Math.min(10, deficit * 2);
          scoreBreakdown.push({ label: `給与（${job.monthlySalary}万 < 希望${seekerSalary}万）⚠️`, score: -penalty });
          totalScore -= penalty;
        }
      } else {
        scoreBreakdown.push({ label: '給与（未設定）', score: 5 });
        totalScore += 5;
      }

      if (seekerConditions.shiftWork) {
        if (seekerConditions.shiftWork === job.shiftWork) {
          scoreBreakdown.push({ label: `勤務形態（${job.shiftWork}）一致`, score: 5 });
          totalScore += 5;
        } else {
          scoreBreakdown.push({ label: `勤務形態（${job.shiftWork}）不一致`, score: 0 });
        }
      } else {
        scoreBreakdown.push({ label: '勤務形態（未設定）', score: 2 });
        totalScore += 2;
      }

      if (job.maxAge && seekerAge >= job.maxAge - 2) {
        scoreBreakdown.push({ label: `年齢上限ギリギリ（${job.maxAge}歳）`, score: SCORE_WEIGHTS.ageWarning });
        totalScore += SCORE_WEIGHTS.ageWarning;
      }

      if (seekerConditions.commuteMethod) {
        const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
        const methodMatch = job.acceptedCommuteMethods.some(method => 
          method.includes(commuteMethodKey) || commuteMethodKey.includes(method.replace('自家用', ''))
        );
        if (!methodMatch && job.acceptedCommuteMethods.length > 0) {
          scoreBreakdown.push({ label: `通勤手段（${job.acceptedCommuteMethods.join('/')}のみ）`, score: SCORE_WEIGHTS.commuteMethodMismatch });
          totalScore += SCORE_WEIGHTS.commuteMethodMismatch;
        }
      }

      if (seekerConditions.commutePreference === '入寮希望' && !job.dormAvailable) {
        scoreBreakdown.push({ label: '入寮不可', score: SCORE_WEIGHTS.dormMismatch });
        totalScore += SCORE_WEIGHTS.dormMismatch;
      }

      picked.push({
        ...job,
        pickupScore: Math.max(0, totalScore),
        scoreBreakdown,
        distance,
        estimatedTime
      });
    }

    picked.sort((a, b) => {
      if (!a.distance && !b.distance) return 0;
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    });

    setPickedJobs(picked);
    setSelectedJobIds(new Set());
    setSearchQuery('');
    setActiveTab('all');
    setSelectedCompanies(new Set());
    
    if (seekerConditions.commuteMethod && seekerConditions.commuteTime) {
      setSortBy('score');
    } else {
      setSortBy('distance');
    }
    
    setMainStep(2);
    setIsLoading(false);
    
    if (picked.length === 0) {
      showToast('該当する案件がありませんでした', 'warning');
    } else {
      showToast(`${picked.length}件をピックアップしました`, 'success');
    }
  };

  const checkCommutePreferenceMatch = (job) => {
    if (!seekerConditions.commutePreference || seekerConditions.commutePreference === 'どちらでもいい') return true;
    if (job.commuteOption === 'どちらも可') return true;
    if (seekerConditions.commutePreference === '通勤希望' && (job.commuteOption === '通勤可' || job.commuteOption === 'どちらも可')) return true;
    if (seekerConditions.commutePreference === '入寮希望' && (job.commuteOption === '入寮可' || job.commuteOption === 'どちらも可')) return true;
    return false;
  };

  const checkConditionDetail = (job, conditionId) => {
    switch(conditionId) {
      case 'age':
        if (!seekerConditions.age) return { pass: true, reason: '' };
        const age = parseInt(seekerConditions.age);
        if (job.minAge && age < parseInt(job.minAge)) return { pass: false, reason: `最低年齢${job.minAge}歳以上が必要` };
        if (job.maxAge && age > parseInt(job.maxAge)) return { pass: false, reason: `最高年齢${job.maxAge}歳以下が必要` };
        return { pass: true, reason: '' };
      case 'gender':
        if (job.gender === '不問') return { pass: true, reason: '' };
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (jobGender.includes(seekerConditions.gender)) return { pass: true, reason: '' };
        return { pass: false, reason: `性別要件:${job.gender}` };
      case 'shiftWork':
        if (!seekerConditions.shiftWork) return { pass: true, reason: '' };
        if (seekerConditions.shiftWork === job.shiftWork) return { pass: true, reason: '' };
        return { pass: false, reason: `勤務形態不一致`, current: seekerConditions.shiftWork, required: job.shiftWork, question: `${job.shiftWork}勤務でも大丈夫ですか?` };
      case 'commuteTime':
        if (!seekerConditions.commuteTime || !job.estimatedTime) return { pass: true, reason: '' };
        if (parseInt(seekerConditions.commuteTime) >= parseInt(job.estimatedTime)) return { pass: true, reason: '' };
        return { pass: false, reason: `通勤時間超過`, current: `${seekerConditions.commuteTime}分`, required: `${job.estimatedTime}分`, question: `通勤${job.estimatedTime}分でも大丈夫ですか?` };
      case 'commuteMethod':
        if (!seekerConditions.commuteMethod) return { pass: true, reason: '' };
        const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
        if (job.acceptedCommuteMethods?.some(m => m.includes(commuteMethodKey) || commuteMethodKey.includes(m))) return { pass: true, reason: '' };
        return { pass: false, reason: `通勤手段不一致`, current: seekerConditions.commuteMethod, required: job.acceptedCommuteMethods?.join('、'), question: `${job.acceptedCommuteMethods?.join('または')}での通勤は可能ですか?` };
      case 'commutePreference':
        if (checkCommutePreferenceMatch(job)) return { pass: true, reason: '' };
        return { pass: false, reason: `通勤・入寮の要件不一致`, current: seekerConditions.commutePreference, required: job.commuteOption, question: job.commuteOption === '入寮可' ? '入寮は可能ですか?' : '通勤は可能ですか?' };
      case 'salary':
        if (!seekerConditions.monthlySalary || !job.monthlySalary) return { pass: true, reason: '' };
        if (parseInt(seekerConditions.monthlySalary) <= parseInt(job.monthlySalary)) return { pass: true, reason: '' };
        return { pass: false, reason: `月収不足`, current: `${seekerConditions.monthlySalary}万円希望`, required: `${job.monthlySalary}万円`, question: `月収${job.monthlySalary}万円でも大丈夫ですか?` };
      default:
        return { pass: true, reason: '' };
    }
  };

  const analyzeJobDetail = (job) => {
    const conditions = [
      { id: 'age', name: '年齢', canRelax: false },
      { id: 'gender', name: '性別', canRelax: false },
      { id: 'shiftWork', name: '勤務形態', canRelax: true },
      { id: 'commuteTime', name: '通勤時間', canRelax: true },
      { id: 'commuteMethod', name: '通勤手段', canRelax: true },
      { id: 'commutePreference', name: '通勤・入寮', canRelax: true },
      { id: 'salary', name: '月収', canRelax: true }
    ];

    const results = conditions.map(condition => ({ ...condition, ...checkConditionDetail(job, condition.id) }));
    const failedConditions = results.filter(r => !r.pass);
    const relaxableFailedConditions = failedConditions.filter(r => r.canRelax);
    const nonRelaxableFailedConditions = failedConditions.filter(r => !r.canRelax);

    return {
      job, score: job.pickupScore || 0, allConditions: results, failedConditions,
      relaxableFailedConditions, nonRelaxableFailedConditions,
      isImmediateMatch: failedConditions.length === 0,
      isPossibleMatch: nonRelaxableFailedConditions.length === 0
    };
  };

  const buildFlowTree = (jobsToAnalyze) => {
    const targetJobs = jobsToAnalyze || jobs;
    const rootNode = { id: 'root', level: 0, type: 'start', jobs: [...targetJobs], children: [] };
    const conditions = [
      { id: 'age', name: '年齢', canRelax: false },
      { id: 'gender', name: '性別', canRelax: false },
      { id: 'shiftWork', name: '勤務形態', canRelax: true },
      { id: 'commuteTime', name: '通勤時間', canRelax: true },
      { id: 'commuteMethod', name: '通勤手段', canRelax: true },
      { id: 'commutePreference', name: '通勤・入寮', canRelax: true },
      { id: 'salary', name: '月収', canRelax: true }
    ];

    const buildNode = (parentNode, remainingConditions, level) => {
      if (remainingConditions.length === 0) {
        if (parentNode.jobs.length > 0) {
          parentNode.children.push({ id: `${parentNode.id}-success`, level, type: 'success', jobs: parentNode.jobs, children: [] });
        }
        return;
      }
      if (parentNode.jobs.length === 0) return;

      const condition = remainingConditions[0];
      const passJobs = parentNode.jobs.filter(job => checkConditionDetail(job, condition.id).pass);
      const failJobs = parentNode.jobs.filter(job => !checkConditionDetail(job, condition.id).pass);

      if (passJobs.length > 0) {
        const passNode = { id: `${parentNode.id}-${condition.id}-pass`, level, type: 'pass', condition: condition.name, conditionId: condition.id, jobs: passJobs, children: [] };
        parentNode.children.push(passNode);
        buildNode(passNode, remainingConditions.slice(1), level + 1);
      }

      if (failJobs.length > 0) {
        if (condition.canRelax) {
          const relaxNode = { id: `${parentNode.id}-${condition.id}-relax`, level, type: 'relax', condition: condition.name, conditionId: condition.id, jobs: failJobs, excludedJobs: [], children: [] };
          parentNode.children.push(relaxNode);
          const relaxAcceptedNode = { id: `${relaxNode.id}-accepted`, level: level + 1, type: 'relax-accepted', condition: '緩和OK', conditionId: condition.id, jobs: failJobs, children: [] };
          relaxNode.children.push(relaxAcceptedNode);
          buildNode(relaxAcceptedNode, remainingConditions.slice(1), level + 2);
          const relaxRejectedNode = { id: `${relaxNode.id}-rejected`, level: level + 1, type: 'relax-rejected', condition: '緩和NG', conditionId: condition.id, jobs: [], excludedJobs: failJobs, children: [] };
          relaxNode.children.push(relaxRejectedNode);
          relaxRejectedNode.children.push({ id: `${relaxRejectedNode.id}-fail`, level: level + 2, type: 'fail', jobs: [], excludedJobs: failJobs, children: [] });
        } else {
          const excludeNode = { id: `${parentNode.id}-${condition.id}-exclude`, level, type: 'exclude', condition: condition.name, conditionId: condition.id, jobs: [], excludedJobs: failJobs, children: [] };
          parentNode.children.push(excludeNode);
          excludeNode.children.push({ id: `${excludeNode.id}-fail`, level: level + 1, type: 'fail', jobs: [], excludedJobs: failJobs, children: [] });
        }
      }
    };

    buildNode(rootNode, conditions, 1);
    return rootNode;
  };

  const calculateNodePositions = (node, x = 500, y = 50, positions = {}) => {
    positions[node.id] = { x, y };
    if (node.children && node.children.length > 0) {
      const childSpacing = 500;
      const totalWidth = (node.children.length - 1) * childSpacing;
      let startX = x - totalWidth / 2;
      node.children.forEach((child, index) => {
        calculateNodePositions(child, startX + index * childSpacing, y + 180, positions);
      });
    }
    return positions;
  };

  const normalizePositions = (positions) => {
    const posArray = Object.values(positions);
    if (posArray.length === 0) return positions;
    const minX = Math.min(...posArray.map(p => p.x));
    const minY = Math.min(...posArray.map(p => p.y));
    const offsetX = minX < 0 ? -minX + 50 : 0;
    const offsetY = minY < 0 ? -minY + 50 : 0;
    if (offsetX === 0 && offsetY === 0) return positions;
    const normalized = {};
    Object.keys(positions).forEach(key => {
      normalized[key] = { x: positions[key].x + offsetX, y: positions[key].y + offsetY };
    });
    return normalized;
  };

  const getPathToJob = (node, targetJobId, path = []) => {
    if (node.jobs && node.jobs.some(job => job.id === targetJobId)) return [...path, node.id];
    for (const child of node.children || []) {
      const foundPath = getPathToJob(child, targetJobId, [...path, node.id]);
      if (foundPath) return foundPath;
    }
    return null;
  };

  const toggleConditionExpansion = (key) => {
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const toggleCheckItem = (jobId, conditionId) => {
    const key = `${jobId}-${conditionId}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleFitToScreen = () => setZoom(0.6);

  const startFlowAnalysis = () => {
    if (selectedJobIds.size === 0) { 
      showToast('分析する案件を選択してください', 'warning'); 
      return; 
    }
    setIsLoading(true);
    setLoadingMessage('フロー分析中...');

    setTimeout(() => {
      const selectedJobs = pickedJobs
        .filter(job => selectedJobIds.has(job.id))
        .slice(0, 100)
        .map(job => ({
          ...job,
          commuteTime: job.estimatedTime || seekerConditions.commuteTime,
          commuteOption: job.dormAvailable ? 'どちらも可' : '通勤可',
        }));

      setJobs(selectedJobs);
      
      const tree = buildFlowTree(selectedJobs);
      setFlowTree(tree);
      const positions = calculateNodePositions(tree);
      const normalizedPositions = normalizePositions(positions);
      setNodePositions(normalizedPositions);
      const posArray = Object.values(normalizedPositions);
      if (posArray.length > 0) {
        setTreeContentSize({ 
          width: Math.max(...posArray.map(p => p.x)) + 250, 
          height: Math.max(...posArray.map(p => p.y)) + 200 
        });
      }
      
      setShowAnalysis(true);
      setMainStep(3);
      setIsLoading(false);
      showToast(`${selectedJobs.length}件の案件で分析が完了しました`, 'success');
    }, 500);
  };

  const exportToCSV = () => {
    const headers = ['案件名', '派遣会社', 'ランク', 'スコア', '距離(km)', '推定通勤(分)', 'Fee(万)', '月収(万)', '欠員数', '都道府県', '住所', '2025実績', '2024実績'];
    const rows = pickedJobs.map(job => [
      job.name, job.company, job.companyRank, job.pickupScore, job.distance?.toFixed(1) || '-',
      job.estimatedTime || '-', job.fee, job.monthlySalary, job.vacancy, job.prefecture, job.address,
      job.placement2025 || 0, job.placement2024 || 0
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `matching_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSVをダウンロードしました', 'success');
  };

  const analysisResults = jobs.map(analyzeJobDetail);
  const immediateMatches = analysisResults.filter(r => r.isImmediateMatch);
  const possibleMatches = analysisResults.filter(r => !r.isImmediateMatch && r.isPossibleMatch);
  const impossibleMatches = analysisResults.filter(r => !r.isPossibleMatch);

  useEffect(() => {
    if (!canvasRef.current || !flowTree || Object.keys(nodePositions).length === 0) return;
    const canvas = canvasRef.current;
    canvas.width = treeContentSize.width;
    canvas.height = treeContentSize.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trackingPath = selectedJobForTracking && flowTree ? getPathToJob(flowTree, selectedJobForTracking) : null;

    const drawConnections = (node) => {
      const parentPos = nodePositions[node.id];
      if (!parentPos) return;
      (node.children || []).forEach(child => {
        const childPos = nodePositions[child.id];
        if (!childPos) return;
        const isOnPath = trackingPath && trackingPath.includes(node.id) && trackingPath.includes(child.id);
        ctx.beginPath();
        ctx.moveTo(parentPos.x + 100, parentPos.y + 70);
        const midY = (parentPos.y + 70 + childPos.y) / 2;
        ctx.bezierCurveTo(parentPos.x + 100, midY, childPos.x + 100, midY, childPos.x + 100, childPos.y);
        if (child.type === 'exclude' || child.type === 'fail' || child.type === 'relax-rejected') {
          ctx.strokeStyle = isOnPath ? '#9333ea' : '#ef4444';
          ctx.setLineDash([5, 5]);
        } else if (child.type === 'relax') {
          ctx.strokeStyle = isOnPath ? '#9333ea' : '#f59e0b';
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isOnPath ? '#9333ea' : '#22c55e';
          ctx.setLineDash([]);
        }
        ctx.lineWidth = isOnPath ? 4 : 2;
        ctx.stroke();
        ctx.setLineDash([]);
        drawConnections(child);
      });
    };
    drawConnections(flowTree);
  }, [flowTree, nodePositions, selectedJobForTracking, treeContentSize]);

  useEffect(() => { fetchSpreadsheetData(); }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: MD3.color.background }}>
      <header 
        className={`${MD3.elevation[2]} sticky top-0 z-40 border-b`}
        style={{ backgroundColor: MD3.color.surface.main, borderColor: MD3.color.outlineVariant }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: MD3.color.primary.main }}>
                <Briefcase style={{ color: MD3.color.primary.onMain }} size={28} />
              </div>
              <div>
                <h1 className={MD3.typography.titleLarge} style={{ color: MD3.color.onSurface }}>案件マッチングツール</h1>
                <p className={MD3.typography.bodySmall} style={{ color: MD3.color.surface.onVariant }}>柔軟な条件設定で最適な案件をピックアップ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchSpreadsheetData} 
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${MD3.transition.standard}`}
                style={{ backgroundColor: MD3.color.surface.variant, color: MD3.color.onSurface, opacity: isLoading ? 0.6 : 1 }}
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                <span className={MD3.typography.labelMedium}>データ更新</span>
              </button>
              {allJobs.length > 0 && (
                <span className={`${MD3.typography.bodySmall} hidden md:block`} style={{ color: MD3.color.surface.onVariant }}>
                  全{allJobs.length}件 / 更新: {lastFetchTime?.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <ProgressStepper currentStep={mainStep} steps={['データ取得', '求職者情報', '案件ピックアップ', '分岐フロー']} />

        {/* Step 1は次のコメントに続きます */}

{/* Step 1: 求職者情報入力 */}
        {mainStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${MD3.elevation[1]} rounded-3xl p-6`} style={{ backgroundColor: MD3.color.surface.main }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: MD3.color.primary.container }}>
                    <User size={24} style={{ color: MD3.color.primary.main }} />
                  </div>
                  <h2 className={MD3.typography.titleLarge} style={{ color: MD3.color.onSurface }}>求職者基本情報</h2>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${MD3.typography.labelMedium} mb-2`} style={{ color: MD3.color.onSurface }}>
                        年齢 <span style={{ color: MD3.color.error.main }}>*</span>
                      </label>
                      <input 
                        type="number" 
                        value={seekerConditions.age}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="例: 35" 
                        className={`w-full px-4 py-3 rounded-xl ${MD3.transition.fast} border-2`}
                        style={{ backgroundColor: MD3.color.surface.variant, borderColor: MD3.color.outline, color: MD3.color.onSurface }}
                      />
                    </div>
                    <div>
                      <label className={`block ${MD3.typography.labelMedium} mb-2`} style={{ color: MD3.color.onSurface }}>
                        性別 <span style={{ color: MD3.color.error.main }}>*</span>
                      </label>
                      <select 
                        value={seekerConditions.gender}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, gender: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl ${MD3.transition.fast} border-2`}
                        style={{ backgroundColor: MD3.color.surface.variant, borderColor: MD3.color.outline, color: MD3.color.onSurface }}
                      >
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4" style={{ backgroundColor: MD3.color.warning.container, border: `1px solid ${MD3.color.warning.main}` }}>
                    <h3 className={`${MD3.typography.labelLarge} mb-1 flex items-center gap-2`} style={{ color: MD3.color.warning.onContainer }}>
                      <Settings size={16} />
                      オプション設定
                    </h3>
                    <p className={MD3.typography.bodySmall} style={{ color: MD3.color.warning.onContainer }}>
                      以下の項目は未入力でも検索可能です。入力すると精度が向上します。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block ${MD3.typography.labelMedium} mb-2 flex items-center gap-2`} style={{ color: MD3.color.onSurface }}>
                        希望月収（万円）
                        <span className={`${MD3.typography.labelSmall} px-2 py-0.5 rounded-full`} style={{ backgroundColor: MD3.color.warning.container, color: MD3.color.warning.onContainer }}>オプション</span>
                      </label>
                      <input 
                        type="number" 
                        value={seekerConditions.monthlySalary}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, monthlySalary: e.target.value }))}
                        placeholder="未設定" 
                        className={`w-full px-4 py-3 rounded-xl ${MD3.transition.fast} border-2`}
                        style={{ backgroundColor: MD3.color.surface.variant, borderColor: MD3.color.outline, color: MD3.color.onSurface }}
                      />
                    </div>
                    <div>
                      <label className={`block ${MD3.typography.labelMedium} mb-2 flex items-center gap-2`} style={{ color: MD3.color.onSurface }}>
                        希望勤務形態
                        <span className={`${MD3.typography.labelSmall} px-2 py-0.5 rounded-full`} style={{ backgroundColor: MD3.color.warning.container, color: MD3.color.warning.onContainer }}>オプション</span>
                      </label>
                      <select 
                        value={seekerConditions.shiftWork}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, shiftWork: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl ${MD3.transition.fast} border-2`}
                        style={{ backgroundColor: MD3.color.surface.variant, borderColor: MD3.color.outline, color: MD3.color.onSurface }}
                      >
                        <option value="">未設定</option>
                        {shiftWorkOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">通勤手段 <span className="text-xs text-amber-600">オプション</span></label>
                      <select 
                        value={seekerConditions.commuteMethod}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {commuteMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">希望通勤時間（分）</label>
                      <input type="number" value={seekerConditions.commuteTime}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteTime: parseInt(e.target.value) || 30 }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      入寮/通勤 <span className="text-xs text-amber-600">オプション</span>
                    </label>
                    <select value={seekerConditions.commutePreference}
                      onChange={(e) => setSeekerConditions(prev => ({ ...prev, commutePreference: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">未設定</option>
                      {commutePreferenceOptions.filter(c => c).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <AddressInput value={seekerConditions.address}
                  onChange={(address) => setSeekerConditions(prev => ({ ...prev, address }))}
                  onGeocode={handleGeocode} isLoading={isLoading} />

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <h3 className="font-bold text-blue-800 mb-2">💡 通勤圏内フィルター</h3>
                  <p className="text-blue-700 text-xs">
                    {seekerConditions.commuteMethod ? (
                      <>
                        {seekerConditions.commuteMethod}で{seekerConditions.commuteTime}分以内の案件のみを表示します
                        <br/>約{Math.round(COMMUTE_DISTANCE_PER_30MIN[seekerConditions.commuteMethod.replace('自家用車', '車')] * seekerConditions.commuteTime / 30)}km圏内
                      </>
                    ) : (
                      '通勤手段を設定すると通勤圏内でフィルタリングされます'
                    )}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm">
                  <h3 className="font-medium text-indigo-700 mb-2">📊 スコア配分</h3>
                  <div className="grid grid-cols-2 gap-1 text-xs text-indigo-600">
                    <div>距離（近いほど高）: 25点</div>
                    <div>欠員数: 25点</div>
                    <div>Fee: 20点</div>
                    <div>派遣会社ランク: 15点</div>
                    <div>給与マッチ: 10点</div>
                    <div>勤務形態: 5点</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Database size={20} />
                    <span className="font-medium">読み込み済み案件:</span>
                    <span className="text-2xl font-bold text-indigo-600">{allJobs.length}件</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={runFullListMode} 
                    disabled={allJobs.length === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      allJobs.length === 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                    }`}
                  >
                    <List size={20} />全件表示モード
                  </button>
                  
                  <button 
                    onClick={runAutoPickup} 
                    disabled={!seekerConditions.age || allJobs.length === 0 || !seekerConditions.address.lat}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      !seekerConditions.age || allJobs.length === 0 || !seekerConditions.address.lat
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                    }`}
                  >
                    <Search size={20} />案件をピックアップ
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-indigo-600" />
                  <span>
                    <strong className="text-indigo-600">案件をピックアップ:</strong> 年齢・性別などの条件でマッチング
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-purple-600" />
                  <span>
                    <strong className="text-purple-600">全件表示モード:</strong> 条件不要で全案件を表示
                  </span>
                </div>
              </div>
              {!seekerConditions.address.lat && (
                <p className="text-xs text-amber-600 mt-2">※「案件をピックアップ」には位置情報の取得が必要です</p>
              )}
            </div>
          </div>
        )}

{/* Step 2: 自動ピックアップ結果 */}
{mainStep === 2 && (
  <div className="space-y-4">
    {/* サマリー */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">ピックアップ結果</h2>
        <div className="flex gap-2">
          <button onClick={() => setMainStep(1)} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm">条件を変更</button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm">
            <Download size={16} />CSV出力
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold">{pickedJobs.length}</div>
          <div className="text-sm opacity-90">該当案件</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold">{selectedJobIds.size}</div>
          <div className="text-sm opacity-90">選択中</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold">{pickedJobs.filter(j => j.companyRank === 'S').length}</div>
          <div className="text-sm opacity-90">Sランク</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold">{pickedJobs.filter(j => (j.vacancy || 0) >= 5).length}</div>
          <div className="text-sm opacity-90">欠員5名以上</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold">{pickedJobs.filter(j => j.fee >= 25).length}</div>
          <div className="text-sm opacity-90">Fee25万+</div>
        </div>
        <div className="bg-yellow-400/30 rounded-lg p-3 text-center border-2 border-yellow-300">
          <div className="text-3xl font-bold">{pickedJobs.filter(j => j.fee >= 40).length}</div>
          <div className="text-sm opacity-90">💎 Fee40万+</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {seekerConditions.age && <span className="bg-white/10 rounded px-2 py-1">👤 {seekerConditions.age}歳 / {seekerConditions.gender}</span>}
        {seekerConditions.commuteMethod && (
          <span className="bg-white/10 rounded px-2 py-1">🚗 {seekerConditions.commuteMethod} {seekerConditions.commuteTime}分以内</span>
        )}
        {seekerConditions.address.prefecture && <span className="bg-white/10 rounded px-2 py-1">📍 {seekerConditions.address.prefecture}{seekerConditions.address.city}</span>}
      </div>
    </div>

    {/* 検索・選択コントロール */}
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="案件名、会社名、住所で検索..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>
          {searchQuery && <p className="text-xs text-slate-500 mt-1">{filteredPickedJobs.length}件がヒット</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {searchQuery ? (
            <>
              <button onClick={selectAllFiltered} className="flex items-center gap-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition">
                <CheckSquare size={16} />検索結果を全選択
              </button>
              <button onClick={deselectAllFiltered} className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition">
                <Square size={16} />検索結果の選択解除
              </button>
            </>
          ) : (
            <>
              <button onClick={selectAll} className="flex items-center gap-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition">
                <CheckSquare size={16} />全選択
              </button>
              <button onClick={deselectAll} className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition">
                <Square size={16} />全解除
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${selectedJobIds.size > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="text-slate-600">
            <span className="font-bold text-indigo-600">{selectedJobIds.size}</span>
            <span className="text-slate-400">/{pickedJobs.length}</span>
            件を分析対象に選択中
          </span>
        </div>
      </div>
    </div>

    {/* オプション条件（トグル式） */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setShowFilterOptions(!showFilterOptions)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-indigo-600" />
          <span className="font-medium text-slate-700">絞り込み条件（編集可能）</span>
          <span className="text-xs text-slate-500">- 条件を変更して再検索できます</span>
        </div>
        {showFilterOptions ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
      </button>
      
      {showFilterOptions && (
        <div className="p-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">💰 希望月収（任意）</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={seekerConditions.monthlySalary}
                  onChange={(e) => setSeekerConditions({ ...seekerConditions, monthlySalary: e.target.value })}
                  placeholder="例: 25"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">万円</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">🌓 勤務形態（任意）</label>
              <select
                value={seekerConditions.shiftWork}
                onChange={(e) => setSeekerConditions({ ...seekerConditions, shiftWork: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">未設定</option>
                {shiftWorkOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">🚗 通勤手段（任意）</label>
              <select
                value={seekerConditions.commuteMethod}
                onChange={(e) => setSeekerConditions({ ...seekerConditions, commuteMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {commuteMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">⏱️ 通勤時間（分）</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={seekerConditions.commuteTime}
                  onChange={(e) => setSeekerConditions({ ...seekerConditions, commuteTime: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">分以内</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">🏠 入寮希望（任意）</label>
              <select
                value={seekerConditions.commutePreference}
                onChange={(e) => setSeekerConditions({ ...seekerConditions, commutePreference: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {commutePreferenceOptions.map(option => (
                  <option key={option} value={option}>{option || '未設定'}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={runAutoPickup}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
            >
              <RefreshCw size={16} />条件を反映して再検索
            </button>
          </div>
        </div>
      )}
    </div>

    {/* 派遣会社フィルター */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setShowCompanyFilter(!showCompanyFilter)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-2">
          <Building size={18} className="text-indigo-600" />
          <span className="font-medium text-slate-700">派遣会社フィルター</span>
          {selectedCompanies.size > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              {selectedCompanies.size}社選択中
            </span>
          )}
        </div>
        {showCompanyFilter ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
      </button>
      
      {showCompanyFilter && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">
              {uniqueCompanies.length}社の派遣会社が見つかりました
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllCompanies}
                className="text-xs px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
              >
                全選択
              </button>
              <button
                onClick={deselectAllCompanies}
                className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                全解除
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {uniqueCompanies.map(company => {
              const isSelected = selectedCompanies.has(company);
              const companyJobs = pickedJobs.filter(j => j.company === company);
              const rank = getCompanyRank(company);
              
              return (
                <label
                  key={company}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCompanySelection(company)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <CompanyRankBadge rank={rank} />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {company}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {companyJobs.length}件
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          
          {selectedCompanies.size > 0 && (
            <div className="mt-3 p-2 bg-indigo-50 rounded-lg text-sm text-indigo-700">
              <strong>{selectedCompanies.size}社</strong>の派遣会社でフィルタリング中
            </div>
          )}
        </div>
      )}
    </div>

    {/* タブとソート */}
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全件 ({pickedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('day-shift')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'day-shift' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ☀️ 日勤 ({pickedJobs.filter(j => j.shiftWork === '日勤').length})
          </button>
          <button
            onClick={() => setActiveTab('other-shift')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'other-shift' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌙 その他 ({pickedJobs.filter(j => j.shiftWork !== '日勤').length})
          </button>
          <button
            onClick={() => { setActiveTab('high-fee'); }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'high-fee' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            💎 高額40万+ ({pickedJobs.filter(j => j.fee >= 40).length})
          </button>
          
          <button
            onClick={() => { setActiveTab('placement-history'); setSortBy('placement'); }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'placement-history' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            📈 入社実績 ({pickedJobs.filter(j => (j.placement2025 || 0) + (j.placement2024 || 0) > 0).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">並び替え:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="score">スコア順（高い順）</option>
            <option value="distance">距離順（近い順）</option>
            <option value="fee">Fee順（高い順）</option>
            <option value="vacancy">欠員数順（多い順）</option>
            <option value="salary">月収順（高い順）</option>
            <option value="placement">入社実績順（多い順）</option>
          </select>
        </div>
      </div>
    </div>

    {/* ピックアップ案件リスト */}
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Target className="text-indigo-600" size={20} />
        ピックアップ案件（{filteredPickedJobs.length}件）
        <span className="text-sm font-normal text-slate-500">- チェックで分析対象を選択、クリックで詳細表示</span>
      </h3>
      
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredPickedJobs.map((job, index) => {
          const isSelected = selectedJobIds.has(job.id);
          const originalIndex = pickedJobs.findIndex(j => j.id === job.id);
          
          return (
            <div 
              key={job.id} 
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div onClick={(e) => { e.stopPropagation(); toggleJobSelection(job.id); }} className="flex-shrink-0 pt-1">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0" onClick={() => setSelectedJob(job)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-sm font-bold text-slate-400 w-8">#{originalIndex + 1}</span>
                      <CompanyRankBadge rank={job.companyRank} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 truncate flex items-center gap-2">
                          {job.name}
                          <Eye size={14} className="text-slate-400" />
                        </div>
                        <div className="text-xs text-slate-500">{job.company} / {job.prefecture} {job.address?.substring(0, 20)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.shiftWork && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${
                              job.shiftWork === '日勤' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                            } rounded-full text-xs`}>
                              {job.shiftWork === '日勤' ? '☀️' : '🌙'}{job.shiftWork}
                            </span>
                          )}
                          {job.estimatedTime && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              🚗{job.estimatedTime}分 ({job.distance?.toFixed(1)}km)
                            </span>
                          )}
                          {(job.vacancy || 0) >= 5 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                              👥欠員{job.vacancy + (job.nextMonthVacancy || 0)}名
                            </span>
                          )}
                          {job.dormAvailable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                              🏠入寮可
                            </span>
                          )}
                          {job.fee >= 40 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                              💎高額
                            </span>
                          )}
                          {((job.placement2025 || 0) + (job.placement2024 || 0) > 0) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                              📈{(job.placement2025 || 0) + (job.placement2024 || 0)}名
                              {job.placement2025 > 0 && <span className="text-[10px]">(25:{job.placement2025})</span>}
                              {job.placement2024 > 0 && <span className="text-[10px]">(24:{job.placement2024})</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`${job.pickupScore >= 80 ? 'bg-emerald-500' : job.pickupScore >= 60 ? 'bg-amber-500' : 'bg-orange-500'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                        {job.pickupScore}点
                      </div>
                      <div className={`font-bold mt-1 ${job.fee >= 40 ? 'text-yellow-600' : 'text-indigo-600'}`}>💰{job.fee}万</div>
                      <div className="text-xs text-slate-500">月収{job.monthlySalary}万</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredPickedJobs.length === 0 && searchQuery && (
          <div className="text-center py-8 text-slate-500">
            <Search size={48} className="mx-auto mb-3 opacity-30" />
            <p>「{searchQuery}」に一致する案件が見つかりませんでした</p>
          </div>
        )}
        
        {filteredPickedJobs.length === 0 && !searchQuery && activeTab === 'high-fee' && (
          <div className="text-center py-8 text-slate-500">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p>Fee 40万円以上の案件がありません</p>
          </div>
        )}
        
        {filteredPickedJobs.length === 0 && !searchQuery && activeTab === 'placement-history' && (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
            <p>入社実績のある案件がありません</p>
          </div>
        )}
      </div>
    </div>

    {/* 分岐フロー開始ボタン */}
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800">次のステップ: 分岐フロー分析</h3>
          <p className="text-sm text-slate-500">
            選択した <span className="font-bold text-indigo-600">{selectedJobIds.size}件</span> を詳細分析します
            {selectedJobIds.size > 100 && <span className="text-amber-600">（上位100件のみ）</span>}
          </p>
        </div>
        <button 
          onClick={startFlowAnalysis}
          disabled={selectedJobIds.size === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            selectedJobIds.size === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
          }`}
        >
          <Target size={20} />分岐フロー分析を開始
        </button>
      </div>
    </div>
  </div>
)}

        {/* Step 3: 分岐フロー分析 */}
{mainStep === 3 && showAnalysis && (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">📊 マッチング状況（{jobs.length}件分析）</h3>
        <div className="flex gap-2">
          <button onClick={() => { setMainStep(2); setShowAnalysis(false); }}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm">案件選択に戻る</button>
          <button onClick={() => { setMainStep(1); setShowAnalysis(false); }}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm">条件を変更</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500 bg-opacity-40 rounded p-3 text-center">
          <div className="font-bold text-3xl">{immediateMatches.length}</div>
          <div className="text-sm">すぐ紹介可能</div>
        </div>
        <div className="bg-amber-500 bg-opacity-40 rounded p-3 text-center">
          <div className="font-bold text-3xl">{possibleMatches.length}</div>
          <div className="text-sm">条件確認必要</div>
        </div>
        <div className="bg-red-500 bg-opacity-40 rounded p-3 text-center">
          <div className="font-bold text-3xl">{impossibleMatches.length}</div>
          <div className="text-sm">紹介不可</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* マッチング結果リスト */}
      <div className="space-y-4">
        {immediateMatches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => toggleConditionExpansion('immediate')}
              className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={20} />
                <span className="font-bold text-emerald-800">✅ すぐ紹介可能 ({immediateMatches.length}件)</span>
              </div>
              {expandedConditions.has('immediate') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedConditions.has('immediate') && (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {immediateMatches.map(result => (
                  <div key={result.job.id}
                    className={`p-3 hover:bg-slate-50 cursor-pointer ${selectedJobForTracking === result.job.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
                    onClick={() => { setSelectedJobForTracking(result.job.id); setSelectedJob(result.job); }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CompanyRankBadge rank={result.job.companyRank} />
                          <span className="font-bold text-slate-800 truncate text-sm">{result.job.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {result.job.estimatedTime && `🚗${result.job.estimatedTime}分`} | 月収:{result.job.monthlySalary}万 | 欠員:{result.job.vacancy}名
                        </div>
                      </div>
                      <div className="text-emerald-600 font-bold">💰{result.job.fee}万</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {possibleMatches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => toggleConditionExpansion('possible')}
              className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-amber-600" size={20} />
                <span className="font-bold text-amber-800">⚠️ 条件確認必要 ({possibleMatches.length}件)</span>
              </div>
              {expandedConditions.has('possible') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedConditions.has('possible') && (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {possibleMatches.map(result => (
                  <div key={result.job.id}
                    className={`p-3 hover:bg-slate-50 cursor-pointer ${selectedJobForTracking === result.job.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}
                    onClick={() => { setSelectedJobForTracking(result.job.id); setSelectedJob(result.job); }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CompanyRankBadge rank={result.job.companyRank} />
                          <span className="font-bold text-slate-800 truncate text-sm">{result.job.name}</span>
                        </div>
                      </div>
                      <div className="text-amber-600 font-bold">💰{result.job.fee}万</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2 text-xs">
                      {result.relaxableFailedConditions.map(cond => (
                        <div key={cond.id} className="flex items-center gap-2">
                          <input type="checkbox" checked={checkedItems[`${result.job.id}-${cond.id}`] || false}
                            onChange={(e) => { e.stopPropagation(); toggleCheckItem(result.job.id, cond.id); }} />
                          <span>{cond.question}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {impossibleMatches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => toggleConditionExpansion('impossible')}
              className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100">
              <div className="flex items-center gap-2">
                <XCircle className="text-red-600" size={20} />
                <span className="font-bold text-red-800">❌ 紹介不可 ({impossibleMatches.length}件)</span>
              </div>
              {expandedConditions.has('impossible') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {expandedConditions.has('impossible') && (
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {impossibleMatches.slice(0, 10).map(result => (
                  <div key={result.job.id} className="p-3 opacity-60">
                    <span className="text-sm text-slate-700">{result.job.name}</span>
                    <div className="text-xs text-red-600">{result.nonRelaxableFailedConditions.map(c => c.reason).join(' / ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* フローツリー */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-indigo-600 flex items-center"><Target className="mr-2" size={20} />フローツリー図</h2>
          <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-200 rounded"><ZoomOut size={16} /></button>
            <span className="text-xs font-semibold px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-200 rounded"><ZoomIn size={16} /></button>
            <button onClick={handleFitToScreen} className="p-1.5 hover:bg-slate-200 rounded"><Maximize2 size={16} /></button>
          </div>
        </div>
        <div ref={treeContainerRef} className="overflow-auto border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50" style={{ height: '450px' }}>
          <div style={{ width: `${treeContentSize.width}px`, height: `${treeContentSize.height}px`, position: 'relative' }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'absolute', width: `${treeContentSize.width}px`, height: `${treeContentSize.height}px` }}>
              <canvas ref={canvasRef} className="absolute top-0 left-0" style={{ zIndex: 1 }} />
              <div style={{ zIndex: 10, position: 'relative' }}>
                {flowTree && Object.keys(nodePositions).length > 0 && (
                  <TreeNodeRenderer node={flowTree} nodePositions={nodePositions} selectedJobForTracking={selectedJobForTracking}
                    getPathToJob={getPathToJob} setHoveredNode={setHoveredNode} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </main>

      {isLoading && <LoadingSpinner message={loadingMessage} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} seekerConditions={seekerConditions} />}
    </div>
  );
};

const TreeNodeRenderer = ({ node, nodePositions, selectedJobForTracking, getPathToJob, setHoveredNode }) => {
  const pos = nodePositions[node.id];
  if (!pos) return null;

  const trackingPath = selectedJobForTracking ? getPathToJob(node, selectedJobForTracking) : null;
  const isOnTrackingPath = trackingPath?.includes(node.id);

  const colorSchemes = {
    start: { bg: 'bg-indigo-50', border: 'border-indigo-500', header: 'bg-indigo-100' },
    pass: { bg: 'bg-emerald-50', border: 'border-emerald-500', header: 'bg-emerald-100' },
    relax: { bg: 'bg-amber-50', border: 'border-amber-500', header: 'bg-amber-100' },
    'relax-accepted': { bg: 'bg-lime-50', border: 'border-lime-500', header: 'bg-lime-100' },
    'relax-rejected': { bg: 'bg-orange-50', border: 'border-orange-500', header: 'bg-orange-100' },
    exclude: { bg: 'bg-red-50', border: 'border-red-500', header: 'bg-red-100' },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-500', header: 'bg-emerald-100' },
    fail: { bg: 'bg-gray-100', border: 'border-gray-400', header: 'bg-gray-200' }
  };

  let colors = colorSchemes[node.type] || colorSchemes.start;
  if (isOnTrackingPath) colors = { ...colors, border: 'border-purple-600' };

  const fees = (node.jobs || []).map(j => parseInt(j.fee) || 0).filter(f => f > 0);
  const avgFee = fees.length > 0 ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;

  return (
    <>
      <div className={`absolute ${colors.bg} border-2 ${colors.border} rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-all`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: '200px', zIndex: isOnTrackingPath ? 50 : 20 }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}>
        <div className={`${colors.header} px-2 py-1 rounded-t-lg border-b ${colors.border}`}>
          <div className="font-bold text-xs text-center">
            {node.type === 'start' && '🚀 START'}
            {node.type === 'pass' && `✅ ${node.condition}`}
            {node.type === 'relax' && `⚠️ ${node.condition}`}
            {node.type === 'relax-accepted' && '✔️ 緩和OK'}
            {node.type === 'relax-rejected' && '✘ 緩和NG'}
            {node.type === 'exclude' && `❌ ${node.condition}`}
            {node.type === 'success' && '🎉 紹介可能'}
            {node.type === 'fail' && '❌ 除外'}
          </div>
        </div>
        <div className="p-2 text-xs">
          {node.jobs && node.jobs.length > 0 && (
            <>
              <div className="font-bold text-center mb-1">
                {node.jobs.length}件
              </div>
              {avgFee > 0 && (
                <div className="text-center text-gray-600">
                  平均Fee: {avgFee}万
                </div>
              )}
            </>
          )}
          {node.excludedJobs && node.excludedJobs.length > 0 && (
            <div className="text-center text-red-600 font-semibold">
              除外: {node.excludedJobs.length}件
            </div>
          )}
        </div>
      </div>

      {node.children?.map(child => (
        <TreeNodeRenderer
          key={child.id}
          node={child}
          nodePositions={nodePositions}
          selectedJobForTracking={selectedJobForTracking}
          getPathToJob={getPathToJob}
          setHoveredNode={setHoveredNode}
        />
      ))}
    </>
  );
};

export default JobMatchingFlowchart;