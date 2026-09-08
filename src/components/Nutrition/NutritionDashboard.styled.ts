import styled from "@emotion/styled";

const NutritionLayout = styled.main`
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px 0 16px;

  .nutrition-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.65fr);
    gap: 18px;
    padding: 28px;
    margin-bottom: 18px;
    border: 1px solid #cfeee8;
    border-radius: 24px;
    background: radial-gradient(circle at 92% 10%, rgba(20,184,166,.2), transparent 16rem), linear-gradient(135deg,#f1fbf8,#fff 56%,#f5f6ff);
    box-shadow: var(--fya-shadow);
  }
  .nutrition-hero > div:first-child { align-self: center; }
  .nutrition-hero h1 { max-width: 800px; margin: 14px 0 10px; font-size: clamp(2rem,4vw,3.7rem); line-height: 1.03; }
  .connection-card { background: rgba(255,255,255,.92); }
  .connection-card .MuiCardContent-root { display: grid; gap: 14px; }
  .connection-heading { display: flex; align-items: center; gap: 11px; }
  .connection-heading > svg { font-size: 34px; }
  .connection-heading div { display: grid; }
  .connection-heading span { color: var(--fya-muted); font-size: .82rem; }
  > .MuiAlert-root { margin-bottom: 14px; }
  > .MuiTabs-root { margin-bottom: 18px; border-bottom: 1px solid var(--fya-border); }

  .dashboard-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; }
  .macro-card { --macro:#5b6cf9; border-radius: 18px; }
  .macro-card--protein { --macro:#14b8a6; }
  .macro-card--fat { --macro:#f59e0b; }
  .macro-card--carbs { --macro:#8b5cf6; }
  .macro-card .MuiCardContent-root { display: grid; gap: 6px; }
  .macro-card span,.macro-card small { color: var(--fya-muted); }
  .macro-card strong { font-size: 1.8rem; }
  .macro-card .MuiLinearProgress-root { height: 7px; margin-top: 8px; border-radius: 99px; }
  .macro-card .MuiLinearProgress-bar { background: var(--macro); }
  .today-meals { grid-column: span 3; }
  .goal-card { grid-column: span 1; background: linear-gradient(145deg,#fff,#f0fbf9); }
  .today-meals .MuiCardContent-root,.goal-card .MuiCardContent-root { display: grid; gap: 14px; }
  .meal-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .meal-row > div { display: grid; }
  .meal-row span { color: var(--fya-muted); font-size: .8rem; text-transform: capitalize; }

  .planner-section,.settings-grid { display: grid; gap: 16px; }
  .section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
  .week-grid { display: grid; grid-template-columns: repeat(7,minmax(150px,1fr)); gap: 10px; overflow-x: auto; padding-bottom: 6px; }
  .day-card { min-width: 150px; border-radius: 16px; }
  .day-card .MuiCardContent-root { display: grid; gap: 8px; padding: 16px; }
  .day-date { color: var(--fya-primary-dark); font-size: .75rem; font-weight: 800; text-transform: uppercase; }
  .day-card > strong { font-size: 1.2rem; }
  .day-card small { color: var(--fya-muted); }
  .compact-meal { display: grid; gap: 2px; padding: 6px 0; }
  .compact-meal span { font-size: .86rem; font-weight: 650; }
  .import-card .MuiCardContent-root,.settings-grid .MuiCardContent-root { display: grid; gap: 16px; }
  .settings-grid { grid-template-columns: minmax(300px,.75fr) minmax(0,1.25fr); }
  .targets-grid,.lists-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }

  @media only screen and (max-width: 1000px) {
    .nutrition-hero,.settings-grid { grid-template-columns: 1fr; }
    .dashboard-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
    .today-meals,.goal-card { grid-column: span 2; }
  }
  @media only screen and (max-width: 600px) {
    padding-top: 12px;
    .nutrition-hero { padding: 18px; border-radius: 20px; }
    .nutrition-hero h1 { font-size: 2.15rem; }
    .dashboard-grid,.targets-grid,.lists-grid { grid-template-columns: 1fr; }
    .today-meals,.goal-card { grid-column: span 1; }
    .section-heading { align-items: stretch; flex-direction: column; }
    .section-heading .MuiButton-root { width: 100%; }
  }
`;

export default NutritionLayout;
