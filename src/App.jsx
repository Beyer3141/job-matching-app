import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, CheckCircle, Heart, History, Phone, ChevronDown, ChevronRight, User, Target, ZoomIn, ZoomOut, Maximize2, AlertCircle, Check, Loader, XCircle, MinusCircle, MapPin, Building, RefreshCw, Search, Filter, AlertTriangle, Info, Clock, DollarSign, Users, Briefcase, Database, Navigation } from 'lucide-react';

// =====================================
// 定数定義
// =====================================

// Google Sheets設定
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
// S: UT系、A: 日研（通勤・入寮）、B: WITC・BN、C: それ以外
const getCompanyRank = (companyName) => {
  if (!companyName) return 'C';
  const upperName = companyName.toUpperCase();
  
  // S: UT系
  if (upperName.includes('UT') || upperName.includes('UTAIM') || 
      upperName.includes('UTAGT') || upperName.includes('UTCNT') ||
      upperName.includes('UT(CNT)') || upperName.includes('UT(AGT)')) {
    return 'S';
  }
  
  // A: 日研
  if (upperName.includes('日研') || upperName.includes('NIKKEN')) {
    return 'A';
  }
  
  // B: WITC・BN
  if (upperName.includes('WITC') || upperName.includes('BN') || 
      upperName.includes('ウィルテック') || upperName.includes('ビーネックス')) {
    return 'B';
  }
  
  // C: それ以外
  return 'C';
};

const COMPANY_RANKS = {
  'S': { label: 'S', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', description: 'UT系（最優良）' },
  'A': { label: 'A', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', description: '日研（優良）' },
  'B': { label: 'B', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', description: 'WITC・BN（標準）' },
  'C': { label: 'C', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50', description: 'その他' },
};

// アイコンサイズ定数
const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

// 都道府県リスト
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

// Haversine公式による直線距離計算（km）
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

// 距離から推定通勤時間を計算（分）
const estimateCommuteTime = (distanceKm, commuteMethod) => {
  const distancePer30Min = COMMUTE_DISTANCE_PER_30MIN[commuteMethod] || 15;
  return Math.round((distanceKm / distancePer30Min) * 30);
};

// 住所から緯度経度を取得（Nominatim API）
const geocodeAddress = async (prefecture, city, detail = '') => {
  try {
    // レート制限対策で少し待つ
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const address = `${prefecture}${city}${detail}`.replace(/\s+/g, '');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=jp&limit=1`,
      { headers: { 'Accept-Language': 'ja', 'User-Agent': 'JobMatchingTool/1.0' } }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        accuracy: 'exact'
      };
    }
    
    // 詳細住所で見つからない場合は市区町村で再検索
    if (detail) {
      await new Promise(resolve => setTimeout(resolve, 1100));
      const fallbackAddress = `${prefecture}${city}`;
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&countrycodes=jp&limit=1`,
        { headers: { 'Accept-Language': 'ja', 'User-Agent': 'JobMatchingTool/1.0' } }
      );
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData && fallbackData.length > 0) {
        return {
          lat: parseFloat(fallbackData[0].lat),
          lng: parseFloat(fallbackData[0].lon),
          displayName: fallbackData[0].display_name,
          accuracy: 'approximate'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// スプレッドシートのデータを変換
const transformSpreadsheetData = (row, headers) => {
  // ヘッダーからインデックスを取得
  const getVal = (colName) => {
    const idx = headers.indexOf(colName);
    return idx >= 0 && row.c && row.c[idx] ? (row.c[idx].v ?? row.c[idx].f ?? '') : '';
  };
  
  const fee = parseInt(getVal('fee')) || 0;
  const totalSalary = parseInt(getVal('総支給額')) || 0;
  const commuteMethods = (getVal('可能通勤手段') || '').split('\\').filter(Boolean);
  
  // 緯度経度のパース（BD列、BE列）
  let lat = null;
  let lng = null;
  const latStr = getVal('緯度');
  const lngStr = getVal('経度');
  
  if (latStr && !String(latStr).includes('読み込') && !isNaN(parseFloat(latStr))) {
    lat = parseFloat(latStr);
  }
  if (lngStr && !String(lngStr).includes('読み込') && !isNaN(parseFloat(lngStr))) {
    lng = parseFloat(lngStr);
  }

  // 住所の組み立て（E列 + F列、綜合キャリアオプションの場合はAY列も参照）
  const prefecture = getVal('所在地（都道府県）') || '';
  let addressDetail = getVal('所在地 （市区町村以降）') || '';
  const company = getVal('派遣会社名(※自動入力)') || '';
  
  // 綜合キャリアオプションの場合、AY列（事業所）に詳細住所がある
  if (company.includes('綜合キャリア')) {
    const officeAddress = getVal('事業所') || '';
    if (officeAddress && !addressDetail.includes(officeAddress)) {
      addressDetail = addressDetail + ' ' + officeAddress;
    }
  }

  const companyRank = getCompanyRank(company);

  return {
    id: getVal('Aid') || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: getVal('案件: 案件名') || '',
    company: company,
    companyRank: companyRank,
    status: getVal('案件ステータス') || '',
    prefecture: prefecture,
    address: addressDetail.trim(),
    fullAddress: `${prefecture}${addressDetail}`.trim(),
    lat,
    lng,
    fee: Math.round(fee / 10000), // 円→万円
    monthlySalary: Math.round(totalSalary / 10000), // 円→万円
    baseSalary: Math.round((parseInt(getVal('基準内賃金')) || 0) / 10000),
    gender: getVal('性別') || '不問',
    minAge: parseInt(getVal('年齢下限')) || null,
    maxAge: parseInt(getVal('年齢上限')) || null,
    shiftWork: getVal('勤務形態') || '日勤',
    acceptedCommuteMethods: commuteMethods.map(m => m.trim()),
    commuteOption: getVal('入寮可否') === '可' ? '入寮可' : '通勤可',
    dormAvailable: getVal('入寮可否') === '可',
    dormSubsidy: getVal('社宅費補助額') || '',
    dormSubsidyType: getVal('社宅費負担') || '',
    vacancy: parseInt(getVal('当月欠員数')) || 0,
    nextMonthVacancy: parseInt(getVal('翌月欠員数 (見込)')) || 0,
    annualHolidays: parseInt(getVal('年間休日')) || 0,
    overtime: parseInt(getVal('（月平均）法定外残業')) || 0,
    workDetail: getVal('業務内容詳細') || '',
    merit: getVal('メリット （訴求ポイント）') || '',
    experienceRequired: getVal('業務経験') === '有',
    experienceDetail: getVal('業務経験詳細') || '',
    foreignerAccepted: getVal('外国籍') === '可',
    tattooAccepted: getVal('【刺青】可否') === '可',
    tattooCondition: getVal('【刺青】 可能条件') || '',
    remarks: getVal('配属可能条件に関する備考') || '',
    workLocation: getVal('事業所') || '',
    shift: getVal('シフト') || '',
    holidays: getVal('休日') || '',
    // 元の形式との互換性のため
    commuteTime: null, // 距離から計算する
  };
};

// =====================================
// コンポーネント
// =====================================

// トースト通知
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-2 animate-pulse`}>
      {type === 'success' && <Check size={ICON_SIZES.md} />}
      {type === 'error' && <AlertCircle size={ICON_SIZES.md} />}
      {type === 'warning' && <AlertTriangle size={ICON_SIZES.md} />}
      {type === 'info' && <Info size={ICON_SIZES.md} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 transition">
        <X size={ICON_SIZES.sm} />
      </button>
    </div>
  );
};

// ローディングスピナー
const LoadingSpinner = ({ message = '読み込み中...' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
      <Loader className="animate-spin text-indigo-600" size={48} />
      <p className="text-gray-700 font-medium text-lg">{message}</p>
    </div>
  </div>
);

// プログレスステッパー
const ProgressStepper = ({ currentStep, steps }) => (
  <div className="bg-white rounded-xl shadow-md p-4 mb-6">
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              index < currentStep
                ? 'bg-emerald-500 text-white'
                : index === currentStep
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {index < currentStep ? <Check size={ICON_SIZES.md} /> : index + 1}
            </div>
            <span className={`mt-2 text-xs md:text-sm font-medium text-center ${
              index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
            }`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded transition-all ${
              index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
            }`} style={{ maxWidth: '60px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// 派遣会社ランクバッジ
const CompanyRankBadge = ({ rank, showLabel = false }) => {
  const config = COMPANY_RANKS[rank] || COMPANY_RANKS['C'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold ${config.color}`}>
      {config.label}
      {showLabel && <span className="text-xs opacity-90">{config.description}</span>}
    </span>
  );
};

// 警告バッジ
const WarningBadge = ({ type, message }) => {
  const config = {
    danger: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: <XCircle size={14} /> },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: <AlertTriangle size={14} /> },
    info: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', icon: <Info size={14} /> },
    success: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', icon: <Check size={14} /> },
  };
  const { bg, text, border, icon } = config[type] || config.info;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text} border ${border}`}>
      {icon}
      {message}
    </span>
  );
};

// 住所入力コンポーネント
const AddressInput = ({ value, onChange, onGeocode, isLoading }) => {
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">詳細住所（任意）</label>
          <input
            type="text"
            value={value.detail}
            onChange={(e) => onChange({ ...value, detail: e.target.value })}
            placeholder="例: 神南1-2-3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          {isLoading ? (
            <>
              <Loader className="animate-spin" size={16} />
              変換中...
            </>
          ) : (
            <>
              <Navigation size={16} />
              位置を取得
            </>
          )}
        </button>

        {value.lat && value.lng && (
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
    </div>
  );
};

// =====================================
// メインコンポーネント
// =====================================

const JobMatchingFlowchart = () => {
  // 通勤手段オプション
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

  // =====================================
  // State定義
  // =====================================
  
  // 全体フロー管理
  const [mainStep, setMainStep] = useState(0); // 0: データ取得, 1: 求職者入力, 2: 自動ピックアップ, 3: 分岐フロー
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [toast, setToast] = useState(null);

  // スプレッドシートデータ
  const [allJobs, setAllJobs] = useState([]); // スプレッドシートから取得した全案件
  const [jobs, setJobs] = useState([]); // フィルタリング後の案件（元の分岐フローで使用）
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // 求職者条件
  const [seekerConditions, setSeekerConditions] = useState({
    age: '',
    gender: '男性',
    monthlySalary: '',
    shiftWork: '日勤',
    commuteTime: 30, // 希望通勤時間（分）
    commutePreference: '通勤希望',
    commuteMethod: '自家用車',
    address: {
      prefecture: '',
      city: '',
      detail: '',
      lat: null,
      lng: null,
      accuracy: null
    },
    priorities: {
      salary: 5,
      shiftWork: 4,
      commuteTime: 3,
      commuteMethod: 3,
      commutePreference: 2
    }
  });

  // 自動ピックアップ結果
  const [pickedJobs, setPickedJobs] = useState([]);
  const [pickupWarnings, setPickupWarnings] = useState({});

  // 元の分岐フロー用のState
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [expandedConditions, setExpandedConditions] = useState(new Set(['immediate', 'possible']));
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedJobForTracking, setSelectedJobForTracking] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // ツリー図用
  const canvasRef = useRef(null);
  const treeContainerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [zoom, setZoom] = useState(0.6);
  const [flowTree, setFlowTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [treeContentSize, setTreeContentSize] = useState({ width: 0, height: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);

  // =====================================
  // トースト表示
  // =====================================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // =====================================
  // スプレッドシートからデータ取得
  // =====================================
  const fetchSpreadsheetData = async () => {
    setIsLoading(true);
    setLoadingMessage('スプレッドシートからデータを取得中...');

    try {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;
      const response = await fetch(url);
      const text = await response.text();
      
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
      if (!jsonMatch) {
        throw new Error('データの解析に失敗しました');
      }
      
      const data = JSON.parse(jsonMatch[1]);
      const rows = data.table.rows;
      const cols = data.table.cols;
      const headers = cols.map(col => col.label);
      
      const transformedJobs = rows.map((row, index) => {
        return transformSpreadsheetData(row, headers);
      }).filter(job => job.name && job.status === 'オープン');

      setAllJobs(transformedJobs);
      setLastFetchTime(new Date());
      showToast(`${transformedJobs.length}件の案件を取得しました`, 'success');
      
      if (mainStep === 0) {
        setMainStep(1);
      }
      
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('データの取得に失敗しました: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // =====================================
  // 住所→緯度経度変換
  // =====================================
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
          address: {
            ...prev.address,
            lat: result.lat,
            lng: result.lng,
            accuracy: result.accuracy
          }
        }));
        
        if (result.accuracy === 'approximate') {
          showToast('詳細住所が見つからないため、市区町村の概算位置を使用します', 'warning');
        } else {
          showToast('住所を緯度経度に変換しました', 'success');
        }
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

  // =====================================
  // 案件の緯度経度を取得（未設定の場合）
  // =====================================
  const geocodeJobIfNeeded = async (job) => {
    if (job.lat && job.lng) {
      return job;
    }
    
    // 住所から緯度経度を取得
    const result = await geocodeAddress(job.prefecture, job.address, '');
    if (result) {
      return {
        ...job,
        lat: result.lat,
        lng: result.lng
      };
    }
    return job;
  };

  // =====================================
  // 自動案件ピックアップ
  // =====================================
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

    const warnings = {};
    const picked = [];

    for (const job of allJobs) {
      const jobWarnings = [];
      let score = 100;
      let eligible = true;

      // === 年齢チェック ===
      if (job.minAge && seekerAge < job.minAge) {
        eligible = false;
        continue;
      }
      if (job.maxAge && seekerAge > job.maxAge) {
        eligible = false;
        continue;
      }
      // 年齢上限ギリギリの警告
      if (job.maxAge && seekerAge >= job.maxAge - 2) {
        jobWarnings.push({ type: 'warning', message: `年齢上限ギリギリ（${job.maxAge}歳まで）決まりづらい可能性` });
        score -= 10;
      }

      // === 性別チェック ===
      if (job.gender !== '不問') {
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (!jobGender.includes(seekerConditions.gender)) {
          eligible = false;
          continue;
        }
      }

      // === 距離計算 ===
      let distance = null;
      let estimatedTime = null;
      
      if (seekerLat && seekerLng) {
        // 案件の緯度経度がない場合は計算をスキップ（後で個別に取得可能）
        if (job.lat && job.lng) {
          distance = calculateDistance(seekerLat, seekerLng, job.lat, job.lng);
          estimatedTime = estimateCommuteTime(distance, seekerConditions.commuteMethod);
          
          if (estimatedTime <= seekerConditions.commuteTime) {
            jobWarnings.push({ type: 'success', message: `通勤${Math.round(distance)}km（約${estimatedTime}分）◎ ランクUP` });
            score += 20;
          } else if (estimatedTime <= seekerConditions.commuteTime * 1.5) {
            jobWarnings.push({ type: 'info', message: `通勤${Math.round(distance)}km（約${estimatedTime}分）` });
          } else {
            jobWarnings.push({ type: 'warning', message: `通勤${Math.round(distance)}km（約${estimatedTime}分）希望より遠い` });
            score -= 15;
          }
        } else {
          jobWarnings.push({ type: 'info', message: '距離計算不可（緯度経度なし）' });
        }
      }

      // === 給与チェック ===
      if (seekerSalary && job.monthlySalary) {
        if (job.monthlySalary < seekerSalary) {
          jobWarnings.push({ type: 'warning', message: `希望給与より${seekerSalary - job.monthlySalary}万円低い ⚠️注意` });
          score -= 10;
        } else {
          jobWarnings.push({ type: 'success', message: `給与${job.monthlySalary}万円 OK` });
          score += 5;
        }
      }

      // === 勤務形態チェック ===
      if (seekerConditions.shiftWork !== job.shiftWork && job.shiftWork) {
        jobWarnings.push({ type: 'info', message: `勤務形態: ${job.shiftWork}（希望: ${seekerConditions.shiftWork}）` });
        score -= 5;
      }

      // === 通勤手段チェック ===
      const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
      const methodMatch = job.acceptedCommuteMethods.some(method => 
        method.includes(commuteMethodKey) || commuteMethodKey.includes(method.replace('自家用', ''))
      );
      if (!methodMatch && job.acceptedCommuteMethods.length > 0) {
        jobWarnings.push({ type: 'warning', message: `通勤手段: ${job.acceptedCommuteMethods.join('/')}のみ` });
        score -= 10;
      }

      // === 入寮チェック ===
      if (seekerConditions.commutePreference === '入寮希望' && !job.dormAvailable) {
        jobWarnings.push({ type: 'warning', message: '入寮不可' });
        score -= 10;
      } else if (job.dormAvailable) {
        jobWarnings.push({ type: 'success', message: '入寮可' });
      }

      // === 欠員数ボーナス ===
      const totalVacancy = job.vacancy + (job.nextMonthVacancy || 0);
      if (totalVacancy >= 10) {
        score += 20;
        jobWarnings.push({ type: 'success', message: `欠員${totalVacancy}名（決まりやすい）ランクUP` });
      } else if (totalVacancy >= 5) {
        score += 10;
        jobWarnings.push({ type: 'info', message: `欠員${totalVacancy}名` });
      }

      // === Fee ボーナス ===
      if (job.fee >= 25) {
        score += 15;
        jobWarnings.push({ type: 'success', message: `Fee ${job.fee}万（高額）ランクUP` });
      } else if (job.fee >= 20) {
        score += 5;
      }

      // === 派遣会社ランクボーナス ===
      if (job.companyRank === 'S') {
        score += 10;
      } else if (job.companyRank === 'A') {
        score += 5;
      }

      if (eligible) {
        picked.push({
          ...job,
          pickupScore: Math.max(0, Math.min(150, score)),
          distance,
          estimatedTime
        });
        warnings[job.id] = jobWarnings;
      }
    }

    // スコア順にソート
    picked.sort((a, b) => b.pickupScore - a.pickupScore);

    setPickedJobs(picked);
    setPickupWarnings(warnings);
    
    // ピックアップされた案件を分岐フロー用のjobsにセット
    // 元の形式に変換
    const jobsForFlow = picked.slice(0, 100).map(job => ({
      ...job,
      id: job.id,
      name: job.name,
      monthlySalary: job.monthlySalary,
      shiftWork: job.shiftWork,
      minAge: job.minAge,
      maxAge: job.maxAge,
      gender: job.gender,
      commuteTime: job.estimatedTime || seekerConditions.commuteTime,
      commuteOption: job.commuteOption,
      acceptedCommuteMethods: job.acceptedCommuteMethods,
      fee: job.fee,
    }));

    setJobs(jobsForFlow);
    setMainStep(2);
    setIsLoading(false);
    showToast(`${picked.length}件の案件をピックアップしました`, 'success');
  };

  // =====================================
  // 元の分岐フロー用の関数（checkConditionDetail, analyzeJobDetailなど）
  // =====================================
  
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
      if ((job.minAge && age < parseInt(job.minAge)) || (job.maxAge && age > parseInt(job.maxAge))) {
        score -= 20;
      }
    }

    if (job.gender !== '不問' && seekerConditions.gender !== job.gender.replace('限定', '').replace('のみ', '')) {
      score -= 20;
    }

    if (seekerConditions.shiftWork !== job.shiftWork) {
      score -= 10 * (priorities.shiftWork / 5);
    }

    if (seekerConditions.commuteTime && job.commuteTime) {
      const diff = parseInt(seekerConditions.commuteTime) - parseInt(job.commuteTime);
      if (diff < 0) {
        score -= Math.abs(diff) * 0.5 * (priorities.commuteTime / 5);
      }
    }

    const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
    if (!job.acceptedCommuteMethods?.some(m => m.includes(commuteMethodKey) || commuteMethodKey.includes(m))) {
      score -= 15 * (priorities.commuteMethod / 5);
    }

    const commuteMatch = checkCommutePreferenceMatch(job);
    if (!commuteMatch) {
      score -= 10 * (priorities.commutePreference / 5);
    }

    if (seekerConditions.monthlySalary && job.monthlySalary) {
      const diff = parseInt(job.monthlySalary) - parseInt(seekerConditions.monthlySalary);
      if (diff < 0) {
        score -= Math.abs(diff) * 2 * (priorities.salary / 5);
      } else {
        score += Math.min(diff * 0.5, 10);
      }
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
        if (job.minAge && age < parseInt(job.minAge)) {
          return { pass: false, reason: `最低年齢${job.minAge}歳以上が必要(現在${age}歳)` };
        }
        if (job.maxAge && age > parseInt(job.maxAge)) {
          return { pass: false, reason: `最高年齢${job.maxAge}歳以下が必要(現在${age}歳)` };
        }
        return { pass: true, reason: '' };
      
      case 'gender':
        if (job.gender === '不問') return { pass: true, reason: '' };
        const jobGender = job.gender.replace('限定', '').replace('のみ', '').trim();
        if (jobGender.includes(seekerConditions.gender)) {
          return { pass: true, reason: '' };
        }
        return { pass: false, reason: `性別要件:${job.gender}(現在:${seekerConditions.gender})` };
      
      case 'shiftWork':
        if (seekerConditions.shiftWork === job.shiftWork) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `勤務形態不一致`,
          current: seekerConditions.shiftWork,
          required: job.shiftWork,
          question: `${job.shiftWork}勤務でも大丈夫ですか?`
        };
      
      case 'commuteTime':
        if (!seekerConditions.commuteTime || !job.commuteTime) return { pass: true, reason: '' };
        if (parseInt(seekerConditions.commuteTime) >= parseInt(job.commuteTime)) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `通勤時間超過`,
          current: `${seekerConditions.commuteTime}分`,
          required: `${job.commuteTime}分`,
          question: `通勤${job.commuteTime}分でも大丈夫ですか?`
        };
      
      case 'commuteMethod':
        const commuteMethodKey = seekerConditions.commuteMethod.replace('自家用車', '車');
        if (job.acceptedCommuteMethods?.some(m => m.includes(commuteMethodKey) || commuteMethodKey.includes(m))) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `通勤手段不一致`,
          current: seekerConditions.commuteMethod,
          required: job.acceptedCommuteMethods?.join('、'),
          question: `${job.acceptedCommuteMethods?.join('または')}での通勤は可能ですか?`
        };
      
      case 'commutePreference':
        if (checkCommutePreferenceMatch(job)) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `通勤・入寮の要件不一致`,
          current: seekerConditions.commutePreference,
          required: job.commuteOption,
          question: job.commuteOption === '入寮可' ? '入寮は可能ですか?' : '通勤は可能ですか?'
        };
      
      case 'salary':
        if (!seekerConditions.monthlySalary || !job.monthlySalary) return { pass: true, reason: '' };
        if (parseInt(seekerConditions.monthlySalary) <= parseInt(job.monthlySalary)) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `月収不足`,
          current: `${seekerConditions.monthlySalary}万円希望`,
          required: `${job.monthlySalary}万円`,
          question: `月収${job.monthlySalary}万円でも大丈夫ですか?`
        };
      
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

    const results = conditions.map(condition => {
      const check = checkConditionDetail(job, condition.id);
      return {
        ...condition,
        ...check
      };
    });

    const failedConditions = results.filter(r => !r.pass);
    const relaxableFailedConditions = failedConditions.filter(r => r.canRelax);
    const nonRelaxableFailedConditions = failedConditions.filter(r => !r.canRelax);

    return {
      job,
      score: calculateMatchScore(job),
      allConditions: results,
      failedConditions,
      relaxableFailedConditions,
      nonRelaxableFailedConditions,
      isImmediateMatch: failedConditions.length === 0,
      isPossibleMatch: nonRelaxableFailedConditions.length === 0
    };
  };

  const getConditionCompareInfo = (job, conditionId) => {
    const conditionNames = {
      age: '年齢',
      gender: '性別',
      shiftWork: '勤務形態',
      commuteTime: '通勤時間',
      commuteMethod: '通勤手段',
      commutePreference: '通勤・入寮',
      salary: '月収'
    };

    const seekerValue = {
      age: seekerConditions.age ? `${seekerConditions.age}歳` : '未設定',
      gender: seekerConditions.gender,
      shiftWork: seekerConditions.shiftWork,
      commuteTime: seekerConditions.commuteTime ? `${seekerConditions.commuteTime}分` : '未設定',
      commuteMethod: seekerConditions.commuteMethod,
      commutePreference: seekerConditions.commutePreference,
      salary: seekerConditions.monthlySalary ? `${seekerConditions.monthlySalary}万円` : '未設定'
    };

    const jobValue = {
      age: job.minAge || job.maxAge ? `${job.minAge || '-'}~${job.maxAge || '-'}歳` : '不問',
      gender: job.gender,
      shiftWork: job.shiftWork,
      commuteTime: job.commuteTime ? `${job.commuteTime}分` : '未設定',
      commuteMethod: job.acceptedCommuteMethods?.join('、') || '未設定',
      commutePreference: job.commuteOption,
      salary: job.monthlySalary ? `${job.monthlySalary}万円` : '未設定'
    };

    return {
      name: conditionNames[conditionId],
      seeker: seekerValue[conditionId],
      job: jobValue[conditionId]
    };
  };

  // =====================================
  // フローツリー構築（元の機能）
  // =====================================
  
  const buildFlowTree = () => {
    const rootNode = {
      id: 'root',
      level: 0,
      type: 'start',
      jobs: [...jobs],
      children: []
    };

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
          const successNode = {
            id: `${parentNode.id}-success`,
            level: level,
            type: 'success',
            jobs: parentNode.jobs,
            children: []
          };
          parentNode.children.push(successNode);
        }
        return;
      }

      if (parentNode.jobs.length === 0) return;

      const condition = remainingConditions[0];
      const passJobs = parentNode.jobs.filter(job => checkConditionDetail(job, condition.id).pass);
      const failJobs = parentNode.jobs.filter(job => !checkConditionDetail(job, condition.id).pass);

      if (passJobs.length > 0) {
        const passNode = {
          id: `${parentNode.id}-${condition.id}-pass`,
          level: level,
          type: 'pass',
          condition: condition.name,
          conditionId: condition.id,
          jobs: passJobs,
          children: []
        };
        parentNode.children.push(passNode);
        buildNode(passNode, remainingConditions.slice(1), level + 1);
      }

      if (failJobs.length > 0) {
        if (condition.canRelax) {
          const relaxNode = {
            id: `${parentNode.id}-${condition.id}-relax`,
            level: level,
            type: 'relax',
            condition: condition.name,
            conditionId: condition.id,
            jobs: failJobs,
            excludedJobs: [],
            children: []
          };
          parentNode.children.push(relaxNode);
          
          const relaxAcceptedNode = {
            id: `${relaxNode.id}-accepted`,
            level: level + 1,
            type: 'relax-accepted',
            condition: '緩和OK',
            conditionId: condition.id,
            jobs: failJobs,
            children: []
          };
          relaxNode.children.push(relaxAcceptedNode);
          buildNode(relaxAcceptedNode, remainingConditions.slice(1), level + 2);
          
          const relaxRejectedNode = {
            id: `${relaxNode.id}-rejected`,
            level: level + 1,
            type: 'relax-rejected',
            condition: '緩和NG',
            conditionId: condition.id,
            jobs: [],
            excludedJobs: failJobs,
            children: []
          };
          relaxNode.children.push(relaxRejectedNode);
          
          const rejectedFailNode = {
            id: `${relaxRejectedNode.id}-fail`,
            level: level + 2,
            type: 'fail',
            jobs: [],
            excludedJobs: failJobs,
            children: []
          };
          relaxRejectedNode.children.push(rejectedFailNode);
        } else {
          const excludeNode = {
            id: `${parentNode.id}-${condition.id}-exclude`,
            level: level,
            type: 'exclude',
            condition: condition.name,
            conditionId: condition.id,
            jobs: [],
            excludedJobs: failJobs,
            children: []
          };
          parentNode.children.push(excludeNode);
          
          const failNode = {
            id: `${excludeNode.id}-fail`,
            level: level + 1,
            type: 'fail',
            jobs: [],
            excludedJobs: failJobs,
            children: []
          };
          excludeNode.children.push(failNode);
        }
      }
    };

    buildNode(rootNode, conditions, 1);
    return rootNode;
  };

  // =====================================
  // ツリー位置計算
  // =====================================

  const calculateNodePositions = (node, x = 500, y = 50, positions = {}) => {
    positions[node.id] = { x, y };

    if (node.children && node.children.length > 0) {
      const childSpacing = 500;
      const totalWidth = (node.children.length - 1) * childSpacing;
      let startX = x - totalWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * childSpacing;
        const childY = y + 180;
        calculateNodePositions(child, childX, childY, positions);
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
      normalized[key] = {
        x: positions[key].x + offsetX,
        y: positions[key].y + offsetY
      };
    });
    
    return normalized;
  };

  const getPathToJob = (node, targetJobId, path = []) => {
    if (node.jobs && node.jobs.some(job => job.id === targetJobId)) {
      return [...path, node.id];
    }

    for (const child of node.children || []) {
      const foundPath = getPathToJob(child, targetJobId, [...path, node.id]);
      if (foundPath) return foundPath;
    }

    return null;
  };

  // =====================================
  // 展開切り替え
  // =====================================
  const toggleConditionExpansion = (key) => {
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleCheckItem = (jobId, conditionId) => {
    const key = `${jobId}-${conditionId}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // =====================================
  // ズーム操作
  // =====================================
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleFitToScreen = () => setZoom(0.6);

  // =====================================
  // 分岐フロー開始
  // =====================================
  const startFlowAnalysis = () => {
    if (jobs.length === 0) {
      showToast('案件をピックアップしてください', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('フロー分析中...');

    setTimeout(() => {
      const tree = buildFlowTree();
      setFlowTree(tree);
      
      const positions = calculateNodePositions(tree);
      const normalizedPositions = normalizePositions(positions);
      setNodePositions(normalizedPositions);

      const posArray = Object.values(normalizedPositions);
      const maxX = Math.max(...posArray.map(p => p.x)) + 250;
      const maxY = Math.max(...posArray.map(p => p.y)) + 200;
      setTreeContentSize({ width: maxX, height: maxY });

      setShowAnalysis(true);
      setMainStep(3);
      setIsLoading(false);
      showToast('分析が完了しました', 'success');
    }, 500);
  };

  // =====================================
  // CSVエクスポート
  // =====================================
  const exportToCSV = () => {
    const headers = ['案件名', '派遣会社', 'ランク', 'スコア', '距離(km)', '推定通勤(分)', 'Fee(万)', '月収(万)', '欠員数', '都道府県', '住所'];
    const rows = pickedJobs.map(job => [
      job.name,
      job.company,
      job.companyRank,
      job.pickupScore,
      job.distance?.toFixed(1) || '-',
      job.estimatedTime || '-',
      job.fee,
      job.monthlySalary,
      job.vacancy,
      job.prefecture,
      job.address
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `matching_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('CSVをダウンロードしました', 'success');
  };

  // =====================================
  // 分析結果の集計
  // =====================================
  const analysisResults = jobs.map(analyzeJobDetail);
  const immediateMatches = analysisResults.filter(r => r.isImmediateMatch);
  const possibleMatches = analysisResults.filter(r => !r.isImmediateMatch && r.isPossibleMatch);
  const impossibleMatches = analysisResults.filter(r => !r.isPossibleMatch);

  // =====================================
  // キャンバス描画（線を引く）
  // =====================================
  useEffect(() => {
    if (!canvasRef.current || !flowTree || Object.keys(nodePositions).length === 0) return;

    const canvas = canvasRef.current;
    canvas.width = treeContentSize.width;
    canvas.height = treeContentSize.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trackingPath = selectedJobForTracking && flowTree 
      ? getPathToJob(flowTree, selectedJobForTracking) 
      : null;

    const drawConnections = (node) => {
      const parentPos = nodePositions[node.id];
      if (!parentPos) return;

      (node.children || []).forEach(child => {
        const childPos = nodePositions[child.id];
        if (!childPos) return;

        const isOnPath = trackingPath && 
          trackingPath.includes(node.id) && 
          trackingPath.includes(child.id);

        ctx.beginPath();
        ctx.moveTo(parentPos.x + 110, parentPos.y + 80);
        
        const midY = (parentPos.y + 80 + childPos.y) / 2;
        ctx.bezierCurveTo(
          parentPos.x + 110, midY,
          childPos.x + 110, midY,
          childPos.x + 110, childPos.y
        );

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

  // =====================================
  // 初回データ取得
  // =====================================
  useEffect(() => {
    fetchSpreadsheetData();
  }, []);

  // =====================================
  // レンダリング
  // =====================================
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
                <p className="text-xs text-slate-500">スプレッドシート連携 + 分岐フロー分析</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSpreadsheetData}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-all text-sm"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                データ更新
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
        {/* プログレスステッパー */}
        <ProgressStepper
          currentStep={mainStep}
          steps={['データ取得', '求職者情報', '自動ピックアップ', '分岐フロー分析']}
        />

        {/* =====================================
            Step 1: 求職者情報入力
        ===================================== */}
        {mainStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 基本情報 */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="text-indigo-600" size={20} />
                  求職者基本情報
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">年齢 *</label>
                      <input
                        type="number"
                        value={seekerConditions.age}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="例: 35"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">性別</label>
                      <select
                        value={seekerConditions.gender}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">希望月収（万円）</label>
                      <input
                        type="number"
                        value={seekerConditions.monthlySalary}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, monthlySalary: e.target.value }))}
                        placeholder="例: 25"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">希望勤務形態</label>
                      <select
                        value={seekerConditions.shiftWork}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, shiftWork: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        {shiftWorkOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">通勤手段</label>
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
                      <input
                        type="number"
                        value={seekerConditions.commuteTime}
                        onChange={(e) => setSeekerConditions(prev => ({ ...prev, commuteTime: parseInt(e.target.value) || 30 }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">入寮/通勤</label>
                    <select
                      value={seekerConditions.commutePreference}
                      onChange={(e) => setSeekerConditions(prev => ({ ...prev, commutePreference: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {commutePreferenceOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 住所入力 */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <AddressInput
                  value={seekerConditions.address}
                  onChange={(address) => setSeekerConditions(prev => ({ ...prev, address }))}
                  onGeocode={handleGeocode}
                  isLoading={isLoading}
                />

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
                  <h3 className="font-medium text-slate-700 mb-2">📏 通勤距離の目安（30分）</h3>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>🚗 車: 15km</div>
                    <div>🏍️ バイク: 10km</div>
                    <div>🚲 自転車: 5km</div>
                    <div>🚶 徒歩: 2km</div>
                    <div>🚌 バス: 10km</div>
                    <div>🚊 電車: 20km</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm">
                  <h3 className="font-medium text-indigo-700 mb-2">🏢 派遣会社ランク</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><CompanyRankBadge rank="S" /> UT系（UTCNT, UTAGT等）</div>
                    <div className="flex items-center gap-2"><CompanyRankBadge rank="A" /> 日研</div>
                    <div className="flex items-center gap-2"><CompanyRankBadge rank="B" /> WITC・BN</div>
                    <div className="flex items-center gap-2"><CompanyRankBadge rank="C" /> その他</div>
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

                <button
                  onClick={runAutoPickup}
                  disabled={!seekerConditions.age || allJobs.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    !seekerConditions.age || allJobs.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Search size={20} />
                  案件を自動ピックアップ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================
            Step 2: 自動ピックアップ結果
        ===================================== */}
        {mainStep === 2 && (
          <div className="space-y-4">
            {/* サマリー */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">自動ピックアップ結果</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMainStep(1)}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm"
                  >
                    条件を変更
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm"
                  >
                    <Download size={16} />
                    CSV出力
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold">{pickedJobs.length}</div>
                  <div className="text-sm opacity-90">ピックアップ済み</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold">{pickedJobs.filter(j => j.companyRank === 'S').length}</div>
                  <div className="text-sm opacity-90">Sランク案件</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold">{pickedJobs.filter(j => j.pickupScore >= 100).length}</div>
                  <div className="text-sm opacity-90">高スコア案件</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-3xl font-bold">{jobs.length}</div>
                  <div className="text-sm opacity-90">分岐フロー対象</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="bg-white/10 rounded px-2 py-1">👤 {seekerConditions.age}歳 / {seekerConditions.gender}</span>
                <span className="bg-white/10 rounded px-2 py-1">💰 希望 {seekerConditions.monthlySalary || '-'}万円</span>
                <span className="bg-white/10 rounded px-2 py-1">🕐 {seekerConditions.shiftWork}</span>
                <span className="bg-white/10 rounded px-2 py-1">🚗 {seekerConditions.commuteMethod} {seekerConditions.commuteTime}分以内</span>
              </div>
            </div>

            {/* ピックアップ案件リスト（上位20件表示） */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Target className="text-indigo-600" size={20} />
                ピックアップ案件（上位20件）
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pickedJobs.slice(0, 20).map((job, index) => (
                  <div key={job.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                        <CompanyRankBadge rank={job.companyRank} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 truncate">{job.name}</div>
                          <div className="text-xs text-slate-500">{job.company} / {job.prefecture}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(pickupWarnings[job.id] || []).slice(0, 3).map((w, i) => (
                              <WarningBadge key={i} type={w.type} message={w.message} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`${job.pickupScore >= 100 ? 'bg-emerald-500' : job.pickupScore >= 80 ? 'bg-amber-500' : 'bg-orange-500'} text-white px-2 py-1 rounded-full text-sm font-bold`}>
                          {job.pickupScore}pt
                        </div>
                        <div className="text-indigo-600 font-bold mt-1">💰{job.fee}万</div>
                        <div className="text-xs text-slate-500">月収{job.monthlySalary}万</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 分岐フロー開始ボタン */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">次のステップ: 分岐フロー分析</h3>
                  <p className="text-sm text-slate-500">ピックアップした{jobs.length}件の案件を詳細分析します</p>
                </div>
                <button
                  onClick={startFlowAnalysis}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Target size={20} />
                  分岐フロー分析を開始
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================
            Step 3: 分岐フロー分析（元の機能）
        ===================================== */}
        {mainStep === 3 && showAnalysis && (
          <div className="space-y-4">
            {/* 求職者情報サマリー */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center">
                  <User className="mr-2" size={20} />
                  👤 求職者の基本情報
                </h3>
                <button
                  onClick={() => { setMainStep(1); setShowAnalysis(false); }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm"
                >
                  条件を変更
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs md:text-sm">
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">年齢</div>
                  <div className="font-bold text-base">{seekerConditions.age || '-'}歳</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">性別</div>
                  <div className="font-bold text-base">{seekerConditions.gender}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">希望月収</div>
                  <div className="font-bold text-base">{seekerConditions.monthlySalary || '-'}万</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">勤務形態</div>
                  <div className="font-bold text-sm">{seekerConditions.shiftWork}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">通勤時間</div>
                  <div className="font-bold text-base">{seekerConditions.commuteTime || '-'}分</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">通勤手段</div>
                  <div className="font-bold text-xs">{seekerConditions.commuteMethod}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                  <div className="opacity-90 text-xs mb-1">通勤/入寮</div>
                  <div className="font-bold text-xs">{seekerConditions.commutePreference}</div>
                </div>
              </div>
              
              <div className="border-t border-white border-opacity-30 pt-3 mt-3">
                <h3 className="font-bold text-base mb-2 flex items-center">
                  <Target className="mr-2" size={20} />
                  📊 マッチング状況
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs md:text-sm">
                  <div className="bg-emerald-500 bg-opacity-40 rounded p-3 text-center">
                    <div className="font-bold text-3xl">{immediateMatches.length}</div>
                    <div className="text-sm mt-1">すぐ紹介可能</div>
                  </div>
                  <div className="bg-amber-500 bg-opacity-40 rounded p-3 text-center">
                    <div className="font-bold text-3xl">{possibleMatches.length}</div>
                    <div className="text-sm mt-1">条件確認必要</div>
                  </div>
                  <div className="bg-red-500 bg-opacity-40 rounded p-3 text-center">
                    <div className="font-bold text-3xl">{impossibleMatches.length}</div>
                    <div className="text-sm mt-1">紹介不可</div>
                  </div>
                </div>
              </div>
            </div>

            {/* マッチング結果リスト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 左カラム: マッチング結果 */}
              <div className="space-y-4">
                {/* すぐ紹介可能 */}
                {immediateMatches.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleConditionExpansion('immediate')}
                      className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-emerald-600" size={20} />
                        <span className="font-bold text-emerald-800">
                          ✅ すぐ紹介可能 ({immediateMatches.length}件)
                        </span>
                      </div>
                      {expandedConditions.has('immediate') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    
                    {expandedConditions.has('immediate') && (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {immediateMatches.map(result => (
                          <div
                            key={result.job.id}
                            className={`p-3 hover:bg-slate-50 cursor-pointer transition ${
                              selectedJobForTracking === result.job.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                            }`}
                            onClick={() => setSelectedJobForTracking(result.job.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <CompanyRankBadge rank={result.job.companyRank} />
                                  <span className="font-bold text-slate-800 truncate">{result.job.name}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  月収:{result.job.monthlySalary}万 | {result.job.shiftWork}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-emerald-600 font-bold">💰 {result.job.fee}万</div>
                                <div className={`text-xs font-bold ${getScoreColor(result.score)} text-white px-2 py-0.5 rounded-full mt-1`}>
                                  {result.score}点
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 条件確認必要 */}
                {possibleMatches.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleConditionExpansion('possible')}
                      className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-amber-600" size={20} />
                        <span className="font-bold text-amber-800">
                          ⚠️ 条件確認必要 ({possibleMatches.length}件)
                        </span>
                      </div>
                      {expandedConditions.has('possible') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    
                    {expandedConditions.has('possible') && (
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {possibleMatches.map(result => {
                          const relaxableConditions = result.relaxableFailedConditions;
                          return (
                            <div
                              key={result.job.id}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition ${
                                selectedJobForTracking === result.job.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                              }`}
                              onClick={() => setSelectedJobForTracking(result.job.id)}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <CompanyRankBadge rank={result.job.companyRank} />
                                    <span className="font-bold text-slate-800 truncate">{result.job.name}</span>
                                  </div>
                                </div>
                                <div className="text-amber-600 font-bold">💰 {result.job.fee}万</div>
                              </div>
                              
                              <div className="bg-amber-50 rounded p-2 text-sm">
                                <div className="font-bold text-amber-800 text-xs mb-1">確認事項:</div>
                                <div className="space-y-1">
                                  {relaxableConditions.map(cond => {
                                    const isChecked = checkedItems[`${result.job.id}-${cond.id}`];
                                    return (
                                      <div key={cond.id} className={`flex items-center gap-2 p-1 rounded ${isChecked ? 'bg-emerald-100' : 'bg-white'}`}>
                                        <input
                                          type="checkbox"
                                          checked={isChecked || false}
                                          onChange={(e) => { e.stopPropagation(); toggleCheckItem(result.job.id, cond.id); }}
                                          className="cursor-pointer"
                                        />
                                        <span className="text-xs">{cond.name}: {cond.question}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 紹介不可 */}
                {impossibleMatches.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleConditionExpansion('impossible')}
                      className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="text-red-600" size={20} />
                        <span className="font-bold text-red-800">
                          ❌ 紹介不可 ({impossibleMatches.length}件)
                        </span>
                      </div>
                      {expandedConditions.has('impossible') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    
                    {expandedConditions.has('impossible') && (
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                        {impossibleMatches.slice(0, 10).map(result => (
                          <div key={result.job.id} className="p-3 opacity-60">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-700 truncate text-sm">{result.job.name}</span>
                                <div className="text-xs text-red-600 mt-1">
                                  {result.nonRelaxableFailedConditions.map(c => c.reason).join(' / ')}
                                </div>
                              </div>
                              <div className="text-gray-400 text-sm">💰 {result.job.fee}万</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 右カラム: フローツリー図 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-indigo-600 flex items-center">
                    <Target className="mr-2" size={20} />
                    📊 フローツリー図
                  </h2>
                  <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                    <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-200 rounded transition">
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-xs font-semibold px-2">{Math.round(zoom * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-200 rounded transition">
                      <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToScreen} className="p-1.5 hover:bg-slate-200 rounded transition">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                <div 
                  ref={treeContainerRef}
                  className="overflow-auto border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50" 
                  style={{ height: '500px' }}
                >
                  <div 
                    style={{ 
                      width: `${treeContentSize.width}px`,
                      height: `${treeContentSize.height}px`,
                      minWidth: `${treeContentSize.width}px`,
                      minHeight: `${treeContentSize.height}px`,
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${treeContentSize.width}px`,
                        height: `${treeContentSize.height}px`
                      }}
                    >
                      <canvas 
                        ref={canvasRef}
                        className="absolute top-0 left-0"
                        style={{ zIndex: 1 }}
                      />
                      <div style={{ zIndex: 10, position: 'relative' }}>
                        {flowTree && Object.keys(nodePositions).length > 0 && (
                          <TreeNodeRenderer 
                            node={flowTree} 
                            nodePositions={nodePositions}
                            selectedJobForTracking={selectedJobForTracking}
                            getPathToJob={getPathToJob}
                            setHoveredNode={setHoveredNode}
                            jobs={jobs}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 凡例 */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-500 rounded"></div>
                      <span>条件クリア</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded"></div>
                      <span>緩和可能</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                      <span>紹介不可</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-100 border-2 border-purple-500 rounded"></div>
                      <span>追跡中</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ローディング */}
      {isLoading && <LoadingSpinner message={loadingMessage} />}

      {/* トースト */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// =====================================
// ツリーノードレンダラー
// =====================================
const TreeNodeRenderer = ({ node, nodePositions, selectedJobForTracking, getPathToJob, setHoveredNode, jobs }) => {
  const pos = nodePositions[node.id];
  if (!pos) return null;

  const trackingPath = selectedJobForTracking ? getPathToJob(node, selectedJobForTracking) : null;
  const isOnTrackingPath = trackingPath?.includes(node.id);

  const getNodeColors = () => {
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
    if (isOnTrackingPath) {
      colors = { ...colors, border: 'border-purple-600' };
    }
    return colors;
  };

  const colors = getNodeColors();
  const fees = (node.jobs || []).map(j => parseInt(j.fee) || 0).filter(f => f > 0);
  const maxFee = fees.length > 0 ? Math.max(...fees) : 0;
  const avgFee = fees.length > 0 ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : 0;

  return (
    <>
      <div
        className={`absolute ${colors.bg} border-2 ${colors.border} rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer ${
          isOnTrackingPath ? 'ring-4 ring-purple-400' : ''
        }`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: '200px',
          zIndex: isOnTrackingPath ? 30 : 20
        }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className="p-2">
          {node.type === 'start' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-sm font-bold text-indigo-900">🚀 スタート</span>
              </div>
              <div className="text-sm text-indigo-700 font-semibold">{node.jobs?.length || 0}件の案件</div>
            </div>
          )}

          {node.type === 'success' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="text-emerald-700" size={16} />
                  <span className="text-sm font-bold text-emerald-900">紹介可能</span>
                </div>
              </div>
              <div className="text-sm text-emerald-700 font-semibold">{node.jobs?.length || 0}件</div>
              {maxFee > 0 && (
                <div className="text-xs text-emerald-600 mt-1">💰 平均{avgFee}万 / 最高{maxFee}万</div>
              )}
            </div>
          )}

          {node.type === 'pass' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-emerald-900">✅ {node.condition}OK</span>
              </div>
              <div className="text-sm text-emerald-700 font-semibold">{node.jobs?.length || 0}件通過</div>
            </div>
          )}

          {node.type === 'relax' && (
            <div className="text-center">
              <div className={`${colors.header} -mx-2 -mt-2 px-2 py-2 mb-2 rounded-t-lg`}>
                <span className="text-xs font-bold text-amber-900">⚠️ {node.condition}確認</span>
              </div>
              <div className="text-sm text-amber-700 font-semibold">{node.jobs?.length || 0}件</div>
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
        <TreeNodeRenderer
          key={child.id}
          node={child}
          nodePositions={nodePositions}
          selectedJobForTracking={selectedJobForTracking}
          getPathToJob={getPathToJob}
          setHoveredNode={setHoveredNode}
          jobs={jobs}
        />
      ))}
    </>
  );
};

export default JobMatchingFlowchart;