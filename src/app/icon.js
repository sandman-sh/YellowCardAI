import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B3B24",
          borderRadius: "4px",
        }}
      >
        {/* Yellow card shape */}
        <div
          style={{
            width: "18px",
            height: "24px",
            background: "#FFD700",
            border: "2px solid #000000",
            borderRadius: "2px",
            transform: "rotate(6deg)",
            boxShadow: "2px 2px 0px 0px #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "2px",
              background: "#000000",
              borderRadius: "1px",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
