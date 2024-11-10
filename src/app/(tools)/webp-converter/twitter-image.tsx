import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WebP to JPG/PNG Converter";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: 60,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          WebP to JPG/PNG Converter
        </h1>
        <p
          style={{
            fontSize: 30,
            textAlign: "center",
            marginTop: 20,
            color: "#666",
          }}
        >
          Convert WebP images instantly in your browser
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
