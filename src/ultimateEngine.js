export function generateUltimate({
  fixedNums = [],
  excludeNums = [],
}) {
  const nums = [...fixedNums];

  while (nums.length < 6) {
    const pool = [];

    for (let i = 1; i <= 45; i++) {
      if (nums.includes(i) || excludeNums.includes(i)) continue;

      let score = Math.random() * 1000;

      // 다양성 강화
      score += Math.random() * 1000;

      // 끝자리 중복 감소
      const last = i % 10;
      const sameLast = nums.filter(n => n % 10 === last).length;
      score -= sameLast * 300;

      // 연속번호 감소
      if (nums.includes(i - 1)) score -= 200;
      if (nums.includes(i + 1)) score -= 200;

      pool.push({ num: i, score });
    }

    pool.sort((a, b) => b.score - a.score);

    const pick = pool[Math.floor(Math.random() * 10)];

    nums.push(pick.num);
  }

  return nums.sort((a, b) => a - b);
}