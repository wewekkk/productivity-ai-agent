export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px",
        lineHeight: 1.8,
      }}
    >
      <h1>Quest Agent 隱私權政策</h1>

      <p>
        Quest Agent 是一個協助使用者規劃任務、
        建立 Quest，並同步工作階段至 Google Calendar
        的生產力工具。
      </p>

      <h2>我們使用的 Google 資料</h2>

      <p>
        當您使用 Google 帳號登入 Quest Agent 時，
        我們可能取得您的 Google 使用者識別資訊，
        包括名稱、電子郵件地址、使用者識別碼與頭像。
      </p>

      <p>
        當您授權 Google Calendar 後，
        Quest Agent 會使用 Google Calendar API
        將您確認的任務與工作階段寫入您自己的 Google Calendar。
      </p>

      <h2>資料用途</h2>

      <p>
        Google 使用者資訊僅用於辨識目前登入使用者，
        並區分不同使用者的 Quest 資料。
      </p>

      <p>
        Google Calendar 權限僅用於建立或更新
        您主動確認的行事曆事件。
      </p>

      <h2>資料儲存</h2>

      <p>
        本 Hackathon 版本的 Quest 與使用紀錄主要儲存在
        使用者目前瀏覽器的 localStorage 中，
        並依 Google 使用者識別碼進行隔離。
      </p>

      <p>
        Google OAuth token 會透過 HttpOnly Cookie
        由伺服器端使用，以執行 Google Calendar API 操作。
      </p>

      <h2>資料分享</h2>

      <p>
        Quest Agent 不會出售您的個人資料，
        也不會將 Google 使用者資料提供給第三方作廣告用途。
      </p>

      <h2>聯絡方式</h2>

      <p>
        如果您對本隱私權政策有任何問題，
        請聯絡 Quest Agent 開發團隊。
      </p>

      <p>
        最後更新日期：2026 年 9 月 5 日
      </p>
    </main>
  );
}