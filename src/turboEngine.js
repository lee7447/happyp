export function generateTurbo({
  fixedNums,
  excludeNums,
  aiLearning,
  pairLearning,
  recentFrequency,
}) {
  const nums = [...fixedNums];

  while (nums.length < 6) {
    const candidates = [];

    for (let i = 1; i <= 45; i++) {
      if (nums.includes(i) || excludeNums.includes(i)) continue;

      let score = Math.random() * 100;

      score += (Math.random() - 0.5) * 80;

      score += (aiLearning[i] || 0) * 0.05;
      score += (recentFrequency[i] || 0) * 0.03;

      let pair = 0;

      nums.forEach((n) => {
        const key = [n, i].sort((a, b) => a - b).join("-");
        pair += pairLearning[key] || 0;
      });

      score += pair * 0.02;

      candidates.push({ num: i, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    const pick =
      candidates[Math.floor(Math.random() * Math.min(8, candidates.length))];

    nums.push(pick.num);
  }

  return nums.sort((a, b) => a - b);
}