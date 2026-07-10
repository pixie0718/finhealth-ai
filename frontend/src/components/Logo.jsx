import { useTheme } from "../context/ThemeContext";

// logo.png's wordmark is light-colored, made for a dark backdrop. logo-white.png
// is the light-theme variant (dark wordmark) and reads fine directly on a light
// background, so it needs no backdrop.
export default function Logo({ size = 40, style = {} }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (isLight) {
    return (
      <img
        src="/logo-white.png"
        alt="FinHealth AI"
        style={{
          height: size,
          width: "auto",
          maxWidth: "100%",
          display: "block",
          ...style,
        }}
      />
    );
  }

  const padY = size * 0.16;
  const padX = size * 0.22;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: "#0f172a", borderRadius: size * 0.18,
      padding: `${padY}px ${padX}px`,
      lineHeight: 0,
    }}>
      <img
        src="/logo.png"
        alt="FinHealth AI"
        style={{
          height: size,
          width: "auto",
          maxWidth: "100%",
          display: "block",
          ...style,
        }}
      />
    </div>
  );
}
