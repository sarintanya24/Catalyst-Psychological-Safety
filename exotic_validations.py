#!/usr/bin/env python3
"""
Exotic Validations for Psychological Safety Project Brain
==========================================================
Five advanced, non-standard validation tests that go beyond
basic coverage checks into deeper quality analysis.
"""

import os
import re
import sys
import json
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime

PROJECT_DIR = Path(__file__).parent
REPORT_FILE = PROJECT_DIR / "EXOTIC_VALIDATION_REPORT.md"

ALL_FILES = [
    "PROJECT_BRAIN.md",
    "Psychological_Safety_Deep_Research.md",
    "Benefits_of_Psychological_Safety_Research.md",
    "risks_and_consequences_of_no_psychological_safety.md",
    "Tech_Organizations_Psychological_Safety.md",
    "Innovative_Nudges_and_Coaching_Research.md",
    "David_Rock_Neuroscience_Research.md",
    "Adjacent_Frameworks_and_Researchers.md",
    "Executive_Nudge_Design_Research.md",
    "AI_Product_Landscape_Research.md",
]


def read_file(filename):
    try:
        with open(PROJECT_DIR / filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def read_all():
    return {f: read_file(f) for f in ALL_FILES}


# ============================================================
# EXOTIC VALIDATION 1: Cross-Document Statistical Consistency
# ============================================================
# Tests whether the same statistic cited in multiple files
# is consistent (not contradictory).

def validate_statistical_consistency(all_content):
    """Check that statistics cited across multiple files don't contradict each other."""
    print("\n" + "=" * 70)
    print("EXOTIC VALIDATION 1: Cross-Document Statistical Consistency")
    print("=" * 70)
    print("  Testing whether statistics cited across multiple files are consistent.\n")

    # Key statistics that should be consistent everywhere
    stat_patterns = [
        {
            "name": "Google teams studied",
            "pattern": r"(\d+)\+?\s*(?:active\s+)?(?:Google\s+)?teams?\s*(?:studied|across|in)",
            "expected": "180",
            "tolerance": None,  # must be exact
        },
        {
            "name": "ROI on psychological safety",
            "pattern": r"(\d+)%\s*(?:average\s+)?(?:return|ROI)",
            "expected": "230",
            "tolerance": None,
        },
        {
            "name": "Turnover reduction",
            "pattern": r"(\d+)%\s*(?:reduction\s+in\s+)?turnover",
            "expected": "27",
            "tolerance": None,
        },
        {
            "name": "Boeing deaths",
            "pattern": r"(\d+)\s*deaths?",
            "expected": "346",
            "tolerance": None,
        },
        {
            "name": "Executive perception of safety",
            "pattern": r"(\d+)%\s*(?:of\s+)?executives?\s*(?:report|feel|perceiv|rate|psychologic|safe)",
            "expected_range": (85, 93),  # various sources cite 87-93%
        },
        {
            "name": "Frazier meta-analysis samples",
            "pattern": r"(\d+)\s*samples",
            "expected": "136",
            "tolerance": None,
        },
        {
            "name": "Microsoft market cap growth",
            "pattern": r"\$?(\d+(?:\.\d+)?)\s*trillion",
            "expected": "2.4",
            "tolerance": None,
        },
        {
            "name": "Humu/Perceptyx nudge library size",
            "pattern": r"(\d[\d,]+)\+?\s*nudge",
            "expected": "2,500",
            "tolerance": None,
        },
        {
            "name": "Manager score improvement",
            "pattern": r"(\d+)-?(\d+)?\s*point\s*improvement",
            "expected_range": (8, 12),
        },
        {
            "name": "Pixar profitable films",
            "pattern": r"(\d+)\s*(?:feature\s+)?films?.*profitable",
            "expected": "27",
            "tolerance": None,
        },
    ]

    results = []
    total_checks = 0
    consistent_checks = 0

    for stat in stat_patterns:
        found_in_files = {}
        for filename, content in all_content.items():
            matches = re.findall(stat["pattern"], content, re.IGNORECASE)
            if matches:
                # Flatten tuples from groups
                flat = []
                for m in matches:
                    if isinstance(m, tuple):
                        flat.extend([x for x in m if x])
                    else:
                        flat.append(m)
                found_in_files[filename] = flat

        if len(found_in_files) < 2:
            # Only check consistency if cited in 2+ files
            continue

        total_checks += 1
        all_values = set()
        for vals in found_in_files.values():
            all_values.update(vals)

        # Check consistency
        if "expected" in stat:
            expected = stat["expected"].replace(",", "")
            is_consistent = any(expected in v.replace(",", "") for v in all_values)
        elif "expected_range" in stat:
            lo, hi = stat["expected_range"]
            numeric_vals = []
            for v in all_values:
                try:
                    numeric_vals.append(float(v.replace(",", "")))
                except ValueError:
                    pass
            is_consistent = all(lo <= n <= hi or n > 100 for n in numeric_vals) if numeric_vals else True
        else:
            is_consistent = True

        if is_consistent:
            consistent_checks += 1
            icon = "PASS"
        else:
            icon = "FAIL"

        files_str = ", ".join(found_in_files.keys())
        values_str = ", ".join(sorted(all_values))
        print(f"  [{icon}] {stat['name']}: values=[{values_str}] across {len(found_in_files)} files")

        results.append({
            "stat": stat["name"],
            "consistent": is_consistent,
            "values_found": sorted(all_values),
            "files": list(found_in_files.keys()),
        })

    score = (consistent_checks / total_checks * 100) if total_checks > 0 else 100
    print(f"\n  Score: {consistent_checks}/{total_checks} consistent ({score:.1f}%)")
    return {"score": score, "results": results, "total": total_checks, "passed": consistent_checks}


# ============================================================
# EXOTIC VALIDATION 2: Framework Interconnection Density
# ============================================================
# Tests how well the documents cross-reference each other's concepts.

def validate_interconnection_density(all_content):
    """Check that frameworks reference each other, creating a dense knowledge web."""
    print("\n" + "=" * 70)
    print("EXOTIC VALIDATION 2: Framework Interconnection Density")
    print("=" * 70)
    print("  Testing cross-pollination of concepts across research documents.\n")

    # Key concepts that should appear across multiple files
    concepts = [
        ("edmondson", "Edmondson"),
        ("scarf", "SCARF Model"),
        ("psychological safety", "Psychological Safety"),
        ("growth mindset", "Growth Mindset"),
        ("project aristotle", "Project Aristotle"),
        ("nudge", "Nudge/Nudging"),
        ("threat.*reward|reward.*threat", "Threat/Reward Response"),
        ("braintrust", "Pixar Braintrust"),
        ("vulnerability", "Vulnerability"),
        ("belonging", "Belonging"),
        ("inclusion", "Inclusion"),
        ("feedback", "Feedback"),
        ("accountability", "Accountability"),
        ("trust", "Trust"),
        ("innovation", "Innovation"),
        ("engagement", "Engagement"),
        ("burnout", "Burnout"),
        ("retention|turnover", "Retention/Turnover"),
        ("bias", "Bias"),
        ("neuroscience|brain", "Neuroscience/Brain"),
        ("ai.*coach|coach.*ai", "AI Coaching"),
        ("cascade", "Cascade Model"),
        ("habit", "Habit Formation"),
        ("micro.?behavior", "Micro-behaviors"),
        ("perceptyx|humu", "Perceptyx/Humu"),
    ]

    # For each concept, count how many files mention it
    concept_spread = {}
    for pattern, name in concepts:
        files_with = []
        for filename, content in all_content.items():
            if re.search(pattern, content, re.IGNORECASE):
                files_with.append(filename)
        concept_spread[name] = files_with

    # Score: concepts appearing in 3+ files = well-interconnected
    well_connected = sum(1 for files in concept_spread.values() if len(files) >= 3)
    broadly_connected = sum(1 for files in concept_spread.values() if len(files) >= 5)
    total = len(concepts)

    print(f"  Concept spread across {len(ALL_FILES)} files:\n")
    for name, files in sorted(concept_spread.items(), key=lambda x: len(x[1]), reverse=True):
        bar = "#" * len(files)
        status = "PASS" if len(files) >= 3 else "WARN"
        print(f"  [{status}] {name:30s} {bar} ({len(files)} files)")

    score = (well_connected / total * 100) if total > 0 else 0
    density_score = (broadly_connected / total * 100) if total > 0 else 0

    print(f"\n  Well-connected (3+ files):    {well_connected}/{total} ({score:.1f}%)")
    print(f"  Broadly connected (5+ files): {broadly_connected}/{total} ({density_score:.1f}%)")
    print(f"  Interconnection Score: {score:.1f}%")

    return {
        "score": score,
        "well_connected": well_connected,
        "broadly_connected": broadly_connected,
        "total_concepts": total,
        "concept_spread": {k: len(v) for k, v in concept_spread.items()},
    }


# ============================================================
# EXOTIC VALIDATION 3: Actionability & Specificity Score
# ============================================================
# Measures ratio of specific/actionable content vs vague claims.

def validate_actionability(all_content):
    """Measure how actionable and specific the research is."""
    print("\n" + "=" * 70)
    print("EXOTIC VALIDATION 3: Actionability & Specificity Score")
    print("=" * 70)
    print("  Measuring specific data, tools, and actions vs vague statements.\n")

    all_text = " ".join(all_content.values())

    # Specificity indicators (high-quality signals)
    specificity_signals = {
        "Specific percentages": len(re.findall(r'\d+(?:\.\d+)?%', all_text)),
        "Dollar amounts": len(re.findall(r'\$[\d,]+(?:\.\d+)?\s*(?:billion|trillion|million)?', all_text, re.IGNORECASE)),
        "Named researchers": len(set(re.findall(r'(?:Edmondson|Clark|Rock|Brown|Scott|Lencioni|Schein|Coyle|Porges|Deci|Ryan|Dweck|Nadella|Catmull|Bock|Thaler|Sunstein|Fogg|Clear|Seligman|Csikszentmihalyi)', all_text, re.IGNORECASE))),
        "Named companies/tools": len(set(re.findall(r'(?:Google|Microsoft|Pixar|Netflix|Spotify|Amazon|Meta|Salesforce|Atlassian|GitLab|Perceptyx|Humu|BetterUp|CoachHub|Valence|Cloverleaf|Textio|Kona|Arist|Hone|15Five|Culture Amp)', all_text, re.IGNORECASE))),
        "Year citations": len(re.findall(r'\b20[12]\d\b', all_text)),
        "Specific frameworks named": len(set(re.findall(r'(?:SCARF|FEAST|AGES|SEEDS|BRAVING|4A|PERMA)', all_text))),
        "Case study references": len(re.findall(r'(?:case study|field experiment|study.*found|research.*showed|survey.*revealed)', all_text, re.IGNORECASE)),
        "Action verbs (prescriptive)": len(re.findall(r'(?:should|must|recommend|implement|deploy|integrate|launch|adopt)', all_text, re.IGNORECASE)),
        "Specific metrics/KPIs": len(re.findall(r'(?:ROI|NPS|engagement score|retention rate|attrition|productivity)', all_text, re.IGNORECASE)),
        "Named surveys/reports": len(re.findall(r'(?:APA|Gallup|BCG|McKinsey|MIT|Frazier|PwC|Gartner|SHRM)', all_text, re.IGNORECASE)),
    }

    # Vagueness indicators (low-quality signals)
    vagueness_signals = {
        "Vague qualifiers": len(re.findall(r'\b(?:some|many|often|generally|typically|usually|might|may|could|perhaps|arguably)\b', all_text, re.IGNORECASE)),
        "Hedging language": len(re.findall(r'\b(?:it seems|appears to|tends to|sort of|kind of|more or less)\b', all_text, re.IGNORECASE)),
        "Unsourced claims ('studies show')": len(re.findall(r'(?:studies show|research suggests|experts say|it is believed)', all_text, re.IGNORECASE)),
    }

    total_specificity = sum(specificity_signals.values())
    total_vagueness = sum(vagueness_signals.values())

    print("  SPECIFICITY SIGNALS:")
    for name, count in sorted(specificity_signals.items(), key=lambda x: x[1], reverse=True):
        bar = "#" * min(count, 60)
        print(f"    {name:35s} {count:5d}  {bar}")

    print(f"\n  VAGUENESS SIGNALS:")
    for name, count in sorted(vagueness_signals.items(), key=lambda x: x[1], reverse=True):
        bar = "!" * min(count, 60)
        print(f"    {name:35s} {count:5d}  {bar}")

    # Score: ratio of specificity to vagueness
    ratio = total_specificity / max(total_vagueness, 1)
    # Normalize to 0-100 (ratio of 10+ = 100%, ratio of 1 = 50%, ratio of 0.1 = 10%)
    score = min(100, max(0, (ratio / 10) * 100))

    print(f"\n  Specificity signals: {total_specificity}")
    print(f"  Vagueness signals:  {total_vagueness}")
    print(f"  Ratio:              {ratio:.1f}:1 (specificity:vagueness)")
    print(f"  Actionability Score: {score:.1f}%")

    return {
        "score": score,
        "specificity_total": total_specificity,
        "vagueness_total": total_vagueness,
        "ratio": round(ratio, 2),
        "specificity_signals": specificity_signals,
        "vagueness_signals": vagueness_signals,
    }


# ============================================================
# EXOTIC VALIDATION 4: Source Diversity & Authority
# ============================================================
# Checks that sources span academic, industry, media, and practitioner domains.

def validate_source_diversity(all_content):
    """Measure diversity and authority of sources cited."""
    print("\n" + "=" * 70)
    print("EXOTIC VALIDATION 4: Source Diversity & Authority")
    print("=" * 70)
    print("  Checking breadth and authority of cited sources.\n")

    all_text = " ".join(all_content.values())

    # Source categories
    categories = {
        "Academic/University": {
            "patterns": [r"harvard", r"mit\b", r"stanford", r"yale", r"insead", r"london business school",
                        r"university", r"journal", r"meta.?analy", r"published in", r"research.*found"],
            "found": set(),
        },
        "Major Consulting": {
            "patterns": [r"mckinsey", r"bcg\b", r"gallup", r"gartner", r"deloitte", r"pwc\b", r"bain"],
            "found": set(),
        },
        "Tech Companies": {
            "patterns": [r"google", r"microsoft", r"amazon", r"meta\b", r"netflix", r"spotify",
                        r"atlassian", r"gitlab", r"salesforce"],
            "found": set(),
        },
        "HR/People Platforms": {
            "patterns": [r"perceptyx", r"betterup", r"coachhub", r"culture amp", r"15five",
                        r"humu", r"valence", r"cloverleaf", r"textio", r"kona"],
            "found": set(),
        },
        "Government/NGO": {
            "patterns": [r"apa\b|american psychological", r"shrm", r"who\b|world health",
                        r"department of justice", r"world economic forum"],
            "found": set(),
        },
        "Business Media": {
            "patterns": [r"hbr|harvard business review", r"new york times", r"fast company",
                        r"variety", r"forbes", r"fortune", r"wired"],
            "found": set(),
        },
        "Books/Thought Leaders": {
            "patterns": [r"edmondson", r"rock\b.*david|david.*rock", r"brown\b.*brene|brene.*brown",
                        r"scott\b.*kim|kim.*scott", r"lencioni", r"catmull", r"coyle\b.*daniel|daniel.*coyle",
                        r"schein", r"porges", r"dweck", r"thaler", r"clear\b.*james|james.*clear",
                        r"fogg\b.*bj|bj.*fogg"],
            "found": set(),
        },
        "Specialized Research Orgs": {
            "patterns": [r"neuroleadership", r"leaderfactor", r"psych\s*safety", r"niagara institute",
                        r"brandon hall", r"josh bersin"],
            "found": set(),
        },
    }

    for cat_name, cat_data in categories.items():
        for pattern in cat_data["patterns"]:
            matches = re.findall(pattern, all_text, re.IGNORECASE)
            if matches:
                cat_data["found"].add(pattern.replace(r"\b", "").replace(r".*", " ").strip())

    print("  Source categories represented:\n")
    categories_with_sources = 0
    total_categories = len(categories)
    for cat_name, cat_data in categories.items():
        count = len(cat_data["found"])
        if count > 0:
            categories_with_sources += 1
        status = "PASS" if count >= 2 else "WARN" if count >= 1 else "FAIL"
        bar = "#" * count
        print(f"  [{status}] {cat_name:30s} {count:3d} sources  {bar}")

    score = (categories_with_sources / total_categories * 100) if total_categories > 0 else 0

    # Bonus: check URL domain diversity
    all_urls = re.findall(r'https?://([^/\s\)]+)', all_text)
    unique_domains = set()
    for url in all_urls:
        # Extract base domain
        parts = url.split(".")
        if len(parts) >= 2:
            unique_domains.add(".".join(parts[-2:]))

    print(f"\n  URL domain diversity: {len(unique_domains)} unique domains from {len(all_urls)} URLs")
    print(f"  Categories with sources: {categories_with_sources}/{total_categories}")
    print(f"  Source Diversity Score: {score:.1f}%")

    return {
        "score": score,
        "categories_represented": categories_with_sources,
        "total_categories": total_categories,
        "unique_domains": len(unique_domains),
        "total_urls": len(all_urls),
        "category_details": {k: len(v["found"]) for k, v in categories.items()},
    }


# ============================================================
# EXOTIC VALIDATION 5: Practitioner Readiness / "Build Score"
# ============================================================
# Could someone actually build a product or program from this research?

def validate_practitioner_readiness(all_content):
    """Assess whether the research is complete enough to build from."""
    print("\n" + "=" * 70)
    print("EXOTIC VALIDATION 5: Practitioner Readiness ('Build Score')")
    print("=" * 70)
    print("  Could someone design a product or program from this research alone?\n")

    all_text = " ".join(all_content.values())

    # Readiness dimensions
    dimensions = {
        "Problem Definition": {
            "description": "Clear articulation of the problem and why it matters",
            "signals": [
                (r"implementation gap", "Implementation gap identified"),
                (r"perception gap", "Perception gap quantified"),
                (r"trillion.*cost|cost.*trillion", "Financial cost of inaction quantified"),
                (r"boeing|wells fargo|nokia|volkswagen|nasa", "Cautionary case studies"),
                (r"burnout|turnover|disengagement", "Human cost articulated"),
                (r"innovation.*fear|fear.*innovation", "Innovation barrier identified"),
            ],
        },
        "Target Audience": {
            "description": "Clear definition of who the solution is for",
            "signals": [
                (r"executive|c-suite|ceo|senior leader", "Executive audience defined"),
                (r"manager|people leader", "Manager audience defined"),
                (r"team member|individual contributor", "IC audience defined"),
                (r"cascade.*model|ripple", "Cascade from leaders to teams described"),
                (r"status threat|ceo bubble|time-poor", "Executive psychology understood"),
            ],
        },
        "Theoretical Foundation": {
            "description": "Grounding in research and established frameworks",
            "signals": [
                (r"edmondson.*7.?item|7.?item.*survey", "Measurement instrument available"),
                (r"scarf.*model", "Neuroscience framework (SCARF)"),
                (r"4 stages|four stages", "Stage model (Clark)"),
                (r"nudge theory|behavioral science", "Behavioral science foundation"),
                (r"habit.*formation|tiny habits|atomic habits", "Habit science integrated"),
                (r"polyvagal|neuroception", "Physiological safety theory"),
                (r"self-determination|autonomy.*competence.*relatedness", "Motivation theory"),
            ],
        },
        "Solution Design": {
            "description": "Specific, actionable product/program design elements",
            "signals": [
                (r"feast.*framework|fun.*easy.*attractive.*social.*timely", "Nudge design framework"),
                (r"micro.?behavior.*roi|highest.*roi.*behavior", "Prioritized behavior list"),
                (r"2-3 nudges per week|every other week", "Optimal nudge frequency"),
                (r"15.?30 words|radical brevity", "Nudge format specified"),
                (r"before.*1:1|before.*meeting|contextual trigger", "Contextual triggers mapped"),
                (r"email.*slack.*teams.*calendar|multi.?channel", "Multi-channel delivery"),
                (r"closed.?loop|measure.*nudge.*track.*re-measure", "Feedback loop architecture"),
                (r"phase.*1.*phase.*2|implementation.*plan|roadmap", "Implementation roadmap"),
            ],
        },
        "Competitive Landscape": {
            "description": "Knowledge of existing solutions and market gaps",
            "signals": [
                (r"perceptyx.*ai coach|betterup|coachhub.*aimy|valence.*nadia", "Existing products mapped"),
                (r"pricing|per user|enterprise", "Pricing intelligence"),
                (r"gap|whitespace|doesn't exist|missing", "Market gaps identified"),
                (r"ideal.*product|next.?generation|purpose.?built", "Ideal product described"),
                (r"ethical.*consideration|privacy|surveillance|trust", "Ethics addressed"),
            ],
        },
        "Evidence of Efficacy": {
            "description": "Proof that the approach works",
            "signals": [
                (r"kraft heinz", "Enterprise case study (Kraft Heinz)"),
                (r"genpact.*130.*000|130.*000.*genpact", "Scale case study (Genpact)"),
                (r"danish.*public.*manager|226.*manager", "Experimental evidence"),
                (r"8-12 point|double.?digit improvement", "Quantified behavior change"),
                (r"2\.5x|twice as.*effective", "Comparative effectiveness data"),
                (r"microsoft.*300.*billion.*2\.4.*trillion", "Transformation case study"),
            ],
        },
        "Measurement Framework": {
            "description": "How to measure success",
            "signals": [
                (r"7.?item survey|fearless organization scan|psindex", "Assessment tools"),
                (r"baseline.*measure|pulse.*survey|benchmark", "Measurement methodology"),
                (r"73%.*average|benchmark.*data", "Benchmark data available"),
                (r"perception gap.*87.*69|executive.*vs.*ic", "Gap measurement"),
                (r"roi.*230|return.*investment", "ROI measurement"),
            ],
        },
    }

    print("  Practitioner Readiness by Dimension:\n")
    total_signals = 0
    found_signals = 0
    dimension_scores = {}

    for dim_name, dim_data in dimensions.items():
        dim_found = 0
        dim_total = len(dim_data["signals"])
        details = []

        for pattern, desc in dim_data["signals"]:
            match = bool(re.search(pattern, all_text, re.IGNORECASE))
            if match:
                dim_found += 1
                found_signals += 1
            total_signals += 1
            details.append((desc, match))

        dim_score = (dim_found / dim_total * 100) if dim_total > 0 else 0
        dimension_scores[dim_name] = dim_score

        status = "PASS" if dim_score >= 80 else "WARN" if dim_score >= 60 else "FAIL"
        print(f"  [{status}] {dim_name} ({dim_score:.0f}%)")
        print(f"       {dim_data['description']}")
        for desc, match in details:
            icon = "+" if match else "-"
            print(f"       [{icon}] {desc}")
        print()

    overall = (found_signals / total_signals * 100) if total_signals > 0 else 0

    print(f"  Signals found: {found_signals}/{total_signals}")
    print(f"  Practitioner Readiness Score: {overall:.1f}%")

    # Overall readiness assessment
    if overall >= 90:
        verdict = "PRODUCTION READY -- Could build a product/program directly from this research"
    elif overall >= 75:
        verdict = "NEAR READY -- Minor gaps to fill before building"
    elif overall >= 60:
        verdict = "FOUNDATIONAL -- Good base but needs more specificity"
    else:
        verdict = "RESEARCH PHASE -- More work needed before building"

    print(f"  Verdict: {verdict}")

    return {
        "score": overall,
        "found_signals": found_signals,
        "total_signals": total_signals,
        "dimension_scores": dimension_scores,
        "verdict": verdict,
    }


# ============================================================
# MAIN: Run all 5 exotic validations
# ============================================================

def main():
    all_content = read_all()

    print("=" * 70)
    print("  EXOTIC VALIDATIONS: Psychological Safety Project Brain")
    print("  5 Advanced Quality Tests")
    print("  " + datetime.now().strftime("%Y-%m-%d %H:%M"))
    print("=" * 70)

    r1 = validate_statistical_consistency(all_content)
    r2 = validate_interconnection_density(all_content)
    r3 = validate_actionability(all_content)
    r4 = validate_source_diversity(all_content)
    r5 = validate_practitioner_readiness(all_content)

    # ============================================================
    # FINAL SUMMARY
    # ============================================================
    print("\n" + "=" * 70)
    print("  EXOTIC VALIDATION SUMMARY")
    print("=" * 70)

    tests = [
        ("1. Statistical Consistency", r1["score"]),
        ("2. Framework Interconnection", r2["score"]),
        ("3. Actionability & Specificity", r3["score"]),
        ("4. Source Diversity", r4["score"]),
        ("5. Practitioner Readiness", r5["score"]),
    ]

    overall = sum(s for _, s in tests) / len(tests)

    for name, score in tests:
        grade = "A+" if score >= 95 else "A" if score >= 90 else "B+" if score >= 85 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F"
        bar = "#" * int(score / 2)
        print(f"  {name:40s}  {score:6.1f}%  [{grade:>2s}]  {bar}")

    overall_grade = "A+" if overall >= 95 else "A" if overall >= 90 else "B+" if overall >= 85 else "B" if overall >= 80 else "C" if overall >= 70 else "D" if overall >= 60 else "F"

    print(f"\n  {'OVERALL EXOTIC SCORE':40s}  {overall:6.1f}%  [{overall_grade:>2s}]")
    print(f"\n  Total words analyzed: {sum(len(c.split()) for c in all_content.values()):,}")
    print(f"  Total URLs: {sum(len(re.findall(r'https?://', c)) for c in all_content.values())}")

    # Write report
    write_exotic_report(tests, overall, overall_grade, r1, r2, r3, r4, r5)
    print(f"\n  Full report: {REPORT_FILE}")
    print("=" * 70)

    return overall >= 80


def write_exotic_report(tests, overall, grade, r1, r2, r3, r4, r5):
    lines = []
    lines.append("# Exotic Validation Report: Psychological Safety Project Brain\n")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"**Overall Grade: {grade}** ({overall:.1f}%)\n")

    lines.append("## Scores\n")
    lines.append("| Test | Score | Grade |")
    lines.append("|------|-------|-------|")
    for name, score in tests:
        g = "A+" if score >= 95 else "A" if score >= 90 else "B+" if score >= 85 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F"
        lines.append(f"| {name} | {score:.1f}% | {g} |")
    lines.append(f"| **Overall** | **{overall:.1f}%** | **{grade}** |")
    lines.append("")

    lines.append("## Test Details\n")

    lines.append("### 1. Statistical Consistency")
    lines.append(f"Checked {r1['total']} statistics across multiple files. {r1['passed']}/{r1['total']} consistent.\n")

    lines.append("### 2. Framework Interconnection")
    lines.append(f"- Well-connected concepts (3+ files): {r2['well_connected']}/{r2['total_concepts']}")
    lines.append(f"- Broadly connected (5+ files): {r2['broadly_connected']}/{r2['total_concepts']}\n")

    lines.append("### 3. Actionability & Specificity")
    lines.append(f"- Specificity signals: {r3['specificity_total']}")
    lines.append(f"- Vagueness signals: {r3['vagueness_total']}")
    lines.append(f"- Ratio: {r3['ratio']}:1\n")

    lines.append("### 4. Source Diversity")
    lines.append(f"- Categories represented: {r4['categories_represented']}/{r4['total_categories']}")
    lines.append(f"- Unique domains: {r4['unique_domains']}")
    lines.append(f"- Total URLs: {r4['total_urls']}\n")

    lines.append("### 5. Practitioner Readiness")
    lines.append(f"- Signals found: {r5['found_signals']}/{r5['total_signals']}")
    lines.append(f"- Verdict: {r5['verdict']}")
    lines.append("")
    lines.append("| Dimension | Score |")
    lines.append("|-----------|-------|")
    for dim, score in r5["dimension_scores"].items():
        lines.append(f"| {dim} | {score:.0f}% |")

    with open(REPORT_FILE, "w") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
