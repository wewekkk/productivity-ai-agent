export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px",
        lineHeight: 1.8,
      }}
    >
      <h1>Quest Agent 服務條款</h1>

      <p>
        歡迎使用 Quest Agent。
        使用本服務即表示您同意以下條款。
      </p>

      <h2>服務內容</h2>

      <p>
        Quest Agent 提供任務規劃、
        Quest 與 Session 管理，
        以及 Google Calendar 同步功能。
      </p>

      <h2>Google 帳號與 Calendar</h2>

      <p>
        使用者可透過自己的 Google 帳號登入並授權
        Google Calendar。
      </p>

      <p>
        Quest Agent 僅會依使用者的操作，
        將確認後的工作階段寫入使用者自己的 Google Calendar。
      </p>

      <h2>使用者責任</h2>

      <p>
        使用者應確保輸入的任務內容合法，
        並自行確認 AI 產生的任務安排是否符合實際需求。
      </p>

      <h2>服務限制</h2>

      <p>
        本服務目前為 Hackathon / Prototype 版本，
        功能可能隨時調整。
      </p>

      <p>
        本版本的部分 Quest 資料僅保存在目前瀏覽器，
        換裝置或清除瀏覽器資料後可能無法復原。
      </p>

      <h2>免責聲明</h2>

      <p>
        Quest Agent 不保證 AI 產生的排程或建議完全正確，
        使用者應自行判斷與確認。
      </p>

      <p>
        最後更新日期：2026 年 9 月 5 日
      </p>
    </main>
  );
}