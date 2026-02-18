#!/usr/bin/env python3
"""Convert design doc markdown to a styled HTML file for easy reading."""
import markdown
from pathlib import Path

DOCS_DIR = Path(__file__).parent
INPUT = DOCS_DIR / "plans" / "2026-02-18-catalyst-product-design.md"
OUTPUT = DOCS_DIR / "catalyst-design.html"

md_content = INPUT.read_text(encoding="utf-8")
html_body = markdown.markdown(md_content, extensions=["tables", "fenced_code", "toc"])

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catalyst — Product Design Document</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.7;
    color: #1B2A4A;
    background: #F8F7F4;
    max-width: 820px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }}
  h1 {{
    font-size: 2.2rem;
    margin: 40px 0 8px;
    color: #1B2A4A;
    border-bottom: 3px solid #E8913A;
    padding-bottom: 12px;
  }}
  h2 {{
    font-size: 1.5rem;
    margin: 48px 0 16px;
    color: #1B2A4A;
    border-bottom: 2px solid #e0ddd8;
    padding-bottom: 8px;
  }}
  h3 {{
    font-size: 1.2rem;
    margin: 32px 0 12px;
    color: #E8913A;
  }}
  h4 {{
    font-size: 1.05rem;
    margin: 24px 0 8px;
    color: #4A9E7D;
  }}
  p {{ margin: 12px 0; }}
  strong {{ color: #1B2A4A; }}
  ul, ol {{
    margin: 12px 0 12px 24px;
  }}
  li {{ margin: 4px 0; }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 0.92rem;
  }}
  th {{
    background: #1B2A4A;
    color: white;
    padding: 10px 14px;
    text-align: left;
    font-weight: 600;
  }}
  td {{
    padding: 10px 14px;
    border-bottom: 1px solid #e0ddd8;
    vertical-align: top;
  }}
  tr:nth-child(even) {{ background: #f0efeb; }}
  code {{
    background: #eae8e3;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'JetBrains Mono', monospace;
    font-size: 0.88rem;
  }}
  pre {{
    background: #1B2A4A;
    color: #F8F7F4;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    line-height: 1.5;
  }}
  pre code {{
    background: none;
    padding: 0;
    color: inherit;
    font-size: 0.85rem;
  }}
  blockquote {{
    border-left: 4px solid #E8913A;
    padding: 12px 20px;
    margin: 16px 0;
    background: #fdf6ef;
    border-radius: 0 8px 8px 0;
  }}
  hr {{
    border: none;
    border-top: 2px solid #e0ddd8;
    margin: 40px 0;
  }}
  a {{ color: #E8913A; text-decoration: none; }}
  a:hover {{ text-decoration: underline; }}
  .toc {{ background: #fff; padding: 20px 30px; border-radius: 8px; margin: 24px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
  .toc ul {{ list-style: none; margin-left: 0; }}
  .toc li {{ margin: 6px 0; }}
  @media (max-width: 600px) {{
    body {{ padding: 20px 16px 60px; }}
    h1 {{ font-size: 1.6rem; }}
    h2 {{ font-size: 1.25rem; }}
    table {{ font-size: 0.82rem; }}
    th, td {{ padding: 8px 10px; }}
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

OUTPUT.write_text(html, encoding="utf-8")
print(f"Generated: {{OUTPUT}}")
