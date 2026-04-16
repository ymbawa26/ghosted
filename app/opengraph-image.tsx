import { ImageResponse } from "next/og";

export const alt = "Ghosted job-post intelligence preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, rgb(247, 244, 236) 0%, rgb(238, 234, 225) 60%, rgb(226, 239, 241) 100%)",
          color: "rgb(15, 27, 37)",
          fontFamily: "Aptos, Avenir Next, Segoe UI, sans-serif",
          padding: "56px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(15,27,37,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,27,37,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid rgba(15, 27, 37, 0.08)",
            borderRadius: "32px",
            background: "rgba(255,255,255,0.78)",
            padding: "48px",
            boxShadow: "0 24px 80px rgba(2,16,24,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <div
                style={{
                  height: "68px",
                  width: "68px",
                  borderRadius: "999px",
                  background: "rgb(16, 34, 43)",
                  color: "rgb(241, 237, 228)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                }}
              >
                G
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "44px", fontWeight: 700 }}>Ghosted</div>
                <div
                  style={{
                    fontSize: "18px",
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgb(31, 111, 120)",
                  }}
                >
                  Evaluate the job post
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 24px",
                borderRadius: "999px",
                background: "rgb(16, 34, 43)",
                color: "white",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Explainable scoring
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                fontSize: "20px",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "rgb(31, 111, 120)",
              }}
            >
              Public-facing job-post intelligence
            </div>
            <div
              style={{
                fontSize: "74px",
                lineHeight: 1.05,
                fontWeight: 700,
                maxWidth: "900px",
              }}
            >
              See whether a job posting looks worth your time.
            </div>
            <div
              style={{
                fontSize: "28px",
                lineHeight: 1.45,
                maxWidth: "860px",
                color: "rgba(15, 27, 37, 0.72)",
              }}
            >
              Ghosted evaluates jobs, not applicants, using signals for seriousness,
              transparency, clarity, requirement inflation, and applicant ROI.
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", fontSize: "22px" }}>
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(31, 111, 120, 0.12)",
                color: "rgb(31, 111, 120)",
              }}
            >
              Seriousness
            </div>
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(31, 111, 120, 0.12)",
                color: "rgb(31, 111, 120)",
              }}
            >
              Transparency
            </div>
            <div
              style={{
                padding: "14px 20px",
                borderRadius: "999px",
                background: "rgba(31, 111, 120, 0.12)",
                color: "rgb(31, 111, 120)",
              }}
            >
              Applicant ROI
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
