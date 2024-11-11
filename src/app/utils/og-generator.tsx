import { ImageResponse } from "next/og";

export async function GenerateImage(params: {
  title: string;
  description?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "20px",
            }}
          >
            {params.title}
          </h1>
          {params.description && (
            <p
              style={{
                fontSize: "30px",
                color: "#888",
              }}
            >
              {params.description}
            </p>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
