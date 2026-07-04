export const hotNumbers = [7, 12, 17, 21, 27, 33, 40, 42];

export const coldNumbers = [3, 11, 18, 24, 31, 37, 44];

export function getHotCount(nums) {
  return nums.filter((n) => hotNumbers.includes(n)).length;
}

export function getColdCount(nums) {
  return nums.filter((n) => coldNumbers.includes(n)).length;
}