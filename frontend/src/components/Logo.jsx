// logo.png's wordmark is rendered in light text for a dark background — on a
// light theme header it's nearly invisible. Give it a fixed dark backdrop so
// it reads correctly regardless of the page's own light/dark theme.
export default function Logo({ size = 40, style = {} }) {
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
