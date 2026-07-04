export function getLearningBonus(nums, aiLearning) {
  let bonus = 0;

  nums.forEach((num) => {
    if (aiLearning[num]) {
      bonus += aiLearning[num] * 0.3;
    }
  });

  return bonus;
}
export function updatePairLearning(nums, pairLearning) {
  const updated = { ...pairLearning };

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const key = [nums[i], nums[j]].sort((a, b) => a - b).join("-");

      updated[key] = (updated[key] || 0) + 1;
    }
  }

  return updated;
}
export function getPairLearningBonus(nums, pairLearning) {
  let bonus = 0;

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const key = [nums[i], nums[j]]
        .sort((a, b) => a - b)
        .join("-");

      bonus += (pairLearning[key] || 0) * 0.2;
    }
  }

  return bonus;
}