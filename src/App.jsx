import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, CheckCircle, Heart, History, Phone, ChevronDown, ChevronRight, User, Target, ZoomIn, ZoomOut, Maximize2, AlertCircle, Check, Loader, XCircle, MinusCircle, MapPin, Building, RefreshCw, Search, Filter, AlertTriangle, Info, Clock, DollarSign, Users, Briefcase, Database, Navigation, Eye, ExternalLink, CheckSquare, Square } from 'lucide-react';

// =====================================
// 定数定義
// =====================================

const SPREADSHEET_ID = '1yKbGLc9wbXamYeMhjennjDPnW46Cyz7QcQXKF773G8g';

// 交通手段別の30分あたりの移動距離（km）
const COMMUTE_DISTANCE_PER_30MIN = {
  '車': 15,
  '自家用車': 15,
  'バイク': 10,
  '自転車': 5,
  '徒歩': 2,
  'バス': 10,
  '電車': 20
};

// 派遣会社ランク
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
  'S': { label: 'S', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', description: 'UT系' },
  'A': { label: 'A', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', description: '日研' },
  'B': { label: 'B', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', description: 'WITC・BN' },
  'C': { label: 'C', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50', description: 'その他' },
};

// スコア配分（合計100点満点 + ボーナス）
const SCORE_WEIGHTS = {
  distance: 25,        // 距離（希望通勤時間内での近さ）
  vacancy: 25,         // 欠員数（多いほど決まりやすい）
  fee: 20,             // Fee（高いほど良い）
  companyRank: 15,     // 派遣会社ランク
  salaryMatch: 10,     // 給与マッチ度
  shiftMatch: 5,       // 勤務形態マッチ
  // ボーナス/ペナルティ
  ageWarning: -10,     // 年齢上限ギリギリ
  commuteMethodMismatch: -5, // 通勤手段不一致
  dormMismatch: -5,    // 入寮希望だが入寮不可
};

const ICON_SIZES = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };

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

const transformSpreadsheetData = (row, headers) => {
  const getVal = (colName) => {
    const idx = headers.indexOf(colName);
    return idx >= 0 && row.c && row.c[idx] ? (row.c[idx].v ?? row.c[idx].f ?? '') : '';
  };
  
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
  const company = getVal('派遣会社名(※自動入力)') || '';
  
  if (company.includes('綜合キャリア')) {
    const officeAddress = getVal('事業所') || '';
    if (officeAddress && !addressDetail.includes(officeAddress)) {
      addressDetail = addressDetail + ' ' + officeAddress;
    }
  }

  return {
    id: getVal('Aid') || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    // 基本情報
    name: getVal('案件: 案件名') || '',
    company: company,
    companyRank: getCompanyRank(company),
    status: getVal('案件ステータス') || '',
    // 所在地
    prefecture: prefecture,
    address: addressDetail.trim(),
    fullAddress: `${prefecture}${addressDetail}`.trim(),
    lat, lng,
    // 給与
    fee: Math.round(fee / 10000),
    feeRaw: fee,
    monthlySalary: Math.round(totalSalary / 10000),
    monthlySalaryRaw: totalSalary,
    baseSalary: Math.round(baseSalary / 10000),
    baseSalaryRaw: baseSalary,
    overtimePay: getVal('（月平均）法定外残業手当') || '',
    holidayPay: getVal('（月平均）休日出勤手当') || '',
    nightPay: getVal('（月平均）深夜手当') || '',
    // 条件
    gender: getVal('性別') || '不問',
    minAge: parseInt(getVal('年齢下限')) || null,
    maxAge: parseInt(getVal('年齢上限')) || null,
    maxClothingSize: getVal('制服サイズ（上限）') || '',
    // 勤務
    shiftWork: getVal('勤務形態') || '日勤',
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
    // 通勤
    acceptedCommuteMethods: commuteMethods.map(m => m.trim()),
    commuteOption: getVal('入寮可否') === '可' ? '入寮可' : '通勤可',
    dormAvailable: getVal('入寮可否') === '可',
    dormSubsidy: getVal('社宅費補助額') || '',
    dormSubsidyType: getVal('社宅費負担') || '',
    familyDorm: getVal('家族入寮') || '',
    coupleDorm: getVal('カップル入居') || '',
    // 欠員
    vacancy: parseInt(getVal('当月欠員数')) || 0,
    nextMonthVacancy: parseInt(getVal('翌月欠員数 (見込)')) || 0,
    nextNextMonthVacancy: parseInt(getVal('翌々月欠員数 (見込)')) || 0,
    // 業務内容
    workDetail: getVal('業務内容詳細') || '',
    merit: getVal('メリット （訴求ポイント）') || '',
    workLocation: getVal('事業所') || '',
    // 経験・資格
    experienceRequired: getVal('業務経験') || '',
    experienceDetail: getVal('業務経験詳細') || '',
    jobExperience: getVal('職種経験') || '',
    jobExperienceDetail: getVal('職種経験詳細') || '',
    // 外国籍・刺青
    foreignerAccepted: getVal('外国籍') || '',
    tattooAccepted: getVal('【刺青】可否') || '',
    tattooCondition: getVal('【刺青】 可能条件') || '',
    // 職場見学
    workplaceVisit: getVal('職場見学') || '',
    // 備考
    remarks: getVal('配属可能条件に関する備考') || '',
    // 元の形式との互換性
    commuteTime: null,
  };
};

// =====================================
// コンポーネント
// =====================================

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-[100] flex items-center space-x-2`}>
      {type === 'success' && <Check size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      {type === 'warning' && <AlertTriangle size={20} />}
      {type === 'info' && <Info size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X size={16} /></button>
    </div>
  );
};

const LoadingSpinner = ({ message = '読み込み中...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
    <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
      <Loader className="animate-spin text-indigo-600" size={48} />
      <p className="text-gray-700 font-medium text-lg">{message}</p>
    </div>
  </div>
);

const ProgressStepper = ({ currentStep, steps }) => (
  <div className="bg-white rounded-xl shadow-md p-4 mb-6">
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              index < currentStep ? 'bg-emerald-500 text-white'
                : index === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index < currentStep ? <Check size={20} /> : index + 1}
            </div>
            <span className={`mt-2 text-xs md:text-sm font-medium text-center ${index <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded transition-all ${index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} style={{ maxWidth: '60px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const CompanyRankBadge = ({ rank, showLabel = false }) => {
  const config = COMPANY_RANKS[rank] || COMPANY_RANKS['C'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold ${config.color}`}>
      {config.label}
      {showLabel && <span className="text-xs opacity-90">{config.description}</span>}
    </span>
  );
};

const ScoreBreakdown = ({ breakdown }) => (
  <div className="space-y-1 text-xs">
    {breakdown.map((item, i) => (
      <div key={i} className="flex justify-between items-center">
        <span className="text-slate-600">{item.label}</span>
        <span className={`font-bold ${item.score >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {item.score >= 0 ? '+' : ''}{item.score}点
        </span>
      </div>
    ))}
  </div>
);

// 案件詳細モーダル
const JobDetailModal = ({ job, onClose, seekerConditions }) => {
  if (!job) return null;

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
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
          
          {/* スコアサマリー */}
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

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左カラム */}
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
                <InfoRow label="業務経験詳細" value={job.experienceDetail} />
                <InfoRow label="職種経験" value={job.jobExperience} />
                <InfoRow label="職種経験詳細" value={job.jobExperienceDetail} />
                <InfoRow label="外国籍" value={job.foreignerAccepted} />
                <InfoRow label="刺青" value={job.tattooAccepted} />
                <InfoRow label="刺青条件" value={job.tattooCondition} />
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

            {/* 右カラム */}
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
                <InfoRow label="合計" value={`${(job.vacancy || 0) + (job.nextMonthVacancy || 0) + (job.nextNextMonthVacancy || 0)}名`} />
              </Section>

              <Section title="📝 その他">
                <InfoRow label="事業所" value={job.workLocation} />
                <InfoRow label="職場見学" value={job.workplaceVisit} />
                <InfoRow label="案件ID" value={job.id} />
              </Section>

              {/* スコア内訳 */}
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

          {/* メリット・備考 */}
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
                  <h4 className="font-bold text-amber-800 mb-1">⚠️ 配属可能条件に関する備考</h4>
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

const AddressInput = ({ value, onChange, onGeocode, isLoading }) => (
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
          {PREFECTURES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          !value.prefecture || !value.city || isLoading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isLoading ? <><Loader className="animate-spin" size={16} />変換中...</> : <><Navigation size={16} />位置を取得</>}
      </button>
      {value.lat && value.lng && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
          <Check size={16} />
          <span>位置取得済み{value.accuracy === 'approximate' && <span className="text-amber-600 ml-1">（概算）</span>}</span>
        </div>
      )}
    </div>
  </div>
);

// =====================================
// メインコンポーネント
// =====================================

const JobMatchingFlowchart = () => {
  const commuteMethods = [
    { value: '自家用車', label: '🚗 自家用車' },
    { value: '自転車', label: '🚲 自転車' },
    { value: 'バイク', label: '🏍️ バイク' },
    { value: 'バス', label: '🚌 バス' },
    { value: '電車', label: '🚊 電車' },
    { value: '徒歩', label: '🚶 徒歩' }
  ];

  const shiftWorkOptions = ['日勤', '夜勤', '2交替', '3交替', 'シフト制'];
  const genderOptions = ['男性', '女性'];
  const commutePreferenceOptions = ['通勤希望', '入寮希望', 'どちらでもいい'];
  const commuteOptionOptions = ['通勤可', '入寮可', 'どちらも可'];

  // State
  const [mainStep, setMainStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null); // 詳細モーダル用

  const [seekerConditions, setSeekerConditions] = useState({
    age: '',
    gender: '男性',
    monthlySalary: '',
    shiftWork: '日勤',
    commuteTime: 30,
    commutePreference: '通勤希望',
    commuteMethod: '自家用車',
    address: { prefecture: '', city: '', detail: '', lat: null, lng: null, accuracy: null },
    priorities: { salary: 5, shiftWork: 4, commuteTime: 3, commuteMethod: 3, commutePreference: 2 }
  });

  const [pickedJobs, setPickedJobs] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedConditions, setExpandedConditions] = useState(new Set(['immediate', 'possible']));
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedJobForTracking, setSelectedJobForTracking] = useState(null);

  // ★★★ 新規追加: 検索とチェック選択用のstate ★★★
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());

  // ツリー図用
  const canvasRef = useRef(null);
  const treeContainerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [zoom, setZoom] = useState(0.6);
  const [flowTree, setFlowTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [treeContentSize, setTreeContentSize] = useState({ width: 0, height: 0 });

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ★★★ 検索でフィルタリングされた案件リスト ★★★
  const filteredPickedJobs = pickedJobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.name?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query) ||
      job.prefecture?.toLowerCase().includes(query) ||
      job.address?.toLowerCase().includes(query) ||
      job.id?.toLowerCase().includes(query)
    );
  });

  // ★★★ 選択操作関数 ★★★
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

  // スプレッドシートデータ取得
  const fetchSpreadsheetData = async () => {
    setIsLoading(true);
    setLoadingMessage('スプレッドシートからデータを取得中...');

    try {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
      const response = await fetch(url);
      const text = await response.text();
      
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      if (!jsonMatch) throw new Error('データの解析に失敗しました');
      
      const data = JSON.parse(jsonMatch[1]);
      const rows = data.table.rows;
      const headers = data.table.cols.map(col => col.label);
      
      const transformedJobs = rows.map(row => transformSpreadsheetData(row, headers))
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

  // 住所→緯度経度変換
  const handleGeocode = async () => {
    const { prefecture, city, detail } = seekerConditions.address;
    if (!prefecture || !city) {
      showToast('都道府県と市区町村を入力してください', 'warning');
      return;
    }

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

  // ===================================
  // 自動案件ピックアップ（通勤圏内のみ）
  // ===================================
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
    const seekerSalary = parseInt(seekerConditions.monthlySalary) || 0;
    const maxCommuteTime = seekerConditions.commuteTime;

    const picked = [];

    for (const job of allJobs) {
      let eligible = true;
      const scoreBreakdown = [];
      let totalScore = 0;

      // ========== 絶対条件（これを満たさないと除外）==========
      
      // 年齢チェック
      if (job.minAge && seekerAge < job.minAge) { eligible = false; continue; }
      if (job.maxAge && seekerAge > job.maxAge) { eligible = false; continue; }

      // 性別チェック
      if (job.gender !== '不問') {
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (!jobGender.includes(seekerConditions.gender)) { eligible = false; continue; }
      }

      // 通勤時間チェック（★重要：希望通勤時間内のみピックアップ）
      let distance = null;
      let estimatedTime = null;
      
      if (seekerLat && seekerLng && job.lat && job.lng) {
        distance = calculateDistance(seekerLat, seekerLng, job.lat, job.lng);
        estimatedTime = estimateCommuteTime(distance, seekerConditions.commuteMethod);
        
        // 希望通勤時間を超えたら除外
        if (estimatedTime > maxCommuteTime) {
          eligible = false;
          continue;
        }
      } else if (seekerLat && seekerLng && !job.lat && !job.lng) {
        // 緯度経度がない案件は一旦含める（距離計算不可）
        // ただしスコアでペナルティ
      }

      if (!eligible) continue;

      // ========== スコア計算 ==========

      // 1. 距離スコア（25点）- 希望通勤時間内での近さ
      if (estimatedTime !== null) {
        const distanceRatio = 1 - (estimatedTime / maxCommuteTime);
        const distanceScore = Math.round(SCORE_WEIGHTS.distance * distanceRatio);
        scoreBreakdown.push({ label: `通勤時間（${estimatedTime}分/${maxCommuteTime}分）`, score: distanceScore });
        totalScore += distanceScore;
      } else {
        scoreBreakdown.push({ label: '通勤時間（計算不可）', score: 0 });
      }

      // 2. 欠員数スコア（25点）- 段階的評価
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

      // 3. Fee スコア（20点）
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

      // 4. 派遣会社ランク（15点）
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

      // 5. 給与マッチ度（10点）
      if (seekerSalary && job.monthlySalary) {
        if (job.monthlySalary >= seekerSalary) {
          const bonus = Math.min(10, Math.round((job.monthlySalary - seekerSalary) / 2));
          scoreBreakdown.push({ label: `給与（${job.monthlySalary}万 ≥ 希望${seekerSalary}万）`, score: 10 });
          totalScore += 10;
        } else {
          const deficit = seekerSalary - job.monthlySalary;
          const penalty = Math.min(10, deficit * 2);
          scoreBreakdown.push({ label: `給与（${job.monthlySalary}万 < 希望${seekerSalary}万）⚠️`, score: -penalty });
          totalScore -= penalty;
        }
      } else {
        scoreBreakdown.push({ label: '給与（比較不可）', score: 5 });
        totalScore += 5;
      }

      // 6. 勤務形態マッチ（5点）
      if (seekerConditions.shiftWork === job.shiftWork) {
        scoreBreakdown.push({ label: `勤務形態（${job.shiftWork}）一致`, score: 5 });
        totalScore += 5;
      } else {
        scoreBreakdown.push({ label: `勤務形態（${job.shiftWork}）不一致`, score: 0 });
      }

      // ========== ペナルティ ==========

      // 年齢上限ギリギリ
      if (job.maxAge && seekerAge >= job.maxAge - 2) {
        scoreBreakdown.push({ label: `年齢上限ギリギリ（${job.maxAge}歳）`, score: SCORE_WEIGHTS.ageWarning });
        totalScore += SCORE_WEIGHTS.ageWarning;
      }

      // 通勤手段不一致
      const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
      const methodMatch = job.acceptedCommuteMethods.some(method => 
        method.includes(commuteMethodKey) || commuteMethodKey.includes(method.replace('自家用', ''))
      );
      if (!methodMatch && job.acceptedCommuteMethods.length > 0) {
        scoreBreakdown.push({ label: `通勤手段（${job.acceptedCommuteMethods.join('/')}のみ）`, score: SCORE_WEIGHTS.commuteMethodMismatch });
        totalScore += SCORE_WEIGHTS.commuteMethodMismatch;
      }

      // 入寮希望だが入寮不可
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

    // スコア順にソート
    picked.sort((a, b) => b.pickupScore - a.pickupScore);

    setPickedJobs(picked);
    
    // ★★★ 初期状態では全件選択 ★★★
    setSelectedJobIds(new Set(picked.map(job => job.id)));
    setSearchQuery(''); // 検索クエリをリセット
    
    setMainStep(2);
    setIsLoading(false);
    
    if (picked.length === 0) {
      showToast('通勤圏内に該当する案件がありませんでした', 'warning');
    } else {
      showToast(`通勤圏内の${picked.length}件をピックアップしました`, 'success');
    }
  };

  // 分岐フロー用の関数群（省略せず実装）
  const checkCommutePreferenceMatch = (job) => {
    if (seekerConditions.commutePreference === 'どちらでもいい') return true;
    if (job.commuteOption === 'どちらも可') return true;
    if (seekerConditions.commutePreference === '通勤希望' && (job.commuteOption === '通勤可' || job.commuteOption === 'どちらも可')) return true;
    if (seekerConditions.commutePreference === '入寮希望' && (job.commuteOption === '入寮可' || job.commuteOption === 'どちらも可')) return true;
    return false;
  };

  const calculateMatchScore = (job) => {
    let score = 100;
    const priorities = seekerConditions.priorities;

    if (seekerConditions.age) {
      const age = parseInt(seekerConditions.age);
      if ((job.minAge && age < parseInt(job.minAge)) || (job.maxAge && age > parseInt(job.maxAge))) score -= 20;
    }
    if (job.gender !== '不問' && seekerConditions.gender !== job.gender.replace('限定', '').replace('のみ', '')) score -= 20;
    if (seekerConditions.shiftWork !== job.shiftWork) score -= 10 * (priorities.shiftWork / 5);
    if (seekerConditions.commuteTime && job.commuteTime) {
      const diff = parseInt(seekerConditions.commuteTime) - parseInt(job.commuteTime);
      if (diff < 0) score -= Math.abs(diff) * 0.5 * (priorities.commuteTime / 5);
    }
    const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
    if (!job.acceptedCommuteMethods?.some(m => m.includes(commuteMethodKey) || commuteMethodKey.includes(m))) {
      score -= 15 * (priorities.commuteMethod / 5);
    }
    if (!checkCommutePreferenceMatch(job)) score -= 10 * (priorities.commutePreference / 5);
    if (seekerConditions.monthlySalary && job.monthlySalary) {
      const diff = parseInt(job.monthlySalary) - parseInt(seekerConditions.monthlySalary);
      if (diff < 0) score -= Math.abs(diff) * 2 * (priorities.salary / 5);
      else score += Math.min(diff * 0.5, 10);
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
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
        if (seekerConditions.shiftWork === job.shiftWork) return { pass: true, reason: '' };
        return { pass: false, reason: `勤務形態不一致`, current: seekerConditions.shiftWork, required: job.shiftWork, question: `${job.shiftWork}勤務でも大丈夫ですか?` };
      case 'commuteTime':
        if (!seekerConditions.commuteTime || !job.commuteTime) return { pass: true, reason: '' };
        if (parseInt(seekerConditions.commuteTime) >= parseInt(job.commuteTime)) return { pass: true, reason: '' };
        return { pass: false, reason: `通勤時間超過`, current: `${seekerConditions.commuteTime}分`, required: `${job.commuteTime}分`, question: `通勤${job.commuteTime}分でも大丈夫ですか?` };
      case 'commuteMethod':
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
      job, score: calculateMatchScore(job), allConditions: results, failedConditions,
      relaxableFailedConditions, nonRelaxableFailedConditions,
      isImmediateMatch: failedConditions.length === 0,
      isPossibleMatch: nonRelaxableFailedConditions.length === 0
    };
  };

  // フローツリー構築
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

  // ★★★ 分岐フロー分析を開始（選択された案件のみ対象）★★★
  const startFlowAnalysis = () => {
    if (selectedJobIds.size === 0) { 
      showToast('分析する案件を選択してください', 'warning'); 
      return; 
    }
    setIsLoading(true);
    setLoadingMessage('フロー分析中...');

    setTimeout(() => {
      // ★★★ 選択された案件のみを分析対象に ★★★
      const selectedJobs = pickedJobs
        .filter(job => selectedJobIds.has(job.id))
        .slice(0, 100)
        .map(job => ({
          ...job,
          commuteTime: job.estimatedTime || seekerConditions.commuteTime,
          commuteOption: job.dormAvailable ? 'どちらも可' : '通勤可',
        }));

      setJobs(selectedJobs);
      
      // ★★★ buildFlowTreeに直接selectedJobsを渡す ★★★
      const tree = buildFlowTree(selectedJobs);
      setFlowTree(tree);
      const positions = calculateNodePositions(tree);
      const normalizedPositions = normalizePositions(positions);
      setNodePositions(normalizedPositions);
      const posArray = Object.values(normalizedPositions);
      setTreeContentSize({ width: Math.max(...posArray.map(p => p.x)) + 250, height: Math.max(...posArray.map(p => p.y)) + 200 });
      setShowAnalysis(true);
      setMainStep(3);
      setIsLoading(false);
      showToast(`${selectedJobs.length}件の案件で分析が完了しました`, 'success');
    }, 500);
  };

  const exportToCSV = () => {
    const headers = ['案件名', '派遣会社', 'ランク', 'スコア', '距離(km)', '推定通勤(分)', 'Fee(万)', '月収(万)', '欠員数', '都道府県', '住所'];
    const rows = pickedJobs.map(job => [
      job.name, job.company, job.companyRank, job.pickupScore, job.distance?.toFixed(1) || '-',
      job.estimatedTime || '-', job.fee, job.monthlySalary, job.vacancy, job.prefecture, job.address
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

  // キャンバス描画
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">案件マッチングツール</h1>
                <p className="text-xs text-slate-500">通勤圏内の案件を自動ピックアップ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchSpreadsheetData} disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm">
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />データ更新
              </button>
              {allJobs.length > 0 && (
                <span className="text-xs text-slate-400 hidden md:block">
                  全{allJobs.length}件 / 更新: {lastFetchTime?.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <ProgressStepper currentStep={mainStep} steps={['データ取得', '求職者情報', '自動ピックアップ', '分岐フロー']} />

        {/* Step 1: 求職者情報入力 */}
        {mainStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 基本情報 */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="text-indigo-600" size={20} />求職者基本情報
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">年齢 *</label>
                      <input type="number" value={seekerConditions.age}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="例: 35" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">性別</label>
                      <select value={seekerConditions.gender}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">希望月収（万円）</label>
                      <input type="number" value={seekerConditions.monthlySalary}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, monthlySalary: e.target.value }))}
                        placeholder="例: 25" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">希望勤務形態</label>
                      <select value={seekerConditions.shiftWork}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, shiftWork: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {shiftWorkOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">通勤手段</label>
                      <select value={seekerConditions.commuteMethod}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
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
                    <label className="block text-sm font-medium text-slate-600 mb-1">入寮/通勤</label>
                    <select value={seekerConditions.commutePreference}
                      onChange={(e) => setSeekerConditions(prev => ({ ...prev, commutePreference: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      {commutePreferenceOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 住所入力 */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <AddressInput value={seekerConditions.address}
                  onChange={(address) => setSeekerConditions(prev => ({ ...prev, address }))}
                  onGeocode={handleGeocode} isLoading={isLoading} />

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <h3 className="font-bold text-amber-800 mb-2">⚠️ 重要: 通勤圏内のみピックアップ</h3>
                  <p className="text-amber-700 text-xs">
                    希望通勤時間（{seekerConditions.commuteTime}分）を超える案件は<strong>除外</strong>されます。<br/>
                    {seekerConditions.commuteMethod}で{seekerConditions.commuteTime}分 ≒ 約{Math.round(COMMUTE_DISTANCE_PER_30MIN[seekerConditions.commuteMethod.replace('自家用車', '車')] * seekerConditions.commuteTime / 30)}km圏内
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

            {/* 自動ピックアップボタン */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Database size={20} />
                    <span className="font-medium">読み込み済み案件:</span>
                    <span className="text-2xl font-bold text-indigo-600">{allJobs.length}件</span>
                  </div>
                </div>
                <button onClick={runAutoPickup} disabled={!seekerConditions.age || allJobs.length === 0 || !seekerConditions.address.lat}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    !seekerConditions.age || allJobs.length === 0 || !seekerConditions.address.lat
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                  }`}>
                  <Search size={20} />通勤圏内の案件をピックアップ
                </button>
              </div>
              {!seekerConditions.address.lat && (
                <p className="text-xs text-amber-600 mt-2">※位置を取得してからピックアップしてください</p>
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
                <h2 className="text-xl font-bold">通勤圏内ピックアップ結果</h2>
                <div className="flex gap-2">
                  <button onClick={() => setMainStep(1)} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm">条件を変更</button>
                  <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm">
                    <Download size={16} />CSV出力
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold">{pickedJobs.length}</div>
                  <div className="text-sm opacity-90">通勤圏内</div>
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
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="bg-white/10 rounded px-2 py-1">👤 {seekerConditions.age}歳 / {seekerConditions.gender}</span>
                <span className="bg-white/10 rounded px-2 py-1">🚗 {seekerConditions.commuteMethod} {seekerConditions.commuteTime}分以内</span>
                <span className="bg-white/10 rounded px-2 py-1">📍 {seekerConditions.address.prefecture}{seekerConditions.address.city}</span>
              </div>
            </div>

            {/* ★★★ 検索・選択コントロール ★★★ */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* 検索欄 */}
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
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-slate-500 mt-1">
                      {filteredPickedJobs.length}件がヒット
                    </p>
                  )}
                </div>

                {/* 選択操作ボタン */}
                <div className="flex flex-wrap gap-2">
                  {searchQuery ? (
                    <>
                      <button
                        onClick={selectAllFiltered}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition"
                      >
                        <CheckSquare size={16} />
                        検索結果を全選択
                      </button>
                      <button
                        onClick={deselectAllFiltered}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                      >
                        <Square size={16} />
                        検索結果の選択解除
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={selectAll}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition"
                      >
                        <CheckSquare size={16} />
                        全選択
                      </button>
                      <button
                        onClick={deselectAll}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                      >
                        <Square size={16} />
                        全解除
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 選択状況表示 */}
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedJobIds.size > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-600">
                    <span className="font-bold text-indigo-600">{selectedJobIds.size}</span>
                    <span className="text-slate-400">/{pickedJobs.length}</span>
                    件を分析対象に選択中
                  </span>
                </div>
                {selectedJobIds.size < pickedJobs.length && selectedJobIds.size > 0 && (
                  <span className="text-amber-600 text-xs">
                    ※ 選択した案件のみ分岐フロー分析されます
                  </span>
                )}
              </div>
            </div>

            {/* ピックアップ案件リスト */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="text-indigo-600" size={20} />
                ピックアップ案件（スコア順）
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
                        {/* ★★★ チェックボックス ★★★ */}
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleJobSelection(job.id); }}
                          className="flex-shrink-0 pt-1"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'border-slate-300 hover:border-indigo-400'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        </div>

                        {/* 案件情報 */}
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => setSelectedJob(job)}
                        >
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
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`${job.pickupScore >= 80 ? 'bg-emerald-500' : job.pickupScore >= 60 ? 'bg-amber-500' : 'bg-orange-500'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                                {job.pickupScore}点
                              </div>
                              <div className="text-indigo-600 font-bold mt-1">💰{job.fee}万</div>
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
            {/* サマリー */}
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

// ツリーノードレンダラー
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
      <div className={`absolute ${colors.bg} border-2 ${colors.border} rounded-lg shadow-md hover:shadow-xl cursor-pointer ${isOnTrackingPath ? 'ring-4 ring-purple-400' : ''}`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: '180px', zIndex: isOnTrackingPath ? 30 : 20 }}
        onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)}>
        <div className="p-2">
          {node.type === 'start' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-sm font-bold text-indigo-900">🚀 スタート</span>
              </div>
              <div className="text-sm font-semibold">{node.jobs?.length || 0}件</div>
            </div>
          )}
          {node.type === 'success' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-sm font-bold text-emerald-900">✅ 紹介可能</span>
              </div>
              <div className="text-sm font-semibold">{node.jobs?.length || 0}件</div>
              {avgFee > 0 && <div className="text-xs text-emerald-600">💰平均{avgFee}万</div>}
            </div>
          )}
          {node.type === 'pass' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-emerald-900">✅ {node.condition}OK</span>
              </div>
              <div className="text-sm font-semibold">{node.jobs?.length || 0}件</div>
            </div>
          )}
          {node.type === 'relax' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-amber-900">⚠️ {node.condition}確認</span>
              </div>
              <div className="text-sm font-semibold">{node.jobs?.length || 0}件</div>
            </div>
          )}
          {(node.type === 'relax-accepted' || node.type === 'relax-rejected') && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold">{node.condition}</span>
              </div>
              <div className="text-sm font-semibold">{node.jobs?.length || 0}件</div>
            </div>
          )}
          {node.type === 'exclude' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-red-900">❌ {node.condition}NG</span>
              </div>
              <div className="text-sm text-red-700">{node.excludedJobs?.length || 0}件除外</div>
            </div>
          )}
          {node.type === 'fail' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-gray-700">紹介不可</span>
              </div>
              <div className="text-sm text-gray-600">{node.excludedJobs?.length || 0}件</div>
            </div>
          )}
        </div>
      </div>
      {(node.children || []).map(child => (
        <TreeNodeRenderer key={child.id} node={child} nodePositions={nodePositions}
          selectedJobForTracking={selectedJobForTracking} getPathToJob={getPathToJob} setHoveredNode={setHoveredNode} />
      ))}
    </>
  );
};

export default JobMatchingFlowchart;