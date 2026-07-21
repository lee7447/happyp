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
const mutationRate = 0.35;
    for (let i = 1; i <= 45; i++) {
      if (nums.includes(i) || excludeNums.includes(i)) continue;

      let score = Math.random() * 100;

      score += (Math.random() - 0.5) * 200;

      score += (aiLearning[i] || 0) * 0.05;
      score += (recentFrequency[i] || 0) * 0.03;

      let pair = 0;

      nums.forEach((n) => {
        const key = [n, i].sort((a, b) => a - b).join("-");
        pair += pairLearning[key] || 0;
      });

      score += pair * 0.02;
score += Math.random() * 15;
      candidates.push({ num: i, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    const elite = candidates.slice(0, 20);
elite.sort(() => Math.random() - 0.5);
const parent1 =
  elite[Math.floor(Math.random() * elite.length)];

const parent2 =
  elite[Math.floor(Math.random() * elite.length)];

const pick =
  Math.random() < 0.5 ? parent1 : parent2;

    if (Math.random() < mutationRate) {
  let randomNum;

  do {
    randomNum = Math.floor(Math.random() * 45) + 1;
  } while (
    nums.includes(randomNum) ||
    excludeNums.includes(randomNum)
  );

  nums.push(randomNum);
} else {
  nums.push(pick.num);
}
  }

  return nums.sort((a, b) => a - b);
}