#!/usr/bin/env python3
"""
Psychological Safety Project Brain Validator
=============================================
Tests the completeness, quality, and consistency of the research outputs.
Generates a detailed quality report with specific gaps and recommendations.
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_DIR = Path(__file__).parent
REPORT_FILE = PROJECT_DIR / "VALIDATION_REPORT.md"

# ============================================================
# EXPECTED FILES
# ============================================================
EXPECTED_FILES = {
    "PROJECT_BRAIN.md": "Master synthesis document",
    "Psychological_Safety_Deep_Research.md": "Foundations & academic research",
    "Benefits_of_Psychological_Safety_Research.md": "Benefits across dimensions",
    "risks_and_consequences_of_no_psychological_safety.md": "Risks & case studies",
    "Tech_Organizations_Psychological_Safety.md": "Large tech org practices",
    "Innovative_Nudges_and_Coaching_Research.md": "Nudge-based coaching",
    "David_Rock_Neuroscience_Research.md": "Neuroscience & SCARF model",
    "Adjacent_Frameworks_and_Researchers.md": "Adjacent frameworks (Brown, Scott, etc.)",
    "Executive_Nudge_Design_Research.md": "Executive nudge mechanism design",
    "AI_Product_Landscape_Research.md": "AI products & ideal product design",
}

# ============================================================
# TOPIC COVERAGE REQUIREMENTS
# ============================================================
# Each entry: (topic_name, required_keywords, min_keyword_matches, files_to_check)
TOPIC_REQUIREMENTS = [
    # --- Foundations ---
    ("Amy Edmondson's Definition",
     ["edmondson", "interpersonal risk", "fearless organization", "shared belief"],
     3, ["Psychological_Safety_Deep_Research.md", "PROJECT_BRAIN.md"]),

    ("Timothy Clark's 4 Stages",
     ["inclusion safety", "learner safety", "contributor safety", "challenger safety", "clark"],
     4, ["Psychological_Safety_Deep_Research.md", "PROJECT_BRAIN.md"]),

    ("Edmondson's 7-Item Survey",
     ["mistake.*held against", "bring up problems", "safe to take a risk", "seven", "7-item", "survey"],
     3, ["Psychological_Safety_Deep_Research.md", "PROJECT_BRAIN.md"]),

    ("Learning Zone Framework (2x2)",
     ["comfort zone", "anxiety zone", "learning zone", "apathy zone", "accountability"],
     3, ["Psychological_Safety_Deep_Research.md", "PROJECT_BRAIN.md"]),

    ("Common Misconceptions",
     ["misconception", "not about being nice", "not about comfort", "accountability"],
     2, ["Psychological_Safety_Deep_Research.md"]),

    # --- Neuroscience ---
    ("David Rock SCARF Model",
     ["scarf", "status", "certainty", "autonomy", "relatedness", "fairness", "david rock"],
     5, ["David_Rock_Neuroscience_Research.md", "PROJECT_BRAIN.md"]),

    ("Threat vs Reward Response",
     ["threat", "reward", "amygdala", "prefrontal cortex", "fight.*flight", "limbic"],
     3, ["David_Rock_Neuroscience_Research.md"]),

    ("Toward vs Away State",
     ["toward", "away", "approach", "avoidance"],
     2, ["David_Rock_Neuroscience_Research.md"]),

    ("NeuroLeadership Institute",
     ["neuroleadership", "nli", "seeds model", "bias"],
     2, ["David_Rock_Neuroscience_Research.md"]),

    # --- Benefits ---
    ("Benefits for Organizations",
     ["roi", "turnover", "productivity", "revenue", "engagement"],
     4, ["Benefits_of_Psychological_Safety_Research.md", "PROJECT_BRAIN.md"]),

    ("Benefits for Teams",
     ["team performance", "collaboration", "knowledge sharing", "idea generation"],
     3, ["Benefits_of_Psychological_Safety_Research.md"]),

    ("Benefits for Leaders",
     ["executive", "leader", "decision", "feedback", "strategic"],
     3, ["Benefits_of_Psychological_Safety_Research.md"]),

    ("Benefits for Individuals",
     ["wellbeing", "burnout", "belonging", "motivation", "engagement"],
     3, ["Benefits_of_Psychological_Safety_Research.md"]),

    ("Benefits for Innovation",
     ["innovation", "experimentation", "risk-taking", "creativity", "fail fast"],
     3, ["Benefits_of_Psychological_Safety_Research.md"]),

    ("DEI / Equity Connection",
     ["dei", "equity", "diversity", "inclusion", "bipoc", "lgbtq", "neurodiver", "great equalizer"],
     3, ["Benefits_of_Psychological_Safety_Research.md"]),

    # --- Risks ---
    ("Boeing 737 MAX Case",
     ["boeing", "737", "max", "346", "silence"],
     3, ["risks_and_consequences_of_no_psychological_safety.md"]),

    ("NASA Challenger/Columbia",
     ["nasa", "challenger", "columbia", "groupthink"],
     3, ["risks_and_consequences_of_no_psychological_safety.md"]),

    ("Wells Fargo Scandal",
     ["wells fargo", "fake account", "intimidation"],
     2, ["risks_and_consequences_of_no_psychological_safety.md"]),

    ("Volkswagen Emissions",
     ["volkswagen", "emission", "defeat device"],
     2, ["risks_and_consequences_of_no_psychological_safety.md"]),

    ("Nokia Decline",
     ["nokia", "frightened", "middle manager"],
     2, ["risks_and_consequences_of_no_psychological_safety.md"]),

    ("Financial Costs of No Safety",
     ["trillion", "billion", "cost", "disengagement"],
     3, ["risks_and_consequences_of_no_psychological_safety.md", "PROJECT_BRAIN.md"]),

    # --- Tech Organizations ---
    ("Google Project Aristotle",
     ["project aristotle", "180", "team", "keystone", "julia rozovsky", "five dynamics"],
     4, ["Tech_Organizations_Psychological_Safety.md", "PROJECT_BRAIN.md"]),

    ("Microsoft Growth Mindset",
     ["nadella", "growth mindset", "know-it-all", "learn-it-all", "model-coach-care"],
     4, ["Tech_Organizations_Psychological_Safety.md", "PROJECT_BRAIN.md"]),

    ("Pixar Braintrust",
     ["pixar", "braintrust", "catmull", "candor", "no authority"],
     4, ["Tech_Organizations_Psychological_Safety.md", "PROJECT_BRAIN.md"]),

    ("Netflix Culture",
     ["netflix", "4a", "feedback", "keeper test", "freedom and responsibility"],
     3, ["Tech_Organizations_Psychological_Safety.md"]),

    ("Spotify Squad Model",
     ["spotify", "squad", "health check", "tribe", "blameless"],
     3, ["Tech_Organizations_Psychological_Safety.md"]),

    # --- Innovative Nudges ---
    ("Nudge Theory Foundation",
     ["thaler", "sunstein", "choice architecture", "nudge", "feast"],
     3, ["Innovative_Nudges_and_Coaching_Research.md"]),

    ("Humu / Perceptyx",
     ["humu", "perceptyx", "laszlo bock", "nudge engine"],
     3, ["Innovative_Nudges_and_Coaching_Research.md", "PROJECT_BRAIN.md"]),

    ("Email-Based Nudges",
     ["textio", "email", "grammarly", "perceptyx"],
     2, ["Innovative_Nudges_and_Coaching_Research.md"]),

    ("Slack/Teams Nudges",
     ["slack", "teams", "kona", "arist"],
     3, ["Innovative_Nudges_and_Coaching_Research.md"]),

    ("Meeting Nudges",
     ["meeting", "slido", "mentimeter", "speaking time", "round-robin"],
     3, ["Innovative_Nudges_and_Coaching_Research.md"]),

    ("AI Coaching Platforms",
     ["betterup", "coachhub", "valence", "cloverleaf"],
     3, ["Innovative_Nudges_and_Coaching_Research.md"]),

    ("Closed-Loop Nudge Architecture",
     ["measure", "identify", "nudge", "track", "re-measure", "iterate", "closed.?loop"],
     4, ["Innovative_Nudges_and_Coaching_Research.md", "PROJECT_BRAIN.md"]),

    # --- Adjacent Frameworks ---
    ("Kim Scott Radical Candor",
     ["kim scott", "radical candor", "ruinous empathy", "care personally", "challenge directly"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Brene Brown Vulnerability",
     ["brene brown", "vulnerability", "dare to lead", "braving", "courage", "shame"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Patrick Lencioni Five Dysfunctions",
     ["lencioni", "five dysfunctions", "absence of trust", "fear of conflict"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Edgar Schein Humble Inquiry",
     ["schein", "humble inquiry", "organizational culture"],
     2, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Daniel Coyle Culture Code",
     ["coyle", "culture code", "belonging cue", "safety signal", "vulnerability loop"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Polyvagal Theory",
     ["polyvagal", "porges", "vagal", "neuroception", "ventral"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    ("Self-Determination Theory",
     ["self-determination", "deci", "ryan", "autonomy", "competence", "relatedness"],
     3, ["Adjacent_Frameworks_and_Researchers.md"]),

    # --- Executive Nudge Design ---
    ("Executive Coaching Audience",
     ["executive", "time-poor", "perception gap", "ceo bubble", "status threat"],
     3, ["Executive_Nudge_Design_Research.md"]),

    ("Habit Formation for Leaders",
     ["habit", "fogg", "atomic habits", "tiny habits", "cue.*routine.*reward"],
     2, ["Executive_Nudge_Design_Research.md"]),

    ("Micro-Behaviors",
     ["micro-behavior", "ask.*question", "fallibility", "thank.*speaking up", "help me understand"],
     2, ["Executive_Nudge_Design_Research.md"]),

    ("Contextual Triggers",
     ["before.*1:1", "before.*meeting", "engagement scores", "performance review", "trigger"],
     2, ["Executive_Nudge_Design_Research.md"]),

    ("Behavioral Economics for Execs",
     ["loss aversion", "social proof", "commitment device", "fresh start", "implementation intention"],
     3, ["Executive_Nudge_Design_Research.md"]),

    # --- AI Product Landscape ---
    ("Current Product Landscape",
     ["product", "platform", "landscape", "comparison"],
     2, ["AI_Product_Landscape_Research.md"]),

    ("Ideal AI Product Design",
     ["ideal", "next.?generation", "personalization", "cascade"],
     2, ["AI_Product_Landscape_Research.md"]),

    ("AI-Driven Organization Context",
     ["ai.*era", "ai.*anxiety", "ai.*adoption", "ai.*transform"],
     2, ["AI_Product_Landscape_Research.md"]),

    ("Cascade Model",
     ["cascade", "ripple", "model.*behavior", "propagat"],
     2, ["AI_Product_Landscape_Research.md"]),

    ("Emerging AI Capabilities",
     ["llm", "sentiment analysis", "digital twin", "agentic", "voice analysis"],
     2, ["AI_Product_Landscape_Research.md"]),
]

# ============================================================
# CITATION QUALITY REQUIREMENTS
# ============================================================
CITATION_PATTERNS = [
    r'https?://[^\s\)]+',           # URLs
    r'\(\d{4}\)',                     # Year citations like (2024)
    r'\d{4}\)',                       # Year at end of citation
    r'HBR|Harvard Business Review',
    r'McKinsey',
    r'Gallup',
    r'APA|American Psychological',
    r'MIT',
    r'Google',
    r'Edmondson',
]

MIN_CITATIONS_PER_FILE = {
    "PROJECT_BRAIN.md": 15,
    "Psychological_Safety_Deep_Research.md": 10,
    "Benefits_of_Psychological_Safety_Research.md": 10,
    "risks_and_consequences_of_no_psychological_safety.md": 10,
    "Tech_Organizations_Psychological_Safety.md": 10,
    "Innovative_Nudges_and_Coaching_Research.md": 10,
    "David_Rock_Neuroscience_Research.md": 5,
    "Adjacent_Frameworks_and_Researchers.md": 10,
    "Executive_Nudge_Design_Research.md": 5,
    "AI_Product_Landscape_Research.md": 5,
}

# ============================================================
# QUANTITATIVE DATA REQUIREMENTS (stats should be present)
# ============================================================
REQUIRED_STATISTICS = [
    ("230%", "ROI on psychological safety investment"),
    ("8.8 trillion", "Global disengagement cost"),
    ("27%", "Turnover reduction"),
    ("87%", "Executive perception of safety"),
    ("53%", "IC perception of safety (risk-taking)"),
    ("2.5", "Times more likely to be high-performing (Google)"),
    ("346", "Boeing 737 MAX deaths"),
    ("180", "Google teams studied"),
    ("300 billion", "Microsoft market cap at Nadella start"),
    ("2.4 trillion", "Microsoft market cap post-transformation"),
    ("83%", "Leaders say safety impacts AI success"),
]

# ============================================================
# CROSS-REFERENCE CHECKS
# ============================================================
CROSS_REFERENCES = [
    ("PROJECT_BRAIN.md", "edmondson", "Edmondson referenced in master doc"),
    ("PROJECT_BRAIN.md", "scarf", "SCARF model referenced in master doc"),
    ("PROJECT_BRAIN.md", "brene brown", "Brene Brown referenced in master doc"),
    ("PROJECT_BRAIN.md", "radical candor", "Radical Candor referenced in master doc"),
    ("PROJECT_BRAIN.md", "lencioni", "Lencioni referenced in master doc"),
    ("PROJECT_BRAIN.md", "polyvagal", "Polyvagal Theory referenced in master doc"),
    ("PROJECT_BRAIN.md", "david rock", "David Rock referenced in master doc"),
    ("PROJECT_BRAIN.md", "coyle", "Daniel Coyle referenced in master doc"),
    ("PROJECT_BRAIN.md", "schein", "Edgar Schein referenced in master doc"),
    ("PROJECT_BRAIN.md", "self-determination", "Self-Determination Theory referenced in master doc"),
    ("PROJECT_BRAIN.md", "nudge.*design", "Nudge design referenced in master doc"),
    ("PROJECT_BRAIN.md", "ai.*product", "AI product landscape referenced in master doc"),
]

# ============================================================
# RECENCY CHECK -- should contain 2024-2026 sources
# ============================================================
RECENCY_YEARS = ["2024", "2025", "2026"]
MIN_RECENT_REFS_PER_FILE = 3


def read_file(filepath):
    """Read file content, return empty string if not found."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def count_words(text):
    return len(text.split())


def count_sections(text):
    """Count markdown headers (## and ###)."""
    return len(re.findall(r'^#{1,4}\s+', text, re.MULTILINE))


def count_urls(text):
    return len(re.findall(r'https?://[^\s\)\]]+', text))


def count_tables(text):
    return len(re.findall(r'\|.*\|.*\|', text)) // 3  # rough table count


def check_keyword_presence(text, keywords):
    """Check how many keywords appear in text (case-insensitive)."""
    text_lower = text.lower()
    found = []
    missing = []
    for kw in keywords:
        if re.search(kw.lower(), text_lower):
            found.append(kw)
        else:
            missing.append(kw)
    return found, missing


def run_validation():
    """Run all validation checks and generate report."""

    results = {
        "file_checks": [],
        "topic_checks": [],
        "citation_checks": [],
        "stat_checks": [],
        "cross_ref_checks": [],
        "recency_checks": [],
        "quality_scores": {},
        "gaps": [],
        "recommendations": [],
    }

    all_content = {}
    total_words = 0
    total_sources = 0

    # ============================================================
    # 1. FILE EXISTENCE AND SIZE CHECKS
    # ============================================================
    print("=" * 60)
    print("PHASE 1: File Existence & Size Checks")
    print("=" * 60)

    for filename, description in EXPECTED_FILES.items():
        filepath = PROJECT_DIR / filename
        content = read_file(filepath)
        exists = len(content) > 0
        words = count_words(content) if exists else 0
        sections = count_sections(content) if exists else 0
        urls = count_urls(content) if exists else 0

        all_content[filename] = content
        total_words += words
        total_sources += urls

        status = "PASS" if exists and words > 1000 else "FAIL" if not exists else "WARN"

        result = {
            "file": filename,
            "description": description,
            "exists": exists,
            "words": words,
            "sections": sections,
            "urls": urls,
            "status": status,
        }
        results["file_checks"].append(result)

        icon = "PASS" if status == "PASS" else "FAIL" if status == "FAIL" else "WARN"
        print(f"  [{icon}] {filename}: {words:,} words, {sections} sections, {urls} URLs")

        if not exists:
            results["gaps"].append(f"MISSING FILE: {filename} ({description})")
        elif words < 1000:
            results["gaps"].append(f"THIN CONTENT: {filename} has only {words} words (expected 1000+)")

    # ============================================================
    # 2. TOPIC COVERAGE CHECKS
    # ============================================================
    print("\n" + "=" * 60)
    print("PHASE 2: Topic Coverage Checks")
    print("=" * 60)

    topic_pass = 0
    topic_total = len(TOPIC_REQUIREMENTS)

    for topic_name, keywords, min_matches, files_to_check in TOPIC_REQUIREMENTS:
        combined_text = ""
        for f in files_to_check:
            combined_text += " " + all_content.get(f, "")

        found, missing = check_keyword_presence(combined_text, keywords)
        passed = len(found) >= min_matches

        if passed:
            topic_pass += 1

        status = "PASS" if passed else "FAIL"
        result = {
            "topic": topic_name,
            "found": found,
            "missing": missing,
            "required": min_matches,
            "actual": len(found),
            "status": status,
            "files": files_to_check,
        }
        results["topic_checks"].append(result)

        icon = "PASS" if passed else "FAIL"
        if not passed:
            print(f"  [{icon}] {topic_name}: {len(found)}/{min_matches} keywords found. Missing: {missing}")
            results["gaps"].append(
                f"TOPIC GAP: '{topic_name}' -- missing keywords: {', '.join(missing)} in {', '.join(files_to_check)}"
            )
        else:
            print(f"  [{icon}] {topic_name}: {len(found)}/{len(keywords)} keywords found")

    # ============================================================
    # 3. CITATION QUALITY CHECKS
    # ============================================================
    print("\n" + "=" * 60)
    print("PHASE 3: Citation Quality Checks")
    print("=" * 60)

    for filename, min_citations in MIN_CITATIONS_PER_FILE.items():
        content = all_content.get(filename, "")
        if not content:
            results["citation_checks"].append({
                "file": filename, "urls": 0, "min": min_citations, "status": "SKIP"
            })
            continue

        url_count = count_urls(content)
        passed = url_count >= min_citations
        status = "PASS" if passed else "FAIL"

        results["citation_checks"].append({
            "file": filename, "urls": url_count, "min": min_citations, "status": status
        })

        icon = "PASS" if passed else "FAIL"
        print(f"  [{icon}] {filename}: {url_count} URLs (min: {min_citations})")

        if not passed:
            results["gaps"].append(
                f"LOW CITATIONS: {filename} has {url_count} URLs (expected {min_citations}+)"
            )

    # ============================================================
    # 4. KEY STATISTICS PRESENCE
    # ============================================================
    print("\n" + "=" * 60)
    print("PHASE 4: Key Statistics Verification")
    print("=" * 60)

    all_text = " ".join(all_content.values())

    for stat_value, stat_description in REQUIRED_STATISTICS:
        found = stat_value.lower() in all_text.lower()
        status = "PASS" if found else "FAIL"

        results["stat_checks"].append({
            "stat": stat_value, "description": stat_description, "found": found, "status": status
        })

        icon = "PASS" if found else "FAIL"
        if not found:
            print(f"  [{icon}] '{stat_value}' ({stat_description}) -- NOT FOUND")
            results["gaps"].append(f"MISSING STAT: '{stat_value}' ({stat_description})")
        else:
            print(f"  [{icon}] '{stat_value}' ({stat_description})")

    # ============================================================
    # 5. CROSS-REFERENCE CHECKS
    # ============================================================
    print("\n" + "=" * 60)
    print("PHASE 5: Cross-Reference Checks (PROJECT_BRAIN.md)")
    print("=" * 60)

    for filename, keyword, description in CROSS_REFERENCES:
        content = all_content.get(filename, "")
        found = bool(re.search(keyword, content, re.IGNORECASE))
        status = "PASS" if found else "FAIL"

        results["cross_ref_checks"].append({
            "file": filename, "keyword": keyword, "description": description,
            "found": found, "status": status
        })

        icon = "PASS" if found else "FAIL"
        if not found:
            print(f"  [{icon}] {description}")
            results["gaps"].append(f"CROSS-REF GAP: {description} ('{keyword}' not in {filename})")
        else:
            print(f"  [{icon}] {description}")

    # ============================================================
    # 6. RECENCY CHECKS
    # ============================================================
    print("\n" + "=" * 60)
    print("PHASE 6: Source Recency Checks (2024-2026)")
    print("=" * 60)

    for filename in EXPECTED_FILES:
        content = all_content.get(filename, "")
        if not content:
            continue

        recent_count = 0
        for year in RECENCY_YEARS:
            recent_count += len(re.findall(year, content))

        passed = recent_count >= MIN_RECENT_REFS_PER_FILE
        status = "PASS" if passed else "WARN"

        results["recency_checks"].append({
            "file": filename, "recent_refs": recent_count, "status": status
        })

        icon = "PASS" if passed else "WARN"
        if not passed:
            print(f"  [{icon}] {filename}: {recent_count} recent year references (want {MIN_RECENT_REFS_PER_FILE}+)")
            results["gaps"].append(f"LOW RECENCY: {filename} has only {recent_count} references to 2024-2026")
        else:
            print(f"  [{icon}] {filename}: {recent_count} recent year references")

    # ============================================================
    # SCORING
    # ============================================================

    file_score = sum(1 for c in results["file_checks"] if c["status"] == "PASS") / max(len(results["file_checks"]), 1)
    topic_score = topic_pass / max(topic_total, 1)
    citation_score = sum(1 for c in results["citation_checks"] if c["status"] == "PASS") / max(len([c for c in results["citation_checks"] if c["status"] != "SKIP"]), 1)
    stat_score = sum(1 for c in results["stat_checks"] if c["found"]) / max(len(results["stat_checks"]), 1)
    crossref_score = sum(1 for c in results["cross_ref_checks"] if c["found"]) / max(len(results["cross_ref_checks"]), 1)

    overall_score = (
        file_score * 0.15 +
        topic_score * 0.35 +
        citation_score * 0.15 +
        stat_score * 0.15 +
        crossref_score * 0.20
    )

    results["quality_scores"] = {
        "file_completeness": round(file_score * 100, 1),
        "topic_coverage": round(topic_score * 100, 1),
        "citation_quality": round(citation_score * 100, 1),
        "statistics_presence": round(stat_score * 100, 1),
        "cross_references": round(crossref_score * 100, 1),
        "overall": round(overall_score * 100, 1),
    }

    # ============================================================
    # GENERATE RECOMMENDATIONS
    # ============================================================

    if file_score < 1.0:
        missing = [c["file"] for c in results["file_checks"] if c["status"] == "FAIL"]
        results["recommendations"].append(f"CREATE missing files: {', '.join(missing)}")

    thin_files = [c["file"] for c in results["file_checks"] if c["status"] == "WARN"]
    if thin_files:
        results["recommendations"].append(f"EXPAND thin files: {', '.join(thin_files)}")

    failed_topics = [c["topic"] for c in results["topic_checks"] if c["status"] == "FAIL"]
    if failed_topics:
        results["recommendations"].append(f"RESEARCH GAPS: Add coverage for {len(failed_topics)} topics: {'; '.join(failed_topics[:10])}")

    failed_crossrefs = [c["description"] for c in results["cross_ref_checks"] if not c["found"]]
    if failed_crossrefs:
        results["recommendations"].append(f"UPDATE PROJECT_BRAIN.md: Add references to {'; '.join(failed_crossrefs)}")

    missing_stats = [f"{c['stat']} ({c['description']})" for c in results["stat_checks"] if not c["found"]]
    if missing_stats:
        results["recommendations"].append(f"ADD STATISTICS: {'; '.join(missing_stats)}")

    # ============================================================
    # PRINT SUMMARY
    # ============================================================
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    print(f"\n  Total files:      {len([c for c in results['file_checks'] if c['exists']])} / {len(EXPECTED_FILES)}")
    print(f"  Total words:      {total_words:,}")
    print(f"  Total URLs:       {total_sources}")
    print(f"  Topics covered:   {topic_pass} / {topic_total}")
    print(f"  Key stats found:  {sum(1 for c in results['stat_checks'] if c['found'])} / {len(REQUIRED_STATISTICS)}")

    print(f"\n  SCORES:")
    print(f"    File Completeness:   {results['quality_scores']['file_completeness']}%")
    print(f"    Topic Coverage:      {results['quality_scores']['topic_coverage']}%")
    print(f"    Citation Quality:    {results['quality_scores']['citation_quality']}%")
    print(f"    Statistics Presence: {results['quality_scores']['statistics_presence']}%")
    print(f"    Cross-References:    {results['quality_scores']['cross_references']}%")
    print(f"    {'=' * 35}")
    print(f"    OVERALL SCORE:       {results['quality_scores']['overall']}%")

    grade = "A+" if overall_score >= 0.95 else "A" if overall_score >= 0.90 else "B+" if overall_score >= 0.85 else "B" if overall_score >= 0.80 else "C" if overall_score >= 0.70 else "D" if overall_score >= 0.60 else "F"
    print(f"    GRADE:               {grade}")

    if results["gaps"]:
        print(f"\n  GAPS FOUND: {len(results['gaps'])}")
        for gap in results["gaps"]:
            print(f"    - {gap}")

    if results["recommendations"]:
        print(f"\n  RECOMMENDATIONS:")
        for i, rec in enumerate(results["recommendations"], 1):
            print(f"    {i}. {rec}")

    # ============================================================
    # WRITE REPORT FILE
    # ============================================================
    write_report(results, total_words, total_sources, topic_pass, topic_total, grade)

    print(f"\n  Full report written to: {REPORT_FILE}")
    print("=" * 60)

    return results


def write_report(results, total_words, total_sources, topic_pass, topic_total, grade):
    """Write detailed markdown report."""

    lines = []
    lines.append("# Psychological Safety Project Brain -- Validation Report\n")
    lines.append(f"**Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    lines.append(f"**Overall Grade: {grade}** ({results['quality_scores']['overall']}%)\n")

    lines.append("## Summary\n")
    lines.append(f"| Metric | Value |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Files present | {len([c for c in results['file_checks'] if c['exists']])} / {len(EXPECTED_FILES)} |")
    lines.append(f"| Total words | {total_words:,} |")
    lines.append(f"| Total source URLs | {total_sources} |")
    lines.append(f"| Topics covered | {topic_pass} / {topic_total} |")
    lines.append(f"| Key statistics | {sum(1 for c in results['stat_checks'] if c['found'])} / {len(REQUIRED_STATISTICS)} |")
    lines.append("")

    lines.append("## Scores\n")
    lines.append("| Dimension | Score | Weight |")
    lines.append("|-----------|-------|--------|")
    lines.append(f"| File Completeness | {results['quality_scores']['file_completeness']}% | 15% |")
    lines.append(f"| Topic Coverage | {results['quality_scores']['topic_coverage']}% | 35% |")
    lines.append(f"| Citation Quality | {results['quality_scores']['citation_quality']}% | 15% |")
    lines.append(f"| Statistics Presence | {results['quality_scores']['statistics_presence']}% | 15% |")
    lines.append(f"| Cross-References | {results['quality_scores']['cross_references']}% | 20% |")
    lines.append(f"| **Overall** | **{results['quality_scores']['overall']}%** | **100%** |")
    lines.append("")

    lines.append("## File Details\n")
    lines.append("| File | Status | Words | Sections | URLs |")
    lines.append("|------|--------|-------|----------|------|")
    for c in results["file_checks"]:
        lines.append(f"| {c['file']} | {c['status']} | {c['words']:,} | {c['sections']} | {c['urls']} |")
    lines.append("")

    # Failed topics
    failed_topics = [c for c in results["topic_checks"] if c["status"] == "FAIL"]
    if failed_topics:
        lines.append("## Topic Gaps\n")
        lines.append("| Topic | Found | Required | Missing Keywords |")
        lines.append("|-------|-------|----------|-----------------|")
        for c in failed_topics:
            lines.append(f"| {c['topic']} | {c['actual']} | {c['required']} | {', '.join(c['missing'])} |")
        lines.append("")

    # Missing stats
    missing_stats = [c for c in results["stat_checks"] if not c["found"]]
    if missing_stats:
        lines.append("## Missing Statistics\n")
        for c in missing_stats:
            lines.append(f"- **{c['stat']}**: {c['description']}")
        lines.append("")

    # Cross-ref failures
    failed_refs = [c for c in results["cross_ref_checks"] if not c["found"]]
    if failed_refs:
        lines.append("## Cross-Reference Gaps (PROJECT_BRAIN.md)\n")
        for c in failed_refs:
            lines.append(f"- {c['description']} (keyword: `{c['keyword']}`)")
        lines.append("")

    # All gaps
    if results["gaps"]:
        lines.append("## All Gaps\n")
        for gap in results["gaps"]:
            lines.append(f"- {gap}")
        lines.append("")

    # Recommendations
    if results["recommendations"]:
        lines.append("## Recommendations\n")
        for i, rec in enumerate(results["recommendations"], 1):
            lines.append(f"{i}. {rec}")
        lines.append("")

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    results = run_validation()

    # Exit with non-zero if overall score < 80%
    if results["quality_scores"]["overall"] < 80.0:
        print(f"\nVALIDATION FAILED: Score {results['quality_scores']['overall']}% is below 80% threshold")
        sys.exit(1)
    else:
        print(f"\nVALIDATION PASSED: Score {results['quality_scores']['overall']}%")
        sys.exit(0)
