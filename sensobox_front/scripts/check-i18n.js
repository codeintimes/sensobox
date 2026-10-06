#!/usr/bin/env node
/*
 * Comprueba la traducción del frontend de Sensobox.
 *   1. Los cinco idiomas (es, en, nl, de, fr) tienen exactamente las mismas claves, sin valores vacíos
 *      y con las mismas variables {{...}} que el español.
 *   2. Todas las claves que se usan en el código con t("...") existen en es.json.
 *   3. No hay cadenas fijas visibles en los componentes: texto JSX, atributos de texto (label, title,
 *      placeholder, aria-label, subtitle, helperText, headerName…) y literales dentro de llaves JSX.
 *      Para dejar pasar a propósito una línea concreta, añade el comentario «i18n-ignore» en ella.
 * Uso: node scripts/check-i18n.js   (sale con código 1 si encuentra algún problema)
 */
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const ROOT = path.resolve(__dirname, "..");
const LOCALES = path.join(ROOT, "src", "locales");
const LANGS = ["es", "en", "nl", "de", "fr"];
const problems = [];

const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === "object") flat(v, p + k + ".", out);
    else out[p + k] = v;
  }
  return out;
};
const vars = (s) => (String(s).match(/\{\{\s*[\w.]+\s*\}\}/g) || []).map((x) => x.replace(/\s/g, "")).sort().join(",");

// 1. Claves por idioma
const dict = {};
for (const l of LANGS) dict[l] = flat(JSON.parse(fs.readFileSync(path.join(LOCALES, `${l}.json`), "utf8")));
const base = dict.es;
for (const l of LANGS) {
  for (const k of Object.keys(base)) {
    if (!(k in dict[l])) problems.push(`[${l}] falta la clave ${k}`);
    else if (typeof dict[l][k] === "string" && !dict[l][k].trim()) problems.push(`[${l}] valor vacío en ${k}`);
    else if (vars(dict[l][k]) !== vars(base[k])) problems.push(`[${l}] variables distintas en ${k}: «${dict[l][k]}»`);
  }
  for (const k of Object.keys(dict[l])) if (!(k in base)) problems.push(`[${l}] clave sobrante ${k}`);
}

// 2 y 3. Recorrido del código
const TEXT_ATTRS = new Set(["label", "title", "placeholder", "aria-label", "alt", "subtitle", "helperText", "headerName", "tooltip", "text", "description", "foot", "unit", "k", "v", "sub", "noOptionsText", "emptyText"]);
const TEXT_PROPS = new Set(["headerName", "label", "title", "subtitle", "sub", "description", "placeholder", "section", "message"]);
const isWords = (s) => /[A-Za-zÀ-ÿ]{2,}/.test(s) && !/^[\w-]+\.[\w.-]+$/.test(s.trim());
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) { if (!["locales", "data"].includes(e.name)) walk(p); }
  else if (/\.(jsx?|tsx?)$/.test(e.name) && !/\.test\./.test(e.name)) files.push(p);
});
walk(path.join(ROOT, "src"));

const usedKeys = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split("\n");
  const rel = path.relative(ROOT, f);
  let ast;
  try { ast = parser.parse(src, { sourceType: "module", plugins: ["jsx"] }); }
  catch (e) { problems.push(`${rel}: no se puede analizar (${e.message})`); continue; }
  const report = (node, what, text) => {
    const ln = node.loc.start.line;
    if (/i18n-ignore/.test(lines[ln - 1] || "")) return;
    problems.push(`${rel}:${ln} ${what}: «${String(text).trim().slice(0, 70)}»`);
  };
  const insideT = (p) => p.findParent((q) => q.isCallExpression() && ["t", "i18n.t"].includes(q.get("callee").toString()));
  traverse(ast, {
    CallExpression(p) {
      const c = p.get("callee").toString();
      if ((c === "t" || c === "i18n.t") && p.node.arguments[0]) {
        const a = p.node.arguments[0];
        if (a.type === "StringLiteral") {
          usedKeys.add(a.value);
          if (!(a.value in base) && !(a.value + "_other" in base) && !Object.keys(base).some((k) => k.startsWith(a.value + "."))) report(a, "clave inexistente en es.json", a.value);
        }
      }
      // Fechas y números deben pasar por utils/format.js (idioma activo), no por el idioma del navegador ni uno fijo
      if (/\.toLocale(Date|Time)?String$/.test(c) && !rel.endsWith(path.join("utils", "format.js")))
        report(p.node, "formato de fecha/número sin utils/format", c);
      // alert/confirm y mensajes de validación de yup (required, email, min, matches…) con texto fijo
      const YUP = ["required", "email", "min", "max", "matches", "positive", "integer", "typeError", "oneOf", "moreThan", "lessThan", "url"];
      const isAlert = ["alert", "window.alert", "confirm", "window.confirm"].includes(c);
      const isYup = p.node.callee.type === "MemberExpression" && YUP.includes(p.node.callee.property.name);
      if (isAlert || isYup) {
        p.get("arguments").forEach((ap) => {
          const lits = ap.isStringLiteral() ? [ap.node] : [];
          ap.traverse({ StringLiteral(x) { if (!insideT(x)) lits.push(x.node); }, TemplateLiteral(x) { x.node.quasis.forEach((q) => lits.push({ ...q, value: q.value.cooked })); } });
          lits.filter((l) => isWords(l.value)).forEach((l) => report(l, isAlert ? "texto fijo en alert/confirm" : "mensaje de validación fijo", l.value));
        });
      }
    },
    JSXText(p) {
      if (isWords(p.node.value)) report(p.node, "texto JSX fijo", p.node.value);
    },
    JSXAttribute(p) {
      const name = p.node.name.name;
      const v = p.node.value;
      if (!TEXT_ATTRS.has(name) || !v) return;
      if (v.type === "StringLiteral" && isWords(v.value)) report(v, `atributo ${name} fijo`, v.value);
    },
    StringLiteral(p) {
      if (!isWords(p.node.value) || insideT(p)) return;
      const par = p.parentPath;
      // literal como hijo JSX ({"texto"}) o en un ternario/&&/|| que acaba en hijo JSX o atributo de texto
      let q = p;
      while (q.parentPath && (q.parentPath.isConditionalExpression() || q.parentPath.isLogicalExpression() || (q.parentPath.isBinaryExpression() && q.parentPath.node.operator === "+"))) {
        if (q.parentPath.isConditionalExpression() && q.key === "test") return;
        q = q.parentPath;
      }
      if (q.parentPath && q.parentPath.isJSXExpressionContainer()) {
        const holder = q.parentPath.parentPath;
        if (holder.isJSXElement() || holder.isJSXFragment()) return report(p.node, "literal en JSX", p.node.value);
        if (holder.isJSXAttribute() && TEXT_ATTRS.has(holder.node.name.name)) return report(p.node, `atributo ${holder.node.name.name} fijo`, p.node.value);
      }
      if (par.isObjectProperty() && p.key === "value") {
        const k = par.node.key.name || par.node.key.value;
        if (TEXT_PROPS.has(k)) report(p.node, `propiedad ${k} fija`, p.node.value);
      }
    },
    TemplateLiteral(p) {
      if (insideT(p)) return;
      const txt = p.node.quasis.map((q) => q.value.cooked).join(" ");
      if (!/[A-Za-zÀ-ÿ]{3,}/.test(txt.replace(/https?:\S+|\/[\w/-]*|Bearer|order_|[\w-]+\.pdf/g, ""))) return;
      let q = p;
      while (q.parentPath && (q.parentPath.isConditionalExpression() || q.parentPath.isLogicalExpression())) q = q.parentPath;
      if (q.parentPath && q.parentPath.isJSXExpressionContainer()) {
        const holder = q.parentPath.parentPath;
        if (holder.isJSXElement() || holder.isJSXFragment() || (holder.isJSXAttribute() && TEXT_ATTRS.has(holder.node.name.name)))
          report(p.node, "plantilla con texto fijo", txt);
      }
      if (q.parentPath && q.parentPath.isObjectProperty() && q.key === "value") {
        const k = q.parentPath.node.key.name || q.parentPath.node.key.value;
        if (TEXT_PROPS.has(k)) report(p.node, `propiedad ${k} con texto fijo`, txt);
      }
    },
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n✘ ${problems.length} problema(s) de traducción`);
  process.exit(1);
}
console.log(`✔ ${Object.keys(base).length} claves en ${LANGS.join(", ")}; ${files.length} ficheros sin cadenas fijas; ${usedKeys.size} claves usadas en el código`);
