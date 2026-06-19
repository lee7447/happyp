export default function Statistics({ data }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📊 번호 출현 빈도</h2>

      {data.map(([num, cnt]) => (
        <div key={num}>
          번호 {num} : {cnt}회
        </div>
      ))}
    </div>
  );
}