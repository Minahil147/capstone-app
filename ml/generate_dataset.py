"""
Builds a small, hand-authored dataset of software issue reports labeled by
category (bug / feature / question / documentation). This mirrors the shape
of the `Issue` model already used in the capstone app (title + description),
so the model trained on it is directly usable by the app later.

Run once to produce data/issues_dataset.csv. Re-running regenerates the file
deterministically (fixed random seed).
"""

import random
import csv

random.seed(42)

COMPONENTS = [
    "login form", "signup page", "issue board", "kanban drag handler",
    "auth middleware", "JWT refresh flow", "issue list view", "navbar",
    "MongoDB connection", "search bar", "profile page", "email notifications",
    "password reset flow", "API rate limiter", "dashboard charts",
    "file upload widget", "comment thread", "dark mode toggle",
    "pagination controls", "settings page",
]

BUG_TEMPLATES = [
    "{component} crashes when {action}",
    "{component} throws an error after {action}",
    "{component} doesn't update after {action}",
    "Unexpected behavior in {component} when {action}",
    "{component} shows stale data after {action}",
    "{component} is broken on mobile after {action}",
]
BUG_ACTIONS = [
    "the page is refreshed", "submitting the form twice", "the token expires",
    "switching between tabs quickly", "the network drops mid-request",
    "resizing the browser window", "logging in with an expired session",
    "clicking submit before validation finishes",
]
BUG_DESCRIPTIONS = [
    "Steps to reproduce: open the page, trigger the action, and observe the console error.",
    "This happens consistently on Chrome and Firefox, haven't tested Safari yet.",
    "Console shows a TypeError, stack trace points to the component's effect hook.",
    "Only reproduces when the user is logged in with an expired token.",
    "Started happening after the latest deploy, likely a regression.",
    "",
]

FEATURE_TEMPLATES = [
    "Add {feature} to {component}",
    "Support {feature} in {component}",
    "Allow users to {feature} from {component}",
    "Introduce {feature} for {component}",
]
FEATURES = [
    "dark mode", "keyboard shortcuts", "bulk actions", "CSV export",
    "drag-and-drop reordering", "email digests", "two-factor authentication",
    "filtering by tag", "inline editing", "undo support",
    "custom status labels", "activity history",
]
FEATURE_DESCRIPTIONS = [
    "Several users have asked for this in feedback calls.",
    "Would make the workflow much faster for power users.",
    "Competitor tools already support this and it's a common request.",
    "Proposing this as a stretch goal, not urgent but valuable.",
    "This would pair well with the existing status system.",
    "",
]

QUESTION_TEMPLATES = [
    "How do I configure {component}?",
    "Is there a way to customize {component}?",
    "What's the recommended approach for {component}?",
    "Does {component} support {feature}?",
    "Why does {component} behave this way?",
]
QUESTION_DESCRIPTIONS = [
    "Couldn't find this in the docs, asking here before opening a bug report.",
    "Not sure if this is expected behavior or a misconfiguration on my end.",
    "New to the codebase, trying to understand the intended usage.",
    "Searched the README but it doesn't cover this case.",
    "",
]

DOC_TEMPLATES = [
    "Document the setup steps for {component}",
    "README is missing instructions for {component}",
    "Add code comments explaining {component}",
    "Clarify the API docs for {component}",
    "Outdated documentation for {component}",
]
DOC_DESCRIPTIONS = [
    "New contributors keep asking the same setup questions in chat.",
    "The current docs reference an old version of the config file.",
    "Would help onboarding if this had a short example.",
    "Docs mention a flag that no longer exists.",
    "",
]


def build_rows():
    rows = []

    for _ in range(55):
        comp = random.choice(COMPONENTS)
        action = random.choice(BUG_ACTIONS)
        title = random.choice(BUG_TEMPLATES).format(component=comp, action=action)
        desc = random.choice(BUG_DESCRIPTIONS)
        rows.append((title, desc, "bug"))

    for _ in range(55):
        comp = random.choice(COMPONENTS)
        feat = random.choice(FEATURES)
        title = random.choice(FEATURE_TEMPLATES).format(component=comp, feature=feat)
        desc = random.choice(FEATURE_DESCRIPTIONS)
        rows.append((title, desc, "feature"))

    for _ in range(55):
        comp = random.choice(COMPONENTS)
        feat = random.choice(FEATURES)
        title = random.choice(QUESTION_TEMPLATES).format(component=comp, feature=feat)
        desc = random.choice(QUESTION_DESCRIPTIONS)
        rows.append((title, desc, "question"))

    for _ in range(55):
        comp = random.choice(COMPONENTS)
        title = random.choice(DOC_TEMPLATES).format(component=comp)
        desc = random.choice(DOC_DESCRIPTIONS)
        rows.append((title, desc, "documentation"))

    random.shuffle(rows)
    return rows


def inject_missing_values(rows, n=10):
    """Blank out a handful of descriptions to simulate real-world missing data."""
    rows = list(rows)
    indices = random.sample(range(len(rows)), n)
    for i in indices:
        title, desc, label = rows[i]
        rows[i] = (title, None, label)
    return rows


if __name__ == "__main__":
    rows = build_rows()
    rows = inject_missing_values(rows, n=10)

    with open("data/issues_dataset.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["title", "description", "category"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to data/issues_dataset.csv")
