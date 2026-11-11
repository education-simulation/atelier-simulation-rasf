import katex from "katex";
import "katex/dist/katex.min.css";

export function MathTex({ tex, display = false, size = "normal" }) {
  try {
    let cleaned = typeof tex === "string" ? tex : "";
    // Restaure les séquences d'échappement mangées par les chaînes JS sans double backslash :
    // \f (form-feed, code 12) -> \f
    // \r (carriage return, code 13) -> \r
    // \t (horizontal tab, code 9) -> \t
    // \b (backspace, code 8) -> \b
    // \v (vertical tab, code 11) -> \v
    cleaned = cleaned
      .replace(/\u000c/g, "\\f")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\u0008/g, "\\b")
      .replace(/\u000b/g, "\\v");

    const html = katex.renderToString(cleaned, {
      displayMode: display,
      throwOnError: false,
    });
    const scale = size === "large" ? "1.4em" : size === "xl" ? "1.75em" : size === "xxl" ? "2.1em" : "1em";
    return (
      <span
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          display: display ? "block" : "inline-block",
          margin: display ? "8px 0" : "0 2px",
          fontSize: scale,
          verticalAlign: display ? "baseline" : "-0.15em",
        }}
      />
    );
  } catch (e) {
    return <span>{tex}</span>;
  }
}
