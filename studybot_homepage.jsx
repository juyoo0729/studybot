import { useState } from "react";

const SUBJECTS = {
  python:      { name:'Python',     emoji:'🐍' },
  math:        { name:'수학',        emoji:'📐' },
  english:     { name:'영어',        emoji:'🔤' },
  algorithm:   { name:'알고리즘',   emoji:'⚙️' },
  science:     { name:'과학',        emoji:'🔬' },
  data:        { name:'데이터분석', emoji:'📊' },
  deeplearning:{ name:'딥러닝',     emoji:'🧠' },
  cv:          { name:'CV',          emoji:'👁️' },
  dlthon:      { name:'DLthon',      emoji:'⚡' },
  nlp:         { name:'NLP',         emoji:'💬' },
  llm:         { name:'LLM',         emoji:'🤖' },
  mlops:       { name:'MLOps',       emoji:'🔧' },
};

const GROUPS = [
  { label:'기초',  keys:['python','math','english','algorithm','science'] },
  { label:'AI/ML', keys:['data','deeplearning','cv','dlthon','nlp','llm','mlops'] },
];

const TOC = {
  python: ['파이썬 환경 설정','변수와 자료형','연산자와 입출력','조건문 if/elif/else','반복문 for/while','리스트와 튜플','딕셔너리와 집합','함수 def','람다·map·filter','클로저와 데코레이터','이터레이터와 제너레이터','예외 처리','파일 입출력','모듈과 패키지','클래스와 객체','상속·캡슐화·다형성','정규표현식 re','표준 라이브러리','가상환경과 패키지 관리','미니 프로젝트'],
  math_elementary: ['자연수와 덧셈·뺄셈','곱셈과 나눗셈','분수 기초','소수 기초','도형 기초','넓이와 둘레','분수의 사칙연산','비와 비율','평균과 가능성','측정 단위 변환'],
  math_middle: ['정수와 유리수','문자와 식','일차방정식','일차함수','연립방정식','부등식','이차방정식','도형의 성질','피타고라스 정리','확률과 통계 기초','다항식 연산','이차함수'],
  math_high: ['집합과 명제','함수의 개념','지수와 로그','삼각함수','수열','경우의 수·순열·조합','확률','통계','미분 기초','미분 응용','적분','벡터와 공간도형'],
  english_elementary: ['알파벳과 파닉스','기초 단어와 인사말','기초 문장 만들기','현재시제 기초','be동사','일상 표현과 회화','과거시제 기초','기초 의문사'],
  english_middle: ['품사와 문장 5형식','시제 (현재·과거·미래)','현재완료','조동사','수동태','to부정사와 동명사','관계대명사 기초','전치사','비교 구문','접속사'],
  english_high: ['시제 완전 정복','조동사 심화','분사와 분사구문','관계사 완전 정복','가정법','특수구문 강조·도치','어휘 확장 전략','독해 전략','수능 문법 포인트','에세이·서술형 작문'],
  algorithm: ['시간·공간 복잡도 Big-O','배열과 문자열','투 포인터·슬라이딩 윈도우','스택','큐와 덱','정렬 알고리즘','이진 탐색','해시 테이블','트리 기초','힙 Heap','그래프 표현','DFS','BFS','최단 경로 다익스트라','DP 기초','DP 심화','그리디 알고리즘','유니온 파인드·위상 정렬'],
  science_elementary: ['동물의 세계','식물의 세계','물질의 상태 변화','빛과 그림자','소리와 진동','자석과 전기','날씨와 물의 순환','지구와 달','혼합물 분리','우리 몸의 구조'],
  science_middle: ['물질의 구성','힘과 운동','열과 에너지','전기와 자기','파동과 빛','화학 반응','산·염기와 중화','세포와 생명활동','유전과 진화','지구와 지각 변동','태양계와 우주','생태계와 환경'],
  science_physics: ['[물리Ⅰ] 힘과 운동','[물리Ⅰ] 에너지','[물리Ⅰ] 전기와 자기','[물리Ⅰ] 파동','[물리Ⅰ] 열역학','[물리Ⅱ] 역학 심화','[물리Ⅱ] 전자기학 심화','[물리Ⅱ] 빛과 물질의 이중성','[물리Ⅱ] 원자와 핵','[물리Ⅱ] 상대성 이론'],
  science_chemistry: ['[화학Ⅰ] 원자 구조','[화학Ⅰ] 주기율표','[화학Ⅰ] 화학 결합','[화학Ⅰ] 분자 구조','[화학Ⅰ] 화학 반응','[화학Ⅰ] 산·염기·중화','[화학Ⅱ] 화학 평형','[화학Ⅱ] 산화·환원','[화학Ⅱ] 반응 속도','[화학Ⅱ] 유기 화합물'],
  science_biology: ['[생Ⅰ] 세포 구조','[생Ⅰ] 물질대사','[생Ⅰ] 광합성과 호흡','[생Ⅰ] 유전 정보','[생Ⅰ] 세포 분열','[생Ⅰ] 유전의 법칙','[생Ⅱ] 생명의 기원','[생Ⅱ] 유전자 발현 조절','[생Ⅱ] 생물 진화','[생Ⅱ] 생태계와 생물 다양성'],
  science_earth: ['[지Ⅰ] 지구의 구조','[지Ⅰ] 판 구조론','[지Ⅰ] 대기와 해양','[지Ⅰ] 날씨와 기후','[지Ⅰ] 태양계','[지Ⅰ] 별과 은하','[지Ⅱ] 지질 시대','[지Ⅱ] 해양 심층 순환','[지Ⅱ] 대기 대순환','[지Ⅱ] 우주론'],
  data: ['환경 설정','NumPy 기초','NumPy 심화','Pandas 기초','데이터 불러오기·저장','EDA 기초','결측치·이상치 처리','데이터 필터링·정렬','groupby 집계','피벗·merge·concat','문자열·날짜 처리','matplotlib 시각화','seaborn 시각화','스케일링·인코딩','상관관계·통계 분석','scikit-learn 입문','모델 평가·검증','데이터 분석 프로젝트'],
  deeplearning: ['딥러닝 개요','퍼셉트론과 신경망','활성화 함수','손실 함수와 옵티마이저','역전파','PyTorch 기초','PyTorch 학습 루프','오버피팅 방지','배치 정규화','CNN 기초','CNN 심화 ResNet·VGG','RNN·LSTM·GRU','Attention 메커니즘','Transformer','전이 학습','GAN 기초','모델 평가 지표','딥러닝 프로젝트'],
  cv: ['이미지 데이터 기초','OpenCV 기초·전처리','에지 검출과 윤곽선','Dataset과 DataLoader','데이터 증강','이미지 분류 모델 학습','전이 학습 ResNet·EfficientNet','객체 탐지 개념','YOLO 실습','Semantic Segmentation','포즈 추정·얼굴 인식','OCR','비디오 처리','CV 프로젝트'],
  dlthon: ['Kaggle 환경 세팅','대회 구조와 평가 지표','EDA 실전','베이스라인 모델','Feature Engineering','Cross Validation','XGBoost·LightGBM','Optuna 튜닝','PyTorch Lightning','앙상블 전략','데이터 불균형 처리','GPU 최적화','리더보드 전략','DLthon 프로젝트'],
  nlp: ['NLP 개요·환경 설정','텍스트 전처리','토크나이징','한국어 NLP KoNLPy','BoW·TF-IDF','Word2Vec','텍스트 분류 ML','LSTM 감성 분석','Attention 메커니즘','Transformer','BERT 이해','BERT 파인튜닝','한국어 BERT','NER','텍스트 요약','QA 시스템','NLP 프로젝트'],
  llm: ['LLM 개요','Transformer 심화','토크나이저 BPE·WordPiece','프롬프트 엔지니어링 기초','프롬프트 엔지니어링 심화','OpenAI API','Hugging Face 활용','LangChain 기초','LangChain Agent','벡터 DB','RAG','Fine-tuning·LoRA·QLoRA','로컬 LLM Ollama','LLM 평가·할루시네이션','멀티모달 LLM','LLM 배포'],
  mlops: ['MLOps 개요','Git & GitHub','MLflow 실험 추적','DVC 데이터 버전 관리','FastAPI 모델 서빙','Docker 컨테이너화','CI/CD GitHub Actions','Airflow 파이프라인','모델 드리프트 감지','모델 모니터링','Kubernetes 배포','클라우드 ML 플랫폼','A/B 테스트·Canary 배포','MLOps 프로젝트'],
};

const LVL = {
  beginner:     { label:'🟢 초급', color:'#22c55e', suffix:' 설명해줘' },
  intermediate: { label:'🟡 중급', color:'#f59e0b', suffix:' 쉬운 문제풀이 형식으로 설명해줘' },
  advanced:     { label:'🔴 상급', color:'#ef4444', suffix:' 중간문제 어려운문제풀이 형식으로 설명해줘' },
};
const MATH_S = [{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'high',l:'고등',c:'#f472b6'}];
const ENG_S  = [{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'high',l:'고등',c:'#f472b6'}];
const SCI_S  = [{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'physics',l:'물리',c:'#38bdf8'},{k:'chemistry',l:'화학',c:'#a78bfa'},{k:'biology',l:'생명과학',c:'#fb923c'},{k:'earth',l:'지구과학',c:'#f472b6'}];

const FEATURES = [
  { icon:'📚', title:'12개 과목', desc:'기초부터 AI/ML까지 체계적인 커리큘럼' },
  { icon:'🎯', title:'3단계 난이도', desc:'초급 설명 → 중급 쉬운문제 → 상급 어려운문제' },
  { icon:'⚡', title:'원클릭 복사', desc:'클릭 한 번으로 질문 자동 생성 & 복사' },
  { icon:'🧠', title:'AI 맞춤 학습', desc:'Claude AI가 수준별 맞춤 설명 제공' },
];

const STATS = [
  { num:'12', label:'과목' },
  { num:'200+', label:'학습 주제' },
  { num:'3', label:'난이도 단계' },
  { num:'∞', label:'반복 학습' },
];

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'app'
  const [subj, setSubj]   = useState('python');
  const [level, setLevel] = useState('beginner');
  const [sub, setSub]     = useState({ math:'elementary', english:'elementary', science:'elementary' });
  const [active, setActive] = useState(null);
  const [sent, setSent] = useState('');

  const tocKey = subj==='math' ? 'math_'+sub.math : subj==='english' ? 'english_'+sub.english : subj==='science' ? 'science_'+sub.science : subj;
  const items = TOC[tocKey] || [];
  const s = SUBJECTS[subj];

  function click(i, title) {
    setActive(i);
    const lvlText = level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '상급';
    const subText = subj === 'math' ? '수학 ' + {elementary:'초등',middle:'중등',high:'고등'}[sub.math] + ' '
                  : subj === 'english' ? '영어 ' + {elementary:'초등',middle:'중등',high:'고등'}[sub.english] + ' '
                  : subj === 'science' ? '과학 ' + {elementary:'초등',middle:'중등',physics:'물리',chemistry:'화학',biology:'생명과학',earth:'지구과학'}[sub.science] + ' '
                  : s.name + ' ';
    const msg = lvlText + ' ' + subText + title + LVL[level].suffix;
    navigator.clipboard.writeText(msg)
      .then(() => setSent('📋 복사완료! 채팅창에 Ctrl+V → Enter'))
      .catch(() => setSent('👉 ' + msg));
  }

  const btn = (label, isActive, color, onClick) => (
    <button onClick={onClick} style={{padding:'3px 10px',borderRadius:16,border:'1px solid',borderColor:isActive?color:'#21262d',background:isActive?color+'33':'transparent',color:isActive?color:'#8b949e',fontSize:11.5,cursor:'pointer',fontWeight:isActive?700:400,whiteSpace:'nowrap'}}>
      {label}
    </button>
  );

  // ── HOME PAGE ──────────────────────────────────────────
  if (page === 'home') return (
    <div style={{minHeight:'100vh',background:'#0d1117',color:'#e2e8f0',fontFamily:'"Noto Sans KR", system-ui, sans-serif',overflowY:'auto'}}>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(13,17,23,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid #21262d',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>📚</span>
          <span style={{fontWeight:700,fontSize:16,color:'#58a6ff',letterSpacing:'-0.02em'}}>StudyBot</span>
          <span style={{fontSize:11,background:'#1f3354',color:'#58a6ff',padding:'2px 8px',borderRadius:99,border:'1px solid #30507a',marginLeft:4}}>AIFFEL</span>
        </div>
        <button onClick={()=>setPage('app')}
          style={{padding:'7px 18px',borderRadius:8,border:'1px solid #58a6ff',background:'#58a6ff',color:'#000',fontSize:13,fontWeight:700,cursor:'pointer'}}>
          앱 시작하기 →
        </button>
      </nav>

      {/* HERO */}
      <div style={{textAlign:'center',padding:'80px 24px 60px',position:'relative'}}>
        {/* bg grid decoration */}
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 50% 0%, #1f335422 0%, transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'relative'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#161b22',border:'1px solid #21262d',borderRadius:99,padding:'5px 14px',fontSize:12,color:'#8b949e',marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}} />
            AI 기반 맞춤형 학습 도우미
          </div>
          <h1 style={{fontSize:'clamp(32px,6vw,56px)',fontWeight:800,margin:'0 0 16px',lineHeight:1.15,letterSpacing:'-0.03em'}}>
            공부가 막힐 때<br/>
            <span style={{background:'linear-gradient(90deg,#58a6ff,#7c5cfc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>StudyBot</span>에게 물어봐
          </h1>
          <p style={{fontSize:16,color:'#8b949e',maxWidth:480,margin:'0 auto 36px',lineHeight:1.7}}>
            12개 과목 · 200개 이상의 학습 주제<br/>
            클릭 한 번으로 맞춤 질문을 Claude에게 전송
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>setPage('app')}
              style={{padding:'12px 28px',borderRadius:10,border:'none',background:'#58a6ff',color:'#000',fontSize:15,fontWeight:700,cursor:'pointer'}}>
              📚 지금 바로 시작하기
            </button>
            <button onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})}
              style={{padding:'12px 28px',borderRadius:10,border:'1px solid #30363d',background:'transparent',color:'#c9d1d9',fontSize:15,cursor:'pointer'}}>
              기능 보기 ↓
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#21262d',borderTop:'1px solid #21262d',borderBottom:'1px solid #21262d',margin:'0 0 64px'}}>
        {STATS.map(({num,label})=>(
          <div key={label} style={{background:'#0d1117',padding:'28px 16px',textAlign:'center'}}>
            <div style={{fontSize:28,fontWeight:800,color:'#58a6ff',letterSpacing:'-0.03em'}}>{num}</div>
            <div style={{fontSize:12,color:'#8b949e',marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <div id="features" style={{padding:'0 24px 64px',maxWidth:840,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',fontSize:22,fontWeight:700,marginBottom:8,letterSpacing:'-0.02em'}}>주요 기능</h2>
        <p style={{textAlign:'center',color:'#8b949e',fontSize:14,marginBottom:40}}>복잡한 설정 없이 클릭 한 번으로 학습 시작</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {FEATURES.map(({icon,title,desc})=>(
            <div key={title} style={{background:'#161b22',border:'1px solid #21262d',borderRadius:12,padding:'24px 20px'}}>
              <div style={{fontSize:28,marginBottom:12}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:'#e2e8f0'}}>{title}</div>
              <div style={{fontSize:13,color:'#8b949e',lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBJECT PREVIEW */}
      <div style={{padding:'0 24px 64px',maxWidth:840,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',fontSize:22,fontWeight:700,marginBottom:8,letterSpacing:'-0.02em'}}>학습 과목</h2>
        <p style={{textAlign:'center',color:'#8b949e',fontSize:14,marginBottom:32}}>기초 과목부터 최신 AI/ML 기술까지</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:16}}>
          <span style={{fontSize:11,color:'#484f58',alignSelf:'center',marginRight:4}}>기초</span>
          {GROUPS[0].keys.map(k=>(
            <div key={k} style={{padding:'6px 14px',borderRadius:20,border:'1px solid #21262d',background:'#161b22',fontSize:13,color:'#c9d1d9',display:'flex',alignItems:'center',gap:5}}>
              {SUBJECTS[k].emoji} {SUBJECTS[k].name}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
          <span style={{fontSize:11,color:'#484f58',alignSelf:'center',marginRight:4}}>AI/ML</span>
          {GROUPS[1].keys.map(k=>(
            <div key={k} style={{padding:'6px 14px',borderRadius:20,border:'1px solid #1f3354',background:'#0d1f33',fontSize:13,color:'#58a6ff',display:'flex',alignItems:'center',gap:5}}>
              {SUBJECTS[k].emoji} {SUBJECTS[k].name}
            </div>
          ))}
        </div>
      </div>

      {/* HOW TO USE */}
      <div style={{padding:'0 24px 64px',maxWidth:840,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',fontSize:22,fontWeight:700,marginBottom:8,letterSpacing:'-0.02em'}}>사용 방법</h2>
        <p style={{textAlign:'center',color:'#8b949e',fontSize:14,marginBottom:40}}>3단계로 끝나는 초간단 학습법</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
          {[
            {step:'01', title:'과목 & 난이도 선택', desc:'원하는 과목과 학습 난이도를 클릭하세요'},
            {step:'02', title:'목차 항목 클릭', desc:'배우고 싶은 주제를 클릭하면 질문이 자동 생성돼요'},
            {step:'03', title:'Claude에 붙여넣기', desc:'Ctrl+V로 붙여넣고 Enter! Claude가 설명해드려요'},
          ].map(({step,title,desc})=>(
            <div key={step} style={{background:'#161b22',border:'1px solid #21262d',borderRadius:12,padding:'24px 20px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:12,right:16,fontSize:32,fontWeight:800,color:'#21262d',fontVariantNumeric:'tabular-nums'}}>{step}</div>
              <div style={{fontSize:13,color:'#58a6ff',fontWeight:700,marginBottom:8}}>STEP {step}</div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:'#e2e8f0'}}>{title}</div>
              <div style={{fontSize:13,color:'#8b949e',lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:'center',padding:'48px 24px 80px',borderTop:'1px solid #21262d'}}>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:12,letterSpacing:'-0.02em'}}>지금 바로 시작해볼까요? 🚀</h2>
        <p style={{color:'#8b949e',fontSize:14,marginBottom:28}}>클릭 한 번으로 맞춤 학습 시작</p>
        <button onClick={()=>setPage('app')}
          style={{padding:'14px 36px',borderRadius:10,border:'none',background:'#58a6ff',color:'#000',fontSize:16,fontWeight:700,cursor:'pointer'}}>
          📚 StudyBot 열기
        </button>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:'1px solid #21262d',padding:'20px 24px',textAlign:'center',fontSize:12,color:'#484f58'}}>
        StudyBot · AIFFEL 부트캠프 학습 도우미 · Made with 💙
      </div>
    </div>
  );

  // ── APP PAGE ──────────────────────────────────────────
  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#0d1117',color:'#e2e8f0',fontFamily:'"Noto Sans KR", system-ui, sans-serif',overflow:'hidden',fontSize:13}}>

      {/* 상단 홈 버튼 포함 탭 */}
      <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'7px 12px',display:'flex',alignItems:'center',gap:5,overflowX:'auto',flexShrink:0,scrollbarWidth:'none'}}>
        <button onClick={()=>{setPage('home');setSent('');}}
          style={{padding:'3px 10px',borderRadius:16,border:'1px solid #21262d',background:'transparent',color:'#8b949e',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
          ← 홈
        </button>
        <span style={{color:'#58a6ff',fontWeight:700,fontSize:13,marginRight:6,whiteSpace:'nowrap'}}>📚 StudyBot</span>
        {GROUPS.map(g=>(
          <span key={g.label} style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:10,color:'#484f58',borderLeft:'1px solid #21262d',paddingLeft:8,marginLeft:2,whiteSpace:'nowrap'}}>{g.label}</span>
            {g.keys.map(k=>(
              <button key={k} onClick={()=>{setSubj(k);setActive(null);setSent('');}}
                style={{padding:'3px 8px',borderRadius:16,border:'1px solid',borderColor:k===subj?'#58a6ff':'#21262d',background:k===subj?'#58a6ff':'transparent',color:k===subj?'#000':'#8b949e',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',fontWeight:k===subj?700:400}}>
                {SUBJECTS[k].emoji} {SUBJECTS[k].name}
              </button>
            ))}
          </span>
        ))}
      </div>

      {/* 난이도 */}
      <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span style={{fontSize:11,color:'#484f58',marginRight:2}}>난이도</span>
        {Object.entries(LVL).map(([k,v])=>btn(v.label, level===k, v.color, ()=>setLevel(k)))}
      </div>

      {subj==='math' && (
        <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',gap:6,flexShrink:0}}>
          {MATH_S.map(({k,l,c})=>(
            <button key={k} onClick={()=>setSub(p=>({...p,math:k}))}
              style={{flex:1,padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.math===k?c:'#21262d',background:sub.math===k?c+'33':'transparent',color:sub.math===k?c:'#484f58',fontSize:12,fontWeight:sub.math===k?700:400,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
      )}
      {subj==='english' && (
        <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',gap:6,flexShrink:0}}>
          {ENG_S.map(({k,l,c})=>(
            <button key={k} onClick={()=>setSub(p=>({...p,english:k}))}
              style={{flex:1,padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.english===k?c:'#21262d',background:sub.english===k?c+'33':'transparent',color:sub.english===k?c:'#484f58',fontSize:12,fontWeight:sub.english===k?700:400,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
      )}
      {subj==='science' && (
        <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',flexWrap:'wrap',gap:5,flexShrink:0}}>
          {SCI_S.map(({k,l,c})=>(
            <button key={k} onClick={()=>setSub(p=>({...p,science:k}))}
              style={{flex:'1 1 calc(33% - 5px)',padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.science===k?c:'#21262d',background:sub.science===k?c+'33':'transparent',color:sub.science===k?c:'#484f58',fontSize:11.5,fontWeight:sub.science===k?700:400,cursor:'pointer',textAlign:'center'}}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* 목차 */}
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        <div style={{fontSize:10,color:'#484f58',padding:'2px 8px 8px',letterSpacing:'0.1em',textTransform:'uppercase'}}>
          {s.emoji} {s.name} · {LVL[level].label}
        </div>
        {items.map((title,i)=>(
          <div key={i} onClick={()=>click(i,title)}
            style={{padding:'10px 12px',borderRadius:8,marginBottom:3,cursor:'pointer',border:'1px solid',borderColor:active===i?'#58a6ff':'#21262d',background:active===i?'#1f3354':'#161b22',display:'flex',gap:10,alignItems:'center'}}
            onMouseEnter={e=>{if(active!==i){e.currentTarget.style.borderColor='#30363d';e.currentTarget.style.background='#1c2128';}}}
            onMouseLeave={e=>{if(active!==i){e.currentTarget.style.borderColor='#21262d';e.currentTarget.style.background='#161b22';}}}>
            <span style={{color:'#484f58',fontSize:11,fontFamily:'monospace',minWidth:22,flexShrink:0}}>{i+1}.</span>
            <span style={{color:active===i?'#58a6ff':'#c9d1d9',fontSize:13,lineHeight:1.4}}>{title}</span>
            {active===i && <span style={{marginLeft:'auto',color:'#58a6ff',fontSize:11,flexShrink:0}}>✓</span>}
          </div>
        ))}
      </div>

      {/* 하단 */}
      <div style={{background:'#161b22',borderTop:'1px solid #21262d',padding:'8px 12px',fontSize:12,color:sent?'#3fb950':'#484f58',textAlign:'center',flexShrink:0,fontWeight:sent?600:400}}>
        {sent || '목차 클릭 → 자동 복사 → 채팅창에 Ctrl+V → Enter'}
      </div>
    </div>
  );
}
