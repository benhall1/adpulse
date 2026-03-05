import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface FatigueAlert {
  adName: string;
  status: "WATCH" | "CRITICAL";
  score: number;
  ctrDecline: number;
  cpmIncrease: number;
  frequencySat: number;
  conversionDrop: number;
}

export async function sendDailyDigest(
  to: string,
  userName: string,
  alerts: FatigueAlert[],
  appUrl: string
) {
  if (alerts.length === 0) return;

  const criticalCount = alerts.filter((a) => a.status === "CRITICAL").length;
  const watchCount = alerts.filter((a) => a.status === "WATCH").length;

  const subject = criticalCount > 0
    ? `🚨 ${criticalCount} critical ad${criticalCount > 1 ? "s" : ""} need attention — AdPulse`
    : `⚠️ ${watchCount} ad${watchCount > 1 ? "s" : ""} showing fatigue — AdPulse`;

  const alertRows = alerts
    .sort((a, b) => b.score - a.score)
    .map(
      (alert) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #262626;">
          ${alert.adName}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #262626; text-align: center;">
          <span style="
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            background: ${alert.status === "CRITICAL" ? "#ef4444" : "#f59e0b"};
          ">${alert.status}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #262626; text-align: center;">
          ${Math.round(alert.score * 100)}%
        </td>
      </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">
            <span style="color: #3b82f6;">Ad</span>Pulse
          </h1>
          <p style="color: #a3a3a3; margin-top: 4px; font-size: 14px;">
            Daily Fatigue Report
          </p>
        </div>

        <div style="background: #171717; border-radius: 12px; border: 1px solid #262626; overflow: hidden;">
          <div style="padding: 20px;">
            <p style="margin: 0; font-size: 16px;">
              Hey ${userName},
            </p>
            <p style="margin: 12px 0 0; color: #a3a3a3; font-size: 14px;">
              ${criticalCount > 0
                ? `${criticalCount} ad${criticalCount > 1 ? "s are" : " is"} in critical fatigue — consider refreshing creative ASAP.`
                : `${watchCount} ad${watchCount > 1 ? "s are" : " is"} showing early signs of fatigue.`
              }
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #1a1a1a;">
                <th style="padding: 10px 16px; text-align: left; color: #a3a3a3; font-weight: 500;">Ad</th>
                <th style="padding: 10px 16px; text-align: center; color: #a3a3a3; font-weight: 500;">Status</th>
                <th style="padding: 10px 16px; text-align: center; color: #a3a3a3; font-weight: 500;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${alertRows}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
          ">View Dashboard</a>
        </div>

        <p style="text-align: center; color: #525252; font-size: 12px; margin-top: 32px;">
          You're receiving this because you have alerts enabled for your AdPulse account.
        </p>
      </div>
    </body>
    </html>
  `;

  await getResend().emails.send({
    from: "AdPulse <alerts@adpulse.app>",
    to,
    subject,
    html,
  });
}
