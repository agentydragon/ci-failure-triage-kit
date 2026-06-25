const patterns = [
  {
    id: "oom",
    severity: "high",
    title: "Process likely ran out of memory",
    regex: /\b(out of memory|oom|killed process|signal: killed|exit code 137|cannot allocate memory|heap out of memory)\b/i,
    owner: "Infrastructure or test owner",
    action:
      "Rerun the failing job with memory metrics enabled, then split the largest test shard or increase the job memory limit.",
  },
  {
    id: "disk",
    severity: "high",
    title: "Runner disk space exhausted",
    regex: /\b(no space left on device|enospc|disk quota exceeded|not enough space|write failed.*space)\b/i,
    owner: "CI platform owner",
    action:
      "Check workspace cleanup, dependency cache size, and artifact retention before raising the runner disk allocation.",
  },
  {
    id: "network",
    severity: "medium",
    title: "Network or registry access failed",
    regex: /\b(econnreset|etimedout|temporary failure in name resolution|could not resolve host|connection reset|tls handshake timeout|502 bad gateway|503 service unavailable|429 too many requests)\b/i,
    owner: "CI platform or dependency owner",
    action:
      "Retry once, then check registry status, rate limits, and whether the job should use an internal mirror or pinned cache.",
  },
  {
    id: "lockfile",
    severity: "medium",
    title: "Dependency lockfile or resolver mismatch",
    regex: /\b(lockfile|package-lock|pnpm-lock|yarn.lock|cargo.lock|poetry.lock|gemfile.lock|requirements.*conflict|resolution impossible|incompatible dependency)\b/i,
    owner: "Code owner for dependency update",
    action:
      "Regenerate the lockfile with the repo's supported package manager and compare the dependency diff before merging.",
  },
  {
    id: "auth",
    severity: "high",
    title: "Credential or permission problem",
    regex: /\b(permission denied|access denied|unauthorized|forbidden|401|403|invalid token|missing credentials|bad owner or permissions)\b/i,
    owner: "Repository or secret owner",
    action:
      "Confirm the job has the expected token scope, secret name, and filesystem permissions. Rotate leaked or over-broad credentials.",
  },
  {
    id: "test",
    severity: "medium",
    title: "Test assertion failure",
    regex: /\b(assertion failed|expected .* received|expected .* actual|test failed|failures:|FAILED .*::|panic:|thread .* panicked)\b/i,
    owner: "Code owner for failing test",
    action:
      "Extract the first failing test name, rerun it locally with the same seed or flags, and check recent commits touching that path.",
  },
  {
    id: "lint",
    severity: "low",
    title: "Formatter, lint, or type check failed",
    regex: /\b(eslint|prettier|ruff|mypy|pyright|tsc|clippy|rustfmt|gofmt|shellcheck|black).*?(error|failed|would reformat)|\b(type error|lint error|format check failed)\b/i,
    owner: "Author of current change",
    action:
      "Run the exact formatter or type checker command from CI and commit the mechanical output separately when possible.",
  },
  {
    id: "bazel",
    severity: "medium",
    title: "Bazel build or test failure",
    regex: /\b(bazel|bazelisk|buildbuddy|remote cache|sandbox|action failed|target .* failed to build|testlogs)\b/i,
    owner: "Target owner or build infrastructure owner",
    action:
      "Open the first failed target's testlog, compare local and remote execution settings, and inspect undeclared outputs.",
  },
  {
    id: "container",
    severity: "medium",
    title: "Container image or runtime problem",
    regex: /\b(docker|podman|containerd|imagepullbackoff|manifest unknown|pull access denied|no matching manifest|exec format error)\b/i,
    owner: "Image publisher or CI runtime owner",
    action:
      "Verify the image tag, architecture, registry credentials, and whether the runner recently changed CPU platform.",
  },
  {
    id: "timeout",
    severity: "medium",
    title: "Job or test timed out",
    regex: /\b(timed out|timeout exceeded|deadline exceeded|cancelled after|operation took longer than|no output received)\b/i,
    owner: "Test owner or infrastructure owner",
    action:
      "Compare current duration with historical p95, then decide whether this is a real hang, resource starvation, or too-strict timeout.",
  },
];

const sampleLog = `Run bazel test //server:integration_test
INFO: Invocation ID: d3f4c2
ERROR: /workspace/server/BUILD:42:13: Testing //server:integration_test failed: Test failed
FAIL: test_retries_after_registry_503
thread 'test_retries_after_registry_503' panicked at src/retry.rs:88:9:
assertion failed: expected 3 attempts, received 1
Caused by: 503 service unavailable from registry.example.com
INFO: Elapsed time: 48.243s, Critical Path: 19.12s
FAILED: Build did NOT complete successfully`;

const els = {
  input: document.getElementById("logInput"),
  analyze: document.getElementById("analyzeButton"),
  clear: document.getElementById("clearButton"),
  sample: document.getElementById("sampleButton"),
  copy: document.getElementById("copyButton"),
  findings: document.getElementById("findings"),
  findingTemplate: document.getElementById("findingTemplate"),
  findingCount: document.getElementById("findingCount"),
  signalCount: document.getElementById("signalCount"),
  confidenceScore: document.getElementById("confidenceScore"),
  summaryLine: document.getElementById("summaryLine"),
  checkoutLink: document.getElementById("checkoutLink"),
  demoNotice: document.getElementById("demoNotice"),
};

let lastMarkdown = "";

function getConfig() {
  const config = window.CI_TRIAGE_KIT_CONFIG || {};
  return {
    checkoutUrl: typeof config.checkoutUrl === "string" ? config.checkoutUrl.trim() : "",
    demoMode: config.demoMode === true,
  };
}

function getCheckoutUrl() {
  return getConfig().checkoutUrl;
}

function isDemoMode() {
  return getConfig().demoMode;
}

function normalizeLine(line) {
  return line.replace(/\x1b\[[0-9;]*m/g, "").trim();
}

function extractSignalLines(lines) {
  const signalRegex =
    /\b(error|failed|failure|panic|exception|fatal|denied|timeout|timed out|killed|oom|no space|unauthorized|forbidden|assertion)\b/i;

  return lines
    .map((line, index) => ({ index: index + 1, text: normalizeLine(line) }))
    .filter((line) => line.text && signalRegex.test(line.text))
    .slice(0, 24);
}

function nearbyExcerpt(lines, lineNumber) {
  const start = Math.max(0, lineNumber - 2);
  const end = Math.min(lines.length, lineNumber + 1);
  return lines
    .slice(start, end)
    .map((line, offset) => `${start + offset + 1}: ${normalizeLine(line)}`)
    .join("\n");
}

function analyze(logText) {
  const lines = logText.split(/\r?\n/);
  const signalLines = extractSignalLines(lines);
  const findings = [];

  for (const pattern of patterns) {
    const match = lines.findIndex((line) => pattern.regex.test(line));
    if (match !== -1) {
      findings.push({
        ...pattern,
        line: match + 1,
        excerpt: nearbyExcerpt(lines, match + 1),
      });
    }
  }

  if (findings.length === 0 && signalLines.length > 0) {
    findings.push({
      id: "unknown",
      severity: "low",
      title: "Failure signal found, but no known category matched",
      owner: "Initial responder",
      action:
        "Start with the first high-signal line, identify the owning target or package, and rerun the narrowest failing command.",
      line: signalLines[0].index,
      excerpt: nearbyExcerpt(lines, signalLines[0].index),
    });
  }

  return {
    findings: rankFindings(findings),
    signalLines,
    lineCount: lines.filter((line) => line.trim()).length,
  };
}

function rankFindings(findings) {
  const score = { high: 3, medium: 2, low: 1 };
  return [...findings].sort((a, b) => {
    const severity = score[b.severity] - score[a.severity];
    return severity || a.line - b.line;
  });
}

function confidenceFor(result) {
  if (result.findings.length === 0) return 0;
  const severityWeight = result.findings.reduce((total, finding) => {
    if (finding.severity === "high") return total + 30;
    if (finding.severity === "medium") return total + 22;
    return total + 14;
  }, 0);
  const signalWeight = Math.min(result.signalLines.length * 4, 28);
  return Math.min(96, severityWeight + signalWeight);
}

function render(result) {
  els.findings.innerHTML = "";
  els.findings.classList.toggle("empty-state", result.findings.length === 0);
  els.findingCount.textContent = String(result.findings.length);
  els.signalCount.textContent = String(result.signalLines.length);
  els.confidenceScore.textContent = `${confidenceFor(result)}%`;

  if (result.findings.length === 0) {
    els.summaryLine.textContent = "No obvious failure pattern found.";
    els.findings.innerHTML =
      "<p>No known pattern matched. Add more complete logs or inspect the first failing command.</p>";
    lastMarkdown = buildMarkdown(result);
    return;
  }

  const top = result.findings[0];
  els.summaryLine.textContent = `${top.title} at line ${top.line}.`;

  for (const finding of result.findings) {
    const node = els.findingTemplate.content.firstElementChild.cloneNode(true);
    const badge = node.querySelector(".badge");
    badge.textContent = finding.severity.toUpperCase();
    badge.classList.add(finding.severity);
    node.querySelector("h3").textContent = finding.title;
    node.querySelector(".finding-detail").textContent =
      `Matched line ${finding.line}. Use the excerpt to anchor the first rerun.`;
    node.querySelector(".owner").textContent = finding.owner;
    node.querySelector(".action").textContent = finding.action;
    node.querySelector("code").textContent = finding.excerpt;
    els.findings.appendChild(node);
  }

  lastMarkdown = buildMarkdown(result);
}

function buildMarkdown(result) {
  const lines = [
    "# CI Failure Triage Report",
    "",
    `- Findings: ${result.findings.length}`,
    `- Signal lines: ${result.signalLines.length}`,
    `- Non-empty log lines: ${result.lineCount}`,
    `- Confidence: ${confidenceFor(result)}%`,
    "",
  ];

  if (result.findings.length > 0) {
    lines.push("## Likely Causes", "");
    result.findings.forEach((finding, index) => {
      lines.push(
        `${index + 1}. ${finding.title}`,
        `   - Severity: ${finding.severity}`,
        `   - Line: ${finding.line}`,
        `   - Likely owner: ${finding.owner}`,
        `   - Next action: ${finding.action}`,
        "   - Excerpt:",
        "```text",
        finding.excerpt,
        "```",
        "",
      );
    });
  }

  if (result.signalLines.length > 0) {
    lines.push("## High-Signal Lines", "");
    result.signalLines.slice(0, 12).forEach((line) => {
      lines.push(`- ${line.index}: ${line.text}`);
    });
    lines.push("");
  }

  lines.push(
    "## First Response Checklist",
    "",
    "- Confirm whether this is reproducible on a fresh rerun.",
    "- Capture the exact target, package, shard, seed, and runner image.",
    "- Compare the failing line with the most recent change touching that area.",
    "- File the report with the owner named above and attach the excerpt.",
  );

  return lines.join("\n");
}

function runAnalysis() {
  if (isDemoMode()) {
    els.input.value = sampleLog;
  }

  const logText = els.input.value.trim();
  if (!logText) {
    render({ findings: [], signalLines: [], lineCount: 0 });
    return;
  }
  render(analyze(logText));
}

async function copyMarkdown() {
  if (!lastMarkdown) runAnalysis();
  if (!lastMarkdown) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(lastMarkdown);
  } else {
    const scratch = document.createElement("textarea");
    scratch.value = lastMarkdown;
    scratch.setAttribute("readonly", "");
    scratch.style.position = "fixed";
    scratch.style.left = "-9999px";
    document.body.appendChild(scratch);
    scratch.select();
    document.execCommand("copy");
    document.body.removeChild(scratch);
  }
  els.copy.textContent = "Copied";
  window.setTimeout(() => {
    els.copy.textContent = "Copy Markdown";
  }, 1400);
}

function markCheckoutPlaceholder() {
  const checkoutUrl = getCheckoutUrl();
  if (checkoutUrl) {
    els.checkoutLink.href = checkoutUrl;
    els.checkoutLink.removeAttribute("aria-disabled");
    return;
  }

  els.checkoutLink.href = "#";
  els.checkoutLink.setAttribute("aria-disabled", "true");
  if (els.checkoutLink.dataset.placeholderBound !== "true") {
    els.checkoutLink.dataset.placeholderBound = "true";
    els.checkoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      alert("Set checkoutUrl in site-config.js before publishing.");
    });
  }
}

function applyDemoMode() {
  if (!isDemoMode()) return;
  els.demoNotice.hidden = false;
  els.input.value = sampleLog;
  els.input.readOnly = true;
  els.input.setAttribute("aria-readonly", "true");
  els.input.placeholder = "Public demo mode uses the bundled sample log.";
  els.clear.disabled = true;
  els.clear.textContent = "Demo locked";
  runAnalysis();
}

els.analyze.addEventListener("click", runAnalysis);
els.clear.addEventListener("click", () => {
  if (isDemoMode()) return;
  els.input.value = "";
  render({ findings: [], signalLines: [], lineCount: 0 });
});
els.sample.addEventListener("click", () => {
  els.input.value = sampleLog;
  runAnalysis();
});
els.copy.addEventListener("click", copyMarkdown);
els.input.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    runAnalysis();
  }
});

markCheckoutPlaceholder();
applyDemoMode();
