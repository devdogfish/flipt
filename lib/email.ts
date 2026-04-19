export function emailButton(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#FED43F;color:#1a1a1a;font-weight:600;font-size:14px;padding:11px 24px;border-radius:20px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-0.01em;">${label}</a>`;
}

export function emailWrapper(body: string, url: string) {
  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f9f8f6;margin:0;padding:48px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:480px;margin:0 auto;">
  <div style="margin-bottom:28px;">
    <span style="font-size:16px;font-weight:700;letter-spacing:-0.5px;color:#1a1a1a;">Flashcardbrowser<span style="color:#FED43F;">.</span></span>
  </div>
  <div style="background:#fff;border-radius:16px;padding:36px;border:1px solid #e8e6e1;">
    ${body}
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0ede8;">
      <p style="color:#999;font-size:12px;margin:0 0 6px;">Or paste this link into your browser:</p>
      <p style="color:#bbb;font-size:11px;margin:0;word-break:break-all;">${url}</p>
    </div>
  </div>
  <p style="color:#bbb;font-size:11px;text-align:center;margin:20px 0 0;">If you didn't request this, ignore this email.</p>
</div>
</body></html>`;
}
