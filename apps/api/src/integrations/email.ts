import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendWeeklyDigest(to: string, data: {
  name: string;
  nudgesEngaged: number;
  nudgesTotal: number;
  safetyScore: number | null;
  scoreDelta: number;
  focusBehavior: string;
  insight: string;
  mirrorReady: boolean;
}) {
  await sgMail.send({
    to,
    from: { email: "nudge@catalyst.coach", name: "Catalyst" },
    subject: `Your Catalyst Brief — Week ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1B2A4A;">
        <h2 style="color: #1B2A4A;">Hi ${data.name},</h2>
        <p>This week's snapshot:</p>
        <ul>
          <li>You engaged with ${data.nudgesEngaged}/${data.nudgesTotal} nudges</li>
          ${data.safetyScore ? `<li>Team safety pulse: ${data.safetyScore} (${data.scoreDelta >= 0 ? "+" : ""}${data.scoreDelta})</li>` : ""}
          <li>Focus: "${data.focusBehavior}"</li>
        </ul>
        <p style="background: #fdf6ef; border-left: 4px solid #E8913A; padding: 12px 16px; border-radius: 0 8px 8px 0;">
          ${data.insight}
        </p>
        ${data.mirrorReady ? '<p><a href="https://app.catalyst.coach/mirror" style="color: #E8913A;">Your Mirror Moment is ready &rarr;</a></p>' : ""}
        <hr style="border: none; border-top: 1px solid #e0ddd8; margin: 24px 0;" />
        <p style="font-size: 12px; color: #8a8580;">
          <a href="https://app.catalyst.coach/settings" style="color: #8a8580;">Adjust your settings</a> &middot;
          <a href="https://app.catalyst.coach/settings/pause" style="color: #8a8580;">Pause nudges</a>
        </p>
      </div>
    `,
  });
}
