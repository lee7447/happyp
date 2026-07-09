export function generateTurbo({
  fixedNums,
  excludeNums,
  aiLearning,
  pairLearning,
  recentFrequency,
}) {
  const nums = [...fixedNums];

  while (nums.length < 6) {
    let totalWeight = 0;
    const weights = [];

    for (let i = 1; i <= 45; i++) {
      if (nums.includes(i) || excludeNums.includes(i)) continue;

      let pairBonus = 0;

      for (const x of nums) {
        const key = [x, i].sort((a, b) => a - b).join("-");
        pairBonus += pairLearning[key] || 0;
      }

      const weight =
        1 +
        (aiLearning[i] || 0) +
        (recentFrequency[i] || 0) +
        pairBonus * 0.3;

      totalWeight += weight;

      weights.push({
        num: i,
        total: totalWeight,
      });
    }

    const rand = Math.random() * totalWeight;

    const selected =
      weights.find((w) => rand <= w.total)?.num;

    if (selected && !nums.includes(selected)) {
      nums.push(selected);
    }
  }

  return nums.sort((a, b) => a - b);
}