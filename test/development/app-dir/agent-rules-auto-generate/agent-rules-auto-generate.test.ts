import { nextTestSetup } from 'e2e-utils'
import fs from 'fs'
import path from 'path'

const AGENT_RULES_MARKER = '<!-- BEGIN:nextjs-agent-rules -->'

describe('agent-rules auto-generate on next dev (agent detected)', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    env: { CLAUDECODE: '1' },
  })

  it('creates AGENTS.md and CLAUDE.md at the project root when neither exists', async () => {
    // Force a request so we know the dev server has finished startup and
    // the agent-rules generation has run.
    const res = await next.fetch('/')
    expect(res.status).toBe(200)

    const agentsContent = fs.readFileSync(
      path.join(next.testDir, 'AGENTS.md'),
      'utf-8'
    )
    expect(agentsContent).toContain(AGENT_RULES_MARKER)
    expect(agentsContent).toContain('node_modules/next/dist/docs/')

    const claudeContent = fs.readFileSync(
      path.join(next.testDir, 'CLAUDE.md'),
      'utf-8'
    )
    expect(claudeContent).toBe('@AGENTS.md\n')
  })
})

describe('agent-rules auto-generate on next dev (no agent)', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    // Explicitly clear every env var `detectAgent()` inspects so the
    // test doesn't inherit one from the host shell (e.g. running it
    // inside Claude Code would otherwise trigger generation).
    env: {
      AI_AGENT: '',
      CURSOR_TRACE_ID: '',
      CURSOR_AGENT: '',
      GEMINI_CLI: '',
      CODEX_SANDBOX: '',
      CODEX_CI: '',
      CODEX_THREAD_ID: '',
      ANTIGRAVITY_AGENT: '',
      AUGMENT_AGENT: '',
      OPENCODE_CLIENT: '',
      CLAUDECODE: '',
      CLAUDE_CODE: '',
      REPL_ID: '',
      COPILOT_MODEL: '',
      COPILOT_ALLOW_ALL: '',
      COPILOT_GITHUB_TOKEN: '',
    },
  })

  it('does not create AGENTS.md or CLAUDE.md when no agent is detected', async () => {
    const res = await next.fetch('/')
    expect(res.status).toBe(200)

    expect(fs.existsSync(path.join(next.testDir, 'AGENTS.md'))).toBe(false)
    expect(fs.existsSync(path.join(next.testDir, 'CLAUDE.md'))).toBe(false)
  })
})

describe('agent-rules auto-generate on next dev (agentRules: false)', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    env: { CLAUDECODE: '1' },
    nextConfig: {
      agentRules: false,
    },
  })

  it('does not generate files when agentRules is disabled in next.config', async () => {
    const res = await next.fetch('/')
    expect(res.status).toBe(200)

    expect(fs.existsSync(path.join(next.testDir, 'AGENTS.md'))).toBe(false)
    expect(fs.existsSync(path.join(next.testDir, 'CLAUDE.md'))).toBe(false)
  })
})
