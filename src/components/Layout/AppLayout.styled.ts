import styled from "@emotion/styled";

const StyledLayout = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--fya-canvas);

  .site-layout {
    min-width: 0;
    padding: 0;
    background: transparent;
  }

  .desktop-sidebar {
    position: sticky;
    z-index: 40;
    top: 0;
    height: 100vh;
    height: 100dvh;
    overflow: hidden auto;
    background:
      radial-gradient(
        circle at 30% 0%,
        rgba(91, 108, 249, 0.22),
        transparent 18rem
      ),
      #101828;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 14px 0 40px rgba(16, 24, 40, 0.1);
  }

  .desktop-sidebar .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }

  .desktop-sidebar .ant-menu {
    flex: 1;
    padding-bottom: 18px;
    background: transparent;
    border-inline-end: 0;
  }

  .desktop-sidebar .ant-menu-submenu-title,
  .desktop-sidebar .ant-menu-item {
    margin-block: 3px;
  }

  .desktop-sidebar .ant-menu-item-selected {
    box-shadow: 0 8px 20px rgba(91, 108, 249, 0.3);
  }

  .desktop-sidebar .ant-layout-sider-trigger {
    background: rgba(255, 255, 255, 0.06);
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .desktop-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    width: calc(100% - 20px);
    min-height: 68px;
    margin: 10px;
    padding: 10px;
    color: #fff;
    text-align: left;
    border: 0;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.06);
    cursor: pointer;
  }

  .desktop-brand:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .desktop-brand-mark {
    display: grid;
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #7b8bff, #4f5fe7);
    box-shadow: 0 8px 18px rgba(91, 108, 249, 0.34);
  }

  .desktop-brand-copy {
    display: grid;
    min-width: 0;
  }

  .desktop-brand-copy strong {
    overflow: hidden;
    font-size: 14px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .desktop-brand-copy small {
    margin-top: 2px;
    color: #98a2b3;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .desktop-content {
    width: 100%;
    min-width: 0;
    max-width: 1920px;
    margin: 0 auto;
    padding: 28px clamp(18px, 2.3vw, 42px) 16px;
  }

  .app-footer {
    padding: 22px;
    color: #98a2b3;
    text-align: center;
    background: transparent;
    font-size: 12px;
  }

  .mobile-layout {
    min-height: 100vh;
    min-height: 100dvh;
    min-width: 0;
    background: transparent;
  }

  .mobile-app-header {
    position: sticky;
    z-index: 20;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60px;
    padding: env(safe-area-inset-top) 14px 0;
    border-bottom: 1px solid rgba(228, 232, 240, 0.88);
    background: rgba(245, 247, 251, 0.9);
    backdrop-filter: blur(14px);
  }

  .mobile-app-header > div {
    display: grid;
    line-height: 1.15;
  }

  .mobile-app-kicker {
    color: var(--fya-primary);
    font-weight: 750;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mobile-content {
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0 max(14px, env(safe-area-inset-right))
      calc(90px + env(safe-area-inset-bottom))
      max(14px, env(safe-area-inset-left));
  }

  .mobile-bottom-navigation {
    position: fixed;
    z-index: 30;
    right: 0;
    bottom: 0;
    left: 0;
    height: calc(68px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid rgba(228, 232, 240, 0.88);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 -10px 30px rgba(16, 24, 40, 0.09);
    backdrop-filter: blur(16px);
  }

  .mobile-bottom-navigation .MuiBottomNavigationAction-root {
    min-width: 0;
    padding: 7px 2px;
    color: #7d8798;
    border-radius: 12px;
  }

  .mobile-bottom-navigation .Mui-selected {
    color: var(--fya-primary);
  }

  .mobile-bottom-navigation .MuiBottomNavigationAction-label {
    font-size: 0.68rem;
    font-weight: 550;
  }

  @media only screen and (min-width: 769px) and (max-width: 1199px) {
    .mobile-app-header {
      padding-inline: max(24px, env(safe-area-inset-left))
        max(24px, env(safe-area-inset-right));
    }

    .mobile-content {
      padding: 20px max(24px, env(safe-area-inset-right))
        calc(92px + env(safe-area-inset-bottom))
        max(24px, env(safe-area-inset-left));
    }

    .mobile-bottom-navigation .MuiBottomNavigationAction-root {
      max-width: 180px;
    }

    .mobile-bottom-navigation .MuiBottomNavigationAction-label {
      font-size: 0.8rem;
    }
  }

  @media only screen and (max-width: 1100px) {
    .desktop-content {
      padding: 22px 20px 14px;
    }
  }
`;

export default StyledLayout;
