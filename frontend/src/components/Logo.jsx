export default function Logo({ size = 40, style = {} }) {
  return (
    <img
      src="/logo.png"
      alt="FinHealth AI"
      style={{
        height: size,
        width: "auto",
        maxWidth: "100%",
        ...style,
      }}
    />
  );
}
