export async function getLatestWinningNumbers(drawNo) {
  const res = await fetch(
    `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drawNo}`
  );

  const data = await res.json();

  if (data.returnValue !== "success") {
    return null;
  }

  return [
    data.drwtNo1,
    data.drwtNo2,
    data.drwtNo3,
    data.drwtNo4,
    data.drwtNo5,
    data.drwtNo6,
  ];
}