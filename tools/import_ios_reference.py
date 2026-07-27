#!/usr/bin/env python3
"""Extract the standalone iOS bundle from a saved JustPaste page.

JustPaste renders source code as one escaped line per ``div > span`` and its
formatter removes a small, repeatable set of CSS property names. This importer
reverses only those display-layer transformations and keeps the bundled app,
runtime, resources, SVGs, state, and interaction logic intact.

Usage:
    python3 tools/import_ios_reference.py justpaste.html \
        apps/web/public/ios/index.html
"""

from __future__ import annotations

import html
import json
from pathlib import Path
import re
import sys


ARTICLE_PATTERN = re.compile(
    r'<div id="articleContent">(.*?)\n\s*</div>\n\s*'
    r'<div id="showArticleBottomWidget">',
    re.DOTALL,
)
LINE_PATTERN = re.compile(r"<div><span>(.*?)</span></div>", re.DOTALL)
TEMPLATE_PATTERN = re.compile(
    r'(<script type="__bundler/template">\s*)(".*")(\s*</script>)',
    re.DOTALL,
)


def extract_source(page: str) -> str:
    article = ARTICLE_PATTERN.search(page)
    if article is None:
        raise ValueError("Could not find JustPaste articleContent")

    lines = [html.unescape(line) for line in LINE_PATTERN.findall(article.group(1))]
    # JustPaste uses non-breaking spaces for source indentation. They are
    # visually indistinguishable, but JSON.parse only accepts the JSON-defined
    # ASCII whitespace around manifest and template payloads.
    source = "\n".join(lines).replace("\N{NO-BREAK SPACE}", " ")
    if not source.lstrip().startswith("<!DOCTYPE html>"):
        raise ValueError("The article does not contain a standalone HTML document")
    return source


def repair_inline_styles(template: str) -> str:
    def repair(match: re.Match[str]) -> str:
        declarations = match.group(1).split(";")
        fixed: list[str] = []
        for declaration in declarations:
            value = declaration.strip()
            if value and ":" not in value:
                whitespace = declaration[: len(declaration) - len(declaration.lstrip())]
                property_name = (
                    "font-family"
                    if re.search(r"[A-Za-z]", value)
                    and not re.match(r"^-?(?:\d|\.)", value)
                    else "margin"
                )
                declaration = f"{whitespace}{property_name}: {declaration.lstrip()}"
            fixed.append(declaration)
        return f'style="{";".join(fixed)}"'

    return re.sub(r'style="([^"]*)"', repair, template)


def repair_source(source: str) -> str:
    template_match = TEMPLATE_PATTERN.search(source)
    if template_match is None:
        raise ValueError("Could not find the bundled template")

    template = json.loads(template_match.group(2))
    template = template.replace("u rl(", "url(")
    template = re.sub(
        r"(@font-face\s*\{\s*)(['\"](?:Figtree|VT323)['\"]\s*;)",
        r"\1font-family: \2",
        template,
    )
    template = template.replace("body{0;", "body{margin:0;")
    template = repair_inline_styles(template)
    template = template.replace(
        "<html><head>\n<meta charset=\"utf-8\">",
        "<html><head>\n<meta charset=\"utf-8\">\n"
        "<title>Miusix · iOS tactile player</title>",
    )

    # Escaping the closing slash prevents the outer HTML parser from ending
    # the JSON script at a nested </script> inside the template.
    encoded_template = json.dumps(template, ensure_ascii=False).replace("</", r"<\/")
    source = (
        source[: template_match.start(2)]
        + encoded_template
        + source[template_match.end(2) :]
    )

    template_offset = source.find('<script type="__bundler/template">')
    outer, bundle = source[:template_offset], source[template_offset:]
    outer = re.sub(r"\* \{\s*0;", "* { margin: 0;", outer)
    outer = outer.replace(
        "min-height: 100vh;  -apple-system",
        "min-height: 100vh; font-family: -apple-system",
    )
    outer = outer.replace(
        "<title>Bundled Page</title>",
        "<title>Miusix · iOS tactile player</title>",
    )
    return outer + bundle


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: import_ios_reference.py INPUT OUTPUT")

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        repair_source(extract_source(input_path.read_text())),
        encoding="utf-8",
    )
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
