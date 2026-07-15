import { useState, useEffect } from "react";
import { generateTurbo } from "./turboEngine";
import { getLatestWinningNumbers } from "./lottoApi";
import { winningHistory } from "./winningHistory";
import { supabase } from "./supabase";
import { hotNumbers, coldNumbers, getHotCount, getColdCount } from "./aiEngine";
import { getSectionCounts } from "./statistics";
import {
  getLearningBonus,
  getPairLearningBonus,
  updatePairLearning,
} from "./learning";
export default function App() {
  const [fixed, setFixed] = useState(() => {
  return localStorage.getItem("fixedNums") || "";
});

const [exclude, setExclude] = useState(() => {
  return localStorage.getItem("excludeNums") || "";
});
  const [results, setResults] = useState([]);
const [saved, setSaved] = useState(() => {
  const stored = localStorage.getItem("savedLotto");
  return stored ? JSON.parse(stored) : [];
});
const [aiLearning, setAiLearning] = useState(() => {
  const data = localStorage.getItem("aiLearning");
  return data ? JSON.parse(data) : {};
});
const [pairLearning, setPairLearning] = useState(() => {
  const data = localStorage.getItem("pairLearning");
  return data ? JSON.parse(data) : {};
});
const [searchNum, setSearchNum] = useState("");
const [history, setHistory] = useState(() => {
  const stored = localStorage.getItem("lottoHistory");
  return stored ? JSON.parse(stored) : [];
});
const [winning, setWinning] = useState(() => {
  return localStorage.getItem("winningNums") || "";
});
const [generateCount, setGenerateCount] = useState(30000);
const loadLatestWinning = async () => {
  const nums = await getLatestWinningNumbers(1180);

  if (nums) {
    setWinning(nums.join(","));
  } else {
    alert("당첨번호를 가져오지 못했습니다.");
  }
};
  const generate = () => {
    console.log(generateTurbo);
    const recentHistory = winningHistory.slice(0, 30);
    const recentFrequency = {};

recentHistory.forEach((draw) => {
  draw.forEach((num) => {
    recentFrequency[num] =
      (recentFrequency[num] || 0) + 1;
  });
});
const recentOddAverage =
  recentHistory.reduce(
    (sum, draw) =>
      sum +
      draw.filter((n) => n % 2 === 1).length,
    0
  ) / recentHistory.length;

const recentSumAverage =
  recentHistory.reduce(
    (sum, draw) =>
      sum + draw.reduce((a, b) => a + b, 0),
    0
  ) / recentHistory.length;
    const fixedNums = fixed
      .split(",")
      .map((n) => parseInt(n))
      .filter((n) => !isNaN(n));

    const excludeNums = exclude
      .split(",")
      .map((n) => parseInt(n))
      .filter((n) => !isNaN(n));

      const winningNums = winning
  .split(",")
  .map((n) => parseInt(n))
  .filter((n) => !isNaN(n));
  const seenSets = new Set();
    const allSets = [];

    

 for (let k = 0; k < generateCount; k++){
      const nums = [...fixedNums];

      while (nums.length < 6) {
        let n;

if (Math.random() < 0.3) {
  const weights = [];

let totalWeight = 0;

for (let i = 1; i <= 45; i++) {
  if (nums.includes(i) || excludeNums.includes(i)) continue;

  let pairBonus = 0;

  nums.forEach((x) => {
    const key = [x, i].sort((a, b) => a - b).join("-");
    pairBonus += pairLearning[key] || 0;
  });

  const weight =
    1 +
    (aiLearning[i] || 0) * 0.2 +
    (recentFrequency[i] || 0) * 0.2 +
    pairBonus * 0.05 +
Math.random() * 0.8;

  totalWeight += weight;
  weights.push({ num: i, total: totalWeight });
}

const rand = Math.random() * totalWeight;

n = weights.find((w) => rand <= w.total).num;
if (Math.random() < 0.4) {
  n = Math.floor(Math.random() * 45) + 1;
}
} else {
  n = Math.floor(Math.random() * 45) + 1;
}

        if (
          !nums.includes(n) &&
          !excludeNums.includes(n)
        ) {
          nums.push(n);
        }
      }

      nums.sort((a, b) => a - b);

      const odd = nums.filter((n) => n % 2).length;
      
      const high = nums.filter((n) => n > 22).length;
const sum = nums.reduce((a, b) => a + b, 0);

let consecutivePenalty = 0;

for (let i = 0; i < nums.length - 1; i++) {
  if (nums[i + 1] - nums[i] === 1) {
    consecutivePenalty += 5;
  }
}
      const score =
  100 -
  Math.abs(odd - 3) * 6 -
  Math.abs(high - 3) * 5 -
  Math.abs(sum - (110 + Math.random() * 50)) * 0.15 -
  consecutivePenalty;
  
const matchCount = nums.filter((n) =>
  winningNums.includes(n)
).length;
const lastDigits = nums.map((n) => n % 10);
const uniqueLastDigits = new Set(lastDigits).size;
const lastDigitPenalty = (6 - uniqueLastDigits) * 3;
const sectionCounts = getSectionCounts(nums);
const maxSection = Math.max(...sectionCounts);
let finalScore = score;

//const learningBonus = getLearningBonus(nums, aiLearning);
//finalScore += learningBonus;
//const pairBonus = getPairLearningBonus(nums, pairLearning);
//finalScore += pairBonus;
if (matchCount === 0) {
  finalScore += 10;
} else if (matchCount === 1) {
  finalScore += 5;
}


const hotCount = getHotCount(nums);

finalScore += hotCount * 2;
//const recentHotBonus = nums.reduce((bonus, num) => {
  //return bonus + (recentFrequency[num] || 0) * 0.5;
//}, 0);

//finalScore += recentHotBonus;
const overHotCount = nums.filter(
  (num) => (recentFrequency[num] || 0) >= 6
).length;

finalScore -= overHotCount * 1.5;

const balancedCount = nums.filter(
  (n) => hotNumbers.includes(n) || coldNumbers.includes(n)
).length;

if (balancedCount >= 3) {
  finalScore += 5;
}
const coldCount = getColdCount(nums);

finalScore += coldCount * 1.5;
if (matchCount >= 3) finalScore -= 20;
else if (matchCount === 2) finalScore -= 10;
else if (matchCount === 0) finalScore += 5;
finalScore -= lastDigitPenalty;


if (maxSection >= 4) finalScore -= 15;
else if (maxSection === 3) finalScore -= 5;
// AI 필터
if (consecutivePenalty >= 15) continue;

if (sum < 90 || sum > 190) continue;

if (maxSection >= 4) continue;

if (uniqueLastDigits <= 2) continue;

if (matchCount >= 4) continue;
if (finalScore < 75) continue;
const key = nums.join("-");

if (seenSets.has(key)) continue;

seenSets.add(key);
      allSets.push({
        nums,
          score: finalScore,
         matchCount,
         sectionCounts,
      });
    }
    
const top10 = [];

allSets.sort((a, b) => b.score - a.score);

for (const set of allSets) {
  const similar = top10.some((item) => {
    let same = 0;

    for (const n of item.nums) {
      if (set.nums.includes(n)) same++;
    }

    return same >= 3;
  });

  if (!similar) {
    top10.push(set);
  }

  if (top10.length >= 10) break;
}

setResults(top10);

setResults(top10);
    const bestSet = top10[0];
const highestScore = Math.max(
  ...history.map((h) => h.score),
  0
);

const isNewRecord =
  bestSet.score > highestScore;
  setPairLearning((prev) =>
  updatePairLearning(bestSet.nums, prev)
);
setHistory((prev) => [
  {
    date: new Date().toLocaleString(),
    nums: bestSet.nums,
    score: bestSet.score,
    isNewRecord,
  },
  ...prev,
].slice(0, 20));
  };
const copyNumbers = (nums) => {
  const text = nums.join(", ");
  navigator.clipboard.writeText(text);
  alert("조합이 복사되었습니다.");
};
const getAIScore = (nums) => {
  let score = 0;

  const odd = nums.filter((n) => n % 2 === 1).length;

  if (odd >= 2 && odd <= 4) {
    score += 20;
  }

  const sections = [
    nums.filter((n) => n <= 10).length,
    nums.filter((n) => n > 10 && n <= 20).length,
    nums.filter((n) => n > 20 && n <= 30).length,
    nums.filter((n) => n > 30 && n <= 40).length,
    nums.filter((n) => n > 40).length,
  ];

  score += sections.filter((v) => v > 0).length * 5;

  return score;
};
const saveNumbers = (nums, idx) => {
   const exists = saved.some(
    (item) => item.nums.join(",") === nums.join(",")
  );

  if (exists) {
    alert("이미 저장된 조합입니다.");
    return;
  }
  setSaved((prev) => [
    ...prev,
    {
      nums,
      idx,
       score: idx,
       date: new Date().toLocaleString(),
    },
  ]);
  //setAiLearning((prev) => {
  //const updated = { ...prev };

  //nums.forEach((num) => {
    //updated[num] = (updated[num] || 0) + 1;
  //});

  //return updated;
//});
  supabase
  .from("saved_numbers")
  .insert([
    {
      nums: nums.join(","),
      score: idx,
    },
  ])
  .then(({ error }) => {
    if (error) {
      console.error("Supabase 저장 실패:", error);
    } else {
      console.log("Supabase 저장 성공");
    }
  });
};

const deleteSaved = (deleteIdx) => {
  setSaved((prev) =>
    prev.filter((_, idx) => idx !== deleteIdx)
  );
};
const exportCSV = () => {
  const rows = saved.map((item) => [
    item.date,
    item.nums.join("-"),
    item.score,
  ]);

  const csvContent = [
    ["날짜", "번호", "점수"],
    ...rows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob(
      ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lotto_history.csv";
  link.click();

  URL.revokeObjectURL(url);
};
useEffect(() => {
  localStorage.setItem(
    "savedLotto",
    JSON.stringify(saved)
  );
}, [saved]);
useEffect(() => {
  localStorage.setItem(
    "aiLearning",
    JSON.stringify(aiLearning)
  );
}, [aiLearning]);

useEffect(() => {
  localStorage.setItem(
    "pairLearning",
    JSON.stringify(pairLearning)
  );
}, [pairLearning]);
useEffect(() => {
  localStorage.setItem(
    "winningNums",
    winning
  );
}, [winning]);
useEffect(() => {
  localStorage.setItem(
    "fixedNums",
    fixed
  );
}, [fixed]);

useEffect(() => {
  localStorage.setItem(
    "excludeNums",
    exclude
  );
}, [exclude]);
  const ballColor = (n) => {
    if (n <= 10) return "#fbc400";
    if (n <= 20) return "#69c8f2";
    if (n <= 30) return "#ff7272";
    if (n <= 40) return "#999";
    return "#7bcc59";
  };

  const frequency = {};
let oddCount = 0;
let evenCount = 0;
let range1 = 0; // 1~10
let range2 = 0; // 11~20
let range3 = 0; // 21~30
let range4 = 0; // 31~40
let range5 = 0; // 41~45
  results.forEach((set) => {
    set.nums.forEach((n) => {
      frequency[n] = (frequency[n] || 0) + 1;
      
      if (n % 2 === 0) {
      evenCount++;
    } else {
      oddCount++;
    }
    if (n <= 10) range1++;
else if (n <= 20) range2++;
else if (n <= 30) range3++;
else if (n <= 40) range4++;
else range5++;
    });
  });
const topNumbers = Object.entries(frequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1
  style={{
    color: "#2e8b57",
    textAlign: "center",
  }}
>
  🍀 행복이 AI 로또 연구소
</h1>

<p
  style={{
    textAlign: "center",
    color: "#777",
  }}
>
  AI 기반 로또 번호 분석 시스템
</p>
      <button
  onClick={exportCSV}
  style={{
    margin: 10,
    padding: 10,
  }}
>
  📄 CSV 다운로드
</button>
      {topNumbers.length > 0 && (
  <div style={{ marginBottom: 20 }}>
    <h3>🔥 자주 나온 번호 TOP10</h3>

    {topNumbers.map(([num, count], idx) => (
      <div key={num}>
        #{idx + 1} : {num}번 ({count}회)
      </div>
    ))}
  </div>
)}
{results.length > 0 && (
  <div
    style={{
      border: "3px solid gold",
      padding: 15,
      margin: 20,
      borderRadius: 10
    }}
  >
    <h2>🏆 BEST 조합</h2>

    <h3>
      {results[0].nums.join(" , ")}
    </h3>

    <p>
      점수 : {results[0].score.toFixed(1)}
    </p>
  </div>
)}
      <input
        placeholder="고정번호 (예: 7,12)"
        value={fixed}
        onChange={(e) => setFixed(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="제외번호 (예: 1,2,3)"
        value={exclude}
        onChange={(e) => setExclude(e.target.value)}
      />
<br /><br />

<input
  placeholder="최근 당첨번호 (예: 7,12,19,28,34,41)"
  value={winning}
  onChange={(e) => setWinning(e.target.value)}
/>
<p
  style={{
    color: "#666",
    fontSize: "14px",
    marginTop: "5px",
  }}
>
💡 최신 당첨번호 6개를 입력하면 AI가 해당 번호를 회피하여 분석합니다.
</p>
      <br /><br />
<input
  type="number"
  value={generateCount}
  onChange={(e) =>
    setGenerateCount(Number(e.target.value))
  }
  style={{
    width: 120,
    padding: 5,
    marginBottom: 10,
  }}
/>

<br /><br />
      <button
        onClick={generate}
        style={{
          padding: "10px 25px",
          fontSize: "18px"
        }}
      >
        🤖 AI {generateCount.toLocaleString()}조합 생성
      </button>

      {results.map((set, idx) => (
        <div
          key={idx}
          style={{
            marginTop: 20,
            border: "1px solid #ddd",
            padding: 10
          }}
        >
          <h3>
  {idx === 0 ? "🏆 BEST 조합" : `${idx + 1}조합`}
  (점수 {set.score})
</h3>
<p>
  🎯 최근 당첨번호 일치 : {set.matchCount}개
</p>
<p>
  ⭐ AI 최종점수 : {set.score.toFixed(1)}
  <br />
</p>
<p>
🏆 AI 등급 :
{set.score >= 120
  ? " 👑 SS"
  : set.score >= 100
  ? " 🏆 S"
  : set.score >= 90
  ? " 🥈 A"
  : set.score >= 80
  ? " 🥉 B"
  : " C"}
</p>


<p>
📈 AI 신뢰도 :
<span
  style={{
    color:
      set.score >= 120
        ? "green"
        : set.score >= 100
        ? "blue"
        : "orange",
    fontWeight: "bold",
  }}
>
  {Math.min(99, Math.round(set.score * 0.8))}%
</span>
</p>

<p>🧠 AI 분석 결과</p>

{set.matchCount === 0 && (
  <p>✔ 최근 당첨번호 회피 우수</p>
)}

{new Set(set.nums.map(n => n % 10)).size >= 5 && (
  <p>✔ 끝자리 다양성 우수</p>
)}

{Math.max(...set.sectionCounts) <= 2 && (
  <p>✔ 번호 분포 균형 우수</p>
)}

{set.score >= 120 && (
  <p>✔ AI 최고등급 조합</p>
)}

{set.isNewRecord && (
  <p>🔥 역대 최고 점수 갱신!</p>
)}
<p>
  🔢 끝자리 다양성 : {new Set(set.nums.map(n => n % 10)).size}/6
</p>
<p>
  📊 번호분포 :
  {set.sectionCounts[0]} /
  {set.sectionCounts[1]} /
  {set.sectionCounts[2]} /
  {set.sectionCounts[3]} /
  {set.sectionCounts[4]}
</p>

{Math.max(
  set.nums.filter(n => n <= 10).length,
  set.nums.filter(n => n > 10 && n <= 20).length,
  set.nums.filter(n => n > 20 && n <= 30).length,
  set.nums.filter(n => n > 30 && n <= 40).length,
  set.nums.filter(n => n > 40).length
) <= 2 && (
  <p>⭐ 구간 균형 우수</p>
)}
          {set.nums.map((n) => (
            <span
              key={n}
              style={{
                display: "inline-block",
                width: 50,
                height: 50,
                lineHeight: "50px",
                borderRadius: "50%",
                margin: 5,
                background: ballColor(n),
                color: "#fff",
                fontWeight: "bold"
              }}
            >
              {n}
            </span>
          ))}
          <div style={{ marginTop: 10 }}>
  <button onClick={() => copyNumbers(set.nums)}>
    조합 복사
  </button>
  <button
  onClick={() => saveNumbers(set.nums, idx)}
  style={{ marginLeft: 10 }}
>
  저장
</button>
</div>
        </div>
      ))}

      {results.length > 0 && (
        <>
          <h2>번호 출현 빈도</h2>

          <div>
            {Object.entries(frequency)
              .sort((a, b) => b[1] - a[1])
              .map(([num, cnt]) => (
                <div key={num}>
                  번호 {num} : {cnt}회
                </div>
              ))}
          </div>
          <h2>🏆 AI 추천 TOP 10</h2>
<h2>📊 홀짝 분석</h2>
<h2>📈 번호 구간 분석</h2>

<div>
  1~10 : {range1}개
  <br />
  11~20 : {range2}개
  <br />
  21~30 : {range3}개
  <br />
  31~40 : {range4}개
  <br />
  41~45 : {range5}개
</div>
<div>
  홀수 : {oddCount}개
  <br />
  짝수 : {evenCount}개
</div>
<div>
  {Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([num, cnt], idx) => (
      <div key={num + "-top"}>
        {idx + 1}위 : {num}번 ({cnt}회)
      </div>
    ))}
</div>
<h2>💾 저장된 조합({saved.length}개)</h2>
<h2>🕒 생성 이력</h2>

{history.length === 0 && (
  <p>생성 이력이 없습니다.</p>
)}

{history.map((item, idx) => (
  <div
    key={idx}
    style={{
      border: "1px solid #ccc",
      padding: 10,
      marginBottom: 5,
      borderRadius: 5,
    }}
  >
    <div>{item.date}</div>
    <div>
      BEST : {item.nums.join(", ")}
    </div>
    <div>
      점수 : {item.score}
      <div>
  등급 :
  {item.score >= 100
    ? " 🏆 S"
    : item.score >= 90
    ? " 🥈 A"
    : " 🥉 B"}
</div>
    </div>
  </div>
))}
<input
  type="number"
  placeholder="번호 검색 (예: 7)"
  value={searchNum}
  onChange={(e) => setSearchNum(e.target.value)}
  style={{
    marginBottom: 10,
    padding: 5,
    width: 200,
  }}
/>
{saved.length === 0 && (
  <p>저장된 조합이 없습니다.</p>
)}
{saved
  .filter((item) => {
    if (!searchNum) return true;

    return item.nums.includes(
      Number(searchNum)
    );
  })
  .map((item, idx) => (
  <div
  key={idx}
  style={{
    border: idx === 0 ? "4px solid gold" : "1px solid #ccc",
    backgroundColor: idx === 0 ? "#fff7dc" : "white",
    boxShadow:
  idx === 0
    ? "0 0 15px rgba(255,215,0,0.5)"
    : "none",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
  }}
>
    {item.idx + 1}조합 저장 :
    {item.nums.join(", ")}
    <br />

⭐ AI 점수 : {getAIScore(item.nums)}점
     <button
      onClick={() => deleteSaved(idx)}
      style={{ marginLeft: 10 }}
    >
      🗑 삭제
    </button>
  </div>
))}

        </>
      )}
    </div>
  );
}