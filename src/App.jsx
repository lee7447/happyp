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
  const [aiCombo] = useState({});
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

const [winning, setWinning] = useState(() => {
  return localStorage.getItem("winningNums") || "";
});

const [hotRecent, setHotRecent] = useState(() => {
  return localStorage.getItem("hotRecentNums") || "";
});

const [generateCount, setGenerateCount] = useState(50000);
const loadLatestWinning = async () => {
  const nums = await getLatestWinningNumbers(1180);

  if (nums) {
    setWinning(nums.join(","));
  } else {
    alert("당첨번호를 가져오지 못했습니다.");
  }
};
const evaluateCombo = (nums) => {
  const odd = nums.filter((n) => n % 2 === 1).length;
  const high = nums.filter((n) => n >= 23).length;
  const sum = nums.reduce((a, b) => a + b, 0);

  let score = 70;

  // 홀짝 균형
  if (odd === 3) score += 10;
  else if (odd === 2 || odd === 4) score += 6;

  // 고번호 균형
  if (high === 3) score += 8;
  else if (high === 2 || high === 4) score += 4;

  // 번호 합계
  if (sum >= 120 && sum <= 150) score += 7;
  else if (sum >= 105 && sum <= 165) score += 3;

  // 번호 구간 분포
  const sections = getSectionCounts(nums);
  const activeSections = sections.filter((n) => n > 0).length;
  score += activeSections * 1.5;

  // 끝자리 다양성
  const uniqueLastDigits =
    new Set(nums.map((n) => n % 10)).size;

  score += uniqueLastDigits * 0.8;

  // 학습 보너스는 최대 3점만 반영
  score += Math.min(3, getLearningBonus(nums, aiLearning));

  // 페어 학습 보너스는 최대 3점만 반영
  score += Math.min(3, getPairLearningBonus(nums, pairLearning));

  // 100점 제한
  return Math.min(100, Math.max(0, score));
};
  const generate = () => {
    setResults([]);
    console.log(generateTurbo);
    const recentHistory = winningHistory.slice(0, 60);
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
  const hotRecentNums = hotRecent
  .split(",")
  .map((n) => parseInt(n))
  .filter((n) => !isNaN(n));
  const seenSets = new Set();
  const seenPattern = new Set();
    const allSets = [];
    let eliteSets = [];
const elitePool = [];
    const MAX_ELITE =3000;

 for (let k = 0; k < generateCount; k++){
  
      const nums = [...fixedNums];
if (elitePool.length > 300 && Math.random() < 0.90) {

  const parent1 =
    elitePool[Math.floor(Math.random() * elitePool.length)];

  const parent2 =
    elitePool[Math.floor(Math.random() * elitePool.length)];

  const genes = [...parent1.nums, ...parent2.nums]
    .sort(() => Math.random() - 0.5);

  genes.forEach((n) => {
    if (
      nums.length < 6 &&
      !nums.includes(n) &&
      !excludeNums.includes(n)
    ) {
      nums.push(n);
    }
  });

}
      while (nums.length < 6) {
        let n;

if (Math.random() < 0.85) {
  const weights = [];

let totalWeight = 0;

for (let i = 1; i <= 45; i++) {
  
  if (nums.includes(i) || excludeNums.includes(i)) continue;

  let pairBonus = 0;
const sectionBalance =
  nums.filter(x => x <= 10).length <= 2 &&
  nums.filter(x => x > 10 && x <= 20).length <= 2 &&
  nums.filter(x => x > 20 && x <= 30).length <= 2 &&
  nums.filter(x => x > 30 && x <= 40).length <= 2 &&
  nums.filter(x => x > 40).length <= 2;

if (sectionBalance) {
  pairBonus += 1.2;
}
  nums.forEach((x) => {
    const key = [x, i].sort((a, b) => a - b).join("-");
    pairBonus += pairLearning[key] || 0;
  });

  const lastDigit = i % 10;

const sameLastDigit = nums.filter(
  (x) => x % 10 === lastDigit
).length;

const hotRecentBonus = hotRecentNums.includes(i) ? 3 : 0;

const learningPenalty =
  Math.max(0, (aiLearning[i] || 0) - 5) * 0.15;

const weight =
  1 +
  (aiLearning[i] || 0) * 0.20 +
  (recentFrequency[i] || 0) * 0.01 +
  hotRecentBonus +
  pairBonus * 0.35 +
  Math.random() * 2.2 -
  sameLastDigit * 3 -
  learningPenalty;

let finalWeight = weight;
const spread = 45 - i;

if (spread >= 10 && spread <= 35) {
  finalWeight += 0.8;
}
if (finalWeight < 0.2) finalWeight = 0.2;
if (finalWeight > 15) finalWeight = 15;
if (i >= 42) {
  finalWeight -= 2.2;
}

totalWeight += finalWeight;
weights.push({
  num: i,
  total: totalWeight,
});
  
}

const rand = (Math.random() ** 1.25) * totalWeight;

const selected = weights.find((w) => rand <= w.total);

if (!selected) {
  n = Math.floor(Math.random() * 45) + 1;
} else {
  n = selected.num;
}
if (Math.random() < 0.8) {
  let retry = 0;

  do {
    n = Math.floor(Math.random() * 45) + 1;
    retry++;
  } while (
    retry < 20 &&
    (
      nums.includes(n) ||
      excludeNums.includes(n) ||
      nums.filter(x => x % 10 === n % 10).length >= 1
    )
  );
}
} else {
  n = Math.floor(Math.random() * 45) + 1;
}

        if (
          !nums.includes(n) &&
          !excludeNums.includes(n)
        ) {
          nums.push(n);
          const sorted = [...nums].sort((a, b) => a - b);

let consecutive = 0;

for (let i = 1; i < sorted.length; i++) {
  if (sorted[i] === sorted[i - 1] + 1) {
    consecutive++;
  }
}

if (consecutive >= 2) {
  nums.pop();
  continue;
}
        }
      }
// Mutation (5%)
if (Math.random() < 0.03) {

  let idx;

do {
  idx = Math.floor(Math.random() * nums.length);
} while (fixedNums.includes(nums[idx]));

  let newNum;

  do {
    newNum = Math.floor(Math.random() * 45) + 1;
  } while (
    nums.includes(newNum) ||
    excludeNums.includes(newNum)
  );

  nums[idx] = newNum;
}
      nums.sort((a, b) => a - b);
const high40 = nums.filter((n) => n >= 40).length;
const high42 = nums.filter((n) => n >= 42).length;

if (high40 >= 3) continue;
if (high42 >= 2) continue;
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
  Math.abs(sum - 135) * 0.10 -
  consecutivePenalty;
  
const matchCount = nums.filter((n) =>
  winningNums.includes(n)
).length;
const lastDigits = nums.map((n) => n % 10);
const uniqueLastDigits = new Set(lastDigits).size;
const maxGap = Math.max(
  ...nums.slice(1).map((n, i) => n - nums[i])
);

const lastDigitPenalty = (6 - uniqueLastDigits) * 3;
const sectionCounts = getSectionCounts(nums);
const maxSection = Math.max(...sectionCounts);
let finalScore = score;
const varianceBonus =
  new Set(nums.map(n => Math.floor((n - 1) / 10))).size * 2;

finalScore += varianceBonus;
const learningBonus = Math.min(
  8,
  getLearningBonus(nums, aiLearning)
);

const diversityBonus =
  new Set(nums.map(n => n % 10)).size * 0.8;

finalScore += diversityBonus;

finalScore += learningBonus;

const comboKey =
  nums.slice().sort((a, b) => a - b).join("-");

finalScore += Math.min(
  2,
  (aiCombo[comboKey] || 0) * 0.5
);

if (matchCount >= 2) {
  finalScore += 3;
}

const pairBonus = Math.min(
  8,
  getPairLearningBonus(nums, pairLearning)
);

finalScore += pairBonus;
const evenOddBalance =
  Math.abs(odd - 3) <= 1 ? 2 : 0;

finalScore += evenOddBalance;
if (matchCount === 0) {
  finalScore += 10;
} else if (matchCount === 1) {
  finalScore += 2;
}


const hotCount = getHotCount(nums);

finalScore += hotCount * 1.5;
//const recentHotBonus = nums.reduce((bonus, num) => {
  //return bonus + (recentFrequency[num] || 0) * 0.5;
//}, 0);

//finalScore += recentHotBonus;
const overHotCount = nums.filter(
  (num) => (recentFrequency[num] || 0) >= 6
).length;

finalScore -= overHotCount * 8;

const balancedCount = nums.filter(
  (n) => hotNumbers.includes(n) || coldNumbers.includes(n)
).length;

if (balancedCount >= 4) {
  finalScore += 8;
}
const coldCount = getColdCount(nums);

finalScore += coldCount * 2.5;
const balanceBonus =
  Math.min(odd, 6 - odd) +
  Math.min(high, 6 - high);

finalScore += balanceBonus * 1.2;
const spread =
  nums[5] - nums[0];

if (spread >= 28 && spread <= 38) {
  finalScore += 4;
} else {
  finalScore -= 3;
}
const lowCount = nums.filter(n => n <= 22).length;
const highCount2 = nums.filter(n => n >= 23).length;

if (
  (lowCount === 3 && highCount2 === 3) ||
  (lowCount === 2 && highCount2 === 4) ||
  (lowCount === 4 && highCount2 === 2)
) {
  finalScore += 4;
} else {
  finalScore -= 2;
}
if (matchCount >= 3) finalScore -= 20;
else if (matchCount === 2) finalScore -= 10;
else if (matchCount === 0) finalScore += 5;
finalScore -= lastDigitPenalty;
const frequencyPenalty = nums.reduce((sum, n) => {
  return sum + Math.max(0, (recentFrequency[n] || 0) - 2);
}, 0);

finalScore -= frequencyPenalty * 1.0;
const fatigue =
  nums.reduce((sum, n) => sum + (aiLearning[n] || 0), 0);

finalScore -= fatigue * 0.04;

if (maxSection >= 4) finalScore -= 15;
else if (maxSection === 3) finalScore -= 5;
// AI 필터
if (consecutivePenalty >= 15) continue;
if (odd < 2 || odd > 4) continue;

if (high < 2 || high > 4) continue;
if (sum < 100 || sum > 180) continue;

if (maxSection >= 4) continue;

if (uniqueLastDigits <= 2) continue;
if (uniqueLastDigits === 3) finalScore -= 3;
if (maxGap >= 20) continue;
if (matchCount >= 4) continue;
if (finalScore < 92) continue;
const key = nums.join("-");
const patternKey = nums.map(n => n % 10).sort((a, b) => a - b).join("-");
if (seenSets.has(key)) continue;
if (seenPattern.has(patternKey)) continue;
seenSets.add(key);
seenPattern.add(patternKey);
finalScore += Math.random() * 0.05;
      allSets.push({
  nums,
  score: finalScore,
  matchCount,
  sectionCounts,
  sum,
  odd,
  high,
});
      const isSimilar = elitePool.some(item => {
  return item.nums.filter(n => nums.includes(n)).length >= 4;
});

if (!isSimilar) {
  elitePool.push({
    nums: [...nums],
    score: finalScore,
  });
}

elitePool.sort((a, b) => b.score - a.score);

elitePool.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;

  const spreadA = a.nums[5] - a.nums[0];
  const spreadB = b.nums[5] - b.nums[0];

  return Math.abs(33 - spreadA) - Math.abs(33 - spreadB);
});
if (elitePool.length > MAX_ELITE) {
  elitePool.length = MAX_ELITE;
}
    }
    
const top10 = [];
const top20 = [];
const MAX_RESULTS = 10;
const lastPattern = new Set();
const diversityCheck = (a, b) => {
  const diversityCheck = (a, b) => {
  const frontA = a.slice(0, 2);
  const frontB = b.slice(0, 2);

  const closeFrontCount = frontA.filter(x =>
    frontB.some(y => Math.abs(x - y) <= 3)
  ).length;

  if (closeFrontCount >= 2) return true;

  let same = 0;

  for (const n of a) {
    if (b.includes(n)) same++;
  }

  const lastA = new Set(a.map(n => n % 10));
  const lastB = new Set(b.map(n => n % 10));

  let lastSame = 0;

  lastA.forEach(v => {
    if (lastB.has(v)) lastSame++;
  });

  return same >= 4 || lastSame >= 4;
};
  let same = 0;

  for (const n of a) {
    if (b.includes(n)) same++;
  }

  const lastA = new Set(a.map(n => n % 10));
  const lastB = new Set(b.map(n => n % 10));

  let lastSame = 0;

  lastA.forEach(v => {
    if (lastB.has(v)) lastSame++;
  });

  return same >= 4 || lastSame >= 4;
};
allSets.sort((a, b) => b.score - a.score);

const finalTop10 = [];
const usedKeys = new Set();

for (const set of allSets) {
  const key = set.nums
    .slice()
    .sort((a, b) => a - b)
    .join("-");

  if (usedKeys.has(key)) continue;

  usedKeys.add(key);
  finalTop10.push(set);

  if (finalTop10.length >= 10) break;
}
const maxFinalScore = Math.max(
  ...finalTop10.map(set => set.score)
);

const minFinalScore = Math.min(
  ...finalTop10.map(set => set.score)
);

if (maxFinalScore > minFinalScore) {
  finalTop10.forEach((set) => {
    set.score =
      92 +
      ((set.score - minFinalScore) /
        (maxFinalScore - minFinalScore)) * 8;
  });
} else {
  finalTop10.forEach((set) => {
    set.score = 100;
  });
}

finalTop10.sort((a, b) => b.score - a.score);





setResults(finalTop10);
if (finalTop10.length === 0) {
  alert("생성된 조합이 없습니다.");
  return;
}
elitePool.length = 0;
eliteSets.length = 0;
seenSets.clear();
seenPattern.clear();
top10.forEach((set) => {
  const key = set.nums.slice().sort((a, b) => a - b).join("-");
  aiCombo[key] = (aiCombo[key] || 0) + 1;
});

    const bestSet = finalTop10[0];
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

  const sorted = [...nums].sort((a, b) => a - b);

  // 홀짝 균형
  const odd = sorted.filter(n => n % 2 === 1).length;
  if (odd === 3) score += 20;
else if (odd === 2 || odd === 4) score += 10;

  // 번호 구간 분포
  const sections = [
    sorted.filter(n => n <= 10).length,
    sorted.filter(n => n > 10 && n <= 20).length,
    sorted.filter(n => n > 20 && n <= 30).length,
    sorted.filter(n => n > 30 && n <= 40).length,
    sorted.filter(n => n > 40).length,
  ];

  score += sections.filter(v => v > 0).length * 5;

  // 합계
  const sum = sorted.reduce((a, b) => a + b, 0);

 if (sum >= 120 && sum <= 150) {
  score += 8;
} else if (sum >= 105 && sum <= 165) {
  score += 3;
}

  // 고번호
  const high = sorted.filter(n => n >= 23).length;

  if (high === 3) {
  score += 5;
} else if (high === 2 || high === 4) {
  score += 2;
}

  // 소수
  const primes = [
    2,3,5,7,11,13,17,19,
    23,29,31,37,41,43
  ];

  const primeCount = sorted.filter(n =>
    primes.includes(n)
  ).length;

  if (primeCount === 2 || primeCount === 3) {
  score += 4;
} else if (primeCount === 1 || primeCount === 4) {
  score += 1;
}

  // 번호 간격
  const gaps = [];

  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1]);
  }

  const avgGap =
    gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (avgGap >= 5 && avgGap <= 9) {
    score += 5;
  }

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

  const aiScore = getAIScore(nums);

  setSaved((prev) => [
    ...prev,
    {
      nums: [...nums],
      idx,
      score: aiScore,
      date: new Date().toLocaleString(),
    },
  ]);
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
    "lottoHistory",
    JSON.stringify(history)
  );
}, [history]);
useEffect(() => {
  localStorage.setItem(
    "hotRecentNums",
    hotRecent
  );
}, [hotRecent]);
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
<br /><br />

<input
  placeholder="최근 60회 최다출현 번호 (예: 3,15,16,27,28,31)"
  value={hotRecent}
  onChange={(e) => setHotRecent(e.target.value)}
/>

<p
  style={{
    color: "#666",
    fontSize: "14px",
    marginTop: "5px",
  }}
>
💡 최근 60회 최다출현 번호를 AI 분석에 반영합니다.
</p>
<p
  style={{
    color: "#666",
    fontSize: "14px",
    marginTop: "5px",
  }}
>
💡 최근 당첨번호 6개를 입력하면 AI가 분석 점수에 반영합니다.
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
  점수 {set.score.toFixed(1)}
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

{set.sectionCounts && Math.max(...set.sectionCounts) <= 2 && (
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
  {(set.sectionCounts || [0, 0, 0, 0, 0])[0]} /
  {(set.sectionCounts || [0, 0, 0, 0, 0])[1]} /
  {(set.sectionCounts || [0, 0, 0, 0, 0])[2]} /
  {(set.sectionCounts || [0, 0, 0, 0, 0])[3]} /
  {(set.sectionCounts || [0, 0, 0, 0, 0])[4]}
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