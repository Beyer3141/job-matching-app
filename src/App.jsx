import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, CheckCircle, Heart, History, Phone, ChevronDown, ChevronRight, User, Target, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const JobMatchingFlowchart = () => {
  const commuteMethods = [
    { value: '自家用車', label: '🚗 自家用車' },
    { value: '自転車', label: '🚲 自転車' },
    { value: 'バイク', label: '🏍️ バイク' },
    { value: 'バス', label: '🚌 バス' },
    { value: '電車', label: '🚊 電車' },
    { value: '徒歩', label: '🚶 徒歩' }
  ];

  const [seekerConditions, setSeekerConditions] = useState({
    age: '',
    gender: '男性',
    monthlySalary: '',
    shiftWork: '日勤',
    commuteTime: '',
    commutePreference: '通勤希望',
    commuteMethod: '自家用車',
    priorities: {
      salary: 5,
      shiftWork: 4,
      commuteTime: 3,
      commuteMethod: 3,
      commutePreference: 2
    }
  });

  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    name: '',
    monthlySalary: '',
    shiftWork: '日勤',
    minAge: '',
    maxAge: '',
    gender: '不問',
    commuteTime: '',
    commuteOption: '通勤可',
    acceptedCommuteMethods: ['自家用車'],
    fee: '',
    feeType: '固定',
    vacancies: '' // 欠員数を追加
  });

  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [searchHistory, setSearchHistory] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState(new Set());
  const [expandedConditions, setExpandedConditions] = useState(new Set(['immediate', 'possible']));
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedJobForTracking, setSelectedJobForTracking] = useState(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  
  // ツリー図用
  const canvasRef = useRef(null);
  const treeContainerRef = useRef(null);
  const [nodePositions, setNodePositions] = useState({});
  const [zoom, setZoom] = useState(1);
  const [flowTree, setFlowTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [treeContentSize, setTreeContentSize] = useState({ width: 0, height: 0 });

  const shiftWorkOptions = ['日勤', '2交代', '3交代'];
  const genderOptions = ['男性', '女性', '不問'];
  const commutePreferenceOptions = ['通勤希望', '入寮希望', 'どちらでもいい'];
  const commuteOptionOptions = ['通勤可', '入寮可', 'どちらも可'];

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleFitToScreen = () => {
    if (treeContainerRef.current && treeContentSize.width > 0) {
      const container = treeContainerRef.current;
      const scaleX = (container.clientWidth - 40) / treeContentSize.width;
      const scaleY = (container.clientHeight - 40) / treeContentSize.height;
      const newZoom = Math.min(scaleX, scaleY, 1);
      setZoom(newZoom);
    }
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

    if (job.gender !== '不問' && seekerConditions.gender !== job.gender) {
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

    if (!job.acceptedCommuteMethods?.includes(seekerConditions.commuteMethod)) {
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

  const checkCommutePreferenceMatch = (job) => {
    if (seekerConditions.commutePreference === 'どちらでもいい') return true;
    if (job.commuteOption === 'どちらも可') return true;
    if (seekerConditions.commutePreference === '通勤希望' && job.commuteOption === '通勤可') return true;
    if (seekerConditions.commutePreference === '入寮希望' && job.commuteOption === '入寮可') return true;
    return false;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return '🟢 完全マッチ';
    if (score >= 70) return '🟡 ほぼマッチ';
    if (score >= 50) return '🟠 要検討';
    return '🔴 ミスマッチ';
  };

  const checkConditionDetail = (job, conditionId) => {
    switch(conditionId) {
      case 'age':
        if (!seekerConditions.age) return { pass: true, reason: '' };
        const age = parseInt(seekerConditions.age);
        if (job.minAge && age < parseInt(job.minAge)) {
          return { pass: false, reason: `最低年齢${job.minAge}歳以上が必要（現在${age}歳）` };
        }
        if (job.maxAge && age > parseInt(job.maxAge)) {
          return { pass: false, reason: `最高年齢${job.maxAge}歳以下が必要（現在${age}歳）` };
        }
        return { pass: true, reason: '' };
      
      case 'gender':
        if (job.gender === '不問' || seekerConditions.gender === job.gender) {
          return { pass: true, reason: '' };
        }
        return { pass: false, reason: `性別要件：${job.gender}（現在：${seekerConditions.gender}）` };
      
      case 'shiftWork':
        if (seekerConditions.shiftWork === job.shiftWork) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `勤務形態不一致`,
          current: seekerConditions.shiftWork,
          required: job.shiftWork,
          question: `${job.shiftWork}勤務でも大丈夫ですか？`
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
          question: `通勤${job.commuteTime}分でも大丈夫ですか？`
        };
      
      case 'commuteMethod':
        if (job.acceptedCommuteMethods?.includes(seekerConditions.commuteMethod)) {
          return { pass: true, reason: '' };
        }
        return { 
          pass: false, 
          reason: `通勤手段不一致`,
          current: seekerConditions.commuteMethod,
          required: job.acceptedCommuteMethods?.join('、'),
          question: `${job.acceptedCommuteMethods?.join('または')}での通勤は可能ですか？`
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
          question: job.commuteOption === '入寮可' ? '入寮は可能ですか？' : '通勤は可能ですか？'
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
          question: `月収${job.monthlySalary}万円でも大丈夫ですか？`
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

  const calculateNodePositions = (node, x = 800, y = 50, positions = {}, levelWidth = {}) => {
    positions[node.id] = { x, y };
    
    if (!levelWidth[node.level]) {
      levelWidth[node.level] = 0;
    }
    levelWidth[node.level] = Math.max(levelWidth[node.level], x + 250);

    if (node.children && node.children.length > 0) {
      const childSpacing = 600;
      const totalWidth = (node.children.length - 1) * childSpacing;
      let startX = x - totalWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * childSpacing;
        const childY = y + 200;
        calculateNodePositions(child, childX, childY, positions, levelWidth);
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
    if (node.jobs.some(job => job.id === targetJobId)) {
      return [...path, node.id];
    }

    for (const child of node.children || []) {
      const foundPath = getPathToJob(child, targetJobId, [...path, node.id]);
      if (foundPath) return foundPath;
    }

    return null;
  };

  const renderTreeNode = (node) => {
    const pos = nodePositions[node.id];
    if (!pos) return null;

    const isOnTrackingPath = selectedJobForTracking && 
      flowTree && 
      getPathToJob(flowTree, selectedJobForTracking)?.includes(node.id);

    let bgColor = 'bg-white';
    let borderColor = 'border-gray-300';
    let iconColor = 'text-gray-600';

    if (node.type === 'start') {
      bgColor = 'bg-indigo-50';
      borderColor = 'border-indigo-500';
      iconColor = 'text-indigo-700';
    } else if (node.type === 'pass') {
      bgColor = 'bg-green-50';
      borderColor = 'border-green-500';
      iconColor = 'text-green-700';
    } else if (node.type === 'relax') {
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-500';
      iconColor = 'text-yellow-700';
    } else if (node.type === 'relax-accepted') {
      bgColor = 'bg-lime-50';
      borderColor = 'border-lime-500';
      iconColor = 'text-lime-700';
    } else if (node.type === 'relax-rejected') {
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-500';
      iconColor = 'text-orange-700';
    } else if (node.type === 'exclude') {
      bgColor = 'bg-red-50';
      borderColor = 'border-red-500';
      iconColor = 'text-red-700';
    } else if (node.type === 'success') {
      bgColor = 'bg-emerald-50';
      borderColor = 'border-emerald-500';
      iconColor = 'text-emerald-700';
    } else if (node.type === 'fail') {
      bgColor = 'bg-gray-100';
      borderColor = 'border-gray-500';
      iconColor = 'text-gray-700';
    }

    if (isOnTrackingPath) {
      borderColor = 'border-purple-600';
      bgColor = bgColor.replace('50', '100');
    }

    const fees = node.jobs.map(j => parseInt(j.fee) || 0).filter(f => f > 0);
    const minFee = fees.length > 0 ? Math.min(...fees) : 0;
    const maxFee = fees.length > 0 ? Math.max(...fees) : 0;

    const isHighFeeNode = maxFee >= 35;
    const isLowFeeNode = maxFee > 0 && maxFee <= 20;

    if (!isOnTrackingPath) {
      if (isHighFeeNode && node.jobs.length > 0) {
        borderColor = 'border-amber-500';
        bgColor = bgColor.replace('-50', '-100');
      } else if (isLowFeeNode && node.jobs.length > 0) {
        borderColor = 'border-gray-400';
      }
    }

    return (
      <div key={node.id}>
        <div
          className={`absolute ${bgColor} border-2 ${borderColor} rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer ${
            isOnTrackingPath ? 'ring-2 ring-purple-400' : ''
          }`}
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: '220px',
            zIndex: isOnTrackingPath ? 30 : 20
          }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div className="p-3">
            <div className={`font-bold text-xs mb-1 ${iconColor} flex items-center justify-center`}>
              {node.type === 'start' && <span className="text-base">🎯</span>}
              {node.type === 'pass' && <span className="text-base">✅</span>}
              {node.type === 'relax' && <span className="text-base">⚠️</span>}
              {node.type === 'relax-accepted' && <span className="text-base">✔️</span>}
              {node.type === 'relax-rejected' && <span className="text-base">✖️</span>}
              {node.type === 'exclude' && <span className="text-base">❌</span>}
              {node.type === 'success' && <span className="text-base">🎉</span>}
              {node.type === 'fail' && <span className="text-base">💀</span>}
            </div>
            
            {node.type === 'success' && (
              <div className="text-center">
                <div className="text-xs font-bold text-emerald-800 mb-2">✅ 紹介可能</div>
                
                <div className="text-left space-y-1 max-h-32 overflow-y-auto">
                  {node.jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="text-xs border-b border-emerald-200 pb-1">
                      <div className="font-semibold text-gray-800 truncate">{job.name}</div>
                      <div className="flex justify-between items-center">
                        {job.fee && (
                          <span className={`font-bold ${
                            parseInt(job.fee) >= 35 ? 'text-amber-600' : 
                            parseInt(job.fee) <= 20 ? 'text-gray-500' : 'text-blue-600'
                          }`}>
                            💰{job.fee}万
                          </span>
                        )}
                        {job.vacancies && (
                          <span className="text-gray-600 text-xs">👥{job.vacancies}名</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {node.jobs.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-1">
                      ...他{node.jobs.length - 5}件
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {node.type === 'fail' && (
              <div className="text-center">
                <div className="text-xs font-bold text-gray-700">提案失敗</div>
              </div>
            )}
            
            {node.type !== 'success' && node.type !== 'fail' && (
              <>
                <div className={`text-xs font-semibold text-center mb-2 ${iconColor}`}>
                  {node.condition || '開始'}
                </div>
                
                {node.jobs.length > 0 ? (
                  <div className="text-left space-y-1 max-h-32 overflow-y-auto">
                    {node.jobs.slice(0, 5).map(job => (
                      <div key={job.id} className="text-xs border-b border-gray-200 pb-1">
                        <div className="font-semibold text-gray-800 truncate" title={job.name}>
                          {job.name}
                        </div>
                        <div className="flex justify-between items-center">
                          {job.fee && (
                            <span className={`font-bold text-xs ${
                              parseInt(job.fee) >= 35 ? 'text-amber-600' : 
                              parseInt(job.fee) <= 20 ? 'text-gray-500' : 'text-blue-600'
                            }`}>
                              💰{job.fee}万
                            </span>
                          )}
                          {job.vacancies && (
                            <span className="text-gray-600 text-xs">👥{job.vacancies}名</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {node.jobs.length > 5 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        ...他{node.jobs.length - 5}件
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-500">
                    案件なし
                  </div>
                )}
              </>
            )}

            {node.excludedJobs && node.excludedJobs.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-300">
                <div className="text-red-600 font-semibold text-xs text-center">除外{node.excludedJobs.length}</div>
              </div>
            )}
          </div>
        </div>

        {hoveredNode === node.id && node.jobs.length > 0 && (
          <div
            className="absolute bg-white border-2 border-indigo-500 rounded-lg shadow-2xl p-3 z-50"
            style={{
              left: `${pos.x + 230}px`,
              top: `${pos.y}px`,
              width: '250px'
            }}
          >
            <div className="font-bold text-indigo-900 mb-2 text-sm">💡 全案件リスト ({node.jobs.length}件)</div>
            {fees.length > 0 && (
              <div className="text-xs mb-2 text-green-600 font-semibold">
                Fee: {minFee === maxFee ? `${minFee}万` : `${minFee}-${maxFee}万`}
              </div>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto text-xs">
              {node.jobs.map(job => (
                <div key={job.id} className="border-b border-gray-200 pb-1">
                  <div className="font-semibold">{job.name}</div>
                  <div className="text-gray-600 flex justify-between">
                    <span>Fee: {job.fee}万</span>
                    {job.vacancies && <span>👥{job.vacancies}名</span>}
                  </div>
                  <div className="text-gray-600">
                    スコア: {calculateMatchScore(job)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {node.children?.map(child => renderTreeNode(child))}
      </div>
    );
  };

  useEffect(() => {
    if (!canvasRef.current || !flowTree || Object.keys(nodePositions).length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const positions = Object.values(nodePositions);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const marginRight = 550;
    const marginBottom = 150;
    
    const canvasWidth = maxX - minX + marginRight;
    const canvasHeight = maxY - minY + marginBottom;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    setTreeContentSize({ width: canvasWidth, height: canvasHeight });
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trackingPath = selectedJobForTracking && flowTree 
      ? getPathToJob(flowTree, selectedJobForTracking) 
      : null;

    const drawConnections = (node) => {
      const nodePos = nodePositions[node.id];
      if (!nodePos) return;

      node.children?.forEach(child => {
        const childPos = nodePositions[child.id];
        if (!childPos) return;

        const isOnPath = trackingPath?.includes(node.id) && trackingPath?.includes(child.id);
        
        const childFees = child.jobs?.map(j => parseInt(j.fee) || 0).filter(f => f > 0) || [];
        const childMaxFee = childFees.length > 0 ? Math.max(...childFees) : 0;
        const isHighFeeChild = childMaxFee >= 35;

        ctx.beginPath();
        ctx.moveTo(nodePos.x + 110, nodePos.y + 80);
        ctx.lineTo(childPos.x + 110, childPos.y);

        if (isOnPath) {
          ctx.strokeStyle = '#9333ea';
          ctx.lineWidth = 4;
        } else if (child.type === 'pass' || child.type === 'success') {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = isHighFeeChild ? 3 : 2;
        } else if (child.type === 'relax') {
          ctx.strokeStyle = isHighFeeChild ? '#f59e0b' : '#eab308';
          ctx.lineWidth = isHighFeeChild ? 3 : 2;
          ctx.setLineDash([4, 4]);
        } else if (child.type === 'relax-accepted') {
          ctx.strokeStyle = isHighFeeChild ? '#65a30d' : '#84cc16';
          ctx.lineWidth = isHighFeeChild ? 3 : 2;
        } else if (child.type === 'relax-rejected') {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 3]);
        } else if (child.type === 'exclude' || child.type === 'fail') {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 3]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        drawConnections(child);
      });
    };

    drawConnections(flowTree);
  }, [nodePositions, flowTree, selectedJobForTracking]);

  const addJob = () => {
    if (newJob.name) {
      setJobs([...jobs, { ...newJob, id: Date.now() }]);
      setNewJob({
        name: '',
        monthlySalary: '',
        shiftWork: '日勤',
        minAge: '',
        maxAge: '',
        gender: '不問',
        commuteTime: '',
        commuteOption: '通勤可',
        acceptedCommuteMethods: ['自家用車'],
        fee: '',
        feeType: '固定',
        vacancies: ''
      });
    }
  };

  const startEditJob = (job) => {
    setEditingJobId(job.id);
    setEditingJob({ ...job });
  };

  const saveEditJob = () => {
    setJobs(jobs.map(job => job.id === editingJobId ? editingJob : job));
    setEditingJobId(null);
    setEditingJob(null);
  };

  const cancelEditJob = () => {
    setEditingJobId(null);
    setEditingJob(null);
  };

  const removeJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleCompareSelection = (id) => {
    setSelectedForCompare(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (newSet.size >= 4) {
          alert('比較は最大4件までです');
          return newSet;
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const saveSearchHistory = () => {
    const historyItem = {
      id: Date.now(),
      conditions: { ...seekerConditions },
      timestamp: new Date().toISOString(),
      jobCount: jobs.length
    };
    setSearchHistory(prev => [historyItem, ...prev].slice(0, 10));
  };

  const loadFromHistory = (historyItem) => {
    setSeekerConditions(historyItem.conditions);
  };

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

  const exportToExcel = () => {
    const headers = ['案件名', '月収', '勤務形態', '性別', '年齢', '通勤時間', '通勤方法', '受入通勤手段', 'Fee', '欠員数', 'マッチングスコア', '状態'];
    const analysisResults = jobs.map(analyzeJobDetail);
    
    const rows = analysisResults.map(result => [
      result.job.name,
      result.job.monthlySalary,
      result.job.shiftWork,
      result.job.gender,
      `${result.job.minAge || '-'}〜${result.job.maxAge || '-'}`,
      result.job.commuteTime,
      result.job.commuteOption,
      result.job.acceptedCommuteMethods?.join('、') || '',
      result.job.fee,
      result.job.vacancies || '-',
      result.score,
      result.isImmediateMatch ? 'すぐ紹介可能' : result.isPossibleMatch ? '条件確認必要' : '紹介不可'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'matching_results.csv';
    link.click();
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
      age: job.minAge || job.maxAge ? `${job.minAge || '-'}〜${job.maxAge || '-'}歳` : '不問',
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

  const analysisResults = jobs.map(analyzeJobDetail);
  const immediateMatches = analysisResults.filter(r => r.isImmediateMatch);
  const possibleMatches = analysisResults.filter(r => !r.isImmediateMatch && r.isPossibleMatch);
  const impossibleMatches = analysisResults.filter(r => !r.isPossibleMatch);

  const topCandidate = immediateMatches.length > 0 
    ? immediateMatches.sort((a, b) => {
        const feeA = parseInt(a.job.fee) || 0;
        const feeB = parseInt(b.job.fee) || 0;
        if (feeB !== feeA) return feeB - feeA;
        return b.score - a.score;
      })[0]
    : possibleMatches.length > 0
    ? possibleMatches.sort((a, b) => {
        const feeA = parseInt(a.job.fee) || 0;
        const feeB = parseInt(b.job.fee) || 0;
        if (feeB !== feeA) return feeB - feeA;
        return b.score - a.score;
      })[0]
    : null;

  const sortedJobs = [...analysisResults].sort((a, b) => {
    if (a.isImmediateMatch && !b.isImmediateMatch) return -1;
    if (!a.isImmediateMatch && b.isImmediateMatch) return 1;
    if (a.isPossibleMatch && !b.isPossibleMatch) return -1;
    if (!a.isPossibleMatch && b.isPossibleMatch) return 1;
    
    const feeA = parseInt(a.job.fee) || 0;
    const feeB = parseInt(b.job.fee) || 0;
    if (feeB !== feeA) return feeB - feeA;
    
    return b.score - a.score;
  });

  useEffect(() => {
    if (showAnalysis && jobs.length > 0) {
      saveSearchHistory();
      const tree = buildFlowTree();
      setFlowTree(tree);
      const positions = calculateNodePositions(tree);
      const normalizedPositions = normalizePositions(positions);
      setNodePositions(normalizedPositions);
    }
  }, [showAnalysis, jobs, seekerConditions]);

  const SeekerInfoCard = () => (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-3 text-white">
      <div className="mb-3">
        <h3 className="font-bold text-sm mb-2 flex items-center">
          <User className="mr-1" size={16} />
          👤 求職者の基本情報
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div className="bg-white bg-opacity-20 rounded p-2 text-center">
            <div className="opacity-90 text-xs mb-1">年齢</div>
            <div className="font-bold text-sm">{seekerConditions.age || '-'}歳</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded p-2 text-center">
            <div className="opacity-90 text-xs mb-1">性別</div>
            <div className="font-bold text-sm">{seekerConditions.gender}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded p-2 text-center">
            <div className="opacity-90 text-xs mb-1">希望月収</div>
            <div className="font-bold text-sm">{seekerConditions.monthlySalary || '-'}万</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded p-2 text-center">
            <div className="opacity-90 text-xs mb-1">勤務形態</div>
            <div className="font-bold text-sm">{seekerConditions.shiftWork}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded p-2 text-center">
            <div className="opacity-90 text-xs mb-1">通勤時間</div>
            <div className="font-bold text-sm">{seekerConditions.commuteTime || '-'}分</div>
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
      </div>
      
      <div className="border-t border-white border-opacity-30 pt-3">
        <h3 className="font-bold text-sm mb-2 flex items-center">
          <Target className="mr-1" size={16} />
          📊 マッチング状況
        </h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-green-500 bg-opacity-40 rounded p-2 text-center">
            <div className="font-bold text-2xl">{immediateMatches.length}</div>
            <div className="text-xs mt-1">すぐ紹介可能</div>
          </div>
          <div className="bg-yellow-500 bg-opacity-40 rounded p-2 text-center">
            <div className="font-bold text-2xl">{possibleMatches.length}</div>
            <div className="text-xs mt-1">条件確認必要</div>
          </div>
          {topCandidate ? (
            <div className="bg-white bg-opacity-30 rounded p-2 text-center">
              <div className="font-bold text-2xl">{topCandidate.job.fee}万</div>
              <div className="text-xs mt-1">最有力Fee</div>
            </div>
          ) : (
            <div className="bg-red-500 bg-opacity-40 rounded p-2 text-center">
              <div className="font-bold text-2xl">{impossibleMatches.length}</div>
              <div className="text-xs mt-1">紹介不可</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-indigo-700 mb-1">
            🎯 求人マッチングシステム Pro
          </h1>
          <p className="text-sm text-gray-600">電話対応に特化した高機能マッチング分析</p>
        </div>

        {!showAnalysis ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2 text-sm">1</span>
                求職者の条件
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">年齢</label>
                  <input
                    type="number"
                    value={seekerConditions.age}
                    onChange={(e) => setSeekerConditions({...seekerConditions, age: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">性別</label>
                  <select
                    value={seekerConditions.gender}
                    onChange={(e) => setSeekerConditions({...seekerConditions, gender: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    <option value="男性">男性</option>
                    <option value="女性">女性</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">希望月収（万円）</label>
                  <input
                    type="number"
                    value={seekerConditions.monthlySalary}
                    onChange={(e) => setSeekerConditions({...seekerConditions, monthlySalary: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">勤務形態</label>
                  <select
                    value={seekerConditions.shiftWork}
                    onChange={(e) => setSeekerConditions({...seekerConditions, shiftWork: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {shiftWorkOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">通勤可能時間（分）</label>
                  <input
                    type="number"
                    value={seekerConditions.commuteTime}
                    onChange={(e) => setSeekerConditions({...seekerConditions, commuteTime: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">通勤/入寮</label>
                  <select
                    value={seekerConditions.commutePreference}
                    onChange={(e) => setSeekerConditions({...seekerConditions, commutePreference: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {commutePreferenceOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">通勤手段</label>
                  <select
                    value={seekerConditions.commuteMethod}
                    onChange={(e) => setSeekerConditions({...seekerConditions, commuteMethod: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {commuteMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <h3 className="font-bold text-indigo-800 mb-2 text-sm">🎯 条件の優先度設定</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {Object.entries({
                    salary: '月収',
                    shiftWork: '勤務形態',
                    commuteTime: '通勤時間',
                    commuteMethod: '通勤手段',
                    commutePreference: '通勤/入寮'
                  }).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                      <select
                        value={seekerConditions.priorities[key]}
                        onChange={(e) => setSeekerConditions({
                          ...seekerConditions,
                          priorities: {
                            ...seekerConditions.priorities,
                            [key]: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900"
                      >
                        <option value="5">最重要 ⭐⭐⭐⭐⭐</option>
                        <option value="4">重要 ⭐⭐⭐⭐</option>
                        <option value="3">普通 ⭐⭐⭐</option>
                        <option value="2">低 ⭐⭐</option>
                        <option value="1">最低 ⭐</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold text-indigo-600 mb-3 flex items-center">
                <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2 text-sm">2</span>
                案件情報
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">案件名</label>
                  <input
                    type="text"
                    value={newJob.name}
                    onChange={(e) => setNewJob({...newJob, name: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: トヨタ自動車"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">月収（万円）</label>
                  <input
                    type="number"
                    value={newJob.monthlySalary}
                    onChange={(e) => setNewJob({...newJob, monthlySalary: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 28"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">勤務形態</label>
                  <select
                    value={newJob.shiftWork}
                    onChange={(e) => setNewJob({...newJob, shiftWork: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {shiftWorkOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">性別</label>
                  <select
                    value={newJob.gender}
                    onChange={(e) => setNewJob({...newJob, gender: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {genderOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">最低年齢</label>
                  <input
                    type="number"
                    value={newJob.minAge}
                    onChange={(e) => setNewJob({...newJob, minAge: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 18"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">最高年齢</label>
                  <input
                    type="number"
                    value={newJob.maxAge}
                    onChange={(e) => setNewJob({...newJob, maxAge: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">通勤時間（分）</label>
                  <input
                    type="number"
                    value={newJob.commuteTime}
                    onChange={(e) => setNewJob({...newJob, commuteTime: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">通勤/入寮</label>
                  <select
                    value={newJob.commuteOption}
                    onChange={(e) => setNewJob({...newJob, commuteOption: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                  >
                    {commuteOptionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fee（万円）</label>
                  <input
                    type="number"
                    value={newJob.fee}
                    onChange={(e) => setNewJob({...newJob, fee: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">欠員数（名）</label>
                  <input
                    type="number"
                    value={newJob.vacancies}
                    onChange={(e) => setNewJob({...newJob, vacancies: e.target.value})}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    placeholder="例: 5"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">受入可能な通勤手段（複数選択可）</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {commuteMethods.map(method => (
                    <label key={method.value} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={newJob.acceptedCommuteMethods?.includes(method.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewJob({
                              ...newJob,
                              acceptedCommuteMethods: [...(newJob.acceptedCommuteMethods || []), method.value]
                            });
                          } else {
                            setNewJob({
                              ...newJob,
                              acceptedCommuteMethods: newJob.acceptedCommuteMethods?.filter(m => m !== method.value)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={addJob}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <Plus size={18} />
                <span>案件を追加</span>
              </button>
            </div>

            {jobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-indigo-600 flex items-center">
                    <span className="bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2 text-sm">3</span>
                    登録済み案件 ({jobs.length}件)
                  </h2>
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      compareMode ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {compareMode ? '比較モード終了' : '比較モード'}
                  </button>
                </div>

                <div className="space-y-2">
                  {jobs.map(job => {
                    const score = calculateMatchScore(job);
                    const isFavorite = favorites.has(job.id);
                    const isSelected = selectedForCompare.has(job.id);
                    
                    return (
                      <div key={job.id}>
                        {editingJobId === job.id ? (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                              <input
                                type="text"
                                value={editingJob.name}
                                onChange={(e) => setEditingJob({...editingJob, name: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="案件名"
                              />
                              <input
                                type="number"
                                value={editingJob.monthlySalary}
                                onChange={(e) => setEditingJob({...editingJob, monthlySalary: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="月収"
                              />
                              <select
                                value={editingJob.shiftWork}
                                onChange={(e) => setEditingJob({...editingJob, shiftWork: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                              >
                                {shiftWorkOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <select
                                value={editingJob.gender}
                                onChange={(e) => setEditingJob({...editingJob, gender: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                              >
                                {genderOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={editingJob.minAge}
                                onChange={(e) => setEditingJob({...editingJob, minAge: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="最低年齢"
                              />
                              <input
                                type="number"
                                value={editingJob.maxAge}
                                onChange={(e) => setEditingJob({...editingJob, maxAge: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="最高年齢"
                              />
                              <input
                                type="number"
                                value={editingJob.commuteTime}
                                onChange={(e) => setEditingJob({...editingJob, commuteTime: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="通勤時間"
                              />
                              <select
                                value={editingJob.commuteOption}
                                onChange={(e) => setEditingJob({...editingJob, commuteOption: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                              >
                                {commuteOptionOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                value={editingJob.fee}
                                onChange={(e) => setEditingJob({...editingJob, fee: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="Fee"
                              />
                              <input
                                type="number"
                                value={editingJob.vacancies}
                                onChange={(e) => setEditingJob({...editingJob, vacancies: e.target.value})}
                                className="px-2 py-1 text-xs border rounded bg-white text-gray-900"
                                placeholder="欠員数"
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={saveEditJob}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded transition text-xs flex items-center justify-center space-x-1"
                              >
                                <Save size={12} />
                                <span>保存</span>
                              </button>
                              <button
                                onClick={cancelEditJob}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-3 rounded transition text-xs flex items-center justify-center space-x-1"
                              >
                                <X size={12} />
                                <span>キャンセル</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition border ${
                            isSelected ? 'border-purple-500 bg-purple-50' : 'border-transparent'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-base">{job.name}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getScoreColor(score)}`}>
                                    {score}点
                                  </span>
                                  {job.fee && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                      💰 {job.fee}万
                                    </span>
                                  )}
                                  {job.vacancies && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                      👥 {job.vacancies}名
                                    </span>
                                  )}
                                  {isFavorite && <span className="text-yellow-500 text-sm">⭐</span>}
                                </div>
                                <div className="text-xs text-gray-600">
                                  月収:{job.monthlySalary}万 | {job.shiftWork} | {job.gender} | 
                                  年齢:{job.minAge || '-'}〜{job.maxAge || '-'} | 
                                  通勤:{job.commuteTime}分
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {compareMode && (
                                  <button
                                    onClick={() => toggleCompareSelection(job.id)}
                                    className={`p-1.5 rounded transition ${
                                      isSelected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleFavorite(job.id)}
                                  className={`p-1.5 rounded transition ${
                                    isFavorite ? 'text-yellow-500' : 'text-gray-400'
                                  }`}
                                >
                                  <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => startEditJob(job)}
                                  className="text-blue-600 p-1.5 hover:bg-blue-100 rounded transition"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeJob(job.id)}
                                  className="text-red-600 p-1.5 hover:bg-red-100 rounded transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {compareMode && selectedForCompare.size > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-bold text-purple-600 mb-3">📊 案件比較 ({selectedForCompare.size}件)</h2>
                
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">求職者の条件:</h3>
                  <div className="bg-indigo-50 rounded-lg p-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="font-semibold">年齢:</span> {seekerConditions.age || '-'}歳
                      </div>
                      <div>
                        <span className="font-semibold">性別:</span> {seekerConditions.gender}
                      </div>
                      <div>
                        <span className="font-semibold">希望月収:</span> {seekerConditions.monthlySalary || '-'}万円
                      </div>
                      <div>
                        <span className="font-semibold">勤務形態:</span> {seekerConditions.shiftWork}
                      </div>
                      <div>
                        <span className="font-semibold">通勤時間:</span> {seekerConditions.commuteTime || '-'}分以内
                      </div>
                      <div>
                        <span className="font-semibold">通勤手段:</span> {seekerConditions.commuteMethod}
                      </div>
                      <div>
                        <span className="font-semibold">通勤/入寮:</span> {seekerConditions.commutePreference}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Array.from(selectedForCompare).map(jobId => {
                    const job = jobs.find(j => j.id === jobId);
                    if (!job) return null;
                    const score = calculateMatchScore(job);
                    
                    return (
                      <div key={job.id} className="border-2 border-purple-300 rounded-lg p-3 bg-purple-50">
                        <h3 className="font-bold text-base mb-2">{job.name}</h3>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>スコア:</span>
                            <span className="font-bold">{score}点</span>
                          </div>
                          <div className="flex justify-between">
                            <span>月収:</span>
                            <span className="font-bold">{job.monthlySalary}万</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee:</span>
                            <span className="font-bold text-green-600">{job.fee}万</span>
                          </div>
                          {job.vacancies && (
                            <div className="flex justify-between">
                              <span>欠員数:</span>
                              <span className="font-bold text-blue-600">{job.vacancies}名</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>勤務:</span>
                            <span>{job.shiftWork}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>年齢:</span>
                            <span>{job.minAge || '-'}〜{job.maxAge || '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {searchHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-bold text-indigo-600 mb-2 flex items-center">
                  <History className="mr-2" size={18} />
                  検索履歴
                </h2>
                <div className="space-y-1">
                  {searchHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer text-xs"
                         onClick={() => loadFromHistory(item)}>
                      <div>
                        <div className="font-semibold text-xs">
                          {new Date(item.timestamp).toLocaleString('ja-JP')}
                        </div>
                        <div className="text-xs text-gray-600">
                          年齢:{item.conditions.age || '-'} | 
                          月収:{item.conditions.monthlySalary || '-'}万
                        </div>
                      </div>
                      <button className="text-indigo-600 font-semibold text-xs">
                        読込
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition transform hover:scale-105"
                >
                  📞 マッチング分析を表示
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowAnalysis(false);
                  setSelectedJobForTracking(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
              >
                ← 入力画面に戻る
              </button>
              
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 text-sm"
              >
                <Download size={16} />
                <span>CSV出力</span>
              </button>
            </div>

            <SeekerInfoCard />

            <div className="bg-white rounded-lg shadow-lg p-3">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => setShowMatrix(!showMatrix)}
              >
                <h2 className="text-lg font-bold text-indigo-600 flex items-center">
                  📋 条件マトリクス一覧
                </h2>
                {showMatrix ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
              {showMatrix && (
                <div className="overflow-x-auto mt-2 relative">
                  <table className="w-full text-xs">
                    <thead className="bg-indigo-100">
                      <tr>
                        <th className="px-2 py-2 text-left font-bold">案件名</th>
                        <th className="px-2 py-2 text-center font-bold">Fee</th>
                        <th className="px-2 py-2 text-center font-bold">欠員</th>
                        <th className="px-2 py-2 text-center font-bold">年齢</th>
                        <th className="px-2 py-2 text-center font-bold">性別</th>
                        <th className="px-2 py-2 text-center font-bold">勤務</th>
                        <th className="px-2 py-2 text-center font-bold">通勤時間</th>
                        <th className="px-2 py-2 text-center font-bold">通勤手段</th>
                        <th className="px-2 py-2 text-center font-bold">月収</th>
                        <th className="px-2 py-2 text-center font-bold">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedJobs.map((result, index) => {
                        const conditions = result.allConditions;
                        const bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                        
                        return (
                          <tr 
                            key={result.job.id} 
                            className={`${bgColor} hover:bg-blue-50 border-b`}
                          >
                            <td 
                              className="px-2 py-2 font-semibold text-xs cursor-pointer"
                              onClick={() => setSelectedJobForTracking(result.job.id)}
                            >
                              {result.job.name}
                              {selectedJobForTracking === result.job.id && (
                                <span className="ml-1 text-purple-600">🎯</span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center text-green-600 font-bold">{result.job.fee || '-'}万</td>
                            <td className="px-2 py-2 text-center text-blue-600 font-bold">{result.job.vacancies || '-'}名</td>
                            {conditions.slice(0, 6).map(cond => (
                              <td 
                                key={cond.id} 
                                className="px-2 py-2 text-center relative cursor-help"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredCell({ 
                                    jobId: result.job.id, 
                                    conditionId: cond.id,
                                    mouseX: rect.left + rect.width / 2,
                                    mouseY: rect.bottom + 5
                                  });
                                }}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                {cond.pass ? (
                                  <span className="text-green-600 text-xl">✅</span>
                                ) : cond.canRelax ? (
                                  <span className="text-yellow-600 text-xl">⚠️</span>
                                ) : (
                                  <span className="text-red-600 text-xl">❌</span>
                                )}
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center text-xs">
                              {result.isImmediateMatch ? (
                                <span className="text-green-600 font-bold text-xs">OK</span>
                              ) : result.isPossibleMatch ? (
                                <span className="text-yellow-600 font-bold text-xs">{result.relaxableFailedConditions.length}項目</span>
                              ) : (
                                <span className="text-red-600 font-bold text-xs">NG</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedJobForTracking && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-300 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-900">
                      🎯 {jobs.find(j => j.id === selectedJobForTracking)?.name} を追跡中
                    </span>
                    <button
                      onClick={() => setSelectedJobForTracking(null)}
                      className="text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      解除
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-3">
              <h2 className="text-lg font-bold text-green-600 mb-2 flex items-center">
                <Phone className="mr-2" size={18} />
                📞 電話確認シート
              </h2>

              {immediateMatches.length > 0 && (
                <div>
                  <div 
                    className="bg-green-100 border-l-4 border-green-500 p-2 cursor-pointer hover:bg-green-200 transition"
                    onClick={() => toggleConditionExpansion('immediate')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-green-800 flex items-center">
                        ✅ すぐ紹介可能 ({immediateMatches.length}件)
                      </h3>
                      {expandedConditions.has('immediate') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                  {expandedConditions.has('immediate') && (
                    <div className="mt-2 space-y-2">
                      {immediateMatches.map(result => (
                        <div 
                          key={result.job.id} 
                          className={`bg-green-50 border rounded-lg p-2 cursor-pointer transition text-xs ${
                            selectedJobForTracking === result.job.id ? 'border-purple-500 ring-1 ring-purple-300' : 'border-green-300'
                          }`}
                          onClick={() => setSelectedJobForTracking(result.job.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="text-sm font-bold text-green-900 flex items-center">
                                {result.job.name}
                                {selectedJobForTracking === result.job.id && <span className="ml-1 text-purple-600">🎯</span>}
                              </h4>
                              <div className="text-xs text-gray-600 mt-0.5">
                                月収:{result.job.monthlySalary}万 | {result.job.shiftWork} | 通勤:{result.job.commuteTime}分
                                {result.job.vacancies && <span> | 欠員:{result.job.vacancies}名</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-600">
                                💰 {result.job.fee}万
                              </div>
                              <div className={`text-xs font-bold ${getScoreColor(result.score)} text-white px-2 py-0.5 rounded-full mt-1`}>
                                {result.score}点
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded p-2 border border-green-200">
                            <div className="font-bold text-green-800 text-xs mb-1">
                              ✅ すべての条件クリア:
                            </div>
                            <div className="text-xs text-gray-700">
                              すぐにご紹介できます！面談のご希望日時をお聞かせください。
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {possibleMatches.length > 0 && (
                <div className="mt-3">
                  <div 
                    className="bg-yellow-100 border-l-4 border-yellow-500 p-2 cursor-pointer hover:bg-yellow-200 transition"
                    onClick={() => toggleConditionExpansion('possible')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-yellow-800 flex items-center">
                        ⚠️ 条件確認が必要 ({possibleMatches.length}件)
                      </h3>
                      {expandedConditions.has('possible') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                  {expandedConditions.has('possible') && (
                    <div className="mt-2 space-y-2">
                      {possibleMatches.map(result => {
                        const relaxableConditions = result.relaxableFailedConditions.map(cond => ({
                          id: cond.id,
                          name: cond.name,
                          question: cond.question,
                          reason: cond.reason
                        }));

                        return (
                          <div 
                            key={result.job.id} 
                            className={`bg-yellow-50 border rounded-lg p-2 cursor-pointer transition text-xs ${
                              selectedJobForTracking === result.job.id ? 'border-purple-500 ring-1 ring-purple-300' : 'border-yellow-300'
                            }`}
                            onClick={() => setSelectedJobForTracking(result.job.id)}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h4 className="text-sm font-bold text-yellow-900 flex items-center">
                                  {result.job.name}
                                  {selectedJobForTracking === result.job.id && <span className="ml-1 text-purple-600">🎯</span>}
                                </h4>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  月収:{result.job.monthlySalary}万 | {result.job.shiftWork} | 通勤:{result.job.commuteTime}分
                                  {result.job.vacancies && <span> | 欠員:{result.job.vacancies}名</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-green-600">
                                  💰 {result.job.fee}万
                                </div>
                                <div className={`text-xs font-bold ${getScoreColor(result.score)} text-white px-2 py-0.5 rounded-full mt-1`}>
                                  {result.score}点
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded p-2 border border-yellow-200">
                              <div className="font-bold text-yellow-800 text-xs mb-1">
                                ⚠️ 以下の点をご確認ください:
                              </div>
                              <div className="space-y-1">
                                {relaxableConditions.map(cond => {
                                  const isChecked = checkedItems[`${result.job.id}-${cond.id}`];
                                  
                                  return (
                                    <div key={cond.id} className={`p-1.5 rounded ${
                                      isChecked ? 'bg-green-100 border border-green-300' : 'bg-yellow-50 border border-yellow-200'
                                    }`}>
                                      <div className="flex items-start space-x-1">
                                        <input
                                          type="checkbox"
                                          checked={isChecked || false}
                                          onChange={() => toggleCheckItem(result.job.id, cond.id)}
                                          className="mt-0.5"
                                        />
                                        <div className="flex-1 text-xs">
                                          <div className="font-semibold">{cond.name}</div>
                                          {cond.question && (
                                            <div className="text-gray-700 flex items-start">
                                              <Phone size={10} className="mr-1 mt-0.5" />
                                              <span>「{cond.question}」</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
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

              {impossibleMatches.length > 0 && (
                <div className="mt-3">
                  <div 
                    className="bg-red-100 border-l-4 border-red-500 p-2 cursor-pointer hover:bg-red-200 transition"
                    onClick={() => toggleConditionExpansion('impossible')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-red-800 flex items-center">
                        ❌ 紹介不可 ({impossibleMatches.length}件)
                      </h3>
                      {expandedConditions.has('impossible') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>
                  {expandedConditions.has('impossible') && (
                    <div className="mt-2 space-y-2">
                      {impossibleMatches.map(result => (
                        <div 
                          key={result.job.id} 
                          className={`bg-red-50 border rounded-lg p-2 cursor-pointer transition text-xs ${
                            selectedJobForTracking === result.job.id ? 'border-purple-500 ring-1 ring-purple-300' : 'border-red-300'
                          }`}
                          onClick={() => setSelectedJobForTracking(result.job.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="text-sm font-bold text-red-900 flex items-center">
                                {result.job.name}
                                {selectedJobForTracking === result.job.id && <span className="ml-1 text-purple-600">🎯</span>}
                              </h4>
                            </div>
                            <div className="text-sm font-bold text-gray-400">
                              💰 {result.job.fee}万
                            </div>
                          </div>
                          
                          <div className="bg-white rounded p-2 border border-red-200">
                            <div className="font-bold text-red-800 text-xs mb-1">
                              ❌ 紹介不可:
                            </div>
                            <div className="space-y-0.5">
                              {result.nonRelaxableFailedConditions.map(cond => (
                                <div key={cond.id} className="text-xs text-gray-700 border-l-2 border-red-400 pl-2">
                                  • {cond.name}: {cond.reason}
                                </div>
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

            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-indigo-600 flex items-center">
                  <Target className="mr-2" size={18} />
                  📊 フローツリー図
                </h2>
                <div className="flex items-center space-x-1 bg-white rounded-lg shadow p-1">
                  <button
                    onClick={handleZoomOut}
                    className="bg-gray-200 hover:bg-gray-300 p-1 rounded transition"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs font-semibold px-2">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="bg-gray-200 hover:bg-gray-300 p-1 rounded transition"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={handleFitToScreen}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded transition ml-1"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 rounded-lg p-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">📖 凡例</h3>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-0.5 bg-green-500"></div>
                        <span>クリア</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-0.5 bg-yellow-500"></div>
                        <span>緩和必要</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-0.5 bg-lime-500"></div>
                        <span>緩和OK</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-0.5 bg-orange-500" style={{borderTop: '2px dashed'}}></div>
                        <span>緩和NG</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-0.5 bg-red-500" style={{borderTop: '2px dashed'}}></div>
                        <span>除外</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-1 bg-purple-600"></div>
                        <span>追跡中</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">💰 Fee</h3>
                    <div className="space-y-0.5 text-gray-700">
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 border-2 border-amber-500 rounded bg-amber-50"></div>
                        <span>高Fee (35万円〜)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 border-2 border-blue-400 rounded bg-blue-50"></div>
                        <span>中Fee (21-34万円)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 border-2 border-gray-400 rounded bg-gray-50"></div>
                        <span>低Fee (〜20万円)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">🎮 操作</h3>
                    <div className="space-y-0.5 text-gray-700">
                      <p>• ズームで拡大縮小</p>
                      <p>• ノードホバーで詳細</p>
                      <p>• 案件クリックで追跡</p>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                ref={treeContainerRef}
                className="overflow-auto border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50" 
                style={{ height: '600px' }}
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
                      {flowTree && Object.keys(nodePositions).length > 0 && renderTreeNode(flowTree)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hoveredCell && (() => {
              const job = jobs.find(j => j.id === hoveredCell.jobId);
              if (!job) return null;
              
              const result = analyzeJobDetail(job);
              const cond = result.allConditions.find(c => c.id === hoveredCell.conditionId);
              if (!cond) return null;

              return (
                <div 
                  className="fixed z-[9999] bg-white border-2 border-indigo-500 rounded-lg shadow-2xl p-3 pointer-events-none"
                  style={{ 
                    left: `${hoveredCell.mouseX}px`,
                    top: `${hoveredCell.mouseY}px`,
                    transform: 'translateX(-50%)',
                    width: '280px'
                  }}
                >
                  <div className="font-bold text-indigo-900 mb-2 text-sm">
                    {getConditionCompareInfo(job, cond.id).name}の比較
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="font-semibold text-blue-900">👤 求職者:</div>
                      <div className="text-gray-700">
                        {getConditionCompareInfo(job, cond.id).seeker}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <div className="font-semibold text-purple-900">📋 案件:</div>
                      <div className="text-gray-700">
                        {getConditionCompareInfo(job, cond.id).job}
                      </div>
                    </div>
                    {!cond.pass && (
                      <div className={`rounded p-2 ${cond.canRelax ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className={`font-semibold ${cond.canRelax ? 'text-yellow-900' : 'text-red-900'}`}>
                          {cond.canRelax ? '⚠️ 確認必要' : '❌ 不適合'}
                        </div>
                        <div className="text-gray-700 text-xs mt-1">
                          {cond.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatchingFlowchart;