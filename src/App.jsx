import { useState, useEffect } from "react";

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
const [searchNum, setSearchNum] = useState("");
const [history, setHistory] = useState(() => {
  const stored = localStorage.getItem("lottoHistory");
  return stored ? JSON.parse(stored) : [];
});
const [winning, setWinning] = useState(() => {
  return localStorage.getItem("winningNums") || "";
});
  const generate = () => {
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
    const allSets = [];

    for (let k = 0; k < 100; k++) {
      const nums = [...fixedNums];

      while (nums.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;

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
  Math.abs(odd - 3) * 10 -
  Math.abs(high - 3) * 10 -
  - Math.abs(sum - 135) * 0.3 -
  consecutivePenalty;
  
const matchCount = nums.filter((n) =>
  winningNums.includes(n)
).length;
const lastDigits = nums.map((n) => n % 10);
const uniqueLastDigits = new Set(lastDigits).size;
const lastDigitPenalty = (6 - uniqueLastDigits) * 3;
const sectionCounts = [0, 0, 0, 0, 0];

nums.forEach((n) => {
  if (n <= 10) sectionCounts[0]++;
  else if (n <= 20) sectionCounts[1]++;
  else if (n <= 30) sectionCounts[2]++;
  else if (n <= 40) sectionCounts[3]++;
  else sectionCounts[4]++;
});
let finalScore = score;

if (matchCount >= 3) finalScore -= 20;
else if (matchCount === 2) finalScore -= 10;
else if (matchCount === 0) finalScore += 5;
finalScore -= lastDigitPenalty;
const maxSection = Math.max(...sectionCounts);

if (maxSection >= 4) finalScore -= 15;
else if (maxSection === 3) finalScore -= 5;
      allSets.push({
        nums,
          score: finalScore,
         matchCount,
      });
    }
allSets.sort((a, b) => b.score - a.score);
    setResults(allSets.slice(0, 10));
    const bestSet = allSets[0];

setHistory((prev) => [
  {
    date: new Date().toLocaleString(),
    nums: bestSet.nums,
    score: bestSet.score,
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
    },
  ]);
};
const deleteSaved = (deleteIdx) => {
  setSaved((prev) =>
    prev.filter((_, idx) => idx !== deleteIdx)
  );
};
const exportCSV = () => {
  const rows = history.map((item) => [
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
      <h1>🎰 유재님 AI 로또 분석기 25.0</h1>
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

      <button
        onClick={generate}
        style={{
          padding: "10px 25px",
          fontSize: "18px"
        }}
      >
        10조합 생성
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
</p>
<p>
  🔢 끝자리 다양성 : {new Set(set.nums.map(n => n % 10)).size}/6
</p>
<p>
  📊 구간분포 :
  {set.nums.filter(n => n <= 10).length} /
  {set.nums.filter(n => n > 10 && n <= 20).length} /
  {set.nums.filter(n => n > 20 && n <= 30).length} /
  {set.nums.filter(n => n > 30 && n <= 40).length} /
  {set.nums.filter(n => n > 40).length}
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
    border: idx === 0 ? "3px solid gold" : "1px solid #ccc",
    backgroundColor: idx === 0 ? "#fff8dc" : "white",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
  }}
>
    {item.idx + 1}조합 저장 :
    {item.nums.join(", ")}
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