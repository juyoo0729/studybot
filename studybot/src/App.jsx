import { useState, useRef, useEffect } from "react";

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
const MATH_S=[{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'high',l:'고등',c:'#f472b6'}];
const ENG_S =[{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'high',l:'고등',c:'#f472b6'}];
const SCI_S =[{k:'elementary',l:'초등',c:'#34d399'},{k:'middle',l:'중등',c:'#f59e0b'},{k:'physics',l:'물리',c:'#38bdf8'},{k:'chemistry',l:'화학',c:'#a78bfa'},{k:'biology',l:'생명과학',c:'#fb923c'},{k:'earth',l:'지구과학',c:'#f472b6'}];

async function askGemini(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts:[{text:'당신은 친절하고 실력 있는 학습 도우미입니다. 한국어로 명확하고 체계적으로 설명해주세요. 코드 예시와 비유를 적극 활용하고, 마크다운 형식으로 답변해주세요.\n\n'+prompt}]}],
        generationConfig:{maxOutputTokens:2048,temperature:0.7}
      }),
    }
  );
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받지 못했어요.';
}

function fmt(text) {
  const parts=[];const re=/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;let last=0,m;
  while((m=re.exec(text))!==null){
    if(m.index>last)parts.push(text.slice(last,m.index));
    const t=m[0];
    if(t.startsWith('`'))parts.push(<code key={m.index} style={{background:'#21262d',padding:'1px 5px',borderRadius:4,fontSize:11.5,color:'#f97316',fontFamily:'monospace'}}>{t.slice(1,-1)}</code>);
    else if(t.startsWith('**'))parts.push(<strong key={m.index} style={{color:'#e2e8f0',fontWeight:700}}>{t.slice(2,-2)}</strong>);
    else parts.push(<em key={m.index} style={{color:'#a5b4fc'}}>{t.slice(1,-1)}</em>);
    last=m.index+t.length;
  }
  if(last<text.length)parts.push(text.slice(last));
  return parts.length===1&&typeof parts[0]==='string'?parts[0]:parts;
}

function DetailsBlock({lines}){
  const[open,setOpen]=useState(false);
  const summary=lines.find(l=>l.startsWith('<summary>'))?.replace(/<\/?summary>/g,'')||'정답 보기';
  const content=lines.filter(l=>!l.startsWith('<summary>')&&!l.startsWith('</summary>'));
  return(
    <div style={{border:'1px solid #30363d',borderRadius:8,margin:'8px 0',overflow:'hidden'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',padding:'8px 12px',background:'#161b22',border:'none',color:'#58a6ff',fontSize:12,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:6}}>
        <span style={{transition:'transform 0.2s',display:'inline-block',transform:open?'rotate(90deg)':'none'}}>▶</span>{summary}
      </button>
      {open&&<div style={{padding:'10px 14px',background:'#0d1117',borderTop:'1px solid #21262d'}}>{renderMd(content.join('\n'))}</div>}
    </div>
  );
}

function renderMd(text){
  const lines=text.split('\n'),result=[];
  let inCode=false,codeLines=[],codeLang='',inDetails=false,detailsLines=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(line.startsWith('```')){
      if(!inCode){inCode=true;codeLines=[];codeLang=line.slice(3);}
      else{inCode=false;result.push(<pre key={i} style={{background:'#0d1117',border:'1px solid #30363d',borderRadius:8,padding:'12px 14px',overflowX:'auto',fontSize:12,lineHeight:1.6,margin:'8px 0',fontFamily:'monospace',color:'#e2e8f0'}}>{codeLang&&<div style={{fontSize:10,color:'#484f58',marginBottom:6}}>{codeLang}</div>}<code>{codeLines.join('\n')}</code></pre>);}
      continue;
    }
    if(inCode){codeLines.push(line);continue;}
    if(line.startsWith('<details>')){inDetails=true;detailsLines=[];continue;}
    if(line.startsWith('</details>')){inDetails=false;result.push(<DetailsBlock key={i} lines={detailsLines}/>);continue;}
    if(inDetails){detailsLines.push(line);continue;}
    if(line.startsWith('# ')) {result.push(<h2 key={i} style={{fontSize:17,fontWeight:700,color:'#58a6ff',margin:'16px 0 8px',borderBottom:'1px solid #21262d',paddingBottom:6}}>{line.slice(2)}</h2>);continue;}
    if(line.startsWith('## ')){result.push(<h3 key={i} style={{fontSize:14,fontWeight:700,color:'#e2e8f0',margin:'14px 0 6px'}}>{line.slice(3)}</h3>);continue;}
    if(line.startsWith('### ')){result.push(<h4 key={i} style={{fontSize:13,fontWeight:700,color:'#c9d1d9',margin:'10px 0 4px'}}>{line.slice(4)}</h4>);continue;}
    if(line.startsWith('> ')){result.push(<blockquote key={i} style={{borderLeft:'3px solid #58a6ff',paddingLeft:10,margin:'6px 0',color:'#8b949e',fontSize:12}}>{fmt(line.slice(2))}</blockquote>);continue;}
    if(line.match(/^\|.+\|$/)&&!line.match(/^\|[-| ]+\|$/)){ result.push(<tr key={i}>{line.split('|').filter((_,j,a)=>j>0&&j<a.length-1).map((c,j)=><td key={j} style={{padding:'5px 10px',border:'1px solid #30363d',fontSize:12,color:'#c9d1d9',background:'#161b22'}}>{fmt(c.trim())}</td>)}</tr>);continue;}
    if(line.match(/^\|[-| ]+\|$/))continue;
    if(line.startsWith('- ')||line.startsWith('* ')){result.push(<li key={i} style={{fontSize:13,lineHeight:1.7,color:'#c9d1d9',marginLeft:16,marginBottom:2}}>{fmt(line.slice(2))}</li>);continue;}
    if(line.match(/^\d+\. /)){result.push(<li key={i} style={{fontSize:13,lineHeight:1.7,color:'#c9d1d9',marginLeft:16,marginBottom:2,listStyleType:'decimal'}}>{fmt(line.replace(/^\d+\. /,''))}</li>);continue;}
    if(line==='---'){result.push(<hr key={i} style={{border:'none',borderTop:'1px solid #21262d',margin:'12px 0'}}/>);continue;}
    if(line.trim()===''){result.push(<div key={i} style={{height:6}}/>);continue;}
    result.push(<p key={i} style={{fontSize:13,lineHeight:1.75,color:'#c9d1d9',margin:'3px 0'}}>{fmt(line)}</p>);
  }
  return result;
}

function ApiKeyScreen({onSave}){
  const[key,setKey]=useState('');
  return(
    <div style={{minHeight:'100vh',background:'#0d1117',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:440,background:'#161b22',border:'1px solid #21262d',borderRadius:16,padding:32}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:36,marginBottom:12}}>🔑</div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#e2e8f0',margin:'0 0 8px'}}>Gemini API 키 입력</h2>
          <p style={{fontSize:13,color:'#8b949e',lineHeight:1.6,margin:0}}>무료 API 키를 입력하면<br/>누구나 StudyBot을 사용할 수 있어요!</p>
        </div>
        <div style={{background:'#0d1117',border:'1px solid #21262d',borderRadius:10,padding:16,marginBottom:20,fontSize:12,color:'#8b949e',lineHeight:1.9}}>
          <div style={{fontWeight:700,color:'#58a6ff',marginBottom:6}}>📋 무료 API 키 발급 (2분)</div>
          <div>1. <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{color:'#58a6ff'}}>aistudio.google.com</a> 접속</div>
          <div>2. Google 계정으로 로그인</div>
          <div>3. <strong style={{color:'#e2e8f0'}}>"Get API key"</strong> 클릭</div>
          <div>4. <strong style={{color:'#e2e8f0'}}>"API 키 만들기"</strong> 클릭</div>
          <div>5. 생성된 키를 아래에 붙여넣기</div>
        </div>
        <input type="password" value={key} onChange={e=>setKey(e.target.value)}
          placeholder="AIza... 로 시작하는 키 입력"
          style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid #30363d',background:'#0d1117',color:'#e2e8f0',fontSize:13,outline:'none',marginBottom:12,boxSizing:'border-box'}}
          onKeyDown={e=>e.key==='Enter'&&key.trim()&&onSave(key.trim())}/>
        <button onClick={()=>key.trim()&&onSave(key.trim())} disabled={!key.trim()}
          style={{width:'100%',padding:'11px',borderRadius:8,border:'none',background:key.trim()?'#58a6ff':'#21262d',color:key.trim()?'#000':'#484f58',fontSize:14,fontWeight:700,cursor:key.trim()?'pointer':'not-allowed'}}>
          StudyBot 시작하기 🚀
        </button>
        <p style={{fontSize:11,color:'#484f58',textAlign:'center',marginTop:12}}>키는 이 기기 브라우저에만 저장돼요</p>
      </div>
    </div>
  );
}

export default function App(){
  const[apiKey,setApiKey]=useState(()=>localStorage.getItem('gemini_key')||'');
  const[page,setPage]=useState('home');
  const[subj,setSubj]=useState('python');
  const[level,setLevel]=useState('beginner');
  const[sub,setSub]=useState({math:'elementary',english:'elementary',science:'elementary'});
  const[active,setActive]=useState(null);
  const[answer,setAnswer]=useState('');
  const[loading,setLoading]=useState(false);
  const[currentTitle,setCurrentTitle]=useState('');
  const[error,setError]=useState('');
  const answerRef=useRef(null);

  function saveKey(k){localStorage.setItem('gemini_key',k);setApiKey(k);}
  useEffect(()=>{if(answerRef.current)answerRef.current.scrollTop=0;},[answer]);

  if(!apiKey)return <ApiKeyScreen onSave={saveKey}/>;

  const tocKey=subj==='math'?'math_'+sub.math:subj==='english'?'english_'+sub.english:subj==='science'?'science_'+sub.science:subj;
  const items=TOC[tocKey]||[];
  const s=SUBJECTS[subj];

  async function ask(i,title){
    setActive(i);setLoading(true);setAnswer('');setError('');setCurrentTitle(title);
    const lvlText=level==='beginner'?'초급':level==='intermediate'?'중급':'상급';
    const subText=subj==='math'?'수학 '+{elementary:'초등',middle:'중등',high:'고등'}[sub.math]+' '
                 :subj==='english'?'영어 '+{elementary:'초등',middle:'중등',high:'고등'}[sub.english]+' '
                 :subj==='science'?'과학 '+{elementary:'초등',middle:'중등',physics:'물리',chemistry:'화학',biology:'생명과학',earth:'지구과학'}[sub.science]+' '
                 :s.name+' ';
    const prompt=lvlText+' '+subText+title+LVL[level].suffix;
    try{const text=await askGemini(apiKey,prompt);setAnswer(text);}
    catch(e){
      setError('❌ '+e.message);
      if(e.message.includes('API_KEY_INVALID')||e.message.includes('401')){localStorage.removeItem('gemini_key');setApiKey('');}
    }
    finally{setLoading(false);}
  }

  const pill=(label,isActive,color,onClick)=>(
    <button onClick={onClick} style={{padding:'3px 10px',borderRadius:16,border:'1px solid',borderColor:isActive?color:'#21262d',background:isActive?color+'33':'transparent',color:isActive?color:'#8b949e',fontSize:11.5,cursor:'pointer',fontWeight:isActive?700:400,whiteSpace:'nowrap'}}>{label}</button>
  );

  // HOME
  if(page==='home')return(
    <div style={{minHeight:'100vh',background:'#0d1117',color:'#e2e8f0',fontFamily:"'Noto Sans KR',system-ui,sans-serif",overflowY:'auto'}}>
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(13,17,23,0.9)',backdropFilter:'blur(12px)',borderBottom:'1px solid #21262d',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>📚</span>
          <span style={{fontWeight:700,fontSize:16,color:'#58a6ff'}}>StudyBot</span>
          <span style={{fontSize:11,background:'#1a2e1a',color:'#22c55e',padding:'2px 8px',borderRadius:99,border:'1px solid #22c55e44',marginLeft:4}}>Gemini AI</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{localStorage.removeItem('gemini_key');setApiKey('');}} style={{padding:'5px 12px',borderRadius:8,border:'1px solid #30363d',background:'transparent',color:'#8b949e',fontSize:12,cursor:'pointer'}}>🔑 키 변경</button>
          <button onClick={()=>setPage('app')} style={{padding:'7px 18px',borderRadius:8,border:'none',background:'#58a6ff',color:'#000',fontSize:13,fontWeight:700,cursor:'pointer'}}>앱 시작하기 →</button>
        </div>
      </nav>
      <div style={{textAlign:'center',padding:'80px 24px 60px',position:'relative'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 50% 0%, #1f335422 0%, transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#161b22',border:'1px solid #21262d',borderRadius:99,padding:'5px 14px',fontSize:12,color:'#8b949e',marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>Google Gemini AI · 완전 무료
          </div>
          <h1 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:900,margin:'0 0 16px',lineHeight:1.15,letterSpacing:'-0.03em'}}>
            공부가 막힐 때<br/>
            <span style={{background:'linear-gradient(90deg,#58a6ff,#7c5cfc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>StudyBot</span>에게 물어봐
          </h1>
          <p style={{fontSize:15,color:'#8b949e',maxWidth:480,margin:'0 auto 36px',lineHeight:1.7}}>12개 과목 · 200개 이상의 학습 주제<br/>클릭 한 번으로 AI가 바로 설명해드려요</p>
          <button onClick={()=>setPage('app')} style={{padding:'12px 32px',borderRadius:10,border:'none',background:'#58a6ff',color:'#000',fontSize:15,fontWeight:700,cursor:'pointer'}}>📚 지금 바로 시작하기</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid #21262d',borderBottom:'1px solid #21262d',margin:'0 0 56px'}}>
        {[{num:'12',label:'과목'},{num:'200+',label:'학습 주제'},{num:'3',label:'난이도 단계'},{num:'무료',label:'Gemini AI'}].map(({num,label})=>(
          <div key={label} style={{padding:'28px 16px',textAlign:'center',borderRight:'1px solid #21262d'}}>
            <div style={{fontSize:24,fontWeight:900,color:'#58a6ff'}}>{num}</div>
            <div style={{fontSize:12,color:'#8b949e',marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 24px 56px',maxWidth:840,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',fontSize:20,fontWeight:700,marginBottom:32}}>주요 기능</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {[{icon:'🤖',title:'Gemini AI 탑재',desc:'Google Gemini 2.0 Flash — 완전 무료!'},{icon:'📚',title:'12개 과목',desc:'기초부터 AI/ML까지 체계적 커리큘럼'},{icon:'🎯',title:'3단계 난이도',desc:'초급 설명 → 중급 문제풀이 → 상급 심화'},{icon:'⚡',title:'즉시 답변',desc:'클릭 한 번으로 AI 답변 바로 출력'}].map(({icon,title,desc})=>(
            <div key={title} style={{background:'#161b22',border:'1px solid #21262d',borderRadius:12,padding:'24px 20px'}}>
              <div style={{fontSize:28,marginBottom:12}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>{title}</div>
              <div style={{fontSize:13,color:'#8b949e',lineHeight:1.6}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{textAlign:'center',padding:'40px 24px 64px',borderTop:'1px solid #21262d'}}>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:12}}>지금 시작해볼까요? 🚀</h2>
        <p style={{color:'#8b949e',fontSize:13,marginBottom:24}}>Gemini API 키만 있으면 누구나 무료로 사용 가능!</p>
        <button onClick={()=>setPage('app')} style={{padding:'14px 36px',borderRadius:10,border:'none',background:'#58a6ff',color:'#000',fontSize:16,fontWeight:700,cursor:'pointer'}}>📚 StudyBot 열기</button>
      </div>
      <div style={{borderTop:'1px solid #21262d',padding:'20px 24px',textAlign:'center',fontSize:12,color:'#484f58'}}>
        StudyBot · AIFFEL 부트캠프 학습 도우미 · Powered by Google Gemini
      </div>
    </div>
  );

  // APP
  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:'#0d1117',color:'#e2e8f0',fontFamily:"'Noto Sans KR',system-ui,sans-serif",overflow:'hidden',fontSize:13}}>
      <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'7px 12px',display:'flex',alignItems:'center',gap:5,overflowX:'auto',flexShrink:0,scrollbarWidth:'none'}}>
        <button onClick={()=>{setPage('home');setAnswer('');}} style={{padding:'3px 10px',borderRadius:16,border:'1px solid #21262d',background:'transparent',color:'#8b949e',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>← 홈</button>
        <span style={{color:'#58a6ff',fontWeight:700,fontSize:13,marginRight:4,whiteSpace:'nowrap'}}>📚 StudyBot</span>
        <span style={{fontSize:10,background:'#1a2e1a',color:'#22c55e',padding:'1px 7px',borderRadius:99,border:'1px solid #22c55e44',marginRight:4,flexShrink:0}}>Gemini</span>
        {GROUPS.map(g=>(
          <span key={g.label} style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{fontSize:10,color:'#484f58',borderLeft:'1px solid #21262d',paddingLeft:8,marginLeft:2,whiteSpace:'nowrap'}}>{g.label}</span>
            {g.keys.map(k=>(
              <button key={k} onClick={()=>{setSubj(k);setActive(null);setAnswer('');}}
                style={{padding:'3px 8px',borderRadius:16,border:'1px solid',borderColor:k===subj?'#58a6ff':'#21262d',background:k===subj?'#58a6ff':'transparent',color:k===subj?'#000':'#8b949e',fontSize:11,cursor:'pointer',whiteSpace:'nowrap',fontWeight:k===subj?700:400}}>
                {SUBJECTS[k].emoji} {SUBJECTS[k].name}
              </button>
            ))}
          </span>
        ))}
      </div>
      <div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span style={{fontSize:11,color:'#484f58',marginRight:2}}>난이도</span>
        {Object.entries(LVL).map(([k,v])=>pill(v.label,level===k,v.color,()=>setLevel(k)))}
      </div>
      {subj==='math'&&<div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',gap:6,flexShrink:0}}>{MATH_S.map(({k,l,c})=><button key={k} onClick={()=>setSub(p=>({...p,math:k}))} style={{flex:1,padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.math===k?c:'#21262d',background:sub.math===k?c+'33':'transparent',color:sub.math===k?c:'#484f58',fontSize:12,fontWeight:sub.math===k?700:400,cursor:'pointer'}}>{l}</button>)}</div>}
      {subj==='english'&&<div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',gap:6,flexShrink:0}}>{ENG_S.map(({k,l,c})=><button key={k} onClick={()=>setSub(p=>({...p,english:k}))} style={{flex:1,padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.english===k?c:'#21262d',background:sub.english===k?c+'33':'transparent',color:sub.english===k?c:'#484f58',fontSize:12,fontWeight:sub.english===k?700:400,cursor:'pointer'}}>{l}</button>)}</div>}
      {subj==='science'&&<div style={{background:'#161b22',borderBottom:'1px solid #21262d',padding:'6px 12px',display:'flex',flexWrap:'wrap',gap:5,flexShrink:0}}>{SCI_S.map(({k,l,c})=><button key={k} onClick={()=>setSub(p=>({...p,science:k}))} style={{flex:'1 1 calc(33% - 5px)',padding:'4px',borderRadius:8,border:'1px solid',borderColor:sub.science===k?c:'#21262d',background:sub.science===k?c+'33':'transparent',color:sub.science===k?c:'#484f58',fontSize:11.5,fontWeight:sub.science===k?700:400,cursor:'pointer',textAlign:'center'}}>{l}</button>)}</div>}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{width:220,flexShrink:0,overflowY:'auto',borderRight:'1px solid #21262d',padding:'8px'}}>
          <div style={{fontSize:10,color:'#484f58',padding:'2px 8px 8px',letterSpacing:'0.08em',textTransform:'uppercase'}}>{s.emoji} {s.name} · {LVL[level].label}</div>
          {items.map((title,i)=>(
            <div key={i} onClick={()=>ask(i,title)}
              style={{padding:'9px 10px',borderRadius:7,marginBottom:3,cursor:'pointer',border:'1px solid',borderColor:active===i?'#58a6ff':'#21262d',background:active===i?'#1f3354':'#161b22',display:'flex',gap:8,alignItems:'flex-start'}}
              onMouseEnter={e=>{if(active!==i){e.currentTarget.style.borderColor='#30363d';e.currentTarget.style.background='#1c2128';}}}
              onMouseLeave={e=>{if(active!==i){e.currentTarget.style.borderColor='#21262d';e.currentTarget.style.background='#161b22';}}}>
              <span style={{color:'#484f58',fontSize:10,fontFamily:'monospace',minWidth:18,flexShrink:0,marginTop:2}}>{i+1}.</span>
              <span style={{color:active===i?'#58a6ff':'#c9d1d9',fontSize:12,lineHeight:1.45}}>{title}</span>
            </div>
          ))}
        </div>
        <div ref={answerRef} style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
          {!answer&&!loading&&!error&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#484f58',textAlign:'center'}}>
              <div style={{fontSize:40}}>🤖</div>
              <div style={{fontSize:14,fontWeight:600,color:'#8b949e'}}>학습할 주제를 선택해요</div>
              <div style={{fontSize:12,lineHeight:1.7}}>왼쪽 목차에서 항목을 클릭하면<br/>Gemini AI가 바로 설명해드려요!</div>
            </div>
          )}
          {loading&&(
            <div>
              <div style={{fontSize:12,color:'#484f58',marginBottom:12}}>{s.emoji} {s.name} › {currentTitle}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'24px 0'}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'bounce 1s infinite',animationDelay:`${i*0.15}s`}}/>)}
                <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6)}40%{transform:scale(1)}}`}</style>
                <span style={{color:'#8b949e',fontSize:13}}>Gemini AI가 답변을 작성하고 있어요...</span>
              </div>
            </div>
          )}
          {error&&<div style={{background:'#2d1515',border:'1px solid #ef4444',borderRadius:8,padding:16,color:'#ef4444',fontSize:13}}>{error}</div>}
          {answer&&!loading&&(
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid #21262d',flexWrap:'wrap'}}>
                <span style={{fontSize:11,background:'#1a2e1a',color:'#22c55e',padding:'3px 10px',borderRadius:99,border:'1px solid #22c55e44'}}>Gemini AI</span>
                <span style={{fontSize:11,background:'#1f3354',color:'#58a6ff',padding:'3px 10px',borderRadius:99,border:'1px solid #30507a'}}>{LVL[level].label}</span>
                <span style={{fontSize:11,color:'#8b949e'}}>{s.emoji} {s.name}</span>
                <span style={{fontSize:11,color:'#484f58'}}>›</span>
                <span style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{currentTitle}</span>
              </div>
              <div>{renderMd(answer)}</div>
              {active!==null&&active<items.length-1&&(
                <div style={{marginTop:24,paddingTop:16,borderTop:'1px solid #21262d'}}>
                  <button onClick={()=>ask(active+1,items[active+1])} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #30363d',background:'#161b22',color:'#c9d1d9',fontSize:12,cursor:'pointer'}}>
                    다음 주제: {items[active+1]} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{background:'#161b22',borderTop:'1px solid #21262d',padding:'6px 14px',fontSize:11,color:'#484f58',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span>📚 StudyBot · Powered by Google Gemini</span>
        <span style={{color:loading?'#f59e0b':answer?'#22c55e':'#484f58'}}>{loading?'⏳ 답변 생성 중...':answer?`✅ ${currentTitle}`:'목차를 클릭해서 학습 시작!'}</span>
      </div>
    </div>
  );
}
