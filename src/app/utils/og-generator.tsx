import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export async function GenerateImage(params: {
  title: string;
  description?: string;
}) {
  // Fonts
  const interSemiBold = fetch(
    new URL("../fonts/Inter-SemiBold.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const interLight = fetch(
    new URL("../fonts/Inter-Light.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 160,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span style={{ fontWeight: 600 }}>{params.title}</span>
          <span style={{ fontSize: 40, fontWeight: 300 }}>
            {params.description}
          </span>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Inter",
          data: await interLight,
          style: "normal",
          weight: 300,
        },
      ],
    },
  );
}
