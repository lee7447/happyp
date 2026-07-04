export function getSectionCounts(nums) {
  const sectionCounts = [0, 0, 0, 0, 0];

  nums.forEach((n) => {
    if (n <= 10) sectionCounts[0]++;
    else if (n <= 20) sectionCounts[1]++;
    else if (n <= 30) sectionCounts[2]++;
    else if (n <= 40) sectionCounts[3]++;
    else sectionCounts[4]++;
  });

  return sectionCounts;
}