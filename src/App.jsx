import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, CheckCircle, Heart, History, Phone, ChevronDown, ChevronRight, User, Target, ZoomIn, ZoomOut, Maximize2, AlertCircle, Check, Loader, XCircle, MinusCircle, MapPin, Building, RefreshCw, Search, Filter, AlertTriangle, Info, Clock, DollarSign, Users, Briefcase, Database, Navigation, Eye, ExternalLink, CheckSquare, Square, ArrowUpDown, TrendingUp, TrendingDown, Settings, BarChart3, Sparkles, Award, Zap, ChevronUp, Sliders, List, Map } from 'lucide-react';

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
  
  text = text.replace(/研修.*?は.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/研修.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/入社.*?[①②③④⑤⑥].*?日勤/gi, '');
  text = text.replace(/研修中.*?日勤/gi, '');
  text = text.replace(/研修時.*?日勤/gi, '');
  text = text.replace(/研修期間中.*?日勤/gi, '');
  
  if (text.includes('または')) {
    const parts = text.split('または');
    text = parts[parts.length - 1];
  }
  
  if (/[（(]3交替[）)]/i.test(text)) return '3交替';
  if (/[（(]2交替[）)]/i.test(text)) return '2交替';
  if (/[（(]シフト制[）)]/i.test(text)) return 'シフト制';
  
  if (/[（(]交替制[）)]/i.test(text)) {
    const slashCount = (text.match(/\//g) || []).length;
    if (slashCount >= 2) return '3交替';
    if (slashCount === 1) return '2交替';
    return '2交替';
  }
  
  if (/[（(]夜勤[）)]/i.test(text)) return '夜勤';
  if (/[（(]日勤[）)]/i.test(text)) return '日勤';
  
  const slashCount = (text.match(/\//g) || []).length;
  if (slashCount >= 2) return '3交替';
  if (slashCount === 1) return '2交替';
  
  if (/\d{1,2}[:：]\d{2}/.test(text)) return '日勤';
  
  return 'その他';
};

const estimateCommuteTime = (distanceKm, commuteMethod) => {
  const distancePer30Min = COMMUTE_DISTANCE_PER_30MIN[commuteMethod] || 15;
  return Math.round((distanceKm / distancePer30Min) * 30);
};

// 車での実際の移動距離・時間を取得（Google Maps Distance Matrix Service）
const fetchDrivingDistances = async (originLat, originLng, jobs, onProgress) => {
  if (!window.google?.maps?.DistanceMatrixService) {
    console.warn('DistanceMatrixService not available, falling back to straight-line distance');
    return new Map();
  }

  const service = new window.google.maps.DistanceMatrixService();
  const jobsWithCoords = jobs.filter(j => j.lat && j.lng);
  const results = new Map();
  const BATCH_SIZE = 25;
  const totalBatches = Math.ceil(jobsWithCoords.length / BATCH_SIZE);

  for (let i = 0; i < jobsWithCoords.length; i += BATCH_SIZE) {
    const batch = jobsWithCoords.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    if (onProgress) {
      onProgress(`🚗 車での距離を計算中... (${batchNum}/${totalBatches}バッチ, ${jobsWithCoords.length}件)`);
    }

    try {
      const response = await new Promise((resolve, reject) => {
        service.getDistanceMatrix({
          origins: [new window.google.maps.LatLng(originLat, originLng)],
          destinations: batch.map(j => new window.google.maps.LatLng(Number(j.lat), Number(j.lng))),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        }, (res, status) => {
          if (status === 'OK') resolve(res);
          else reject(new Error(status));
        });
      });

      response.rows[0].elements.forEach((el, idx) => {
        if (el.status === 'OK') {
          results.set(batch[idx].id, {
            drivingDistanceKm: el.distance.value / 1000,
            drivingTimeMin: Math.round(el.duration.value / 60),
          });
        }
      });
    } catch (err) {
      console.warn(`Distance Matrix batch ${batchNum} failed:`, err);
    }

    if (i + BATCH_SIZE < jobsWithCoords.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
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
  
  let shiftWork = '';
  
  if (company.includes('DPT')) {
    const workTimeText = getVal('シフト');
    shiftWork = extractShiftWork(workTimeText);
  } else if (company.includes('日研') || company.includes('NIKKEN')) {
    const workTimeText = getVal('勤務時間開始①');
    shiftWork = extractShiftWork(workTimeText);
  } else {
    shiftWork = getVal('勤務形態') || '日勤';
  }
  
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
  
  if (addressMasterMap && addressMasterMap[aid]) {
    const masterData = addressMasterMap[aid];
    const fullAddressFromMaster = `${masterData.prefecture || ''}${masterData.address || ''}`.trim();
    if (fullAddressFromMaster) {
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
    shiftWork: shiftWork,
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
// Google Maps関連
// =====================================

// カスタムSVGマーカー生成
const createJobMarkerSvg = (fee, isMain = false) => {
  const color = isMain ? '#DC2626'
    : fee >= 40 ? '#D97706'
    : fee >= 30 ? '#EA580C'
    : fee >= 20 ? '#7C3AED'
    : '#2563EB';
  const w = isMain ? 52 : 44;
  const h = isMain ? 60 : 52;
  const r = w / 2;
  const textSize = isMain ? 11 : 10;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.35"/></filter></defs>
    <path d="M${r} 0 C${r * 0.45} 0 0 ${r * 0.45} 0 ${r} C0 ${r * 1.55} ${r} ${h} ${r} ${h} C${r} ${h} ${w} ${r * 1.55} ${w} ${r} C${w} ${r * 0.45} ${r * 1.55} 0 ${r} 0Z" fill="${color}" filter="url(#s)"/>
    <circle cx="${r}" cy="${r}" r="${r - 6}" fill="white" fill-opacity="0.97"/>
    <text x="${r}" y="${r + textSize * 0.4}" text-anchor="middle" font-size="${textSize}" font-weight="800" fill="${color}" font-family="system-ui,-apple-system,sans-serif">${fee}万</text>
  </svg>`;
  return { svg, w, h };
};

const makeJobMarkerIcon = (fee, isMain = false) => {
  if (!window.google?.maps?.Size) return null;
  const { svg, w, h } = createJobMarkerSvg(fee, isMain);
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(w, h),
    anchor: new window.google.maps.Point(w / 2, h),
  };
};

const makeHomeMarkerIcon = () => {
  if (!window.google?.maps?.Size) return null;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
    <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/></filter></defs>
    <circle cx="25" cy="25" r="23" fill="#059669" stroke="white" stroke-width="3" filter="url(#s)"/>
    <text x="25" y="33" text-anchor="middle" font-size="22" font-family="system-ui">🏠</text>
  </svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(50, 50),
    anchor: new window.google.maps.Point(25, 25),
  };
};

const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 既に読み込まれているかチェック
    if (window.google?.maps?.Map) {
      setIsLoaded(true);
      return;
    }
    
    // 既にスクリプトが追加されているかチェック
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // スクリプトは存在するが、まだ読み込み中
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.Map) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      
      return () => clearInterval(checkLoaded);
    }
    
    // 新しくスクリプトを追加
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCQ2AII3z1Sarpf2--hegfBObBKlZmV9uY&libraries=geometry&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // API読み込み後、google.maps.Mapが利用可能になるまで待つ
      const checkReady = setInterval(() => {
        if (window.google?.maps?.Map) {
          setIsLoaded(true);
          clearInterval(checkReady);
        }
      }, 50);
      
      // タイムアウト設定（10秒）
      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.google?.maps?.Map) {
          setError('Google Maps APIの読み込みがタイムアウトしました');
        }
      }, 10000);
    };
    
    script.onerror = () => {
      setError('Google Maps APIの読み込みに失敗しました');
    };
    
    document.head.appendChild(script);
    
    return () => {
      // クリーンアップ時にスクリプトは残す（他のコンポーネントが使う可能性があるため）
    };
  }, []);
  
  return { isLoaded, error };
};

const findNearbyJobs = (centerJob, allJobs, seekerLocation, maxDistanceKm = 10) => {
  if (!centerJob.lat || !centerJob.lng) return [];
  
  return allJobs
    .filter(job => job.id !== centerJob.id && job.lat && job.lng)
    .map(job => {
      const distance = calculateDistance(
        centerJob.lat, centerJob.lng, 
        job.lat, job.lng
      );
      return { ...job, distanceFromCenter: distance };
    })
    .filter(job => job.distanceFromCenter <= maxDistanceKm)
    .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter)
    .slice(0, 20);
};

// =====================================
// UIコンポーネント
// =====================================

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { accent: '#10B981', icon: <CheckCircle size={17} /> },
    error:   { accent: '#EF4444', icon: <AlertCircle size={17} /> },
    warning: { accent: '#F59E0B', icon: <AlertTriangle size={17} /> },
    info:    { accent: '#6366F1', icon: <Info size={17} /> },
  }[type] || { accent: '#6366F1', icon: <Info size={17} /> };

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex items-center gap-3 bg-white border border-gray-200 shadow-xl rounded-xl px-4 py-3 min-w-[300px] max-w-[420px] animate-in slide-in-from-top-2"
      style={{ borderLeft: `4px solid ${config.accent}` }}
    >
      <span style={{ color: config.accent, flexShrink: 0 }}>{config.icon}</span>
      <span className="flex-1 text-sm font-medium text-gray-800 leading-snug">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-1 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
};

const LoadingSpinner = ({ message = '読み込み中...' }) => (
  <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-[100]">
    <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 min-w-[260px]">
      <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-700 text-center leading-relaxed max-w-[220px]">{message}</p>
    </div>
  </div>
);

const ProgressStepper = ({ currentStep, steps }) => (
  <div className="flex items-start justify-between mb-6 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm">
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            index < currentStep
              ? 'bg-indigo-600 text-white'
              : index === currentStep
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
              : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
          }`}>
            {index < currentStep ? <Check size={15} strokeWidth={3} /> : <span>{index + 1}</span>}
          </div>
          <span className={`text-xs font-medium text-center leading-tight ${
            index === currentStep ? 'text-indigo-700' : index < currentStep ? 'text-indigo-500' : 'text-gray-400'
          }`}>{step}</span>
        </div>
        {index < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mt-4 rounded-full transition-all duration-300 ${
            index < currentStep ? 'bg-indigo-500' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const CompanyRankBadge = ({ rank, showLabel = false }) => {
  const config = COMPANY_RANKS[rank] || COMPANY_RANKS['C'];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide transition-colors"
      style={{ backgroundColor: config.bg, color: config.textColor, border: `1px solid ${config.border}` }}
    >
      <span>{config.label}</span>
      {showLabel && <span className="opacity-80 font-normal">{config.description}</span>}
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

// =====================================
// 地図コンポーネント（個別案件詳細用）
// =====================================

const JobMapView = ({ selectedJob, nearbyJobs, seekerLocation, onJobClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { isLoaded, error } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || error || !mapRef.current || !selectedJob.lat) {
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }

    if (!window.google?.maps?.Map) {
      console.error('Google Maps API is not fully loaded');
      return;
    }

    try {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(selectedJob.lat), lng: Number(selectedJob.lng) },
        zoom: 11,
        mapTypeControl: true,
        streetViewControl: false,
      });

      mapInstanceRef.current = googleMap;

      const mainMarker = new window.google.maps.Marker({
        position: { lat: Number(selectedJob.lat), lng: Number(selectedJob.lng) },
        map: googleMap,
        icon: makeJobMarkerIcon(selectedJob.fee, true),
        title: selectedJob.name,
        zIndex: 1000,
      });

      const mainInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 260px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: inline-block; background: #FEE2E2; color: #DC2626; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-bottom: 6px;">📍 選択中の案件</div>
            <p style="margin: 0 0 2px; font-weight: 700; font-size: 14px; color: #1e293b;">${selectedJob.name}</p>
            <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">${selectedJob.company}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="background: #f5f3ff; border-radius: 6px; padding: 6px 8px; text-align: center;">
                <div style="font-size: 9px; color: #7c3aed; font-weight: 600;">💰 Fee</div>
                <div style="font-size: 15px; font-weight: 800; color: #6d28d9;">${selectedJob.fee}万</div>
              </div>
              <div style="background: #eff6ff; border-radius: 6px; padding: 6px 8px; text-align: center;">
                <div style="font-size: 9px; color: #2563eb; font-weight: 600;">💵 月収</div>
                <div style="font-size: 15px; font-weight: 800; color: #1d4ed8;">${selectedJob.monthlySalary}万</div>
              </div>
            </div>
            ${selectedJob.drivingTimeMin
              ? `<div style="margin-top: 8px; background: #eef2ff; border-radius: 6px; padding: 6px 10px; font-size: 12px; font-weight: 700; color: #4338ca;">🚗 車で約${selectedJob.drivingTimeMin}分 (${selectedJob.drivingDistanceKm?.toFixed(1)}km)</div>`
              : selectedJob.estimatedTime
              ? `<div style="margin-top: 8px; background: #eef2ff; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #4338ca;">🚗 推定約${selectedJob.estimatedTime}分</div>`
              : ''}
          </div>
        `
      });

      mainMarker.addListener('click', () => {
        mainInfoWindow.open(googleMap, mainMarker);
      });

      if (seekerLocation?.lat && seekerLocation?.lng) {
        const homeMarker = new window.google.maps.Marker({
          position: { lat: Number(seekerLocation.lat), lng: Number(seekerLocation.lng) },
          map: googleMap,
          icon: makeHomeMarkerIcon(),
          title: '自宅',
          zIndex: 999,
        });

        const homeInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 160px; font-family: system-ui, sans-serif;">
              <h3 style="margin: 0 0 6px; color: #059669; font-size: 14px; font-weight: 700;">🏠 あなたの自宅</h3>
              <p style="margin: 0; font-size: 13px; color: #374151;">${seekerLocation.prefecture || ''}${seekerLocation.city || ''}</p>
            </div>
          `
        });

        homeMarker.addListener('click', () => {
          homeInfoWindow.open(googleMap, homeMarker);
        });

        new window.google.maps.Polyline({
          path: [
            { lat: Number(seekerLocation.lat), lng: Number(seekerLocation.lng) },
            { lat: Number(selectedJob.lat), lng: Number(selectedJob.lng) }
          ],
          geodesic: true,
          strokeColor: '#4F46E5',
          strokeOpacity: 0.7,
          strokeWeight: 3,
          map: googleMap,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '20px' }],
        });
      }

      nearbyJobs.forEach(job => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(job.lat), lng: Number(job.lng) },
          map: googleMap,
          icon: makeJobMarkerIcon(job.fee),
          title: job.name,
          zIndex: job.fee >= 40 ? 100 : job.fee >= 30 ? 50 : 10,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 260px; font-family: system-ui, -apple-system, sans-serif;">
              <p style="margin: 0 0 2px; font-weight: 700; font-size: 13px; color: #1e293b;">${job.name}</p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">${job.company}</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 6px;">
                <div style="background: #f5f3ff; border-radius: 5px; padding: 5px 7px; text-align: center;">
                  <div style="font-size: 9px; color: #7c3aed; font-weight: 600;">Fee</div>
                  <div style="font-size: 13px; font-weight: 800; color: #6d28d9;">${job.fee}万</div>
                </div>
                <div style="background: #ecfdf5; border-radius: 5px; padding: 5px 7px; text-align: center;">
                  <div style="font-size: 9px; color: #059669; font-weight: 600;">欠員</div>
                  <div style="font-size: 13px; font-weight: 800; color: #047857;">${job.vacancy || 0}名</div>
                </div>
              </div>
              <div style="font-size: 11px; color: #6366f1; font-weight: 600;">📍 選択案件から ${job.distanceFromCenter?.toFixed(1)}km</div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMap, marker);
        });
      });

    } catch (err) {
      console.error('Map initialization error:', err);
    }

  }, [isLoaded, error, selectedJob, nearbyJobs, seekerLocation]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-2">APIキーを確認してください</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-3 text-indigo-600" size={32} />
          <p className="text-slate-600">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!selectedJob.lat || !selectedJob.lng) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
        <div className="text-center">
          <MapPin className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="text-slate-600">この案件には位置情報がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#DC2626' }} />
          <span>選択中の案件</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#059669' }} />
          <span>自宅</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: '#2563EB' }} />
          <span>周辺案件 ({nearbyJobs.length}件)</span>
        </div>
        <span className="ml-auto text-xs text-slate-500">クリックで詳細表示</span>
      </div>

      <div
        ref={mapRef}
        className="w-full rounded-xl border border-slate-200 shadow-lg"
        style={{ height: '500px' }}
      />

      {nearbyJobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Target size={18} className="text-indigo-600" />
            周辺案件 ({nearbyJobs.length}件)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {nearbyJobs.slice(0, 10).map(job => (
              <div 
                key={job.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer transition"
                onClick={() => onJobClick && onJobClick(job)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">{job.name}</p>
                  <p className="text-xs text-slate-500">{job.company}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-600">📍 {job.distanceFromCenter?.toFixed(1)}km</span>
                  <span className="font-bold text-indigo-600">💰{job.fee}万</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyJobs.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
          <MapPin className="mx-auto mb-2 text-slate-400" size={32} />
          <p className="text-slate-600 text-sm">周辺10km以内に他の案件はありません</p>
        </div>
      )}
    </div>
  );
};

// =====================================
// 全件地図表示コンポーネント（新規）
// =====================================

const AllJobsMapView = ({ jobs, seekerLocation, onJobClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { isLoaded, error } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || error || !mapRef.current || jobs.length === 0) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }

    if (!window.google?.maps?.Map) {
      console.error('Google Maps API is not fully loaded');
      return;
    }

    let centerLat, centerLng, zoom;
    
    if (seekerLocation?.lat && seekerLocation?.lng) {
      centerLat = seekerLocation.lat;
      centerLng = seekerLocation.lng;
      zoom = 10;
    } else {
      const validJobs = jobs.filter(j => j.lat && j.lng);
      if (validJobs.length === 0) return;
      
      centerLat = validJobs.reduce((sum, j) => sum + Number(j.lat), 0) / validJobs.length;
      centerLng = validJobs.reduce((sum, j) => sum + Number(j.lng), 0) / validJobs.length;
      zoom = 9;
    }

    try {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(centerLat), lng: Number(centerLng) },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: false,
      });

      mapInstanceRef.current = googleMap;

      if (seekerLocation?.lat && seekerLocation?.lng) {
        const homeMarker = new window.google.maps.Marker({
          position: { lat: Number(seekerLocation.lat), lng: Number(seekerLocation.lng) },
          map: googleMap,
          icon: makeHomeMarkerIcon(),
          title: '自宅',
          zIndex: 9999,
        });

        const homeInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 160px; font-family: system-ui, sans-serif;">
              <h3 style="margin: 0 0 6px; color: #059669; font-size: 14px; font-weight: 700;">🏠 あなたの自宅</h3>
              <p style="margin: 0; font-size: 13px; color: #374151;">${seekerLocation.prefecture || ''}${seekerLocation.city || ''}</p>
            </div>
          `
        });

        homeMarker.addListener('click', () => {
          homeInfoWindow.open(googleMap, homeMarker);
        });
      }

      jobs.forEach(job => {
        if (!job.lat || !job.lng) return;

        const marker = new window.google.maps.Marker({
          position: { lat: Number(job.lat), lng: Number(job.lng) },
          map: googleMap,
          icon: makeJobMarkerIcon(job.fee),
          title: job.name,
          zIndex: job.fee >= 40 ? 200 : job.fee >= 30 ? 100 : 10,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 260px; font-family: system-ui, -apple-system, sans-serif;">
              <p style="margin: 0 0 2px; font-weight: 700; font-size: 13px; color: #1e293b; line-height: 1.4;">${job.name}</p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">${job.company}</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                <div style="background: #f5f3ff; border-radius: 6px; padding: 6px 8px;">
                  <div style="font-size: 10px; color: #7c3aed; margin-bottom: 2px; font-weight: 600;">💰 Fee</div>
                  <div style="font-size: 14px; font-weight: 800; color: #6d28d9;">${job.fee}万円</div>
                </div>
                <div style="background: #eff6ff; border-radius: 6px; padding: 6px 8px;">
                  <div style="font-size: 10px; color: #2563eb; margin-bottom: 2px; font-weight: 600;">💵 月収</div>
                  <div style="font-size: 14px; font-weight: 800; color: #1d4ed8;">${job.monthlySalary}万円</div>
                </div>
                <div style="background: #ecfdf5; border-radius: 6px; padding: 6px 8px;">
                  <div style="font-size: 10px; color: #059669; margin-bottom: 2px; font-weight: 600;">👥 欠員</div>
                  <div style="font-size: 14px; font-weight: 800; color: #047857;">${(job.vacancy || 0) + (job.nextMonthVacancy || 0)}名</div>
                </div>
                <div style="background: #fff7ed; border-radius: 6px; padding: 6px 8px;">
                  <div style="font-size: 10px; color: #d97706; margin-bottom: 2px; font-weight: 600;">⏰ 勤務</div>
                  <div style="font-size: 12px; font-weight: 700; color: #b45309;">${job.shiftWork || '-'}</div>
                </div>
              </div>
              ${job.drivingTimeMin ? `<div style="background: #eef2ff; border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; gap: 6px;"><span style="font-size: 12px;">🚗</span><span style="font-size: 12px; font-weight: 700; color: #4338ca;">車で約${job.drivingTimeMin}分 (${job.drivingDistanceKm?.toFixed(1)}km)</span></div>` : job.estimatedTime ? `<div style="background: #eef2ff; border-radius: 6px; padding: 6px 10px;"><span style="font-size: 12px; color: #4338ca;">🚗 推定約${job.estimatedTime}分 (${job.distance?.toFixed(1)}km)</span></div>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMap, marker);
        });
      });

    } catch (err) {
      console.error('Map initialization error:', err);
    }

  }, [isLoaded, error, jobs, seekerLocation]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-2">APIキーを確認してください</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-50 rounded-lg">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-3 text-indigo-600" size={32} />
          <p className="text-slate-600">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  const validJobs = jobs.filter(j => j.lat && j.lng);
  
  if (validJobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-slate-50 rounded-lg">
        <div className="text-center">
          <MapPin className="mx-auto mb-3 text-slate-400" size={48} />
          <p className="text-slate-600">位置情報のある案件がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 px-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#059669' }} />
          <span>自宅</span>
        </div>
        {[
          { label: 'Fee 40万+', count: jobs.filter(j => j.fee >= 40).length, color: '#D97706' },
          { label: 'Fee 30-39万', count: jobs.filter(j => j.fee >= 30 && j.fee < 40).length, color: '#EA580C' },
          { label: 'Fee 20-29万', count: jobs.filter(j => j.fee >= 20 && j.fee < 30).length, color: '#7C3AED' },
          { label: 'Fee 20万未満', count: jobs.filter(j => j.fee < 20).length, color: '#2563EB' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-sm">
            <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
            <span className="font-medium" style={{ color: item.color }}>{item.label}</span>
            <span className="text-slate-500 text-xs">({item.count}件)</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-500">表示中: {validJobs.length}件 • クリックで詳細</span>
      </div>

      <div
        ref={mapRef}
        className="w-full rounded-xl border border-slate-200 shadow-lg"
        style={{ height: '600px' }}
      />
    </div>
  );
};

// 案件詳細モーダル
const JobDetailModal = ({ job, onClose, seekerConditions, allJobs = [] }) => {
  const [activeTab, setActiveTab] = useState('detail');
  
  if (!job) return null;

  const nearbyJobs = findNearbyJobs(
    job, 
    allJobs, 
    seekerConditions.address,
    10
  );

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
              <div className="text-2xl font-bold">{job.drivingTimeMin ? `${job.drivingTimeMin}分` : job.estimatedTime ? `${job.estimatedTime}分` : '-'}</div>
              <div className="text-xs opacity-90">{job.drivingTimeMin ? '🚗 車で' : '推定通勤'}</div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('detail')}
            className={`flex-1 px-6 py-3 font-medium transition-all ${
              activeTab === 'detail'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 詳細情報
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 px-6 py-3 font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🗺️ 地図・周辺案件
            {nearbyJobs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                {nearbyJobs.length}件
              </span>
            )}
          </button>
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
          {activeTab === 'detail' && (
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
                  {job.drivingDistanceKm
                    ? <InfoRow label="車での距離" value={`${job.drivingDistanceKm.toFixed(1)}km`} />
                    : job.distance
                    ? <InfoRow label="直線距離" value={`${job.distance.toFixed(1)}km (概算)`} />
                    : null
                  }
                  {job.drivingTimeMin
                    ? <InfoRow label="🚗 車での通勤時間" value={`約${job.drivingTimeMin}分`} highlight />
                    : job.estimatedTime
                    ? <InfoRow label="推定通勤時間" value={`約${job.estimatedTime}分 (概算)`} />
                    : null
                  }
                  
                  {(job.lat && job.lng) && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setActiveTab('map')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all font-medium"
                      >
                        <MapPin size={16} />
                        地図で周辺案件を確認する
                        {nearbyJobs.length > 0 && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs">
                            {nearbyJobs.length}件
                          </span>
                        )}
                      </button>
                    </div>
                  )}
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
          )}

          {activeTab === 'map' && (
            <JobMapView 
              selectedJob={job}
              nearbyJobs={nearbyJobs}
              seekerLocation={seekerConditions.address}
              onJobClick={(clickedJob) => {
                onClose();
                setTimeout(() => {
                  // 親コンポーネントのsetSelectedJobを呼び出す必要があるため
                  // ここでは単純にモーダルを閉じるのみ
                }, 100);
              }}
            />
          )}

          {(job.merit || job.workDetail || job.remarks) && activeTab === 'detail' && (
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
      mapInstanceRef.current = null;
    }
  
    setTimeout(() => {
      if (!mapContainerRef.current) return;
      
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
    }, 100);
  
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error('Map cleanup error:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, value.lat, value.lng]);

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

  // 🗺️ 地図/リスト表示モード
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // 🗺️ 全案件マップモーダル
  const [showAllJobsMap, setShowAllJobsMap] = useState(false);

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
      console.log('🔍 Step 1: 緯度経度マスター取得開始');
      setLoadingMessage('緯度経度マスターを読み込み中...');
      const masterUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=緯度経度マスター&tqx=out:json`;
      const masterResponse = await fetch(masterUrl);
      console.log('✅ Step 1: マスターレスポンス取得完了', masterResponse.ok);
      
      const masterText = await masterResponse.text();
      console.log('✅ Step 1: マスターテキスト取得完了', masterText.substring(0, 100));
      
      const masterJsonMatch = masterText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      console.log('✅ Step 1: 正規表現マッチ結果', !!masterJsonMatch);
      
      const addressMasterMap = {};
console.log('✅ Step 1: オブジェクト作成完了', typeof addressMasterMap === 'object');
      
      if (masterJsonMatch) {
        console.log('🔍 Step 2: マスターJSON解析開始');
        const masterData = JSON.parse(masterJsonMatch[1]);
        console.log('✅ Step 2: JSON解析完了', masterData);
        
        const masterRows = masterData.table.rows;
        console.log('✅ Step 2: 行数', masterRows.length);
        
        masterRows.forEach((row, index) => {
          if (row.c && row.c[0]) {
            const aid = row.c[0].v || '';
            const prefecture = row.c[1] ? (row.c[1].v || '') : '';
            const address = row.c[2] ? (row.c[2].v || '') : '';
            
            if (aid) {
              addressMasterMap[aid] = { prefecture, address };
            }
          }
        });
        
        console.log(`✅ Step 2: マスター登録完了 ${addressMasterMap.size}件`);
      }
      
      console.log('🔍 Step 3: 案件一覧取得開始');
      setLoadingMessage('案件一覧を読み込み中...');
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
      const response = await fetch(url);
      console.log('✅ Step 3: 案件レスポンス取得完了', response.ok);
      
      const text = await response.text();
      console.log('✅ Step 3: 案件テキスト取得完了', text.substring(0, 100));
      
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      console.log('✅ Step 3: 正規表現マッチ結果', !!jsonMatch);
      
      if (!jsonMatch) throw new Error('データの解析に失敗しました');
      
      console.log('🔍 Step 4: JSON解析開始');
      const data = JSON.parse(jsonMatch[1]);
      console.log('✅ Step 4: JSON解析完了');
      
      const rows = data.table.rows;
      const headers = data.table.cols.map(col => col.label);
      console.log('✅ Step 4: 行数/列数', rows.length, headers.length);
      
      console.log('🔍 Step 5: データ変換開始');
      const transformedJobs = rows.map((row, index) => {
        try {
          return transformSpreadsheetData(row, headers, addressMasterMap);
        } catch (err) {
          console.error(`❌ 行${index}の変換エラー:`, err, row);
          throw err;
        }
      }).filter(job => job.name && job.status === 'オープン');
      
      console.log('✅ Step 5: 変換完了', transformedJobs.length);
  
      setAllJobs(transformedJobs);
      setLastFetchTime(new Date());
      showToast(`${transformedJobs.length}件の案件を取得しました`, 'success');
      if (mainStep === 0) setMainStep(1);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      console.error('❌ Error stack:', error.stack);
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

  const runFullListMode = async () => {
    if (allJobs.length === 0) {
      showToast('案件データを取得してください', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('全案件を表示中...');

    let picked = allJobs.map(job => {
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

    // Distance Matrix APIで車での実際の距離・時間を取得
    const seekerLat2 = seekerConditions.address.lat;
    const seekerLng2 = seekerConditions.address.lng;
    if (seekerLat2 && seekerLng2) {
      const jobsNeedingDriving = picked.filter(j => j.lat && j.lng);
      if (jobsNeedingDriving.length > 0) {
        try {
          const drivingResults = await fetchDrivingDistances(
            seekerLat2, seekerLng2, jobsNeedingDriving,
            (msg) => setLoadingMessage(msg)
          );
          if (drivingResults.size > 0) {
            picked = picked.map(job => {
              const driving = drivingResults.get(job.id);
              if (driving) {
                return {
                  ...job,
                  drivingDistanceKm: driving.drivingDistanceKm,
                  drivingTimeMin: driving.drivingTimeMin,
                  estimatedTime: driving.drivingTimeMin,
                  distance: driving.drivingDistanceKm,
                };
              }
              return job;
            });
          }
        } catch (err) {
          console.warn('Distance Matrix failed in full list mode:', err);
        }
      }
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

    let picked = [];

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

    // Distance Matrix APIで車での実際の距離・時間を取得
    if (seekerLat && seekerLng) {
      const jobsNeedingDriving = picked.filter(j => j.lat && j.lng);
      if (jobsNeedingDriving.length > 0) {
        try {
          setLoadingMessage(`🚗 車での移動距離を計算中... (${jobsNeedingDriving.length}件)`);
          const drivingResults = await fetchDrivingDistances(
            seekerLat, seekerLng, jobsNeedingDriving,
            (msg) => setLoadingMessage(msg)
          );

          if (drivingResults.size > 0) {
            picked = picked.map(job => {
              const driving = drivingResults.get(job.id);
              if (driving) {
                return {
                  ...job,
                  drivingDistanceKm: driving.drivingDistanceKm,
                  drivingTimeMin: driving.drivingTimeMin,
                  estimatedTime: driving.drivingTimeMin,
                  distance: driving.drivingDistanceKm,
                };
              }
              return job;
            });

            // 車での時間で80分制限を再チェック
            if (seekerConditions.commuteMethod) {
              picked = picked.filter(job => {
                if (job.drivingTimeMin !== undefined) return job.drivingTimeMin <= 80;
                return true;
              });
            }

            // スコアの距離項目を車での時間で再計算
            picked = picked.map(job => {
              if (job.drivingTimeMin === undefined) return job;
              const newBreakdown = [...(job.scoreBreakdown || [])];
              const distIdx = newBreakdown.findIndex(b => b.label.includes('通勤時間'));
              if (distIdx >= 0) {
                let distanceScore = 0;
                const t = job.drivingTimeMin;
                const maxT = maxCommuteTime;
                if (t <= maxT) {
                  distanceScore = SCORE_WEIGHTS.distance;
                  newBreakdown[distIdx] = { label: `通勤時間（車で${t}分/${maxT}分）✨希望範囲内`, score: distanceScore };
                } else if (t <= 60) {
                  const ratio = (t - maxT) / (60 - maxT);
                  distanceScore = Math.round(SCORE_WEIGHTS.distance * (1 - ratio));
                  newBreakdown[distIdx] = { label: `通勤時間（車で${t}分）⚠️希望+${t - maxT}分`, score: distanceScore };
                } else {
                  newBreakdown[distIdx] = { label: `通勤時間（車で${t}分）⚠️遠い`, score: 0 };
                }
                const oldScore = job.scoreBreakdown?.[distIdx]?.score || 0;
                const newTotalScore = Math.max(0, (job.pickupScore || 0) - oldScore + distanceScore);
                return { ...job, pickupScore: newTotalScore, scoreBreakdown: newBreakdown };
              }
              return job;
            });
          }
        } catch (err) {
          console.warn('Distance Matrix failed, using estimated times:', err);
        }
      }
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
    const headers = ['案件名', '派遣会社', 'ランク', 'スコア', '距離(km)', '距離種別', '通勤時間(分)', 'Fee(万)', '月収(万)', '欠員数', '都道府県', '住所', '2025実績', '2024実績'];
    const rows = pickedJobs.map(job => [
      job.name, job.company, job.companyRank, job.pickupScore,
      (job.drivingDistanceKm ?? job.distance)?.toFixed(1) || '-',
      job.drivingDistanceKm ? '車での距離' : job.distance ? '直線距離' : '-',
      job.drivingTimeMin ?? job.estimatedTime ?? '-',
      job.fee, job.monthlySalary, job.vacancy, job.prefecture, job.address,
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
    <div className="min-h-screen bg-[#F4F5F7]">
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="text-white" size={17} />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-white leading-tight">案件マッチングツール</h1>
              <p className="text-[11px] text-gray-400 leading-tight">
                {allJobs.length > 0
                  ? `${allJobs.length}件読み込み済み${lastFetchTime ? `  ·  ${lastFetchTime.toLocaleTimeString()}` : ''}`
                  : 'データを取得中...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allJobs.length > 0 && (
              <button
                onClick={() => setShowAllJobsMap(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700"
              >
                <Map size={15} />
                <span>全案件マップ</span>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white">
                  {allJobs.filter(j => j.lat && j.lng).length}
                </span>
              </button>
            )}
            <button
              onClick={fetchSpreadsheetData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700 disabled:opacity-50"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>更新</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-5">
        <ProgressStepper currentStep={mainStep} steps={['データ取得', '求職者情報', '案件ピックアップ', '分岐フロー']} />

        {/* Step 1: 求職者情報入力 */}
        {mainStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 左: 基本情報 */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">求職者情報</h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* 必須項目 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        年齢 <span className="text-red-500 normal-case tracking-normal">必須</span>
                      </label>
                      <input
                        type="number"
                        value={seekerConditions.age}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="例: 35"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        性別 <span className="text-red-500 normal-case tracking-normal">必須</span>
                      </label>
                      <select
                        value={seekerConditions.gender}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      >
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                      <Settings size={12} />
                      以下はオプション — 入力すると精度が向上します
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">希望月収（万円）</label>
                        <input
                          type="number"
                          value={seekerConditions.monthlySalary}
                          onChange={(e) => setSeekerConditions(prev => ({ ...prev, monthlySalary: e.target.value }))}
                          placeholder="未設定"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">希望勤務形態</label>
                        <select
                          value={seekerConditions.shiftWork}
                          onChange={(e) => setSeekerConditions(prev => ({ ...prev, shiftWork: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        >
                          <option value="">未設定</option>
                          {shiftWorkOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">通勤手段</label>
                        <select
                          value={seekerConditions.commuteMethod}
                          onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteMethod: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        >
                          {commuteMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">希望通勤時間（分）</label>
                        <input
                          type="number"
                          value={seekerConditions.commuteTime}
                          onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteTime: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">入寮 / 通勤</label>
                      <select
                        value={seekerConditions.commutePreference}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, commutePreference: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      >
                        <option value="">未設定</option>
                        {commutePreferenceOptions.filter(c => c).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* スコア説明 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5"><BarChart3 size={12} /> スコア配分</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-gray-500">
                      <span>距離: <b className="text-gray-700">25点</b></span>
                      <span>欠員: <b className="text-gray-700">25点</b></span>
                      <span>Fee: <b className="text-gray-700">20点</b></span>
                      <span>ランク: <b className="text-gray-700">15点</b></span>
                      <span>給与: <b className="text-gray-700">10点</b></span>
                      <span>勤務形態: <b className="text-gray-700">5点</b></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右: 住所入力 */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin size={16} className="text-emerald-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">居住地</h2>
                </div>
                <div className="p-5">
                  <AddressInput
                    value={seekerConditions.address}
                    onChange={(address) => setSeekerConditions(prev => ({ ...prev, address }))}
                    onGeocode={handleGeocode}
                    isLoading={isLoading}
                  />
                  {(seekerConditions.commuteMethod === '自家用車' || seekerConditions.commuteMethod === '車') && (
                    <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-indigo-700 font-medium flex items-center gap-1.5 mb-0.5">
                        <Navigation size={12} /> 車での実距離計算が有効
                      </p>
                      <p className="text-[11px] text-indigo-500">
                        Google Maps Distance Matrix APIで実際の所要時間を計算します（{seekerConditions.commuteTime}分以内 / 80分超は除外）
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* アクションバー */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Database size={18} className="text-gray-400" />
                    <span className="text-sm">読み込み済み:</span>
                    <span className="text-xl font-bold text-indigo-600">{allJobs.length}<span className="text-sm font-normal text-gray-500 ml-1">件</span></span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={runFullListMode}
                    disabled={allJobs.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-violet-600 text-white hover:bg-violet-700 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <List size={17} />全件表示
                  </button>
                  <button
                    onClick={runAutoPickup}
                    disabled={!seekerConditions.age || allJobs.length === 0 || !seekerConditions.address.lat}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Search size={17} />案件をピックアップ
                  </button>
                </div>
              </div>
              {!seekerConditions.address.lat && seekerConditions.age && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> 「案件をピックアップ」には位置情報の取得が必要です
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: ピックアップ結果 */}
        {mainStep === 2 && (
          <div className="space-y-4">
            {/* サマリーカード */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">ピックアップ結果</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {seekerConditions.age && (
                      <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1">
                        👤 {seekerConditions.age}歳 / {seekerConditions.gender}
                      </span>
                    )}
                    {seekerConditions.commuteMethod && (
                      <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1">
                        🚗 {seekerConditions.commuteMethod} {seekerConditions.commuteTime}分以内
                      </span>
                    )}
                    {seekerConditions.address.prefecture && (
                      <span className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-1">
                        📍 {seekerConditions.address.prefecture}{seekerConditions.address.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMainStep(1)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ← 条件変更
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={15} />CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { value: pickedJobs.length, label: '該当案件', color: 'text-gray-900' },
                  { value: selectedJobIds.size, label: '選択中', color: 'text-indigo-600' },
                  { value: pickedJobs.filter(j => j.companyRank === 'S').length, label: 'Sランク', color: 'text-violet-600' },
                  { value: pickedJobs.filter(j => (j.vacancy || 0) >= 5).length, label: '欠員5+', color: 'text-emerald-600' },
                  { value: pickedJobs.filter(j => j.fee >= 25).length, label: 'Fee25万+', color: 'text-blue-600' },
                  { value: pickedJobs.filter(j => j.fee >= 40).length, label: '💎 Fee40万+', color: 'text-amber-600', highlight: true },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 text-center border ${stat.highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 検索・選択コントロール */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="案件名・会社名・住所で検索..."
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {searchQuery ? (
                    <>
                      <button onClick={selectAllFiltered} className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition border border-indigo-200">
                        <CheckSquare size={14} />検索結果を全選択
                      </button>
                      <button onClick={deselectAllFiltered} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200">
                        <Square size={14} />選択解除
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={selectAll} className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium transition border border-indigo-200">
                        <CheckSquare size={14} />全選択
                      </button>
                      <button onClick={deselectAll} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200">
                        <Square size={14} />全解除
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setShowFilterOptions(!showFilterOptions)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition border ${
                      showFilterOptions ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                    }`}
                  >
                    <Sliders size={14} />フィルター
                  </button>

                  <button
                    onClick={startFlowAnalysis}
                    disabled={selectedJobIds.size === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <BarChart3 size={15} />分岐フロー分析
                    {selectedJobIds.size > 0 && (
                      <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded">
                        {selectedJobIds.size}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">{filteredPickedJobs.length}件がヒット</p>
              )}

              {showFilterOptions && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">並べ替え</h3>
                    <button onClick={() => setShowFilterOptions(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[
                      { value: 'score', label: 'スコア順' },
                      { value: 'fee', label: 'Fee順' },
                      { value: 'distance', label: '距離順' },
                      { value: 'vacancy', label: '欠員数順' },
                      { value: 'salary', label: '月収順' },
                      { value: 'placement', label: '入社実績順' }
                    ].map(sort => (
                      <button
                        key={sort.value}
                        onClick={() => setSortBy(sort.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          sortBy === sort.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {sort.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">派遣会社フィルター</h3>
                      <div className="flex gap-3">
                        <button onClick={selectAllCompanies} className="text-xs text-indigo-600 hover:text-indigo-800">全選択</button>
                        <button onClick={deselectAllCompanies} className="text-xs text-gray-500 hover:text-gray-700">全解除</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueCompanies.map(company => (
                        <button
                          key={company}
                          onClick={() => toggleCompanySelection(company)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                            selectedCompanies.has(company)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                          }`}
                        >
                          {company}
                          <span className="ml-1 opacity-60">({pickedJobs.filter(j => j.company === company).length})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* タブ + リスト/地図切り替え */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* タブナビ */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                  { key: 'all', label: '全件', count: pickedJobs.length },
                  { key: 'day-shift', label: '日勤', count: pickedJobs.filter(j => j.shiftWork === '日勤').length },
                  { key: 'other-shift', label: '交替制・夜勤', count: pickedJobs.filter(j => j.shiftWork !== '日勤').length },
                  { key: 'high-fee', label: '💎 Fee40万+', count: pickedJobs.filter(j => j.fee >= 40).length },
                  { key: 'placement-history', label: '📈 入社実績', count: pickedJobs.filter(j => ((j.placement2025 || 0) + (j.placement2024 || 0)) > 0).length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.key
                        ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* リスト / 地図 切り替え */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List size={15} />リスト ({filteredPickedJobs.length})
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === 'map'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Map size={15} />地図 ({filteredPickedJobs.filter(j => j.lat && j.lng).length})
                  </button>
                </div>
                {viewMode === 'map' && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Info size={13} />マーカーをクリックで詳細
                  </span>
                )}
              </div>

              {/* リスト表示 */}
              {viewMode === 'list' && (
                <div className="p-4">
                  {filteredPickedJobs.length === 0 ? (
                    <div className="text-center py-14 text-gray-400">
                      <Search size={40} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">条件に一致する案件がありません</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredPickedJobs.map(job => {
                        const rankConfig = COMPANY_RANKS[job.companyRank] || COMPANY_RANKS['C'];
                        const isSelected = selectedJobIds.has(job.id);
                        const totalVacancy = (job.vacancy || 0) + (job.nextMonthVacancy || 0);
                        const totalPlacement = (job.placement2025 || 0) + (job.placement2024 || 0);
                        return (
                          <div
                            key={job.id}
                            className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                              isSelected
                                ? 'border-indigo-400 ring-2 ring-indigo-100 bg-white'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                            style={{ borderLeft: `4px solid ${rankConfig.color}` }}
                            onClick={() => toggleJobSelection(job.id)}
                          >
                            <div className="flex items-start gap-3 p-4">
                              {/* チェックボックス */}
                              <div className="flex-shrink-0 mt-0.5">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                  isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                              </div>

                              {/* メインコンテンツ */}
                              <div className="flex-1 min-w-0">
                                {/* ヘッダー行 */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <CompanyRankBadge rank={job.companyRank} />
                                      <span className="text-xs text-gray-500 truncate">{job.company}</span>
                                      {totalPlacement > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                                          <Award size={10} />実績{totalPlacement}名
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">{job.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.prefecture} {job.address}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    {job.pickupScore !== undefined && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 rounded-lg">
                                        <Sparkles size={12} className="text-indigo-200" />
                                        <span className="text-[13px] font-bold text-white">{job.pickupScore}点</span>
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition"
                                    >
                                      <Eye size={12} />詳細
                                    </button>
                                  </div>
                                </div>

                                {/* スタッツグリッド */}
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  <div className="bg-violet-50 border border-violet-100 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-violet-500 font-medium">Fee</div>
                                    <div className="text-sm font-bold text-violet-700">{job.fee}万</div>
                                  </div>
                                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-blue-500 font-medium">月収</div>
                                    <div className="text-sm font-bold text-blue-700">{job.monthlySalary}万</div>
                                  </div>
                                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-emerald-500 font-medium">欠員</div>
                                    <div className="text-sm font-bold text-emerald-700">{totalVacancy}名</div>
                                  </div>
                                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-center">
                                    <div className="text-[10px] text-amber-500 font-medium">
                                      {job.drivingTimeMin ? '車通勤' : job.estimatedTime ? '推定通勤' : '勤務形態'}
                                    </div>
                                    <div className="text-sm font-bold text-amber-700">
                                      {job.drivingTimeMin ? `${job.drivingTimeMin}分` : job.estimatedTime ? `${job.estimatedTime}分` : (job.shiftWork || '-')}
                                    </div>
                                  </div>
                                </div>

                                {/* 距離・シフト */}
                                {(job.drivingDistanceKm || job.distance || job.shiftWork) && (
                                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                                    {job.drivingDistanceKm ? (
                                      <span className="flex items-center gap-1">
                                        <span className="text-indigo-400">🚗</span>
                                        <span className="font-medium text-gray-700">{job.drivingDistanceKm.toFixed(1)}km</span>
                                        <span>(車)</span>
                                      </span>
                                    ) : job.distance ? (
                                      <span>📍 {job.distance.toFixed(1)}km <span className="text-gray-400">(直線)</span></span>
                                    ) : null}
                                    {job.shiftWork && (
                                      <span className="flex items-center gap-1">
                                        <Clock size={11} className="text-gray-400" />{job.shiftWork}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 地図表示（新規追加） */}
              {viewMode === 'map' && (
                <div className="p-4">
                  <AllJobsMapView 
                    jobs={filteredPickedJobs}
                    seekerLocation={seekerConditions.address}
                    onJobClick={(job) => setSelectedJob(job)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 分岐フロー分析 */}
        {mainStep === 3 && showAnalysis && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">分岐フロー分析結果</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{jobs.length}件の案件を分析</p>
                </div>
                <button
                  onClick={() => { setMainStep(2); setShowAnalysis(false); }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  ← ピックアップに戻る
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-700">{immediateMatches.length}</div>
                  <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center justify-center gap-1">
                    <CheckCircle size={12} />即時紹介可能
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-700">{possibleMatches.length}</div>
                  <div className="text-xs font-medium text-amber-600 mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle size={12} />条件緩和で紹介可
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-red-700">{impossibleMatches.length}</div>
                  <div className="text-xs font-medium text-red-600 mt-1 flex items-center justify-center gap-1">
                    <XCircle size={12} />紹介不可
                  </div>
                </div>
              </div>

              {immediateMatches.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => toggleConditionExpansion('immediate')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="text-emerald-600" size={18} />
                      <span className="font-semibold text-emerald-800 text-sm">即時紹介可能な案件 <span className="font-normal">({immediateMatches.length}件)</span></span>
                    </div>
                    {expandedConditions.has('immediate') ? <ChevronUp className="text-emerald-600" size={18} /> : <ChevronDown className="text-emerald-600" size={18} />}
                  </button>

                  {expandedConditions.has('immediate') && (
                    <div className="mt-2 space-y-2 pl-2">
                      {immediateMatches.map(result => (
                        <div key={result.job.id} className="bg-white border border-emerald-200 rounded-lg p-4" style={{ borderLeft: '4px solid #10B981' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <CompanyRankBadge rank={result.job.companyRank} />
                                <span className="text-xs text-gray-500">{result.job.company}</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-[15px]">{result.job.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{result.job.prefecture} {result.job.address}</p>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                              <div className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-sm font-bold">
                                {result.score}点
                              </div>
                              <button onClick={() => setSelectedJob(result.job)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">詳細 →</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="bg-violet-50 rounded p-2 text-center border border-violet-100">
                              <div className="text-xs text-violet-500">Fee</div>
                              <div className="font-bold text-violet-700">{result.job.fee}万</div>
                            </div>
                            <div className="bg-blue-50 rounded p-2 text-center border border-blue-100">
                              <div className="text-xs text-blue-600">月収</div>
                              <div className="font-bold text-blue-700">{result.job.monthlySalary}万</div>
                            </div>
                            <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                              <div className="text-xs text-emerald-600">欠員</div>
                              <div className="font-bold text-emerald-700">{result.job.vacancy || 0}名</div>
                            </div>
                            <div className="bg-amber-50 rounded p-2 text-center border border-amber-100">
                              <div className="text-xs text-amber-600">通勤</div>
                              <div className="font-bold text-amber-700">{result.job.estimatedTime || '-'}分</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {possibleMatches.length > 0 && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleConditionExpansion('possible')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="text-amber-600" size={18} />
                      <span className="font-semibold text-amber-800 text-sm">条件緩和で紹介可能 <span className="font-normal">({possibleMatches.length}件)</span></span>
                    </div>
                    {expandedConditions.has('possible') ? <ChevronUp className="text-amber-600" size={18} /> : <ChevronDown className="text-amber-600" size={18} />}
                  </button>

                  {expandedConditions.has('possible') && (
                    <div className="mt-2 space-y-2 pl-2">
                      {possibleMatches.map(result => (
                        <div key={result.job.id} className="bg-white border border-amber-200 rounded-lg p-4" style={{ borderLeft: '4px solid #F59E0B' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <CompanyRankBadge rank={result.job.companyRank} />
                                <span className="text-xs text-gray-500">{result.job.company}</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-[15px]">{result.job.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{result.job.prefecture} {result.job.address}</p>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                              <div className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-sm font-bold">{result.score}点</div>
                              <button onClick={() => setSelectedJob(result.job)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">詳細 →</button>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                            <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1"><AlertTriangle size={12} />確認が必要な条件</h4>
                            <div className="space-y-2">
                              {result.relaxableFailedConditions.map(cond => (
                                <div key={cond.id} className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={!!checkedItems[`${result.job.id}-${cond.id}`]}
                                    onChange={() => toggleCheckItem(result.job.id, cond.id)}
                                    className="mt-0.5 w-4 h-4 text-amber-600 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-amber-800">{cond.name}: {cond.question}</p>
                                    <p className="text-[11px] text-amber-600 mt-0.5">現在: {cond.current} → 要件: {cond.required}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-violet-50 rounded p-2 text-center border border-violet-100">
                              <div className="text-[10px] text-violet-500">Fee</div>
                              <div className="text-sm font-bold text-violet-700">{result.job.fee}万</div>
                            </div>
                            <div className="bg-blue-50 rounded p-2 text-center border border-blue-100">
                              <div className="text-[10px] text-blue-500">月収</div>
                              <div className="text-sm font-bold text-blue-700">{result.job.monthlySalary}万</div>
                            </div>
                            <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                              <div className="text-[10px] text-emerald-500">欠員</div>
                              <div className="text-sm font-bold text-emerald-700">{result.job.vacancy || 0}名</div>
                            </div>
                            <div className="bg-amber-50 rounded p-2 text-center border border-amber-100">
                              <div className="text-[10px] text-amber-500">通勤</div>
                              <div className="text-sm font-bold text-amber-700">{result.job.estimatedTime || '-'}分</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {impossibleMatches.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleConditionExpansion('impossible')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <XCircle className="text-red-500" size={18} />
                      <span className="font-semibold text-red-800 text-sm">紹介不可 <span className="font-normal">({impossibleMatches.length}件)</span></span>
                    </div>
                    {expandedConditions.has('impossible') ? <ChevronUp className="text-red-500" size={18} /> : <ChevronDown className="text-red-500" size={18} />}
                  </button>

                  {expandedConditions.has('impossible') && (
                    <div className="mt-2 space-y-2 pl-2">
                      {impossibleMatches.map(result => (
                        <div key={result.job.id} className="bg-white border border-red-200 rounded-lg p-4 opacity-80" style={{ borderLeft: '4px solid #EF4444' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <CompanyRankBadge rank={result.job.companyRank} />
                                <span className="text-xs text-gray-500">{result.job.company}</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-[15px]">{result.job.name}</h3>
                              <p className="text-xs text-gray-500">{result.job.prefecture} {result.job.address}</p>
                            </div>
                            <button onClick={() => setSelectedJob(result.job)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">詳細 →</button>
                          </div>

                          <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                            <h4 className="text-[11px] font-semibold text-red-700 mb-1 flex items-center gap-1"><XCircle size={11} />絶対条件で不適合</h4>
                            <div className="space-y-0.5">
                              {result.nonRelaxableFailedConditions.map(cond => (
                                <p key={cond.id} className="text-xs text-red-600">• {cond.name}: {cond.reason}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 全案件マップモーダル */}
      {showAllJobsMap && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-[2px] z-[85] flex items-start justify-center p-4 pt-14" onClick={() => setShowAllJobsMap(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col overflow-hidden border border-gray-200"
            style={{ maxHeight: 'calc(100vh - 72px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Map size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">全案件マップ</h2>
                  <p className="text-xs text-gray-500">
                    {allJobs.filter(j => j.lat && j.lng).length}件を表示
                    {seekerConditions.address.lat && ` · ${seekerConditions.address.prefecture}${seekerConditions.address.city} から`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllJobsMap(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {!seekerConditions.address.lat && (
              <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 flex-shrink-0">
                <Info size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">住所を設定すると自宅からの距離感が表示されます</p>
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1">
              <AllJobsMapView
                jobs={allJobs}
                seekerLocation={seekerConditions.address}
                onJobClick={(job) => {
                  setSelectedJob(job);
                  setShowAllJobsMap(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner message={loadingMessage} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          seekerConditions={seekerConditions}
          allJobs={pickedJobs}
        />
      )}
    </div>
  );
};

export default JobMatchingFlowchart;