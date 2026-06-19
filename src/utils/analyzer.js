export function analyzeFrequency(results) {
  const frequency = {};

  results.forEach((set) => {
    set.nums.forEach((n) => {
      frequency[n] = (frequency[n] || 0) + 1;
    });
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1]);
}