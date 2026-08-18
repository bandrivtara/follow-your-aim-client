import styled from "@emotion/styled";

const CareerDashboardLayout = styled.main`
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px 0 16px;

  .career-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.8fr);
    gap: 18px;
    padding: 28px;
    overflow: hidden;
    border: 1px solid #dfe3ff;
    border-radius: 24px;
    background:
      radial-gradient(
        circle at 92% 12%,
        rgba(20, 184, 166, 0.16),
        transparent 15rem
      ),
      linear-gradient(135deg, #f4f5ff 0%, #ffffff 55%, #f0fbf9 100%);
    box-shadow: var(--fya-shadow);
  }

  .career-hero-copy {
    align-self: center;
    max-width: 850px;
  }

  .career-kicker {
    margin-bottom: 16px;
    color: var(--fya-primary-dark);
    background: rgba(91, 108, 249, 0.1);
  }

  .career-hero h1 {
    max-width: 820px;
    font-size: clamp(2.1rem, 4.3vw, 4rem);
    line-height: 1.02;
  }

  .career-hero-description {
    max-width: 760px;
    margin-top: 14px;
    color: var(--fya-muted);
    font-size: clamp(1rem, 1.6vw, 1.18rem);
    line-height: 1.6;
  }

  .career-focus-card,
  .career-panel,
  .career-track-card,
  .career-goal-card,
  .career-empty-card,
  .career-weekly-protocol {
    border-radius: 20px;
  }

  .career-focus-card {
    align-self: stretch;
    background: rgba(255, 255, 255, 0.9);
  }

  .career-focus-card .MuiCardContent-root {
    padding: 22px;
  }

  .career-card-eyebrow {
    color: var(--fya-primary-dark);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .career-focus-list {
    padding-left: 21px;
    margin: 16px 0 0;
  }

  .career-focus-list li {
    padding-left: 3px;
    margin-bottom: 9px;
  }

  .career-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin: 16px 0;
  }

  .career-summary-card {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
  }

  .career-summary-card::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--summary-accent);
    content: "";
  }

  .career-summary-card--primary {
    --summary-accent: #5b6cf9;
  }
  .career-summary-card--green {
    --summary-accent: #14b8a6;
  }
  .career-summary-card--orange {
    --summary-accent: #f59e0b;
  }
  .career-summary-card--purple {
    --summary-accent: #8b5cf6;
  }

  .career-summary-card .MuiCardContent-root {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 2px 12px;
    padding: 18px 20px;
  }

  .career-summary-card svg {
    grid-row: 1 / span 2;
    color: var(--summary-accent);
  }

  .career-summary-card strong {
    font-size: 1.8rem;
    line-height: 1;
  }

  .career-summary-card span {
    color: var(--fya-muted);
    font-size: 0.85rem;
  }

  .career-section {
    margin-top: 24px;
  }

  .career-section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .career-track-grid,
  .career-goal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .career-track-card {
    position: relative;
    overflow: hidden;
  }

  .career-track-card::before {
    position: absolute;
    inset: 0 0 auto;
    height: 4px;
    background: var(--track-accent);
    content: "";
  }

  .career-track-card .MuiCardContent-root {
    padding: 22px;
  }

  .career-track-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .career-progress-ring {
    position: relative;
    display: grid;
    flex: 0 0 58px;
    place-items: center;
    color: var(--track-accent);
  }

  .career-progress-ring strong {
    position: absolute;
    color: var(--fya-ink);
    font-size: 0.76rem;
  }

  .career-next-action {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
    margin-top: 18px;
    padding: 12px;
    border-radius: 12px;
    color: var(--fya-ink);
    background: #f7f8fc;
  }

  .career-next-action svg {
    color: var(--track-accent);
  }

  .career-roadmap {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    overflow: hidden;
    border: 1px solid var(--fya-border);
    border-radius: 20px;
    background: #fff;
    box-shadow: var(--fya-shadow);
  }

  .career-phase {
    position: relative;
    min-width: 0;
    padding: 22px 18px;
    border-right: 1px solid var(--fya-border);
  }

  .career-phase:last-child {
    border-right: 0;
  }

  .career-phase-marker {
    display: grid;
    width: 34px;
    height: 34px;
    margin-bottom: 14px;
    place-items: center;
    border-radius: 11px;
    color: #fff;
    background: var(--fya-primary);
    font-weight: 800;
    box-shadow: 0 7px 16px rgba(91, 108, 249, 0.25);
  }

  .career-phase--current {
    background: linear-gradient(180deg, rgba(91, 108, 249, 0.07), transparent);
  }

  .career-phase--current .career-phase-marker::after {
    position: absolute;
    top: 24px;
    left: 58px;
    padding: 4px 7px;
    border-radius: 999px;
    color: var(--fya-primary-dark);
    background: #eef0ff;
    content: "Зараз";
    font-size: 0.68rem;
    font-weight: 800;
  }

  .career-two-column {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.8fr);
    gap: 14px;
  }

  .career-side-stack {
    display: grid;
    gap: 14px;
  }

  .career-panel .MuiCardContent-root {
    padding: 22px;
  }

  .career-panel-title {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .career-panel-title > svg {
    padding: 8px;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    color: var(--fya-primary);
    background: #eef0ff;
  }

  .career-skill-list {
    display: grid;
    gap: 17px;
    margin-top: 22px;
  }

  .career-skill-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 7px;
  }

  .career-skill-heading span {
    color: var(--fya-primary-dark);
    font-weight: 800;
  }

  .career-skill .MuiLinearProgress-root {
    height: 7px;
    border-radius: 99px;
    background: #e8ebf3;
  }

  .career-skill small {
    display: block;
    margin-top: 7px;
    color: var(--fya-muted);
  }

  .career-check-list {
    padding-left: 21px;
    margin: 16px 0 0;
  }

  .career-check-list li {
    margin-bottom: 9px;
  }

  .career-goal-card .MuiCardContent-root {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    padding: 20px;
  }

  .career-goal-description {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .career-goal-progress {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-top: auto;
  }

  .career-goal-progress .MuiLinearProgress-root {
    height: 8px;
    border-radius: 99px;
  }

  .career-goal-card .MuiButton-root {
    align-self: flex-start;
  }

  .career-empty-card .MuiCardContent-root {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 22px;
  }

  .career-empty-card .MuiButton-root {
    margin-left: auto;
  }

  .career-weekly-protocol {
    margin-top: 24px;
    background: linear-gradient(135deg, #fff 0%, #f4f5ff 100%);
  }

  .career-weekly-protocol .MuiCardContent-root {
    padding: 22px;
  }

  .career-protocol-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .career-protocol-grid > div {
    display: grid;
    gap: 3px;
    padding: 13px;
    border: 1px solid var(--fya-border);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.86);
  }

  .career-protocol-grid strong {
    color: var(--fya-primary-dark);
  }

  .career-protocol-grid span {
    color: var(--fya-muted);
    font-size: 0.82rem;
  }

  @media only screen and (max-width: 1180px) {
    .career-roadmap {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .career-phase {
      border-bottom: 1px solid var(--fya-border);
    }

    .career-phase:nth-child(2n) {
      border-right: 0;
    }

    .career-phase:last-child {
      border-bottom: 0;
    }
  }

  @media only screen and (max-width: 900px) {
    .career-hero,
    .career-two-column {
      grid-template-columns: 1fr;
    }

    .career-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .career-protocol-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media only screen and (max-width: 600px) {
    padding-top: 12px;

    .career-hero {
      padding: 18px;
      border-radius: 20px;
    }

    .career-hero h1 {
      font-size: 2.25rem;
    }

    .career-hero-actions,
    .career-section-header {
      align-items: stretch;
      flex-direction: column;
    }

    .career-hero-actions .MuiButton-root,
    .career-section-header .MuiButton-root {
      width: 100%;
    }

    .career-summary-grid,
    .career-track-grid,
    .career-goal-grid,
    .career-roadmap,
    .career-protocol-grid {
      grid-template-columns: 1fr;
    }

    .career-phase,
    .career-phase:nth-child(2n) {
      border-right: 0;
      border-bottom: 1px solid var(--fya-border);
    }

    .career-empty-card .MuiCardContent-root {
      align-items: flex-start;
      flex-direction: column;
    }

    .career-empty-card .MuiButton-root {
      width: 100%;
      margin-left: 0;
    }
  }
`;

export default CareerDashboardLayout;
