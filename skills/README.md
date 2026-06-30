# Runloop Skills

Drop Cursor Agent Skills here so the AI can use them in this repo.

Each skill is a folder with a required `SKILL.md` file:

```text
skills/
├── README.md
├── my-skill/
│   ├── SKILL.md          # required
│   ├── reference.md      # optional
│   └── scripts/          # optional
└── another-skill/
    └── SKILL.md
```

## Add a skill from online

1. Create a new folder under `skills/` (use lowercase letters, numbers, and hyphens).
2. Add the skill's `SKILL.md` (and any supporting files) into that folder.
3. Keep the YAML frontmatter at the top of `SKILL.md`:

```markdown
---
name: my-skill
description: What the skill does and when the agent should use it.
---

# My Skill

Instructions for the agent...
```

4. Commit the folder to git if you want it shared with the team.

Skills in this directory are wired to Cursor through `.cursor/skills/` (symlink).

## Authoring tips

- **Description matters**: Cursor uses it to decide when to load the skill. Include both what it does and when to use it.
- **Stay concise**: Put essentials in `SKILL.md`; move long reference material to separate files.
- **One skill, one job**: Prefer focused skills over giant catch-all guides.
- **No secrets**: Do not put API keys or credentials in skill files.

## Template

Copy this when creating a new skill:

```markdown
---
name: skill-name
description: Brief third-person description with trigger terms for when to use this skill.
---

# Skill Name

## When to use

- Scenario 1
- Scenario 2

## Instructions

1. Step one
2. Step two

## Output format

Describe the expected result or template.
```

## Learn more

- Cursor skill authoring: ask the agent to use the `create-skill` skill, or see [Cursor docs on Agent Skills](https://cursor.com/docs/context/skills).
- Runloop architecture docs live in `context/`.
